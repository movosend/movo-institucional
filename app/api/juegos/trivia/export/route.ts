import { badRequest } from "@/lib/juegos/movo-api"
import { DAY_RE, todayAR, type ExportRow } from "@/lib/trivia/admin"
import { db, unavailable } from "@/lib/trivia/server"

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v)
  // Comillas siempre; un "=" inicial no se interpreta como fórmula en planillas.
  return `"${s.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`
}

/** CSV del día (modo stand de la TV): una fila por jugador y partida, con el mail si lo dejó. */
export async function GET(request: Request) {
  const day = new URL(request.url).searchParams.get("day") ?? todayAR()
  if (!DAY_RE.test(day)) return badRequest("Día inválido.")
  const supabase = db()
  if (!supabase) return unavailable()
  const { data, error } = await supabase.rpc("trivia_export", { p_day: day })
  if (error) {
    console.error("[trivia] export:", error)
    return unavailable()
  }
  const header = [
    "partida",
    "inicio",
    "jugador",
    "nombre",
    "emoji",
    "ciudad",
    "provincia",
    "email",
    "oculto",
    "puntos",
  ]
  const lines = (data as ExportRow[]).map((r) =>
    [
      r.game,
      r.started_at,
      r.player_id,
      r.name,
      r.emoji,
      r.city,
      r.province,
      r.email,
      r.hidden ? "si" : "no",
      r.score,
    ]
      .map(cell)
      .join(",")
  )
  return new Response("﻿" + [header.join(","), ...lines].join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="trivia-${day}.csv"`,
      "cache-control": "no-store",
    },
  })
}
