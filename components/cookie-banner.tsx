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
      // Mobile: full-width bottom bar. Desktop: floating card anchored bottom-right
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/5 bg-ink-950/95 px-4 py-4 shadow-lg backdrop-blur-md md:right-4 md:bottom-4 md:left-auto md:w-full md:max-w-md md:rounded-xl md:border md:border-white/5 md:bg-white/5 md:px-4 md:py-3"
    >
      {/* Mobile layout: stacked text + action row */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm leading-relaxed text-ink-300">
            Este sitio usa tecnologías de seguimiento para mejorar la
            experiencia.
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label="Más información"
            className="mt-0.5 shrink-0 text-ink-500 transition-colors hover:text-ink-300"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        <div
          className="grid transition-[grid-template-rows] duration-[var(--motion-state)] ease-out motion-reduce:transition-none"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <p className="pb-1 text-sm text-ink-500">
              <span className="text-ink-400">Microsoft Clarity:</span> registra
              interacciones anónimas (clics, scroll) para mejorar el sitio. Sin
              datos personales.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => dispatch("accepted")}
            className="flex-1 rounded-lg border border-ink-600 bg-transparent px-4 py-2.5 text-sm font-medium text-ink-200 transition-colors hover:border-ink-400 hover:text-white"
          >
            Aceptar
          </button>
          <button
            onClick={() => dispatch("denied")}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm text-ink-500 transition-colors hover:text-ink-300"
          >
            Denegar
          </button>
        </div>
      </div>

      {/* Desktop layout: single row */}
      <div className="hidden items-center gap-3 md:flex">
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

      <div
        className="hidden transition-[grid-template-rows] duration-[var(--motion-state)] ease-out motion-reduce:transition-none md:grid"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="mt-2 text-xs text-ink-500">
            <span className="text-ink-400">Microsoft Clarity:</span> registra
            interacciones anónimas (clics, scroll) para mejorar el sitio. Sin
            datos personales.
          </p>
        </div>
      </div>
    </div>
  )
}
