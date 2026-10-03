import { parseEventTag } from "@/lib/juegos/event-tag"
import {
  badRequest,
  forwardToMovo,
  readJsonObject,
} from "@/lib/juegos/movo-api"

/** Juego del optimizador: botón "Reiniciar ranking de hoy" del modo stand. */
export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return badRequest()
  const eventTag =
    typeof body.eventTag === "string" ? parseEventTag(body.eventTag) : undefined
  if (body.eventTag !== undefined && !eventTag)
    return badRequest("Evento inválido.")
  return forwardToMovo(request, "/route-game/ranking/reset", {
    method: "POST",
    body: eventTag ? { eventTag } : {},
  })
}
