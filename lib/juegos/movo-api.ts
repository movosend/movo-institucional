import "server-only"

import { NextResponse } from "next/server"

/**
 * Proxy de los juegos (/juegos) hacia el backend de Movo (`/api/v1/demo/*`). Corre solo
 * en el servidor: la API key (`MOVO_DEMO_API_KEY`) nunca llega al navegador, así que el
 * gateway no necesita CORS. Reenvía la IP real del visitante en `x-movo-client-ip` para
 * que el rate limit del gateway cuente por visitante y no por las IPs de Vercel.
 */
const TIMEOUT_MS = 8000
const MAX_BODY_BYTES = 16 * 1024

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip =
    forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip")
  return ip && ip.length <= 64 ? ip : undefined
}

function unavailable(status = 503) {
  return NextResponse.json(
    {
      error: {
        code: "DEMO_BACKEND_UNAVAILABLE",
        message: "El servicio no está disponible en este momento.",
      },
    },
    { status }
  )
}

/** Lee el body como JSON con un tope de tamaño. `undefined` si no es un objeto JSON válido. */
export async function readJsonObject(
  request: Request
): Promise<Record<string, unknown> | undefined> {
  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) return undefined
  try {
    const value: unknown = JSON.parse(text)
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined
  } catch {
    return undefined
  }
}

export function badRequest(message = "Solicitud inválida.") {
  return NextResponse.json(
    { error: { code: "VALIDATION_FAILED", message } },
    { status: 400 }
  )
}

export async function forwardToMovo(
  request: Request,
  path: string,
  init: { method: "GET" | "POST" | "PUT"; body?: unknown }
) {
  const baseUrl = process.env.MOVO_API_URL
  const apiKey = process.env.MOVO_DEMO_API_KEY
  if (!baseUrl || !apiKey) {
    console.error("[juegos] Falta MOVO_API_URL o MOVO_DEMO_API_KEY")
    return unavailable()
  }

  const headers: Record<string, string> = { "x-api-key": apiKey }
  const ip = clientIp(request)
  if (ip) headers["x-movo-client-ip"] = ip
  if (init.body !== undefined) headers["content-type"] = "application/json"

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/v1/demo${path}`,
      {
        method: init.method,
        headers,
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      }
    )
    const text = await response.text().catch(() => "")
    let payload: unknown = null
    try {
      payload = JSON.parse(text)
    } catch {}
    if (payload === null) {
      console.error(
        `[juegos] Backend de Movo respondió ${response.status} sin JSON en ${init.method} ${path}:`,
        text.slice(0, 300)
      )
      return unavailable(502)
    }
    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    console.error("[juegos] Backend de Movo:", error)
    return unavailable()
  }
}
