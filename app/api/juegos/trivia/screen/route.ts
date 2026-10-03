import { NextResponse } from "next/server"

import { broadcast, db, invalidateTick, unavailable } from "@/lib/trivia/server"

/**
 * Aviso de la pantalla del stand (detrás del PIN de /juegos, ver proxy.ts): mientras llega,
 * la trivia está abierta. `?leave=1` la cierra al instante (la TV lo manda al cerrarse).
 */
export async function POST(request: Request) {
  const leave = new URL(request.url).searchParams.get("leave") === "1"
  const supabase = db()
  if (!supabase) return unavailable()
  const { data: changed, error } = await supabase.rpc("trivia_screen_ping", {
    p_leave: leave,
  })
  if (error) {
    console.error("[trivia] screen:", error)
    return unavailable()
  }
  if (changed || leave) {
    invalidateTick()
    broadcast("room")
  }
  return NextResponse.json({ ok: true })
}
