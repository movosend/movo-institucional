"use client"

import { css } from "@/lib/juegos/css"
import type { TriviaState } from "@/lib/trivia/types"

import { CONTROL_PATH, ControlPanel } from "../control/control-panel"

/**
 * Modo stand de la TV (5 toques en la esquina superior izquierda): el mismo control de
 * `/juegos/trivia/control` sobre la pantalla, con la opción de sacarlo a otra ventana.
 */
export function StandPanel({
  state,
  now,
  onClose,
  onChange,
}: {
  state: TriviaState | null
  now: number
  onClose: () => void
  onChange: () => void
}) {
  const popOut = () => {
    const w = window.open(
      CONTROL_PATH,
      "movo-trivia-control",
      "popup=yes,width=560,height=900"
    )
    if (w) onClose()
  }
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={css(
        "position:absolute;inset:0;z-index:30;background:rgba(10,10,11,.7);display:flex;align-items:center;justify-content:center;user-select:text"
      )}
    >
      <div
        style={css(
          "width:min(720px,94vw);max-height:94vh;overflow-y:auto;box-sizing:border-box;padding:20px;border-radius:14px;background:#F1F1F3;box-shadow:0 24px 60px rgba(10,10,11,.3)"
        )}
      >
        <ControlPanel
          state={state}
          now={now}
          onChange={onChange}
          onPopOut={popOut}
          onClose={onClose}
        />
      </div>
    </div>
  )
}
