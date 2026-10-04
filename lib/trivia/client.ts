"use client"

import { createClient, type RealtimeChannel } from "@supabase/supabase-js"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import { randomUUID } from "@/lib/uuid"
import { phaseAt, type GameRow, type Phase } from "./engine"
import type { LiveGame, TriviaState } from "./types"

/**
 * Cliente de la trivia (TV y celular). Combina tres cosas para aguantar mala señal:
 *
 * - Reloj sincronizado: cada respuesta del server trae su hora; nos quedamos con la muestra
 *   de menor ida y vuelta. Con eso cada pantalla calcula la fase sola (`phaseAt`).
 * - Realtime (broadcast de Supabase): avisa al instante que algo cambió y se pide el estado.
 * - Polling de respaldo, más un pedido justo al cruzar cada cambio de fase.
 */

// ── Reloj ────────────────────────────────────────────────────────────────────

let offset = 0
let bestRtt = Infinity
let rttAge = 0

function sampleClock(serverNow: number, sentAt: number, rtt: number) {
  // Las muestras viejas pierden peso de a poco (el reloj del celular puede derivar).
  rttAge++
  if (rtt <= bestRtt || rttAge > 30) {
    bestRtt = rtt
    rttAge = 0
    offset = serverNow - (sentAt + rtt / 2)
  }
}

export const serverNow = () => Date.now() + offset

/** Hora sincronizada que se actualiza cada `everyMs`. */
export function useNow(everyMs = 200) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const id = setInterval(cb, everyMs)
      return () => clearInterval(id)
    },
    [everyMs]
  )
  const bucket = useSyncExternalStore(
    subscribe,
    () => Math.floor(serverNow() / everyMs),
    () => 0
  )
  return bucket ? serverNow() : 0
}

// ── Fases ────────────────────────────────────────────────────────────────────

/** `LiveGame` → la forma que espera el motor. */
export function liveRow(g: LiveGame): GameRow {
  return {
    id: g.id,
    number: g.number,
    lobby_ends_at: null,
    started_at: new Date(g.startedAt).toISOString(),
    podium_at: null,
    ends_at: null,
    timeline: g.timeline,
    play_ms: 0,
    podium_ms: 0,
    question_ids: [],
    hold_ms: g.holdMs,
  }
}

export function livePhase(g: LiveGame | null, now: number): Phase {
  return g ? phaseAt(liveRow(g), now) : { kind: "ended" }
}

/** Próximo cambio de fase (ms epoch) para pedir el estado justo ahí. */
function nextBoundary(state: TriviaState, now: number): number | undefined {
  const marks: number[] = []
  if (state.current) {
    const p = livePhase(state.current, now)
    if ("end" in p) marks.push(p.end)
  }
  if (state.lobby.lobbyEndsAt) marks.push(state.lobby.lobbyEndsAt)
  return marks.filter((m) => m > now).sort((a, b) => a - b)[0]
}

// ── Realtime ─────────────────────────────────────────────────────────────────

let channel: RealtimeChannel | null = null
const listeners = new Set<(event: string) => void>()
const statusListeners = new Set<(ok: boolean) => void>()
let realtimeOk = false

function ensureChannel() {
  if (channel) return
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  channel = supabase
    .channel("trivia")
    .on("broadcast", { event: "*" }, (msg) =>
      listeners.forEach((l) => l(String(msg.event)))
    )
    .subscribe((status) => {
      realtimeOk = status === "SUBSCRIBED"
      statusListeners.forEach((l) => l(realtimeOk))
    })
}

// ── Estado ───────────────────────────────────────────────────────────────────

export interface TriviaClient {
  state: TriviaState | null
  /** El último pedido falló (sin red o server caído). */
  offline: boolean
  realtime: boolean
  refresh: () => void
}

export function useTriviaState({
  role,
  playerId,
}: {
  role: "tv" | "player"
  playerId?: string
}): TriviaClient {
  const [state, setState] = useState<TriviaState | null>(null)
  const [offline, setOffline] = useState(false)
  const [realtime, setRealtime] = useState(false)
  const stateRef = useRef<TriviaState | null>(null)
  const inflight = useRef(false)
  const again = useRef(false)
  const pollTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const boundaryTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const fetchRef = useRef<() => void>(() => {})

  const schedule = useCallback(() => {
    clearTimeout(pollTimer.current)
    clearTimeout(boundaryTimer.current)
    const s = stateRef.current
    const now = serverNow()
    let every = realtimeOk ? 2000 : 1000
    if (role === "player") every = realtimeOk ? 3000 : 1500
    // Revelación sin datos todavía (reloj apenas adelantado): reintento rápido.
    if (s?.current) {
      const p = livePhase(s.current, now)
      const missing =
        (p.kind === "reveal" && !s.current.reveals.some((r) => r.q === p.q)) ||
        (p.kind === "top5" && s.current.reveals.length <= p.after)
      if (missing) every = 400
    }
    pollTimer.current = setTimeout(() => fetchRef.current(), every)
    const b = s && nextBoundary(s, now)
    if (b) {
      // Los celulares se reparten unos cientos de ms para no pegarle todos juntos al server.
      const jitter = role === "player" ? Math.random() * 400 : 0
      boundaryTimer.current = setTimeout(
        () => fetchRef.current(),
        Math.max(0, b - now) + 150 + jitter
      )
    }
  }, [role])

  const fetchState = useCallback(async () => {
    if (inflight.current) {
      again.current = true
      return
    }
    inflight.current = true
    const sentAt = Date.now()
    const t0 = performance.now()
    try {
      const qs = playerId ? `?player=${playerId}` : ""
      const r = await fetch(`/api/trivia/state${qs}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      })
      if (!r.ok) throw new Error(String(r.status))
      const next = (await r.json()) as TriviaState
      sampleClock(next.serverNow, sentAt, performance.now() - t0)
      stateRef.current = next
      setState(next)
      setOffline(false)
    } catch {
      setOffline(true)
    } finally {
      inflight.current = false
      if (again.current) {
        again.current = false
        void fetchRef.current()
      } else schedule()
    }
  }, [playerId, schedule])

  useEffect(() => {
    fetchRef.current = () => void fetchState()
  }, [fetchState])

  const refresh = useCallback(() => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(
      () => fetchRef.current(),
      role === "tv" ? 250 : 300 + Math.random() * 500
    )
  }, [role])

  useEffect(() => {
    // Primer pedido al montar: el estado llega por red, no hay render en cascada.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchState()
    ensureChannel()
    setRealtime(realtimeOk)
    const onEvent = (event: string) => {
      // Los celulares no necesitan enterarse de cada respuesta ajena.
      if (role === "player" && event === "answer") return
      refresh()
    }
    const onStatus = (ok: boolean) => setRealtime(ok)
    listeners.add(onEvent)
    statusListeners.add(onStatus)
    const wake = () => {
      if (document.visibilityState === "visible") fetchRef.current()
    }
    document.addEventListener("visibilitychange", wake)
    window.addEventListener("online", wake)
    return () => {
      listeners.delete(onEvent)
      statusListeners.delete(onStatus)
      document.removeEventListener("visibilitychange", wake)
      window.removeEventListener("online", wake)
      clearTimeout(pollTimer.current)
      clearTimeout(boundaryTimer.current)
      clearTimeout(debounceTimer.current)
    }
  }, [fetchState, refresh, role])

  return { state, offline, realtime, refresh }
}

// ── Perfil y cola de respuestas (celular) ─────────────────────────────────────

export interface Profile {
  id: string
  name: string
  city: string
  province?: string
  /** Lo asigna el server en el primer ingreso. */
  emoji?: string
}

const LS_PROFILE = "movo-trivia-player"
const LS_ANSWERS = "movo-trivia-answers"
const LS_EMAIL = "movo-trivia-email"

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function writeLS(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export const loadProfile = () => readLS<Profile | null>(LS_PROFILE, null)
export const saveProfile = (p: Profile) => writeLS(LS_PROFILE, p)
/** UUID v4 del jugador. */
export const newPlayerId = randomUUID

export type JoinResult =
  | { ok: true; gameId: string; emoji?: string }
  | { ok: false; status: number; message?: string }

export async function joinGame(p: Profile): Promise<JoinResult> {
  try {
    const r = await fetch("/api/trivia/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        playerId: p.id,
        name: p.name,
        city: p.city,
        province: p.province,
      }),
      signal: AbortSignal.timeout(8000),
    })
    const body = (await r.json().catch(() => ({}))) as {
      gameId?: string
      emoji?: string
      error?: { message?: string }
    }
    return r.ok && body.gameId
      ? { ok: true, gameId: body.gameId, emoji: body.emoji }
      : { ok: false, status: r.status, message: body.error?.message }
  } catch {
    return { ok: false, status: 0 }
  }
}

export interface PendingAnswer {
  gameId: string
  playerId: string
  q: number
  ms: number
  choice?: number
  price?: number
}

/** Respuestas que todavía no confirmó el server, por `gameId:q`. */
const pendingStore = {
  listeners: new Set<() => void>(),
  snapshot: [] as PendingAnswer[],
  read() {
    this.snapshot = readLS<PendingAnswer[]>(LS_ANSWERS, [])
    return this.snapshot
  },
  write(v: PendingAnswer[]) {
    writeLS(LS_ANSWERS, v)
    this.snapshot = v
    this.listeners.forEach((l) => l())
  },
}

if (typeof window !== "undefined") pendingStore.read()

let flushing = false
let retryTimer: ReturnType<typeof setTimeout> | undefined
let retryDelay = 800

async function postAnswer(a: PendingAnswer): Promise<"ok" | "drop" | "retry"> {
  try {
    const r = await fetch("/api/trivia/answer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(a),
      signal: AbortSignal.timeout(6000),
    })
    if (r.ok) return "ok"
    // 4xx: el server la rechazó (tarde, inválida): no tiene sentido reintentar.
    return r.status >= 400 && r.status < 500 ? "drop" : "retry"
  } catch {
    return "retry"
  }
}

export async function flushAnswers() {
  if (flushing) return
  flushing = true
  clearTimeout(retryTimer)
  try {
    const pending = pendingStore.read()
    const keep: PendingAnswer[] = []
    for (const a of pending) if ((await postAnswer(a)) === "retry") keep.push(a)
    // Lo que se sumó mientras se enviaba.
    const added = pendingStore
      .read()
      .filter((a) => !pending.some((p) => p.gameId === a.gameId && p.q === a.q))
    pendingStore.write([...keep, ...added])
    if (keep.length || added.length) {
      retryTimer = setTimeout(() => void flushAnswers(), retryDelay)
      retryDelay = Math.min(retryDelay * 1.6, 4000)
    } else retryDelay = 800
  } finally {
    flushing = false
  }
}

export function sendAnswer(a: PendingAnswer) {
  const pending = pendingStore
    .read()
    .filter((p) => !(p.gameId === a.gameId && p.q === a.q))
  pendingStore.write([...pending, a])
  retryDelay = 800
  void flushAnswers()
}

export function usePendingAnswers(): PendingAnswer[] {
  return useSyncExternalStore(
    (cb) => {
      pendingStore.listeners.add(cb)
      return () => pendingStore.listeners.delete(cb)
    },
    () => pendingStore.snapshot,
    () => pendingStore.snapshot
  )
}

/** Mail del resultado: si no hay red, queda guardado y se reintenta en la próxima carga. */
export async function sendEmail(playerId: string, email: string) {
  writeLS(LS_EMAIL, { playerId, email })
  return flushEmail()
}

export async function flushEmail(): Promise<boolean> {
  const pending = readLS<{ playerId: string; email: string } | null>(
    LS_EMAIL,
    null
  )
  if (!pending) return true
  try {
    const r = await fetch("/api/trivia/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(pending),
      signal: AbortSignal.timeout(8000),
    })
    if (r.ok || r.status === 400) writeLS(LS_EMAIL, null)
    return r.ok
  } catch {
    return false
  }
}
