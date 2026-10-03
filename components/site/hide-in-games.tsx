"use client"

import { usePathname } from "next/navigation"

/** Los juegos (`/juegos`) son pantallas completas para el stand: sin navbar, footer ni banner de cookies. */
export function isGamesPath(pathname: string) {
  return pathname === "/juegos" || pathname.startsWith("/juegos/")
}

export function HideInGames({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (isGamesPath(pathname)) return null
  return children
}
