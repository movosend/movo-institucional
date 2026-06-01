"use client"

import { useEffect, useState } from "react"
import { Info } from "lucide-react"
import { getConsent, setConsent } from "@/lib/consent"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (getConsent() === null) setVisible(true)
  }, [])

  function dispatch(decision: "accepted" | "denied") {
    setConsent(decision)
    setVisible(false)
    window.dispatchEvent(
      new CustomEvent("consent-decision", { detail: decision })
    )
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed right-4 top-4 z-50 w-full max-w-md rounded-xl border border-white/5 bg-white/5 px-4 py-3 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-ink-400">
          Este sitio usa tecnologías de seguimiento.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => dispatch("accepted")}
            className="rounded-lg border border-ink-700/60 bg-transparent px-3 py-1.5 text-xs text-ink-300 transition-colors duration-120 hover:border-ink-500 hover:text-white"
          >
            Aceptar
          </button>
          <button
            onClick={() => dispatch("denied")}
            className="rounded-lg px-3 py-1.5 text-xs text-ink-600 transition-colors duration-120 hover:text-ink-400"
          >
            Denegar
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label="Más información"
            className="text-ink-600 transition-colors duration-120 hover:text-ink-300"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <p className="mt-2 text-xs text-ink-500">
          <span className="text-ink-400">Microsoft Clarity:</span> registra interacciones anónimas (clics, scroll) para mejorar el sitio. Sin datos personales.
        </p>
      )}
    </div>
  )
}
