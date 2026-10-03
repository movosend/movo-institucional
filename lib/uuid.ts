/**
 * UUID v4. `crypto.randomUUID` solo existe en contextos seguros (HTTPS o localhost) y en
 * Safari 15.4+: al probar desde el iPad o el celular por la IP de la red local no está, así
 * que se arma con `getRandomValues`, que sí está siempre.
 */
export function randomUUID(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("")
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
