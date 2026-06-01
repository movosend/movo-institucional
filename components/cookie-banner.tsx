"use client"

import { useEffect, useRef, useState } from "react"
import { Info } from "lucide-react"
import { gsap } from "gsap"
import { getConsent, setConsent } from "@/lib/consent"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  // Track position so we only animate on actual direction change
  const atBottom = useRef(false)

  useEffect(() => {
    if (getConsent() === null) setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible || !ref.current) return

    const el = ref.current
    // Place banner at top initially without animation
    gsap.set(el, { top: 16, bottom: "auto", y: 0 })

    const onScroll = () => {
      const shouldBeBottom = window.scrollY > 20

      if (shouldBeBottom && !atBottom.current) {
        atBottom.current = true
        // Animate down: switch anchor to bottom, use y to slide in from above
        gsap.set(el, { bottom: 16, top: "auto", y: -80 })
        gsap.to(el, { y: 0, duration: 0.45, ease: "power2.out" })
      } else if (!shouldBeBottom && atBottom.current) {
        atBottom.current = false
        // Animate up: switch anchor to top, use y to slide in from below
        gsap.set(el, { top: 16, bottom: "auto", y: 80 })
        gsap.to(el, { y: 0, duration: 0.45, ease: "power2.out" })
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [visible])

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
      ref={ref}
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed right-4 z-50 w-full max-w-md rounded-xl border border-white/5 bg-white/5 px-4 py-3 shadow-lg backdrop-blur-md"
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
          <span className="text-ink-400">Microsoft Clarity:</span> registra
          interacciones anónimas (clics, scroll) para mejorar el sitio. Sin
          datos personales.
        </p>
      )}
    </div>
  )
}
