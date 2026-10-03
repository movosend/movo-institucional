import { NextResponse } from "next/server"

import { badRequest, readJsonObject, UUID_RE } from "@/lib/juegos/movo-api"
import { isOffensive } from "@/lib/trivia/badwords"
import { NAME_MAX } from "@/lib/trivia/config"
import { apiError, broadcast, db, tick, unavailable } from "@/lib/trivia/server"

/**
 * Suma al jugador a la partida en lobby. Si hay una partida en curso, el lobby es el de la
 * próxima: el celular muestra "Hay una partida en curso" hasta que arranque la suya.
 */
export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return badRequest()
  const { playerId, name, city, province } = body
  if (typeof playerId !== "string" || !UUID_RE.test(playerId))
    return badRequest("Jugador inválido.")
  const cleanName =
    typeof name === "string" ? name.trim().replace(/\s+/g, " ") : ""
  if (!cleanName || cleanName.length > NAME_MAX)
    return badRequest(`El nombre tiene que tener entre 1 y ${NAME_MAX} letras.`)
  if (isOffensive(cleanName))
    return apiError("NAME_REJECTED", "Probá con otro nombre.", 422)
  const cleanCity = typeof city === "string" ? city.trim().slice(0, 60) : ""
  if (!cleanCity) return badRequest("Contanos de dónde venís.")
  const cleanProvince =
    typeof province === "string" && province.trim()
      ? province.trim().slice(0, 40)
      : null

  const supabase = db()
  if (!supabase) return unavailable()
  try {
    const { error: playerError } = await supabase
      .from("trivia_players")
      .upsert({
        id: playerId,
        name: cleanName,
        city: cleanCity,
        province: cleanProvince,
        updated_at: new Date().toISOString(),
      })
    if (playerError) throw playerError

    const t = await tick()
    const { error } = await supabase
      .from("trivia_entries")
      .upsert(
        { game_id: t.lobby.id, player_id: playerId },
        { onConflict: "game_id,player_id", ignoreDuplicates: true }
      )
    if (error) throw error
    broadcast("room")
    return NextResponse.json({ ok: true, gameId: t.lobby.id })
  } catch (e) {
    console.error("[trivia] join:", e)
    return unavailable()
  }
}
