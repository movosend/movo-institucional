import { NextResponse } from "next/server"

import { badRequest, readJsonObject, UUID_RE } from "@/lib/juegos/movo-api"
import { EMAIL_RE, subscribeToNewsletter } from "@/lib/newsletter"
import { db, unavailable } from "@/lib/trivia/server"

/** Mail opcional del resultado: queda en el jugador y lo suma al newsletter de Resend. */
export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return badRequest()
  const { playerId, email } = body
  if (typeof playerId !== "string" || !UUID_RE.test(playerId))
    return badRequest("Jugador inválido.")
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    return badRequest("Ingresá un email válido.")
  const clean = email.trim().toLowerCase().slice(0, 254)

  const supabase = db()
  if (!supabase) return unavailable()
  const { data, error } = await supabase
    .from("trivia_players")
    .update({ email: clean, updated_at: new Date().toISOString() })
    .eq("id", playerId)
    .select("name")
    .maybeSingle()
  if (error) {
    console.error("[trivia] email:", error)
    return unavailable()
  }
  if (!data) return badRequest("Jugador inválido.")

  const result = await subscribeToNewsletter({
    email: clean,
    firstName: data.name,
  })
  if (!result.ok) console.error("[trivia] newsletter:", result.reason)
  // El mail ya quedó guardado en el jugador: no hace falta que el celular reintente.
  return NextResponse.json({ ok: true })
}
