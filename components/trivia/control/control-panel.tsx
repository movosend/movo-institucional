"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { css } from "@/lib/juegos/css"
import { livePhase } from "@/lib/trivia/client"
import {
  MAX_PLAYERS_LIMIT,
  TIMELINE_LABELS,
  TIMELINE_LIMITS,
  type Timeline,
} from "@/lib/trivia/config"
import { QUESTION_COUNT, fmtPoints } from "@/lib/trivia/engine"
import {
  setSoundSettings,
  useSoundSettings,
  useTvHere,
} from "@/lib/trivia/sound-settings"
import type { TriviaState } from "@/lib/trivia/types"

/**
 * Control de la trivia para el stand. Vive en dos lugares con el mismo componente: como
 * panel sobre la TV (5 toques arriba a la izquierda) y como ventana propia en
 * `/juegos/trivia/control`, para llevarla a otra pantalla, una tablet o el celular.
 *
 * Todo es optimista: el control cambia al toque y el pedido viaja de fondo; si falla, se
 * vuelve al valor del server y se avisa. Los tiempos se guardan solos.
 */
export const CONTROL_PATH = "/juegos/trivia/control"
const ADMIN = "/api/juegos/trivia/admin"

interface Player {
  id: string
  name: string
  city: string
  hidden: boolean
  best: number
  games: number
}
interface AdminData {
  paused: boolean
  manualLobby: boolean
  manualSlides: boolean
  maxPlayers: number
  timeline: Timeline
  players: Player[]
}

const INK = "#0A0A0B"
const MUTED = "#5A5A62"
const CARD =
  "display:flex;flex-direction:column;gap:16px;padding:20px;border-radius:12px;background:#FFFFFF;border:1px solid rgba(10,10,11,.1)"
const LABEL = css(
  "font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5A5A62"
)

const btn = (variant: "primary" | "secondary" | "danger", h = 48) =>
  css(
    `height:${h}px;padding:0 18px;border-radius:8px;font-family:inherit;font-size:16px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;white-space:nowrap;transition:background 120ms,opacity 120ms,transform 120ms;${
      variant === "primary"
        ? `border:1px solid ${INK};background:${INK};color:#FFFFFF`
        : variant === "danger"
          ? "border:1px solid #E5484D;background:#E5484D;color:#FFFFFF"
          : `border:1px solid rgba(10,10,11,.18);background:#FFFFFF;color:${INK}`
    }`
  )

function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: (on: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="mv-press"
      style={css(
        `flex:none;position:relative;width:60px;height:36px;border-radius:999px;border:0;padding:0;cursor:pointer;background:${on ? INK : "#C9C9CF"};transition:background 120ms`
      )}
    >
      <span
        style={css(
          `position:absolute;top:4px;left:${on ? 28 : 4}px;width:28px;height:28px;border-radius:999px;background:#FFFFFF;transition:left 120ms;box-shadow:0 1px 3px rgba(10,10,11,.3)`
        )}
      />
    </button>
  )
}

function SwitchRow({
  title,
  hint,
  on,
  onChange,
}: {
  title: string
  hint: string
  on: boolean
  onChange: (on: boolean) => void
}) {
  return (
    <div
      style={css(
        "display:flex;align-items:center;justify-content:space-between;gap:16px"
      )}
    >
      <div style={css("display:flex;flex-direction:column;gap:2px")}>
        <span style={css("font-size:17px;font-weight:600")}>{title}</span>
        <span style={css(`font-size:14px;color:${MUTED};line-height:1.35`)}>
          {hint}
        </span>
      </div>
      <Switch on={on} onChange={onChange} label={title} />
    </div>
  )
}

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

/** Qué está pasando en la TV, en una línea, y qué se puede hacer desde acá. */
function describe(
  state: TriviaState | null,
  data: AdminData | null,
  now: number
) {
  if (!state) return { dot: "#B4B4BC", title: "Conectando…", sub: "" }
  const paused = data?.paused ?? state.paused
  const manualLobby = data?.manualLobby ?? state.manualLobby
  if (!state.open)
    return {
      dot: "#E5484D",
      title: "La pantalla del stand está apagada",
      sub: "Abrí /juegos/trivia en la TV: sin ella nadie puede entrar ni arranca nada.",
    }
  if (paused)
    return {
      dot: "#B4B4BC",
      title: "En pausa",
      sub: "La TV queda en el lobby y no arranca ninguna partida.",
    }
  const game = state.current
  const phase = livePhase(game, now)
  if (!game || phase.kind === "lobby" || phase.kind === "ended") {
    const n = state.lobby.count
    const people = `${n} ${n === 1 ? "jugador" : "jugadores"} en la sala`
    if (n === 0)
      return {
        dot: "#C6F24A",
        title: "Lobby esperando jugadores",
        sub: "Cuando entre el primero, arranca la cuenta.",
      }
    if (manualLobby)
      return {
        dot: "#C6F24A",
        title: "Lobby listo",
        sub: `${people}. Iniciá cuando quieras.`,
      }
    const left = state.lobby.lobbyEndsAt
      ? ` · arranca en ${mmss(state.lobby.lobbyEndsAt - now)}`
      : ""
    return { dot: "#C6F24A", title: "Lobby", sub: `${people}${left}` }
  }
  const n = game.number
  if (phase.kind === "question") {
    const answered = game.answered[phase.q] ?? 0
    return {
      dot: "#C6F24A",
      title: `Partida ${n} · pregunta ${phase.q + 1} de ${QUESTION_COUNT}`,
      sub: `Cierra en ${mmss(phase.end - now)} · respondieron ${answered} de ${game.players}`,
    }
  }
  if (phase.kind === "reveal")
    return {
      dot: "#C6F24A",
      title: `Partida ${n} · revelación ${phase.q + 1} de ${QUESTION_COUNT}`,
      sub: "",
    }
  if (phase.kind === "top5")
    return { dot: "#C6F24A", title: `Partida ${n} · top 5`, sub: "" }
  return { dot: "#C6F24A", title: `Partida ${n} · podio`, sub: "" }
}

export function ControlPanel({
  state,
  now,
  onChange,
  onPopOut,
  onClose,
}: {
  /** Estado en vivo de la TV (el que ya consume la pantalla). */
  state: TriviaState | null
  now: number
  /** Pide de nuevo el estado en vivo después de un cambio. */
  onChange: () => void
  /** Solo en el panel sobre la TV: sacarlo a una ventana aparte. */
  onPopOut?: () => void
  onClose?: () => void
}) {
  const [data, setData] = useState<AdminData | null>(null)
  const [draft, setDraft] = useState<Timeline | null>(null)
  const [toast, setToast] = useState<{ text: string; error: boolean } | null>(
    null
  )
  const [pending, setPending] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmRanking, setConfirmRanking] = useState(false)
  const [query, setQuery] = useState("")
  const [timesOpen, setTimesOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const sound = useSoundSettings()
  const tvHere = useTvHere()

  const inflight = useRef(0)
  const lastAct = useRef(0)
  const dirty = useRef(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const maxTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const rankingTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const say = useCallback((text: string, error = false) => {
    setToast({ text, error })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), error ? 4500 : 2200)
  }, [])

  const load = useCallback(
    async (force = false) => {
      try {
        const r = await fetch(ADMIN, { cache: "no-store" })
        if (!r.ok) throw new Error(String(r.status))
        const d = (await r.json()) as AdminData
        // Una respuesta que salió antes de un cambio nuestro pisaría el control.
        if (
          !force &&
          (inflight.current > 0 || Date.now() - lastAct.current < 1500)
        )
          return
        setData(d)
        if (!dirty.current) setDraft(d.timeline)
      } catch {
        say("No se pudo cargar. Revisá la conexión.", true)
      }
    },
    [say]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga por red al abrir
    void load(true)
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void load()
    }, 5000)
    return () => {
      clearInterval(id)
      clearTimeout(toastTimer.current)
      clearTimeout(saveTimer.current)
      clearTimeout(resetTimer.current)
      clearTimeout(rankingTimer.current)
      clearTimeout(maxTimer.current)
    }
  }, [load])

  // Jugadores nuevos: la lista del día se refresca cuando cambia el lobby o las partidas.
  const lobbyCount = state?.lobby.count
  const played = state?.day.played
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- recarga por red
    void load()
  }, [lobbyCount, played, load])

  /** Aplica el cambio ya mismo y manda el pedido de fondo. `key` marca el botón ocupado. */
  const act = useCallback(
    (
      body: object,
      opts: {
        patch?: (d: AdminData) => AdminData
        ok?: string
        key?: string
      } = {}
    ) => {
      lastAct.current = Date.now()
      if (opts.patch) setData((d) => (d ? opts.patch!(d) : d))
      if (opts.key) setPending(opts.key)
      inflight.current++
      fetch(ADMIN, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
        .then(async (r) => {
          if (r.ok) {
            if (opts.ok) say(opts.ok)
            return
          }
          const e = (await r.json().catch(() => null)) as {
            error?: { message?: string }
          } | null
          say(e?.error?.message ?? "No se pudo. Probá de nuevo.", true)
          void load(true)
        })
        .catch(() => {
          say("Sin conexión. Probá de nuevo.", true)
          void load(true)
        })
        .finally(() => {
          inflight.current--
          lastAct.current = Date.now()
          setPending((p) => (p === opts.key ? null : p))
          onChange()
        })
    },
    [load, onChange, say]
  )

  const paused = data?.paused ?? state?.paused ?? false
  const manualLobby = data?.manualLobby ?? state?.manualLobby ?? false
  const manualSlides = data?.manualSlides ?? state?.manualSlides ?? false
  const maxPlayers = data?.maxPlayers ?? MAX_PLAYERS_LIMIT
  const stepMax = (delta: number) => {
    const value = Math.min(MAX_PLAYERS_LIMIT, Math.max(10, maxPlayers + delta))
    if (value === maxPlayers) return
    setData((d) => (d ? { ...d, maxPlayers: value } : d))
    lastAct.current = Date.now()
    clearTimeout(maxTimer.current)
    maxTimer.current = setTimeout(
      () =>
        act(
          { action: "max_players", value },
          { patch: (d) => ({ ...d, maxPlayers: value }), ok: `Cupo: ${value}.` }
        ),
      500
    )
  }
  const info = describe(state, data, now)

  const lobbyCount0 = state?.lobby.count ?? 0
  const phase = state ? livePhase(state.current, now) : null
  const inGame =
    !!state?.current && !!phase && !["lobby", "ended"].includes(phase.kind)
  const canStart =
    manualLobby && !!state?.open && !paused && !inGame && lobbyCount0 > 0
  const canNext = manualSlides && inGame

  const start = useCallback(
    () => act({ action: "start" }, { key: "start", ok: "Partida iniciada." }),
    [act]
  )
  const next = useCallback(
    () => act({ action: "next" }, { key: "next" }),
    [act]
  )

  // Teclado: Enter inicia, Espacio / → / Av Pág pasan de pantalla (clickers de presentación).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement
      if (el.closest("input,textarea")) return
      const onButton = !!el.closest("button,summary,a")
      if (e.key === "Enter" && !onButton && canStart) start()
      else if (
        (e.key === " " && !onButton) ||
        e.key === "ArrowRight" ||
        e.key === "PageDown"
      ) {
        if (!canNext) return
        next()
      } else return
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [canStart, canNext, start, next])

  // Tiempos: se guardan solos un momento después de tocar.
  const step = (k: keyof Timeline, delta: number) => {
    if (!draft) return
    const [min, max] = TIMELINE_LIMITS[k]
    const value = Math.min(max, Math.max(min, draft[k] + delta))
    if (value === draft[k]) return
    const timeline = { ...draft, [k]: value }
    dirty.current = true
    setDraft(timeline)
    setSaved(false)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      dirty.current = false
      act(
        { action: "timeline", timeline },
        { patch: (d) => ({ ...d, timeline }) }
      )
      setSaved(true)
    }, 700)
  }

  const players = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all = data?.players ?? []
    return q
      ? all.filter((p) => `${p.name} ${p.city}`.toLowerCase().includes(q))
      : all
  }, [data, query])

  const setHidden = (p: Player, hidden: boolean) =>
    act(
      { action: hidden ? "hide" : "unhide", playerId: p.id },
      {
        patch: (d) => ({
          ...d,
          players: d.players.map((x) => (x.id === p.id ? { ...x, hidden } : x)),
        }),
        ok: hidden ? `${p.name} quedó oculto.` : `${p.name} vuelve a aparecer.`,
      }
    )

  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setConfirmReset(false), 4000)
      return
    }
    setConfirmReset(false)
    act(
      { action: "reset" },
      { key: "reset", ok: "Reiniciado: sin partida ni jugadores." }
    )
  }

  const resetRanking = () => {
    if (!confirmRanking) {
      setConfirmRanking(true)
      clearTimeout(rankingTimer.current)
      rankingTimer.current = setTimeout(() => setConfirmRanking(false), 4000)
      return
    }
    setConfirmRanking(false)
    act(
      { action: "reset_ranking" },
      { ok: "Ranking reiniciado. El CSV sigue completo." }
    )
  }

  const primary = canStart
    ? {
        label: `Iniciar partida · ${lobbyCount0} ${lobbyCount0 === 1 ? "jugador" : "jugadores"}`,
        hint: "Enter",
        key: "start",
      }
    : canNext
      ? {
          label:
            phase?.kind === "podium"
              ? "Terminar partida"
              : "Siguiente pantalla",
          hint: "Espacio o →",
          key: "next",
        }
      : null

  return (
    <div
      style={css(
        `display:flex;flex-direction:column;gap:16px;font-family:var(--font-sans);color:${INK}`
      )}
    >
      <div
        style={css(
          "display:flex;justify-content:space-between;align-items:center;gap:12px"
        )}
      >
        <span style={LABEL}>Control de la trivia</span>
        <span style={css("display:flex;gap:8px")}>
          {onPopOut && (
            <button onClick={onPopOut} style={btn("secondary", 40)}>
              Abrir en otra ventana
            </button>
          )}
          {onClose && (
            <button onClick={onClose} style={btn("secondary", 40)}>
              Cerrar
            </button>
          )}
        </span>
      </div>

      <section style={css(CARD)}>
        <div style={css("display:flex;gap:12px;align-items:flex-start")}>
          <span
            style={css(
              `flex:none;margin-top:8px;width:12px;height:12px;border-radius:999px;background:${info.dot};box-shadow:inset 0 0 0 1px rgba(10,10,11,.2)`
            )}
          />
          <div style={css("display:flex;flex-direction:column;gap:2px")}>
            <span
              style={css(
                "font-size:22px;font-weight:600;letter-spacing:-.02em"
              )}
            >
              {info.title}
            </span>
            {info.sub && (
              <span
                style={css(`font-size:15px;color:${MUTED};line-height:1.4`)}
              >
                {info.sub}
              </span>
            )}
          </div>
        </div>
        {primary ? (
          <button
            onClick={() => (canStart ? start() : next())}
            disabled={pending === primary.key}
            className="mv-press"
            style={{
              ...btn("primary", 72),
              fontSize: 20,
              opacity: pending === primary.key ? 0.6 : 1,
            }}
          >
            {primary.label}
            <span style={css("font-size:13px;font-weight:500;opacity:.6")}>
              {primary.hint}
            </span>
          </button>
        ) : (
          <span style={css(`font-size:14px;color:${MUTED}`)}>
            {manualLobby || manualSlides
              ? "Los botones de avance aparecen acá cuando corresponde."
              : "Todo corre solo. Activá el modo manual para iniciar y pasar pantallas vos."}
          </span>
        )}
      </section>

      <section style={css(CARD)}>
        <span style={LABEL}>Modo</span>
        <SwitchRow
          title="Pausar el loop"
          hint="La TV queda en el lobby y no arranca ninguna partida."
          on={paused}
          onChange={(on) =>
            act(
              { action: on ? "pause" : "resume" },
              {
                patch: (d) => ({ ...d, paused: on }),
                ok: on ? "Loop en pausa." : "Loop reanudado.",
              }
            )
          }
        />
        <SwitchRow
          title="Lobby manual"
          hint="Sin cuenta regresiva: la gente se suma y vos iniciás la partida."
          on={manualLobby}
          onChange={(on) =>
            act(
              { action: "manual_lobby", on },
              {
                patch: (d) => ({ ...d, manualLobby: on }),
                ok: on ? "Lobby manual." : "Lobby automático.",
              }
            )
          }
        />
        <SwitchRow
          title="Pantallas manuales"
          hint="Las preguntas cierran solas; revelación, top 5 y podio esperan a que las pases."
          on={manualSlides}
          onChange={(on) =>
            act(
              { action: "manual_slides", on },
              {
                patch: (d) => ({ ...d, manualSlides: on }),
                ok: on ? "Pantallas manuales." : "Pantallas automáticas.",
              }
            )
          }
        />
        <div
          style={css(
            "display:flex;align-items:center;justify-content:space-between;gap:16px"
          )}
        >
          <div style={css("display:flex;flex-direction:column;gap:2px")}>
            <span style={css("font-size:17px;font-weight:600")}>
              Cupo de la sala
            </span>
            <span style={css(`font-size:14px;color:${MUTED};line-height:1.35`)}>
              Con la sala llena nadie más entra a esa partida.
            </span>
          </div>
          <span
            style={css("flex:none;display:flex;align-items:center;gap:4px")}
          >
            <button
              onClick={() => stepMax(-10)}
              aria-label="Menos cupo"
              className="mv-press"
              style={{ ...btn("secondary", 44), width: 44, padding: 0 }}
            >
              −
            </button>
            <span
              style={css(
                "min-width:48px;text-align:center;font-family:var(--font-mono);font-size:19px;font-weight:500"
              )}
            >
              {maxPlayers}
            </span>
            <button
              onClick={() => stepMax(10)}
              aria-label="Más cupo"
              className="mv-press"
              style={{ ...btn("secondary", 44), width: 44, padding: 0 }}
            >
              +
            </button>
          </span>
        </div>
      </section>

      {(onPopOut || tvHere) && (
        <section style={css(CARD)}>
          <span style={LABEL}>Sonido de la TV</span>
          <SwitchRow
            title="Silenciar"
            hint="Se guarda en esta pantalla; desde otro dispositivo no aplica."
            on={sound.muted}
            onChange={(on) => setSoundSettings({ muted: on })}
          />
          <div
            style={css(
              "display:flex;align-items:center;justify-content:space-between;gap:16px"
            )}
          >
            <div style={css("display:flex;flex-direction:column;gap:2px")}>
              <span style={css("font-size:17px;font-weight:600")}>Volumen</span>
              <span
                style={css(`font-size:14px;color:${MUTED};line-height:1.35`)}
              >
                La TV suena una muestra con cada cambio.
              </span>
            </div>
            <span
              style={css("flex:none;display:flex;align-items:center;gap:4px")}
            >
              <button
                onClick={() =>
                  setSoundSettings({
                    volume: Math.max(
                      0.1,
                      Math.round(sound.volume * 10 - 1) / 10
                    ),
                  })
                }
                aria-label="Menos volumen"
                className="mv-press"
                style={{ ...btn("secondary", 44), width: 44, padding: 0 }}
              >
                −
              </button>
              <span
                style={css(
                  "min-width:56px;text-align:center;font-family:var(--font-mono);font-size:19px;font-weight:500"
                )}
              >
                {Math.round(sound.volume * 100)}%
              </span>
              <button
                onClick={() =>
                  setSoundSettings({
                    volume: Math.min(1, Math.round(sound.volume * 10 + 1) / 10),
                  })
                }
                aria-label="Más volumen"
                className="mv-press"
                style={{ ...btn("secondary", 44), width: 44, padding: 0 }}
              >
                +
              </button>
            </span>
          </div>
          <SwitchRow
            title="Música de fondo"
            hint="Loop suave en el lobby y el podio; baja durante las preguntas."
            on={sound.music}
            onChange={(on) => setSoundSettings({ music: on })}
          />
        </section>
      )}

      <section style={css(CARD)}>
        <div
          style={css(
            "display:flex;justify-content:space-between;align-items:center;gap:12px"
          )}
        >
          <span style={LABEL}>Jugadores de hoy</span>
          <span style={css(`font-size:14px;color:${MUTED}`)}>
            {data?.players.length ?? 0}
          </span>
        </div>
        {data && data.players.length > 6 && (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o ciudad"
            className="mv-input"
            style={css(
              `height:44px;padding:0 14px;border-radius:8px;border:1px solid rgba(10,10,11,.18);font-family:inherit;font-size:16px;color:${INK};background:#FFFFFF;outline:none`
            )}
          />
        )}
        {data && data.players.length === 0 && (
          <span style={css(`font-size:15px;color:${MUTED}`)}>
            Todavía no hay partidas hoy.
          </span>
        )}
        <div
          style={css(
            "display:flex;flex-direction:column;max-height:340px;overflow-y:auto"
          )}
        >
          {players.map((p) => (
            <div
              key={p.id}
              style={css(
                "display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid rgba(10,10,11,.08)"
              )}
            >
              <div
                style={css(
                  `min-width:0;display:flex;flex-direction:column;${p.hidden ? "opacity:.45" : ""}`
                )}
              >
                <span
                  style={css(
                    `font-size:16px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${p.hidden ? "text-decoration:line-through" : ""}`
                  )}
                >
                  {p.name}
                </span>
                <span style={css(`font-size:13px;color:${MUTED}`)}>
                  {p.city} · {p.games ? fmtPoints(p.best) : "en el lobby"}
                  {p.games > 1 ? ` · ${p.games} partidas` : ""}
                </span>
              </div>
              <button
                onClick={() => setHidden(p, !p.hidden)}
                className="mv-press"
                style={btn("secondary", 40)}
              >
                {p.hidden ? "Mostrar" : "Ocultar"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={css(CARD)}>
        <button
          onClick={() => setTimesOpen((v) => !v)}
          aria-expanded={timesOpen}
          style={css(
            "display:flex;justify-content:space-between;align-items:center;gap:12px;padding:0;border:0;background:none;font-family:inherit;cursor:pointer;text-align:left"
          )}
        >
          <span style={LABEL}>Tiempos (segundos)</span>
          <span style={css(`font-size:14px;color:${MUTED}`)}>
            {saved ? "Guardado · " : ""}
            {timesOpen ? "Ocultar" : "Editar"}
          </span>
        </button>
        {timesOpen && draft && (
          <>
            <span style={css(`font-size:14px;color:${MUTED}`)}>
              Se guardan solos y aplican desde la próxima partida.
            </span>
            <div
              style={css(
                "display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:8px"
              )}
            >
              {(Object.keys(TIMELINE_LABELS) as (keyof Timeline)[]).map((k) => (
                <div
                  key={k}
                  style={css(
                    "display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 6px 6px 14px;border-radius:8px;background:#F1F1F3"
                  )}
                >
                  <span style={css("font-size:15px;color:#3A3A40")}>
                    {TIMELINE_LABELS[k]}
                  </span>
                  <span style={css("display:flex;align-items:center;gap:4px")}>
                    <button
                      onClick={() => step(k, -1)}
                      aria-label={`Menos ${TIMELINE_LABELS[k]}`}
                      className="mv-press"
                      style={{ ...btn("secondary", 44), width: 44, padding: 0 }}
                    >
                      −
                    </button>
                    <span
                      style={css(
                        "min-width:38px;text-align:center;font-family:var(--font-mono);font-size:19px;font-weight:500"
                      )}
                    >
                      {draft[k]}
                    </span>
                    <button
                      onClick={() => step(k, 1)}
                      aria-label={`Más ${TIMELINE_LABELS[k]}`}
                      className="mv-press"
                      style={{ ...btn("secondary", 44), width: 44, padding: 0 }}
                    >
                      +
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section
        style={css(
          "display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between"
        )}
      >
        <a href="/api/juegos/trivia/export" download style={btn("secondary")}>
          Bajar CSV de hoy
        </a>
        <button
          onClick={resetRanking}
          style={btn(confirmRanking ? "danger" : "secondary")}
        >
          {confirmRanking
            ? "Vacía el ranking del día. Tocá de nuevo"
            : "Reiniciar ranking"}
        </button>
        <button
          onClick={reset}
          disabled={pending === "reset"}
          style={btn(confirmReset ? "danger" : "secondary")}
        >
          {confirmReset
            ? "Corta la partida y saca a todos. Tocá de nuevo"
            : "Reiniciar todo"}
        </button>
      </section>

      {toast && (
        <div
          role="status"
          style={css(
            `position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:50;max-width:calc(100vw - 32px);padding:12px 18px;border-radius:8px;font-size:15px;font-weight:600;color:#FFFFFF;background:${toast.error ? "#E5484D" : INK};box-shadow:0 8px 24px rgba(10,10,11,.3)`
          )}
        >
          {toast.text}
        </div>
      )}
    </div>
  )
}
