"use client"

import "./juegos.css"

import { useCallback, useEffect, useState } from "react"

import { css } from "@/lib/juegos/css"

const LENGTH = 6
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"]

type Status = "idle" | "checking" | "error"

/** Pantalla del PIN de los juegos (`JUEGOS_PIN`): teclado numérico para el iPad del stand. */
export function PinGate({ next }: { next: string }) {
  const [pin, setPin] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const [attempt, setAttempt] = useState(0)

  const submit = useCallback(
    async (value: string) => {
      setStatus("checking")
      try {
        const res = await fetch("/api/juegos/acceso", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pin: value }),
        })
        if (res.ok) {
          // Navegación completa: el proxy vuelve a leer la cookie recién creada.
          window.location.replace(next)
          return
        }
        const data = (await res.json().catch(() => null)) as {
          error?: { message?: string }
        } | null
        setMessage(data?.error?.message ?? "No se pudo validar el PIN.")
      } catch {
        setMessage("Sin conexión. Probá de nuevo.")
      }
      setStatus("error")
      setAttempt((a) => a + 1)
      setPin("")
    },
    [next]
  )

  const press = useCallback(
    (key: string) => {
      if (status === "checking") return
      if (key === "⌫") {
        setPin((p) => p.slice(0, -1))
        return
      }
      if (!/^\d$/.test(key) || pin.length >= LENGTH) return
      const value = pin + key
      setPin(value)
      setStatus("idle")
      if (value.length === LENGTH) void submit(value)
    },
    [pin, status, submit]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Backspace") press("⌫")
      else if (/^\d$/.test(e.key)) press(e.key)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [press])

  return (
    <div
      className="mv-game"
      style={css(
        "position:fixed;inset:0;z-index:200;background:#0A0A0B;color:#FFFFFF;font-family:var(--font-sans);overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:32px 32px"
      )}
    >
      <div
        style={css(
          "display:flex;flex-direction:column;align-items:center;gap:clamp(20px,4vh,36px);padding:24px;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) both"
        )}
      >
        <span
          style={css(
            "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
          )}
        >
          Movo · Juegos
        </span>
        <h1
          style={css(
            "margin:0;font-size:clamp(28px,4vh,40px);line-height:1.08;letter-spacing:-.03em;font-weight:600;text-align:center"
          )}
        >
          Ingresá el PIN del stand
        </h1>

        <div
          key={attempt}
          style={css(
            `display:flex;gap:14px;${attempt > 0 ? "animation:mvShake .4s ease both" : ""}`
          )}
        >
          {Array.from({ length: LENGTH }, (_, i) => (
            <span
              key={i}
              style={css(
                `width:18px;height:18px;border-radius:50%;border:2px solid ${status === "error" ? "#E5484D" : "#C6F24A"};background:${i < pin.length ? "#C6F24A" : "transparent"};transition:background .12s`
              )}
            />
          ))}
        </div>

        <span
          role="status"
          style={css(
            `min-height:24px;font-size:17px;color:${status === "error" ? "#E5484D" : "#8A8A93"}`
          )}
        >
          {status === "checking"
            ? "Verificando…"
            : status === "error"
              ? message
              : ""}
        </span>

        <div
          style={css(
            "display:grid;grid-template-columns:repeat(3,clamp(72px,10vh,92px));gap:clamp(12px,2vh,18px)"
          )}
        >
          {KEYS.map((key, i) =>
            key ? (
              <button
                key={i}
                type="button"
                aria-label={key === "⌫" ? "Borrar" : key}
                onClick={() => press(key)}
                disabled={status === "checking"}
                style={css(
                  `aspect-ratio:1;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:${key === "⌫" ? "transparent" : "rgba(255,255,255,.06)"};color:#FFFFFF;font-family:inherit;font-size:clamp(26px,3.6vh,34px);font-weight:500;cursor:pointer;opacity:${status === "checking" ? 0.5 : 1}`
                )}
              >
                {key}
              </button>
            ) : (
              <span key={i} />
            )
          )}
        </div>
      </div>
    </div>
  )
}
