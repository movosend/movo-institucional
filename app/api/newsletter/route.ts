import { NextResponse } from "next/server"
import { Resend } from "resend"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (!apiKey || !audienceId) {
    console.error("[newsletter] Falta RESEND_API_KEY o RESEND_AUDIENCE_ID")
    return NextResponse.json(
      { error: "El servicio no está disponible en este momento." },
      { status: 500 }
    )
  }

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

  const resend = new Resend(apiKey)

  const { error } = await resend.contacts.create({
    email: email.trim().toLowerCase(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    unsubscribed: false,
    audienceId,
  })

  if (error) {
    // Un email ya registrado no es un error para quien se suscribe.
    if (/already/i.test(error.message ?? "")) {
      return NextResponse.json({ ok: true })
    }
    console.error("[newsletter] Resend:", error)
    return NextResponse.json(
      { error: "No pudimos registrarte. Probá de nuevo en un momento." },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
