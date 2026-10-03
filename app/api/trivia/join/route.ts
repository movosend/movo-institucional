import type { SupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

import { badRequest, readJsonObject, UUID_RE } from "@/lib/juegos/movo-api"
import { isOffensive } from "@/lib/trivia/badwords"
import { pickEmoji } from "@/lib/trivia/emojis"
import {
  LOBBY_EXTEND_MAX_S,
  LOBBY_EXTEND_S,
  NAME_MAX,
} from "@/lib/trivia/config"
import {
  apiError,
  broadcast,
  db,
  invalidateTick,
  tick,
  unavailable,
} from "@/lib/trivia/server"

/**
 * Emoji del jugador: el que ya tiene, o uno al azar que no use nadie de la sala. Queda
 * guardado, así es el mismo en todas sus partidas.
 */
async function ensureEmoji(
  supabase: SupabaseClient,
  playerId: string,
  lobbyId: string
): Promise<string> {
  const { data: player, error } = await supabase
    .from("trivia_players")
    .select("emoji")
    .eq("id", playerId)
    .single()
  if (error) throw error
  if (player.emoji) return player.emoji as string

  const { data: room } = await supabase
    .from("trivia_entries")
    .select("trivia_players(emoji)")
    .eq("game_id", lobbyId)
  const taken = (
    (room ?? []) as unknown as {
      trivia_players: { emoji: string | null } | null
    }[]
  ).map((e) => e.trivia_players?.emoji)
  const emoji = pickEmoji(taken)
  await supabase
    .from("trivia_players")
    .update({ emoji })
    .eq("id", playerId)
    .throwOnError()
  return emoji
}

/**
 * Suma al jugador a la partida en lobby. Si hay una partida en curso, el lobby es el de la
 * próxima: el celular muestra "Hay una partida en curso" hasta que arranque la suya. Con la
 * pantalla del stand apagada no se puede entrar.
 */
export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return badRequest()
  const { playerId, name, city, province } = body
  if (typeof playerId !== "string" || !UUID_RE.test(playerId))
    return badRequest("Jugador inválido.")
  const cleanName =
    typeof name === "string" ? name.trim().replace(/\s+/g, " ") : ""
  if (!cleanName || cleanName.length > NAME_MAX)
    return badRequest(`El nombre tiene que tener entre 1 y ${NAME_MAX} letras.`)
  if (isOffensive(cleanName))
    return apiError("NAME_REJECTED", "Probá con otro nombre.", 422)
  const cleanCity = typeof city === "string" ? city.trim().slice(0, 60) : ""
  if (!cleanCity) return badRequest("Contanos de dónde venís.")
  const cleanProvince =
    typeof province === "string" && province.trim()
      ? province.trim().slice(0, 40)
      : null

  const supabase = db()
  if (!supabase) return unavailable()
  try {
    // El tick asegura que haya lobby (y arranca la partida si su cuenta ya venció);
    // trivia_join anota al jugador y arranca o estira la cuenta regresiva.
    const t = await tick()
    if (!t.open)
      return apiError(
        "TRIVIA_CLOSED",
        "La trivia no está habilitada ahora.",
        409
      )

    const { error: playerError } = await supabase
      .from("trivia_players")
      .upsert({
        id: playerId,
        name: cleanName,
        city: cleanCity,
        province: cleanProvince,
        updated_at: new Date().toISOString(),
      })
    if (playerError) throw playerError

    const emoji = await ensureEmoji(supabase, playerId, t.lobby.id)
    const { data: gameId, error } = await supabase.rpc("trivia_join", {
      p_player: playerId,
      p_extend_s: LOBBY_EXTEND_S,
      p_extend_max_s: LOBBY_EXTEND_MAX_S,
    })
    if (error) throw error
    invalidateTick()
    broadcast("room")
    return NextResponse.json({ ok: true, gameId: gameId as string, emoji })
  } catch (e) {
    console.error("[trivia] join:", e)
    return unavailable()
  }
}
