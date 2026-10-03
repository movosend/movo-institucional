/** Lo que devuelve `GET /api/trivia/state`: lo consumen la TV y el celular. */
import type { Timeline } from "./config"
import type { PublicQuestion } from "./engine"

export interface PlayerChip {
  id: string
  /** Con el emoji del jugador adelante ("🦊 Juli"). */
  name: string
  city: string
}

export interface Standing extends PlayerChip {
  score: number
  rank: number
  /** Puestos ganados (+) o perdidos (−) respecto de la pregunta anterior. */
  delta: number
}

export interface Reveal {
  q: number
  /** mc: índice de la correcta; tf: 0 = verdadero, 1 = falso; price: precio real. */
  answer: number
  fact?: string
  breakdown?: string
  /** Jugadores de la partida y cuántos respondieron / acertaron. */
  players: number
  answered: number
  correct: number
  /** mc y tf: respuestas por opción. */
  counts: number[]
  fastest?: PlayerChip & { ms: number; points: number }
  /** Precio justo. */
  guesses?: (PlayerChip & { price: number })[]
  avg?: number
  closest?: PlayerChip & { price: number; points: number }
}

/** La partida en juego (o en podio). Las preguntas viajan sin la respuesta. */
export interface LiveGame {
  id: string
  number: number
  startedAt: number
  timeline: Timeline
  questions: PublicQuestion[]
  players: number
  /** Respuestas recibidas por pregunta. */
  answered: number[]
  /** Solo de las preguntas ya cerradas. */
  reveals: Reveal[]
  /** Ranking de la partida después de la última pregunta cerrada (todos, sin ocultos). */
  standings: Standing[]
  /** Puesto en el ranking del día de los del podio, cuando ya cuenta la partida. */
  dayRanks?: Record<string, number>
}

export interface LobbyGame {
  id: string
  number: number
  lobbyEndsAt: number | null
  /** Duración del lobby (s), para la barra de la cuenta regresiva. */
  lobbyS: number
  /** Últimos en entrar primero. */
  players: PlayerChip[]
  count: number
}

export interface DayBoard {
  top: (PlayerChip & { score: number; rank: number })[]
  played: number
  cities: { name: string; count: number }[]
}

export interface MyAnswer {
  q: number
  ms: number
  choice?: number
  price?: number
  /** Solo de preguntas ya reveladas. */
  points?: number
}

export interface MyState {
  name: string
  emoji?: string
  city: string
  inLobby: boolean
  inCurrent: boolean
  answers: MyAnswer[]
  /** En la partida actual, con las preguntas reveladas. */
  score: number
  rank?: number
  /** Ranking anterior (para "bajaste/subiste"). */
  prevRank?: number
  dayBest?: { rank: number; score: number }
  hasEmail: boolean
}

export interface TriviaState {
  serverNow: number
  paused: boolean
  lobby: LobbyGame
  current: LiveGame | null
  day: DayBoard
  me?: MyState
}

export interface ApiError {
  error: { code: string; message: string }
}
