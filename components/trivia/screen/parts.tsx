import { css } from "@/lib/juegos/css"
import { fmtClock } from "@/lib/trivia/engine"

/** Piezas comunes de las escenas de la TV (1920×1080), copiadas del prototipo. */

export function Brand({
  label,
  strong,
}: {
  label: string
  /** Fondo lime: separador negro y texto en tinta. */
  strong?: boolean
}) {
  return (
    <div style={css("display:flex;align-items:center;gap:20px")}>
      <span
        style={css(
          "width:44px;height:44px;border-radius:999px;border:10px solid #0A0A0B;box-sizing:border-box"
        )}
      />
      <span
        style={css("font-size:42px;font-weight:600;letter-spacing:-.045em")}
      >
        movo
      </span>
      <span
        style={css(
          strong
            ? "width:2px;height:32px;background:#0A0A0B"
            : "width:1px;height:32px;background:rgba(10,10,11,.18)"
        )}
      />
      <span
        style={css(
          `font-size:22px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${strong ? "#0A0A0B" : "#5A5A62"}`
        )}
      >
        {label}
      </span>
    </div>
  )
}

export function Header({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={css(
        "position:absolute;top:0;left:0;right:0;height:128px;padding:0 72px;display:flex;align-items:center;justify-content:space-between"
      )}
    >
      {children}
    </div>
  )
}

/** "18 de 24 respondieron" + reloj. */
export function TimerHeader({
  done,
  total,
  verb,
  remainingMs,
}: {
  done: number
  total: number
  verb: string
  remainingMs: number
}) {
  return (
    <div style={css("display:flex;align-items:center;gap:28px")}>
      <span style={css("font-size:26px;color:#3A3A40")}>
        <strong style={css("font-weight:600;color:#0A0A0B")}>{done}</strong> de{" "}
        {total} {verb}
      </span>
      <span
        style={css(
          "display:flex;align-items:center;gap:12px;height:68px;padding:0 26px;border-radius:999px;background:#0A0A0B;color:#FFFFFF;font-family:var(--font-mono);font-size:36px;font-weight:500"
        )}
      >
        <span
          style={css(
            "width:12px;height:12px;border-radius:999px;background:#C6F24A"
          )}
        />
        {fmtClock(remainingMs)}
      </span>
    </div>
  )
}

/** Barra de tiempo bajo el header: el ancho es lo que queda. */
export function TimeBar({ left }: { left: number }) {
  return (
    <div
      style={css(
        "position:absolute;top:128px;left:0;right:0;height:8px;background:#E6E6EA"
      )}
    >
      <div
        style={{
          ...css("height:100%;background:#0A0A0B;transition:width .2s linear"),
          width: `${Math.max(0, Math.min(1, left)) * 100}%`,
        }}
      />
    </div>
  )
}

export const ordinal = (n: number) => `${n}°`
