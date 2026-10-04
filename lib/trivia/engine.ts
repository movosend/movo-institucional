/**
 * Motor de la trivia: funciones puras que usan por igual la TV, el celular y el server.
 *
 * Cada partida guarda su hora de inicio y su timeline (congelado al crearla); con eso,
 * cualquiera calcula en qué fase está la partida en un instante dado sin preguntarle a
 * nadie. Si un celular pierde señal y vuelve, sabe solo en qué pregunta va.
 */
import { GAME_TEMPLATE, SCORING, type Timeline } from "./config"
import {
  QUESTIONS,
  QUESTIONS_BY_ID,
  PRICE_PROMPT,
  type Question,
  type QuestionType,
} from "./questions"

/** Fila de `trivia_games` tal como la devuelve Supabase. */
export interface GameRow {
  id: string
  number: number
  lobby_ends_at: string | null
  started_at: string | null
  podium_at: string | null
  ends_at: string | null
  timeline: Timeline
  play_ms: number
  podium_ms: number
  question_ids: string[]
  /**
   * Pantallas manuales: instante del reloj de la partida (ms desde started_at) donde se
   * frena hasta que el stand pasa a la siguiente (`manualHold`). null = corre solo.
   */
  hold_ms?: number | null
}

export type Phase =
  | { kind: "lobby"; endsAt: number | null }
  | { kind: "question"; q: number; start: number; end: number }
  | { kind: "reveal"; q: number; start: number; end: number }
  | { kind: "top5"; after: number; start: number; end: number }
  | { kind: "podium"; start: number; end: number }
  | { kind: "ended" }

type Segment =
  | { kind: "question" | "reveal"; q: number; from: number; to: number }
  | { kind: "top5"; after: number; from: number; to: number }
  | { kind: "podium"; from: number; to: number }

/** Tipos de pregunta de cada partida, en orden (el template sin la pausa del top 5). */
export const QUESTION_SLOTS = GAME_TEMPLATE.filter(
  (s): s is QuestionType => s !== "top5"
)
export const QUESTION_COUNT = QUESTION_SLOTS.length

export const questionLimitS = (t: Timeline, type: QuestionType) => t[type]
const revealS = (t: Timeline, type: QuestionType) =>
  type === "price" ? t.priceReveal : t.reveal

/** Segmentos de la partida en ms desde `started_at`. */
export function segments(t: Timeline): Segment[] {
  const out: Segment[] = []
  let at = 0
  let q = 0
  for (const slot of GAME_TEMPLATE) {
    if (slot === "top5") {
      out.push({
        kind: "top5",
        after: q - 1,
        from: at,
        to: (at += t.top5 * 1000),
      })
      continue
    }
    out.push({
      kind: "question",
      q,
      from: at,
      to: (at += questionLimitS(t, slot) * 1000),
    })
    out.push({
      kind: "reveal",
      q,
      from: at,
      to: (at += revealS(t, slot) * 1000),
    })
    q++
  }
  out.push({ kind: "podium", from: at, to: at + t.podium * 1000 })
  return out
}

export const playMs = (t: Timeline) => segments(t).at(-1)!.to
export const podiumMs = (t: Timeline) => t.podium * 1000

/** Ms de reloj de la partida en un instante: se frena en `hold_ms` si está en manual. */
export function clockAt(game: GameRow, now: number): number {
  const t = now - Date.parse(game.started_at!)
  return game.hold_ms == null ? t : Math.min(t, game.hold_ms)
}

/**
 * Pantallas manuales: las preguntas corren y cierran solas; la partida se frena al final de
 * cada pantalla que no es pregunta (revelación, top 5, podio) hasta que el stand pasa a la
 * siguiente. Devuelve el `hold_ms` de la primera de esas pantallas a partir de `from`
 * (índice de segmento): su fin menos 1 ms, para quedarse en ella.
 */
const holdFrom = (segs: Segment[], from: number) => {
  const j = segs.findIndex((s, i) => i >= from && s.kind !== "question")
  return j < 0 ? null : segs[j].to - 1
}

/** `hold_ms` con el que se prende lo manual en el instante `now` (partida en curso). */
export function manualHold(game: GameRow, now: number) {
  const segs = segments(game.timeline)
  const t = clockAt(game, now)
  const i = segs.findIndex((s) => t < s.to)
  return i < 0 ? null : holdFrom(segs, i)
}

/**
 * Siguiente paso de una partida en manual, para `trivia_advance`: fin del segmento actual,
 * `hold_ms` que corresponde después de avanzar (null si el actual es el podio: la partida
 * termina) e inicio del podio, en ms desde started_at. undefined si ya terminó.
 */
export function manualStep(game: GameRow, now: number) {
  const segs = segments(game.timeline)
  const t = clockAt(game, now)
  const i = segs.findIndex((s) => t < s.to)
  if (i < 0) return undefined
  return {
    curTo: segs[i].to,
    nextHold: holdFrom(segs, i + 1),
    podiumFrom: segs.at(-1)!.from,
  }
}

/** Ventana de una pregunta, en ms epoch. */
export function questionWindow(game: GameRow, q: number) {
  const start = Date.parse(game.started_at!)
  const seg = segments(game.timeline).find(
    (s) => s.kind === "question" && s.q === q
  )!
  return { start: start + seg.from, end: start + seg.to }
}

export function phaseAt(game: GameRow, now: number): Phase {
  if (!game.started_at)
    return {
      kind: "lobby",
      endsAt: game.lobby_ends_at ? Date.parse(game.lobby_ends_at) : null,
    }
  const start = Date.parse(game.started_at)
  const t = clockAt(game, now)
  for (const s of segments(game.timeline)) {
    if (t < s.to) {
      const span = { start: start + s.from, end: start + s.to }
      if (s.kind === "top5") return { kind: "top5", after: s.after, ...span }
      if (s.kind === "podium") return { kind: "podium", ...span }
      return { kind: s.kind, q: s.q, ...span }
    }
  }
  return { kind: "ended" }
}

/** Preguntas ya cerradas (con respuesta revelada) en un instante: 0 a QUESTION_COUNT. */
export function revealedCount(game: GameRow, now: number): number {
  if (!game.started_at) return 0
  const t = clockAt(game, now)
  return segments(game.timeline).filter(
    (s) => s.kind === "question" && t >= s.to
  ).length
}

/** Sortea las preguntas de una partida nueva: una por lugar del template, sin repetir. */
export function pickQuestions(rand: () => number = Math.random): string[] {
  const used = new Set<string>()
  return QUESTION_SLOTS.map((type) => {
    const pool = QUESTIONS.filter((q) => q.type === type && !used.has(q.id))
    const pick = pool[Math.floor(rand() * pool.length)]
    if (!pick) throw new Error(`[trivia] Faltan preguntas de tipo ${type}`)
    used.add(pick.id)
    return pick.id
  })
}

export function questionOf(game: GameRow, q: number): Question | undefined {
  const id = game.question_ids[q]
  const question = id ? QUESTIONS_BY_ID.get(id) : undefined
  // Si el banco cambió y el tipo ya no coincide con el template, la pregunta no se usa.
  return question && question.type === QUESTION_SLOTS[q] ? question : undefined
}

/** Puntos de una respuesta de mc o tf. `ms` = lo que tardó en responder. */
export function choicePoints(correct: boolean, ms: number, limitMs: number) {
  if (!correct) return 0
  const left = 1 - Math.min(1, Math.max(0, ms / limitMs))
  return Math.round(SCORING.base + SCORING.speed * left)
}

export function pricePoints(guess: number, real: number) {
  const accuracy = Math.max(0, 1 - Math.abs(guess - real) / real)
  return Math.round(SCORING.price * accuracy * SCORING.priceMultiplier)
}

/** Pregunta sin la respuesta: lo que ve el celular mientras se responde. */
export type PublicQuestion =
  | { type: "mc"; prompt: string; options: string[] }
  | { type: "tf"; prompt: string }
  | {
      type: "price"
      prompt: string
      from: string
      to: string
      km: number
      parcel: string
      min: number
      max: number
    }

export function publicQuestion(q: Question): PublicQuestion {
  if (q.type === "mc")
    return { type: "mc", prompt: q.prompt, options: [...q.options] }
  if (q.type === "tf") return { type: "tf", prompt: q.prompt }
  return {
    type: "price",
    prompt: PRICE_PROMPT,
    from: q.from,
    to: q.to,
    km: q.km,
    parcel: q.parcel,
    min: q.min,
    max: q.max,
  }
}

/** Cantidad de opciones de una pregunta de elección (tf: 0 = Verdadero, 1 = Falso). */
export const choiceCount = (q: PublicQuestion) =>
  q.type === "mc" ? q.options.length : q.type === "tf" ? 2 : 0

export const OPTION_KEYS = ["A", "B", "C", "D"]

const money = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 })
export const fmtMoney = (v: number) => "$" + money.format(Math.round(v))
export const fmtPoints = (v: number) => money.format(Math.round(v))
/** "0:11" a partir de ms restantes (redondea hacia arriba). */
export function fmtClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}
/** "3,2 s" */
export const fmtSeconds = (ms: number) =>
  (Math.round(ms / 100) / 10).toLocaleString("es-AR") + " s"
