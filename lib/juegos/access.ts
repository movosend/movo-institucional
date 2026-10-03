/**
 * PIN de acceso a los juegos (/juegos), configurado con `JUEGOS_PIN` (6 dígitos). Es una
 * barrera simple para que solo los iPads del stand entren: el PIN se ingresa una vez y queda
 * una cookie httpOnly por 30 días. Sin `JUEGOS_PIN` la sección queda abierta en desarrollo y
 * cerrada en producción.
 *
 * La cookie guarda un hash del PIN con `MOVO_DEMO_API_KEY` como secreto: sin él cualquiera
 * podría fabricar la cookie probando los 10⁶ PINs sin pasar por la demora del endpoint.
 * Cambiar el PIN invalida las cookies existentes. Corre en el proxy y en route handlers.
 */
export const ACCESS_COOKIE = "movo_juegos_access"
export const ACCESS_MAX_AGE = 60 * 60 * 24 * 30
export const ACCESS_PATH = "/juegos/acceso"

const PIN_RE = /^\d{6}$/

export function configuredPin(): string | undefined {
  const pin = process.env.JUEGOS_PIN?.trim()
  return pin && PIN_RE.test(pin) ? pin : undefined
}

/** Sin PIN válido: abierto en desarrollo, cerrado en producción. */
export function accessDisabled(): boolean {
  return !configuredPin() && process.env.NODE_ENV !== "production"
}

export async function accessToken(pin: string): Promise<string> {
  const data = new TextEncoder().encode(
    `movo-juegos:v1:${pin}:${process.env.MOVO_DEMO_API_KEY ?? ""}`
  )
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("")
}

export async function hasAccess(cookie: string | undefined): Promise<boolean> {
  if (accessDisabled()) return true
  const pin = configuredPin()
  return !!pin && !!cookie && cookie === (await accessToken(pin))
}

/** Solo rutas internas de los juegos como destino después del PIN (evita open redirects). */
export function safeNext(value: string | null | undefined): string {
  return value &&
    (value === "/juegos" ||
      value.startsWith("/juegos/") ||
      value.startsWith("/juegos?")) &&
    !value.startsWith(ACCESS_PATH)
    ? value
    : "/juegos"
}
