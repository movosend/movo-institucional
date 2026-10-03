import { css } from "@/lib/juegos/css"
import { fmtClock } from "@/lib/trivia/engine"

import { Arrow } from "../icons"
import { Wordmark } from "../wordmark"

/** Piezas comunes del celular (diseño a 390 px de ancho), copiadas del prototipo. */

export function Screen({
  bg = "#FFFFFF",
  fg = "#0A0A0B",
  children,
}: {
  bg?: string
  fg?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="mv-game mv-trivia"
      style={css(
        `position:fixed;inset:0;z-index:200;overflow-y:auto;background:${bg};color:${fg};font-family:var(--font-sans);-webkit-tap-highlight-color:transparent;transition:background .36s`
      )}
    >
      <div
        style={css(
          "max-width:480px;min-height:100%;margin:0 auto;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);box-sizing:border-box"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function Logo({ label }: { label?: string }) {
  return (
    <Wordmark
      size={22}
      mark={26}
      gap={10}
      label={label}
      labelSize={13}
      labelStyle="color:#5A5A62"
    />
  )
}

export function Bar({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={css(
        "flex:none;height:56px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:10px"
      )}
    >
      {children}
    </div>
  )
}

export function Eyebrow({
  children,
  color = "#5A5A62",
}: {
  children: React.ReactNode
  color?: string
}) {
  return (
    <span
      style={css(
        `font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${color}`
      )}
    >
      {children}
    </span>
  )
}

export function NamePill({
  children,
  dark,
}: {
  children: React.ReactNode
  dark?: "ink" | "soft"
}) {
  return (
    <span
      style={css(
        `padding:6px 12px;border-radius:999px;background:${dark === "ink" ? "#0A0A0B" : dark === "soft" ? "#27272B" : "#F1F1F3"};color:${dark ? "#FFFFFF" : "#0A0A0B"};font-size:15px;font-weight:600;white-space:nowrap`
      )}
    >
      {children}
    </span>
  )
}

export function TimerPill({ ms }: { ms: number }) {
  return (
    <span
      style={css(
        "display:flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:999px;background:#0A0A0B;color:#FFFFFF;font-family:var(--font-mono);font-size:18px"
      )}
    >
      <span
        style={css(
          "width:7px;height:7px;border-radius:999px;background:#C6F24A"
        )}
      />
      {fmtClock(ms)}
    </span>
  )
}

export function TimeLine({ left }: { left: number }) {
  return (
    <div
      style={css(
        "flex:none;height:4px;margin:0 20px;border-radius:999px;background:#E6E6EA;overflow:hidden"
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

export function Body({
  children,
  pad = "28px 20px 32px",
  gap = 24,
}: {
  children: React.ReactNode
  pad?: string
  gap?: number
}) {
  return (
    <div
      style={css(
        `flex:1;padding:${pad};display:flex;flex-direction:column;gap:${gap}px`
      )}
    >
      {children}
    </div>
  )
}

export function H1({
  children,
  size = 36,
  style,
}: {
  children: React.ReactNode
  size?: number
  style?: string
}) {
  const lh = size >= 50 ? 1 : size >= 36 ? 1.05 : size >= 30 ? 1.1 : 1.15
  const ls = size >= 50 ? "-.045em" : size >= 30 ? "-.035em" : "-.025em"
  return (
    <h1
      style={css(
        `margin:0;font-size:${size}px;line-height:${lh};letter-spacing:${ls};font-weight:600;text-wrap:pretty;${style ?? ""}`
      )}
    >
      {children}
    </h1>
  )
}

export function Primary({
  children,
  onClick,
  disabled,
  icon = "arrow",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: "arrow" | "none"
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className="mv-press"
      style={css(
        `flex:none;height:58px;width:100%;border:0;border-radius:8px;background:#0A0A0B;color:#FFFFFF;display:flex;align-items:center;justify-content:center;gap:10px;font-family:inherit;font-size:19px;font-weight:600;cursor:pointer;opacity:${disabled ? 0.4 : 1};transition:opacity .2s,transform .12s`
      )}
    >
      {children}
      {icon === "arrow" && <Arrow size={20} color="#C6F24A" width={2.25} />}
    </button>
  )
}

export function Muted({
  children,
  size = 15,
}: {
  children: React.ReactNode
  size?: number
}) {
  return (
    <span style={css(`font-size:${size}px;line-height:1.4;color:#5A5A62`)}>
      {children}
    </span>
  )
}

export function FactBox({ fact, dark }: { fact: string; dark?: boolean }) {
  return (
    <div
      style={css(
        `padding:18px;border-radius:6px;background:${dark ? "#1A1A1D" : "#FFFFFF"};display:flex;flex-direction:column;gap:8px`
      )}
    >
      <span
        style={css(
          `font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${dark ? "#B4B4BC" : "#5A5A62"}`
        )}
      >
        Dato Movo
      </span>
      <p
        style={css("margin:0;font-size:17px;line-height:1.4;text-wrap:pretty")}
      >
        {fact}
      </p>
    </div>
  )
}
