import { NextResponse } from "next/server"

import { badRequest, readJsonObject } from "@/lib/juegos/movo-api"
import { EMAIL_RE, subscribeToNewsletter } from "@/lib/newsletter"

/**
 * Paso de sorteo de los juegos (/juegos): dejar el mail suscribe al newsletter (el
 * texto de la pantalla lo dice, ver `components/juegos/raffle.ts`). El nombre es
 * opcional: el juego de precios no lo pide, el del optimizador sí (ranking).
 */
export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return badRequest()
  const { email, name } = body
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    return badRequest("Ingresá un email válido.")
  const firstName =
    typeof name === "string" && name.trim()
      ? name.trim().slice(0, 60)
      : undefined

  const result = await subscribeToNewsletter({ email, firstName })
  if (!result.ok)
    return NextResponse.json(
      {
        error: {
          code: "NEWSLETTER_UNAVAILABLE",
          message: "No pudimos registrarte en este momento.",
        },
      },
      { status: result.reason === "unavailable" ? 503 : 502 }
    )
  return NextResponse.json({ ok: true })
}
