import {
  badRequest,
  forwardToMovo,
  readJsonObject,
} from "@/lib/juegos/movo-api"

/** Juego de precios: precio sugerido real de Movo para un envío de ejemplo. */
export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return badRequest()
  const { origin, destination, packagePreset } = body
  return forwardToMovo(request, "/pricing-game/quote", {
    method: "POST",
    body: { origin, destination, packagePreset },
  })
}
