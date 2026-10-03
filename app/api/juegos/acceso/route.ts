import { NextResponse } from "next/server"

import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  accessToken,
  configuredPin,
} from "@/lib/juegos/access"
import { badRequest, readJsonObject } from "@/lib/juegos/movo-api"

/** Demora ante un PIN incorrecto: frena la fuerza bruta sin tener que guardar intentos. */
const WRONG_PIN_DELAY_MS = 1500

/** Pantalla del PIN de los juegos: valida `JUEGOS_PIN` y deja la cookie de acceso. */
export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body || typeof body.pin !== "string") return badRequest()

  const pin = configuredPin()
  if (!pin) {
    console.error("[juegos] Falta JUEGOS_PIN (6 dígitos)")
    return NextResponse.json(
      {
        error: {
          code: "PIN_NOT_CONFIGURED",
          message: "El acceso no está configurado.",
        },
      },
      { status: 503 }
    )
  }

  if (body.pin !== pin) {
    await new Promise((r) => setTimeout(r, WRONG_PIN_DELAY_MS))
    return NextResponse.json(
      { error: { code: "INVALID_PIN", message: "PIN incorrecto." } },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ACCESS_COOKIE, await accessToken(pin), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  })
  return response
}
