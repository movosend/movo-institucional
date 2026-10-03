import { parseEventTag } from "@/lib/juegos/event-tag"
import { badRequest, forwardToMovo, UUID_RE } from "@/lib/juegos/movo-api"

/** Juego del optimizador: ranking del día del evento, compartido entre iPads. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const rawTag = params.get("eventTag")
  const gameId = params.get("gameId")
  const eventTag = parseEventTag(rawTag ?? undefined)
  if (rawTag !== null && !eventTag) return badRequest("Evento inválido.")
  if (gameId !== null && !UUID_RE.test(gameId))
    return badRequest("Partida inválida.")
  const query = new URLSearchParams({
    ...(eventTag ? { eventTag } : {}),
    ...(gameId ? { gameId } : {}),
  }).toString()
  return forwardToMovo(
    request,
    `/route-game/ranking${query ? `?${query}` : ""}`,
    { method: "GET" }
  )
}
