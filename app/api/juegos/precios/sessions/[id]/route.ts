import {
  badRequest,
  forwardToMovo,
  readJsonObject,
  UUID_RE,
} from "@/lib/juegos/movo-api"

/** Juego de precios: registra (o reenvía, idempotente) una partida. */
export async function PUT(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return badRequest("Partida inválida.")
  const body = await readJsonObject(request)
  if (!body) return badRequest()
  return forwardToMovo(request, `/pricing-game/sessions/${id}`, {
    method: "PUT",
    body,
  })
}
