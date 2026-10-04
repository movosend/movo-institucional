import { NextResponse } from "next/server"

import { badRequest, readJsonObject, UUID_RE } from "@/lib/juegos/movo-api"
import { todayAR, type ExportRow } from "@/lib/trivia/admin"
import {
  DEFAULT_TIMELINE,
  LOBBY_EXTEND_MAX_S,
  MAX_PLAYERS_LIMIT,
  TIMELINE_LIMITS,
  type Timeline,
} from "@/lib/trivia/config"
import { withEmoji } from "@/lib/trivia/emojis"
import { manualHold, manualStep, playMs, podiumMs } from "@/lib/trivia/engine"
import {
  apiError,
  broadcast,
  db,
  invalidateDay,
  invalidateGames,
  invalidateTick,
  tick,
  unavailable,
} from "@/lib/trivia/server"

/**
 * Modo stand de la TV (detrás del PIN de /juegos, ver proxy.ts): pausar el loop, cambiar
 * los tiempos y ocultar nombres.
 */
export async function GET() {
  const supabase = db()
  if (!supabase) return unavailable()
  const [settings, rows] = await Promise.all([
    supabase
      .from("trivia_settings")
      .select("paused, timeline, manual_lobby, manual_slides, max_players")
      .eq("id", 1)
      .single(),
    supabase.rpc("trivia_export", { p_day: todayAR() }),
  ])
  if (settings.error || rows.error) {
    console.error("[trivia] admin:", settings.error ?? rows.error)
    return unavailable()
  }
  const players = new Map<
    string,
    {
      id: string
      name: string
      city: string
      hidden: boolean
      best: number
      games: number
    }
  >()
  for (const r of rows.data as ExportRow[]) {
    const p = players.get(r.player_id)
    if (p) {
      p.best = Math.max(p.best, r.score)
      p.games++
    } else
      players.set(r.player_id, {
        id: r.player_id,
        name: withEmoji(r.name, r.emoji),
        city: r.city,
        hidden: r.hidden,
        best: r.score,
        games: 1,
      })
  }
  // Los que esperan en el lobby todavía no jugaron hoy, pero su nombre ya está en la TV.
  try {
    const t = await tick()
    const { data: lobby } = await supabase
      .from("trivia_entries")
      .select("player_id, trivia_players(name, emoji, city, hidden)")
      .eq("game_id", t.lobby.id)
    for (const e of (lobby ?? []) as unknown as {
      player_id: string
      trivia_players: {
        name: string
        emoji: string | null
        city: string
        hidden: boolean
      } | null
    }[])
      if (e.trivia_players && !players.has(e.player_id))
        players.set(e.player_id, {
          id: e.player_id,
          name: withEmoji(e.trivia_players.name, e.trivia_players.emoji),
          city: e.trivia_players.city,
          hidden: e.trivia_players.hidden,
          best: 0,
          games: 0,
        })
  } catch (e) {
    console.error("[trivia] admin lobby:", e)
  }
  return NextResponse.json({
    paused: settings.data.paused,
    manualLobby: settings.data.manual_lobby,
    manualSlides: settings.data.manual_slides,
    maxPlayers: settings.data.max_players,
    timeline: { ...DEFAULT_TIMELINE, ...settings.data.timeline },
    players: [...players.values()].sort((a, b) => b.best - a.best),
  })
}

function parseTimeline(value: unknown): Timeline | undefined {
  if (!value || typeof value !== "object") return undefined
  const out = { ...DEFAULT_TIMELINE }
  for (const key of Object.keys(TIMELINE_LIMITS) as (keyof Timeline)[]) {
    const v = (value as Record<string, unknown>)[key]
    if (v === undefined) continue
    const [min, max] = TIMELINE_LIMITS[key]
    if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max)
      return undefined
    out[key] = v
  }
  return out
}

export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return badRequest()
  const supabase = db()
  if (!supabase) return unavailable()

  try {
    switch (body.action) {
      case "pause": {
        await supabase
          .from("trivia_settings")
          .update({ paused: true, updated_at: new Date().toISOString() })
          .eq("id", 1)
          .throwOnError()
        await supabase
          .from("trivia_games")
          .update({ lobby_ends_at: null, lobby_max_at: null })
          .is("started_at", null)
          .throwOnError()
        break
      }
      case "resume": {
        const t = await tick()
        await supabase
          .from("trivia_settings")
          .update({ paused: false, updated_at: new Date().toISOString() })
          .eq("id", 1)
          .throwOnError()
        // Si ya había gente esperando, arranca la cuenta; si no, el lobby espera al primero.
        const { count } = await supabase
          .from("trivia_entries")
          .select("player_id", { count: "exact", head: true })
          .eq("game_id", t.lobby.id)
        if (count) {
          const from = Math.max(
            Date.now(),
            t.current?.ends_at ? Date.parse(t.current.ends_at) : 0
          )
          const ends = from + t.lobby.timeline.lobby * 1000
          await supabase
            .from("trivia_games")
            .update({
              lobby_ends_at: new Date(ends).toISOString(),
              lobby_max_at: new Date(
                ends + LOBBY_EXTEND_MAX_S * 1000
              ).toISOString(),
            })
            .eq("id", t.lobby.id)
            .throwOnError()
        }
        break
      }
      case "timeline": {
        const timeline = parseTimeline(body.timeline)
        if (!timeline) return badRequest("Tiempos inválidos.")
        await supabase
          .from("trivia_settings")
          .update({ timeline, updated_at: new Date().toISOString() })
          .eq("id", 1)
          .throwOnError()
        // La partida en lobby todavía no arrancó: toma los tiempos nuevos.
        await supabase
          .from("trivia_games")
          .update({
            timeline,
            play_ms: playMs(timeline),
            podium_ms: podiumMs(timeline),
          })
          .is("started_at", null)
          .throwOnError()
        break
      }
      case "manual_lobby": {
        if (typeof body.on !== "boolean") return badRequest()
        await supabase
          .from("trivia_settings")
          .update({
            manual_lobby: body.on,
            updated_at: new Date().toISOString(),
          })
          .eq("id", 1)
          .throwOnError()
        // Sin cuenta regresiva: los que ya esperan siguen anotados. Al volver al lobby
        // automático, trivia_tick arranca la cuenta si hay gente.
        if (body.on)
          await supabase
            .from("trivia_games")
            .update({ lobby_ends_at: null, lobby_max_at: null })
            .is("started_at", null)
            .throwOnError()
        break
      }
      case "manual_slides": {
        if (typeof body.on !== "boolean") return badRequest()
        // Con una partida en curso se frena en la próxima pantalla que no es pregunta.
        let holdMs: number | null = null
        if (body.on) {
          invalidateTick()
          const { current } = await tick()
          if (current && current.hold_ms == null)
            holdMs = manualHold(current, Date.now())
        }
        await supabase
          .rpc("trivia_set_manual_slides", {
            p_on: body.on,
            p_hold_ms: holdMs,
          })
          .throwOnError()
        break
      }
      case "start": {
        invalidateTick()
        const t = await tick()
        if (!t.manualLobby)
          return apiError("NOT_MANUAL", "El lobby no está en manual.", 409)
        const { data: started } = await supabase
          .rpc("trivia_start_lobby", { p_game: t.lobby.id })
          .throwOnError()
        if (!started)
          return apiError(
            "CANNOT_START",
            !t.open
              ? "La pantalla del stand no está activa."
              : t.current
                ? "Hay una partida en curso."
                : "Todavía no hay jugadores en la sala.",
            409
          )
        break
      }
      case "next": {
        invalidateTick()
        const { current } = await tick()
        if (!current || current.hold_ms == null)
          return apiError(
            "NOT_MANUAL",
            current
              ? "Las pantallas no están en manual."
              : "No hay una partida en curso.",
            409
          )
        const step = manualStep(current, Date.now())
        if (!step) return apiError("ENDED", "La partida ya terminó.", 409)
        const { data: moved } = await supabase
          .rpc("trivia_advance", {
            p_game: current.id,
            p_started_at: current.started_at,
            p_cur_to_ms: step.curTo,
            p_next_hold_ms: step.nextHold,
            p_podium_from_ms: step.podiumFrom,
          })
          .throwOnError()
        if (!moved)
          return apiError("BUSY", "Ya se estaba pasando de pantalla.", 409)
        break
      }
      case "reset": {
        // Medida drástica: corta la partida en curso (si no llegó al podio, no suma al
        // ranking del día), saca a todos los anotados del lobby y frena su cuenta: el lobby
        // vuelve a esperar al primer jugador. No toca los perfiles ni el ranking ya cerrado.
        invalidateTick()
        const t = await tick()
        const now = new Date().toISOString()
        await supabase
          .from("trivia_games")
          .update({ ends_at: now, hold_ms: null })
          .not("started_at", "is", null)
          .gt("ends_at", now)
          .throwOnError()
        await supabase
          .from("trivia_entries")
          .delete()
          .eq("game_id", t.lobby.id)
          .throwOnError()
        await supabase
          .from("trivia_games")
          .update({ lobby_ends_at: null, lobby_max_at: null })
          .eq("id", t.lobby.id)
          .throwOnError()
        break
      }
      case "max_players": {
        const n = body.value
        if (
          typeof n !== "number" ||
          !Number.isInteger(n) ||
          n < 1 ||
          n > MAX_PLAYERS_LIMIT
        )
          return badRequest("Cupo inválido.")
        await supabase
          .from("trivia_settings")
          .update({ max_players: n, updated_at: new Date().toISOString() })
          .eq("id", 1)
          .throwOnError()
        break
      }
      case "reset_ranking": {
        // No borra partidas ni jugadores: el ranking del día cuenta desde ahora.
        await supabase
          .from("trivia_settings")
          .update({ ranking_reset_at: new Date().toISOString() })
          .eq("id", 1)
          .throwOnError()
        break
      }
      case "hide":
      case "unhide": {
        const { playerId } = body
        if (typeof playerId !== "string" || !UUID_RE.test(playerId))
          return badRequest("Jugador inválido.")
        await supabase
          .from("trivia_players")
          .update({ hidden: body.action === "hide" })
          .eq("id", playerId)
          .throwOnError()
        break
      }
      default:
        return badRequest("Acción inválida.")
    }
  } catch (e) {
    console.error("[trivia] admin:", e)
    return unavailable()
  }
  invalidateTick()
  invalidateGames()
  invalidateDay()
  broadcast("game")
  return NextResponse.json({ ok: true })
}
