"use client"

import "@/components/juegos/juegos.css"
import "../trivia.css"

import { css } from "@/lib/juegos/css"
import { useNow, useTriviaState } from "@/lib/trivia/client"

import { ControlPanel } from "./control-panel"

/**
 * Control de la trivia en su propia ventana (`/juegos/trivia/control`): para llevarlo a la
 * otra pantalla del proyector, a una tablet o al celular. No manda el ping de la pantalla,
 * así que abrirlo no "enciende" la trivia: eso sigue siendo cosa de la TV.
 */
export function TriviaControl() {
  const { state, refresh, offline } = useTriviaState({ role: "tv" })
  const now = useNow(250)
  return (
    <div
      className="mv-game"
      style={css(
        "min-height:100dvh;background:#F1F1F3;padding:20px 16px 80px;font-family:var(--font-sans)"
      )}
    >
      <div style={css("max-width:720px;margin:0 auto")}>
        {offline && (
          <div
            style={css(
              "margin-bottom:12px;padding:10px 14px;border-radius:8px;background:#E5484D;color:#FFFFFF;font-size:14px;font-weight:600"
            )}
          >
            Sin conexión, reintentando
          </div>
        )}
        <ControlPanel state={state} now={now} onChange={refresh} />
      </div>
    </div>
  )
}
