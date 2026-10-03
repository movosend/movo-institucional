import { badRequest, forwardToMovo } from "@/lib/juegos/movo-api"

const EVENT_TAG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

/** Juego de precios: métricas agregadas (sin datos personales). */
export async function GET(request: Request) {
  const eventTag = new URL(request.url).searchParams.get("eventTag")
  if (eventTag !== null && !EVENT_TAG_RE.test(eventTag))
    return badRequest("Evento inválido.")
  const query = eventTag ? `?eventTag=${encodeURIComponent(eventTag)}` : ""
  return forwardToMovo(request, `/pricing-game/stats${query}`, {
    method: "GET",
  })
}
