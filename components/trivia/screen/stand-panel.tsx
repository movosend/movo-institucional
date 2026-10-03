"use client"

import { useCallback, useEffect, useState } from "react"

import { css } from "@/lib/juegos/css"
import {
  TIMELINE_LABELS,
  TIMELINE_LIMITS,
  type Timeline,
} from "@/lib/trivia/config"
import { fmtPoints } from "@/lib/trivia/engine"

/**
 * Modo stand de la TV (5 toques en la esquina superior izquierda): pausar el loop, ajustar
 * tiempos (aplican desde la próxima partida, para todos), ocultar nombres y bajar el CSV.
 * Mismo estilo que el modo stand de los otros juegos.
 */
interface AdminData {
  paused: boolean
  timeline: Timeline
  players: {
    id: string
    name: string
    city: string
    hidden: boolean
    best: number
    games: number
  }[]
}

const BTN = (on: boolean) =>
  css(
    `height:52px;padding:0 16px;border-radius:8px;border:1px solid ${on ? "#0A0A0B" : "rgba(10,10,11,.18)"};background:${on ? "#0A0A0B" : "#FFFFFF"};color:${on ? "#FFFFFF" : "#0A0A0B"};font-family:inherit;font-size:17px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none`
  )
const LABEL = css(
  "font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5A5A62"
)

export function StandPanel({
  onClose,
  onChange,
  paused,
}: {
  onClose: () => void
  onChange: () => void
  paused: boolean
}) {
  const [data, setData] = useState<AdminData | null>(null)
  const [draft, setDraft] = useState<Timeline | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/juegos/trivia/admin", { cache: "no-store" })
      if (!r.ok) throw new Error(String(r.status))
      const d = (await r.json()) as AdminData
      setData(d)
      setDraft((cur) => cur ?? d.timeline)
    } catch {
      setMsg("No se pudo cargar. Revisá la conexión.")
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga por red al abrir
    void load()
  }, [load])

  const act = async (body: object, ok: string) => {
    setBusy(true)
    try {
      const r = await fetch("/api/juegos/trivia/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error(String(r.status))
      setMsg(ok)
      onChange()
      await load()
    } catch {
      setMsg("No se pudo guardar. Probá de nuevo.")
    } finally {
      setBusy(false)
    }
  }

  const isPaused = data?.paused ?? paused
  const changed =
    draft &&
    data &&
    (Object.keys(draft) as (keyof Timeline)[]).some(
      (k) => draft[k] !== data.timeline[k]
    )

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={css(
        "position:absolute;inset:0;z-index:30;background:rgba(10,10,11,.7);display:flex;align-items:center;justify-content:center;font-family:var(--font-sans);user-select:text"
      )}
    >
      <div
        style={css(
          "width:min(760px,92vw);max-height:92vh;overflow-y:auto;box-sizing:border-box;padding:36px;border-radius:14px;background:#FFFFFF;color:#0A0A0B;display:flex;flex-direction:column;gap:24px;box-shadow:0 24px 60px rgba(10,10,11,.3)"
        )}
      >
        <div
          style={css(
            "display:flex;justify-content:space-between;align-items:center"
          )}
        >
          <span style={LABEL}>Modo stand · Trivia</span>
          <button onClick={onClose} style={BTN(false)}>
            Cerrar
          </button>
        </div>

        <div style={css("display:flex;gap:10px;flex-wrap:wrap")}>
          <button
            disabled={busy}
            onClick={() =>
              void act(
                { action: isPaused ? "resume" : "pause" },
                isPaused
                  ? "Loop reanudado."
                  : "Loop en pausa: la TV queda en el lobby."
              )
            }
            style={BTN(isPaused)}
          >
            <span
              style={css(
                `width:10px;height:10px;border-radius:999px;background:${isPaused ? "#C6F24A" : "#B4B4BC"}`
              )}
            />
            {isPaused ? "En pausa · reanudar" : "Pausar el loop"}
          </button>
          <a href="/api/juegos/trivia/export" download style={BTN(false)}>
            Bajar CSV de hoy
          </a>
        </div>

        <div style={css("display:flex;flex-direction:column;gap:12px")}>
          <span style={LABEL}>
            Tiempos (segundos) · aplican desde la próxima partida
          </span>
          {draft && (
            <div
              style={css("display:grid;grid-template-columns:1fr 1fr;gap:10px")}
            >
              {(Object.keys(TIMELINE_LABELS) as (keyof Timeline)[]).map((k) => {
                const [min, max] = TIMELINE_LIMITS[k]
                const set = (v: number) =>
                  setDraft({ ...draft, [k]: Math.min(max, Math.max(min, v)) })
                return (
                  <div
                    key={k}
                    style={css(
                      "display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 8px 8px 16px;border-radius:8px;background:#F1F1F3"
                    )}
                  >
                    <span style={css("font-size:15px;color:#3A3A40")}>
                      {TIMELINE_LABELS[k]}
                    </span>
                    <span
                      style={css("display:flex;align-items:center;gap:6px")}
                    >
                      <button
                        onClick={() => set(draft[k] - 1)}
                        style={{ ...BTN(false), width: 44, height: 44 }}
                      >
                        −
                      </button>
                      <span
                        style={css(
                          "min-width:40px;text-align:center;font-family:var(--font-mono);font-size:20px;font-weight:500"
                        )}
                      >
                        {draft[k]}
                      </span>
                      <button
                        onClick={() => set(draft[k] + 1)}
                        style={{ ...BTN(false), width: 44, height: 44 }}
                      >
                        +
                      </button>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <button
            disabled={!changed || busy}
            onClick={() =>
              void act(
                { action: "timeline", timeline: draft },
                "Tiempos guardados."
              )
            }
            style={{ ...BTN(!!changed), opacity: changed ? 1 : 0.5 }}
          >
            Guardar tiempos
          </button>
        </div>

        <div style={css("display:flex;flex-direction:column;gap:12px")}>
          <span style={LABEL}>
            Jugadores de hoy · tocá para ocultar de la TV
          </span>
          {data && data.players.length === 0 && (
            <span style={css("font-size:15px;color:#5A5A62")}>
              Todavía no hay partidas hoy.
            </span>
          )}
          <div style={css("display:flex;flex-direction:column;gap:6px")}>
            {data?.players.map((p) => (
              <button
                key={p.id}
                disabled={busy}
                onClick={() =>
                  void act(
                    { action: p.hidden ? "unhide" : "hide", playerId: p.id },
                    p.hidden
                      ? `${p.name} vuelve a aparecer.`
                      : `${p.name} quedó oculto.`
                  )
                }
                style={css(
                  `display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:16px;padding:12px 16px;border-radius:8px;border:1px solid rgba(10,10,11,.12);background:${p.hidden ? "#F1F1F3" : "#FFFFFF"};font-family:inherit;text-align:left;cursor:pointer;color:#0A0A0B`
                )}
              >
                <span
                  style={css(
                    `font-size:17px;font-weight:600;${p.hidden ? "text-decoration:line-through;color:#8A8A93" : ""}`
                  )}
                >
                  {p.name}{" "}
                  <span style={css("font-weight:400;color:#5A5A62")}>
                    · {p.city}
                  </span>
                </span>
                <span
                  style={css(
                    "font-family:var(--font-mono);font-size:15px;color:#5A5A62"
                  )}
                >
                  {fmtPoints(p.best)} · {p.games}{" "}
                  {p.games === 1 ? "partida" : "partidas"}
                </span>
                <span
                  style={css("font-size:13px;font-weight:600;color:#5A5A62")}
                >
                  {p.hidden ? "Mostrar" : "Ocultar"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {msg && <span style={css("font-size:15px;color:#3A3A40")}>{msg}</span>}
      </div>
    </div>
  )
}
