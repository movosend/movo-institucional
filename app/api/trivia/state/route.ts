import { NextResponse } from "next/server"

import { UUID_RE } from "@/lib/juegos/movo-api"
import { buildState, unavailable } from "@/lib/trivia/server"

/**
 * Estado de la trivia para la TV y los celulares (público: lo abre el QR). Corre el loop de
 * partidas (`trivia_tick`) y devuelve la hora del server para sincronizar relojes.
 */
export async function GET(request: Request) {
  const player = new URL(request.url).searchParams.get("player")
  try {
    const state = await buildState(
      player && UUID_RE.test(player) ? player : undefined
    )
    return NextResponse.json(state, {
      headers: { "cache-control": "no-store" },
    })
  } catch (e) {
    console.error("[trivia] state:", e)
    return unavailable()
  }
}
