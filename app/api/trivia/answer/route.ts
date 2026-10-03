import { NextResponse } from "next/server"

import { badRequest, readJsonObject, UUID_RE } from "@/lib/juegos/movo-api"
import { ANSWER_GRACE_S } from "@/lib/trivia/config"
import {
  choicePoints,
  pricePoints,
  questionLimitS,
  questionOf,
  questionWindow,
} from "@/lib/trivia/engine"
import {
  apiError,
  broadcast,
  db,
  gameById,
  unavailable,
} from "@/lib/trivia/server"

/**
 * Respuesta de un jugador. Idempotente: el celular reintenta hasta que llega y vale la
 * primera. La velocidad la mide el celular (con mala señal la respuesta puede llegar
 * tarde sin castigar al jugador), pero no puede ser mayor que el tiempo que pasó desde que
 * se abrió la pregunta, y se acepta hasta ANSWER_GRACE_S después del cierre.
 */
export async function POST(request: Request) {
  const receivedAt = Date.now()
  const body = await readJsonObject(request)
  if (!body) return badRequest()
  const { gameId, playerId, q, choice, price, ms } = body
  if (
    typeof gameId !== "string" ||
    !UUID_RE.test(gameId) ||
    typeof playerId !== "string" ||
    !UUID_RE.test(playerId) ||
    !Number.isInteger(q) ||
    typeof ms !== "number" ||
    !Number.isFinite(ms)
  )
    return badRequest()

  const supabase = db()
  if (!supabase) return unavailable()
  try {
    const game = await gameById(gameId)
    if (!game?.started_at) return badRequest("Partida inválida.")
    const qi = q as number
    const question = questionOf(game, qi)
    if (!question) return badRequest("Pregunta inválida.")

    const window = questionWindow(game, qi)
    if (receivedAt < window.start - 2000)
      return apiError("TOO_EARLY", "La pregunta todavía no empezó.", 409)
    if (receivedAt > window.end + ANSWER_GRACE_S * 1000)
      return apiError("TOO_LATE", "Se terminó el tiempo.", 409)

    const limitMs = questionLimitS(game.timeline, question.type) * 1000
    const elapsed = Math.max(0, receivedAt - window.start)
    const clientMs = Math.round(
      Math.min(Math.max(0, ms), limitMs, elapsed + 1000)
    )

    let row: { choice?: number; price?: number; points: number }
    if (question.type === "price") {
      if (typeof price !== "number" || !Number.isFinite(price) || price < 0)
        return badRequest()
      const guess = Math.round(
        Math.min(Math.max(price, question.min), question.max)
      )
      row = { price: guess, points: pricePoints(guess, question.price) }
    } else {
      const options = question.type === "mc" ? 4 : 2
      if (
        !Number.isInteger(choice) ||
        (choice as number) < 0 ||
        (choice as number) >= options
      )
        return badRequest()
      const c = choice as number
      const correct =
        question.type === "mc"
          ? c === question.answer
          : (c === 0) === question.answer
      row = { choice: c, points: choicePoints(correct, clientMs, limitMs) }
    }

    const { error } = await supabase.from("trivia_answers").upsert(
      {
        game_id: gameId,
        player_id: playerId,
        q: qi,
        client_ms: clientMs,
        ...row,
      },
      { onConflict: "game_id,player_id,q", ignoreDuplicates: true }
    )
    if (error) {
      // 23503: no está anotado en esta partida.
      if (error.code === "23503")
        return apiError("NOT_IN_GAME", "No estás en esta partida.", 403)
      throw error
    }
    broadcast("answer", { q: qi })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[trivia] answer:", e)
    return unavailable()
  }
}
