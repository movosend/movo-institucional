import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

import { DEFAULT_TIMELINE, type Timeline } from "./config"
import { withEmoji } from "./emojis"
import {
  QUESTION_COUNT,
  pickQuestions,
  playMs,
  podiumMs,
  publicQuestion,
  questionOf,
  revealedCount,
  phaseAt,
  type GameRow,
  type PublicQuestion,
} from "./engine"
import type {
  DayBoard,
  LiveGame,
  MyAnswer,
  MyState,
  PlayerChip,
  Reveal,
  Standing,
  TriviaState,
} from "./types"

/**
 * Servidor de la trivia: habla con el proyecto de Supabase de la feria con la service role
 * key (nunca llega al navegador). Las lecturas se cachean unos cientos de ms por instancia:
 * la TV y los celulares hacen polling cada 1-2 s.
 */

let client: SupabaseClient | null | undefined

export function db(): SupabaseClient | null {
  if (client !== undefined) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error("[trivia] Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
    client = null
    return client
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}
export const unavailable = () =>
  apiError("TRIVIA_UNAVAILABLE", "La trivia no está disponible ahora.", 503)

/** Cache corta con deduplicación de pedidos en vuelo. */
function cached<T>(ttlMs: number) {
  const store = new Map<string, { at: number; value: Promise<T> }>()
  return {
    get(key: string, load: () => Promise<T>): Promise<T> {
      const hit = store.get(key)
      if (hit && Date.now() - hit.at < ttlMs) return hit.value
      const value = load()
      store.set(key, { at: Date.now(), value })
      value.catch(() => store.delete(key))
      if (store.size > 200) store.delete(store.keys().next().value!)
      return value
    },
    clear() {
      store.clear()
    },
  }
}

// ── Loop de partidas ──────────────────────────────────────────────────────────

interface TickResult {
  now: string
  paused: boolean
  timeline: Timeline
  lobby: GameRow
  current: GameRow | null
}

/** Timeline vigente según el último tick (el stand lo cambia en `trivia_settings`). */
let knownTimeline: Timeline = DEFAULT_TIMELINE
const tickCache = cached<TickResult>(400)

export function tick(): Promise<TickResult> {
  return tickCache.get("tick", async () => {
    const supabase = db()
    if (!supabase) throw new Error("unavailable")
    const timeline = { ...DEFAULT_TIMELINE, ...knownTimeline }
    const { data, error } = await supabase.rpc("trivia_tick", {
      p_timeline: timeline,
      p_play_ms: playMs(timeline),
      p_podium_ms: podiumMs(timeline),
      p_question_ids: pickQuestions(),
    })
    if (error) throw error
    const result = data as TickResult
    knownTimeline = { ...DEFAULT_TIMELINE, ...result.timeline }
    return result
  })
}

export function invalidateTick() {
  tickCache.clear()
}

// ── Realtime ──────────────────────────────────────────────────────────────────

export type BroadcastEvent = "room" | "answer" | "game"

/**
 * Aviso por el canal broadcast `trivia` de Supabase Realtime (vía REST). Lleva solo el
 * tipo de evento: los clientes vuelven a pedir el estado. Si falla, el polling cubre.
 */
export function broadcast(event: BroadcastEvent, payload: object = {}) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return
  void fetch(`${url.replace(/\/$/, "")}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ topic: "trivia", event, payload, private: false }],
    }),
    signal: AbortSignal.timeout(3000),
  }).catch((e) => console.error("[trivia] broadcast:", e))
}

// ── Datos de una partida ──────────────────────────────────────────────────────

interface EntryRow {
  player_id: string
  joined_at: string
  trivia_players: {
    name: string
    emoji: string | null
    city: string
    hidden: boolean
    email: string | null
  } | null
}

interface AnswerRow {
  player_id: string
  q: number
  choice: number | null
  price: number | null
  client_ms: number
  points: number
}

interface GameData {
  entries: EntryRow[]
  answers: AnswerRow[]
}

const gameDataCache = cached<GameData>(400)

function loadGameData(gameId: string): Promise<GameData> {
  return gameDataCache.get(gameId, async () => {
    const supabase = db()!
    const [entries, answers] = await Promise.all([
      supabase
        .from("trivia_entries")
        .select(
          "player_id, joined_at, trivia_players(name, emoji, city, hidden, email)"
        )
        .eq("game_id", gameId)
        .order("joined_at", { ascending: false })
        .limit(500),
      supabase
        .from("trivia_answers")
        .select("player_id, q, choice, price, client_ms, points")
        .eq("game_id", gameId)
        .limit(10000),
    ])
    if (entries.error) throw entries.error
    if (answers.error) throw answers.error
    return {
      entries: entries.data as unknown as EntryRow[],
      answers: answers.data as AnswerRow[],
    }
  })
}

const gameRowCache = new Map<string, GameRow>()

/** Partida por id. Una vez arrancada no cambia, así que queda en memoria. */
export async function gameById(id: string): Promise<GameRow | null> {
  const hit = gameRowCache.get(id)
  if (hit) return hit
  const { data, error } = await db()!
    .from("trivia_games")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  if (data?.started_at) {
    if (gameRowCache.size > 100) gameRowCache.clear()
    gameRowCache.set(id, data as GameRow)
  }
  return (data as GameRow) ?? null
}

// ── Ranking del día ───────────────────────────────────────────────────────────

interface DayRow {
  player_id: string
  name: string
  emoji: string | null
  city: string
  hidden: boolean
  best: number
  games: number
}

const dayCache = cached<DayRow[]>(3000)

function loadDay(): Promise<DayRow[]> {
  return dayCache.get("day", async () => {
    const { data, error } = await db()!.rpc("trivia_day_board")
    if (error) throw error
    return data as DayRow[]
  })
}

export function invalidateDay() {
  dayCache.clear()
}

// ── Estado ────────────────────────────────────────────────────────────────────

/** Lo que ve la TV: el nombre ya va con su emoji ("🦊 Juli"). */
const chip = (
  id: string,
  p: { name: string; emoji?: string | null; city: string }
): PlayerChip => ({
  id,
  name: withEmoji(p.name, p.emoji),
  city: p.city,
})

function rankBy(
  entries: EntryRow[],
  answers: AnswerRow[],
  upToQ: number
): Map<string, { score: number; rank: number }> {
  const score = new Map(entries.map((e) => [e.player_id, 0]))
  for (const a of answers)
    if (a.q < upToQ && score.has(a.player_id))
      score.set(a.player_id, score.get(a.player_id)! + a.points)
  // Empates: entra antes quien se sumó antes (entries viene del más nuevo al más viejo).
  const order = [...entries].reverse().map((e) => e.player_id)
  const sorted = [...score.entries()].sort(
    (a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0])
  )
  return new Map(sorted.map(([id, s], i) => [id, { score: s, rank: i + 1 }]))
}

function buildReveal(
  game: GameRow,
  q: number,
  data: GameData,
  names: Map<string, EntryRow>
): Reveal | null {
  const question = questionOf(game, q)
  if (!question) return null
  const answers = data.answers.filter((a) => a.q === q)
  const visible = (id: string) => {
    const p = names.get(id)?.trivia_players
    return p && !p.hidden ? chip(id, p) : null
  }
  const base = {
    q,
    players: data.entries.length,
    answered: answers.length,
  }

  if (question.type === "price") {
    const guesses = answers
      .filter((a) => a.price !== null)
      .map((a) => ({ a, p: visible(a.player_id) }))
    const best = [...answers]
      .filter((a) => a.price !== null)
      .sort(
        (x, y) =>
          Math.abs(x.price! - question.price) -
          Math.abs(y.price! - question.price)
      )
      .find((a) => visible(a.player_id))
    return {
      ...base,
      answer: question.price,
      breakdown: question.breakdown,
      correct: answers.filter((a) => a.points > 0).length,
      counts: [],
      guesses: guesses
        .filter((g) => g.p)
        .map((g) => ({ ...g.p!, price: g.a.price! })),
      avg: answers.length
        ? answers.reduce((s, a) => s + (a.price ?? 0), 0) / answers.length
        : undefined,
      closest: best
        ? {
            ...visible(best.player_id)!,
            price: best.price!,
            points: best.points,
          }
        : undefined,
    }
  }

  const answer =
    question.type === "mc" ? question.answer : question.answer ? 0 : 1
  const counts = Array.from(
    { length: question.type === "mc" ? 4 : 2 },
    (_, i) => answers.filter((a) => a.choice === i).length
  )
  const right = answers
    .filter((a) => a.choice === answer)
    .sort((x, y) => x.client_ms - y.client_ms)
  const fast = right.find((a) => visible(a.player_id))
  return {
    ...base,
    answer,
    fact: question.fact,
    correct: right.length,
    counts,
    fastest: fast
      ? { ...visible(fast.player_id)!, ms: fast.client_ms, points: fast.points }
      : undefined,
  }
}

async function liveGame(
  game: GameRow,
  now: number,
  day: DayRow[]
): Promise<{
  live: LiveGame
  data: GameData
  ranks: ReturnType<typeof rankBy>
  prev: ReturnType<typeof rankBy>
}> {
  const data = await loadGameData(game.id)
  const names = new Map(data.entries.map((e) => [e.player_id, e]))
  const revealed = revealedCount(game, now)
  const ranks = rankBy(data.entries, data.answers, revealed)
  const prev = rankBy(data.entries, data.answers, Math.max(0, revealed - 1))

  const standings: Standing[] = []
  for (const [id, r] of ranks) {
    const p = names.get(id)?.trivia_players
    if (!p || p.hidden) continue
    standings.push({
      ...chip(id, p),
      score: r.score,
      rank: r.rank,
      delta: (prev.get(id)?.rank ?? r.rank) - r.rank,
    })
  }

  const questions: PublicQuestion[] = []
  for (let q = 0; q < QUESTION_COUNT; q++) {
    const question = questionOf(game, q)
    if (question) questions.push(publicQuestion(question))
  }

  const reveals: Reveal[] = []
  for (let q = 0; q < revealed; q++) {
    const r = buildReveal(game, q, data, names)
    if (r) reveals.push(r)
  }

  const phase = phaseAt(game, now)
  let dayRanks: Record<string, number> | undefined
  if (phase.kind === "podium") {
    dayRanks = {}
    const visibleDay = day.filter((d) => !d.hidden)
    for (const s of standings.slice(0, 3)) {
      const i = visibleDay.findIndex((d) => d.player_id === s.id)
      if (i >= 0) dayRanks[s.id] = i + 1
    }
  }

  return {
    live: {
      id: game.id,
      number: game.number,
      startedAt: Date.parse(game.started_at!),
      timeline: game.timeline,
      questions,
      players: data.entries.length,
      answered: Array.from(
        { length: QUESTION_COUNT },
        (_, q) => data.answers.filter((a) => a.q === q).length
      ),
      reveals,
      standings,
      dayRanks,
    },
    data,
    ranks,
    prev,
  }
}

function dayBoard(day: DayRow[], lobbyCities: string[]): DayBoard {
  const visible = day.filter((d) => !d.hidden)
  const cities = new Map<string, number>()
  for (const d of day) cities.set(d.city, (cities.get(d.city) ?? 0) + 1)
  for (const c of lobbyCities) if (!cities.has(c)) cities.set(c, 1)
  return {
    top: visible.slice(0, 5).map((d, i) => ({
      ...chip(d.player_id, d),
      score: d.best,
      rank: i + 1,
    })),
    played: day.length,
    cities: [...cities].map(([name, count]) => ({ name, count })),
  }
}

export async function buildState(playerId?: string): Promise<TriviaState> {
  const t = await tick()
  const now = Date.now()
  const [lobbyData, day] = await Promise.all([
    loadGameData(t.lobby.id),
    loadDay(),
  ])
  const current = t.current ? await liveGame(t.current, now, day) : null

  const lobbyPlayers = lobbyData.entries
    .filter((e) => e.trivia_players && !e.trivia_players.hidden)
    .map((e) => chip(e.player_id, e.trivia_players!))

  const state: TriviaState = {
    serverNow: now,
    paused: t.paused,
    lobby: {
      id: t.lobby.id,
      number: t.lobby.number,
      lobbyEndsAt: t.lobby.lobby_ends_at
        ? Date.parse(t.lobby.lobby_ends_at)
        : null,
      lobbyS: t.lobby.timeline.lobby,
      players: lobbyPlayers.slice(0, 40),
      count: lobbyData.entries.length,
    },
    current: current?.live ?? null,
    day: dayBoard(
      day,
      lobbyPlayers.map((p) => p.city)
    ),
  }

  if (playerId) {
    const inLobby = lobbyData.entries.find((e) => e.player_id === playerId)
    const inCurrent = current?.data.entries.find(
      (e) => e.player_id === playerId
    )
    const profile = (inCurrent ?? inLobby)?.trivia_players
    let me: MyState | undefined
    if (profile) {
      const revealed = t.current ? revealedCount(t.current, now) : 0
      const answers: MyAnswer[] = (current?.data.answers ?? [])
        .filter((a) => a.player_id === playerId)
        .map((a) => ({
          q: a.q,
          ms: a.client_ms,
          ...(a.choice !== null ? { choice: a.choice } : {}),
          ...(a.price !== null ? { price: a.price } : {}),
          ...(a.q < revealed ? { points: a.points } : {}),
        }))
      const r = current?.ranks.get(playerId)
      const dayIndex = day.findIndex((d) => d.player_id === playerId)
      me = {
        name: profile.name,
        emoji: profile.emoji ?? undefined,
        city: profile.city,
        inLobby: !!inLobby,
        inCurrent: !!inCurrent,
        answers,
        score: r?.score ?? 0,
        rank: r?.rank,
        prevRank: current?.prev.get(playerId)?.rank,
        dayBest:
          dayIndex >= 0
            ? { rank: dayIndex + 1, score: day[dayIndex].best }
            : undefined,
        hasEmail: !!profile.email,
      }
    }
    state.me = me
  }
  return state
}
