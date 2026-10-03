import {
  badRequest,
  forwardToMovo,
  readJsonObject,
} from "@/lib/juegos/movo-api"

/** Juego del optimizador: crea una partida (ciudad, paradas y óptimo de OR-Tools). */
export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return badRequest()
  const { stopCount, lastScenarioId } = body
  return forwardToMovo(request, "/route-game/games", {
    method: "POST",
    body: { stopCount, ...(lastScenarioId ? { lastScenarioId } : {}) },
  })
}
