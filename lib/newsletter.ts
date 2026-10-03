import "server-only"

import { Resend } from "resend"

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "unavailable" | "provider" }

/**
 * Suma un contacto a la audiencia del newsletter en Resend. La usan el formulario del
 * home (`/api/newsletter`) y el paso de sorteo de los juegos (`/api/juegos/newsletter`).
 * Un mail ya registrado no es un error para quien se suscribe.
 */
export async function subscribeToNewsletter(contact: {
  email: string
  firstName?: string
  lastName?: string
}): Promise<SubscribeResult> {
  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!apiKey || !audienceId) {
    console.error("[newsletter] Falta RESEND_API_KEY o RESEND_AUDIENCE_ID")
    return { ok: false, reason: "unavailable" }
  }

  const { error } = await new Resend(apiKey).contacts.create({
    email: contact.email.trim().toLowerCase(),
    ...(contact.firstName ? { firstName: contact.firstName.trim() } : {}),
    ...(contact.lastName ? { lastName: contact.lastName.trim() } : {}),
    unsubscribed: false,
    audienceId,
  })

  if (error) {
    if (/already/i.test(error.message ?? "")) return { ok: true }
    console.error("[newsletter] Resend:", error)
    return { ok: false, reason: "provider" }
  }
  return { ok: true }
}
