"use client"

import { usePathname } from "next/navigation"

/**
 * Los juegos (`/juegos`) y la trivia del celular (`/trivia`) son pantallas completas para el
 * stand: sin navbar, footer ni banner de cookies.
 */
export function isGamesPath(pathname: string) {
  return ["/juegos", "/trivia"].some(
    (base) => pathname === base || pathname.startsWith(base + "/")
  )
}

export function HideInGames({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (isGamesPath(pathname)) return null
  return children
}
