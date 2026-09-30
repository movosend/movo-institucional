"use client"

import { useEffect, useLayoutEffect, type RefObject } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger)

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

/** Zoom de página aplicado en escritorio (ver --page-zoom en globals.css). */
export function pageZoom() {
  if (typeof window === "undefined") return 1
  return parseFloat(getComputedStyle(document.documentElement).zoom) || 1
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

/**
 * Corre `setup` dentro de un gsap.context acotado a `scope` y lo revierte al
 * desmontar. `setup` recibe si el usuario pidió reducir el movimiento.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (reduce: boolean) => void | (() => void),
  deps: unknown[] = []
) {
  useIsoLayoutEffect(() => {
    if (!scope.current) return
    let cleanup: void | (() => void)
    const ctx = gsap.context(() => {
      cleanup = setup(prefersReducedMotion())
    }, scope)
    return () => {
      cleanup?.()
      ctx.revert()
    }
  }, deps)
}

export { gsap, ScrollTrigger }
