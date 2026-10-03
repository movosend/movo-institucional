import { NextResponse } from "next/server"

import { EMAIL_RE, subscribeToNewsletter } from "@/lib/newsletter"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 })
  }

  const { email, firstName, lastName } = (body ?? {}) as {
    email?: unknown
    firstName?: unknown
    lastName?: unknown
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "Ingresá un email válido." },
      { status: 400 }
    )
  }

  if (typeof firstName !== "string" || !firstName.trim()) {
    return NextResponse.json({ error: "Ingresá tu nombre." }, { status: 400 })
  }

  if (typeof lastName !== "string" || !lastName.trim()) {
    return NextResponse.json({ error: "Ingresá tu apellido." }, { status: 400 })
  }

  const result = await subscribeToNewsletter({ email, firstName, lastName })
  if (!result.ok) {
    return result.reason === "unavailable"
      ? NextResponse.json(
          { error: "El servicio no está disponible en este momento." },
          { status: 500 }
        )
      : NextResponse.json(
          { error: "No pudimos registrarte. Probá de nuevo en un momento." },
          { status: 502 }
        )
  }

  return NextResponse.json({ ok: true })
}
