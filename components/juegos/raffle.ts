/**
 * Paso de sorteo + newsletter, compartido por los juegos del stand. Mismo copy en los
 * dos: dejar el mail es entrar al sorteo y suscribirse al newsletter (Resend), y la
 * pantalla lo dice antes de anotarse, así el mail en la partida (`emailConsent`) y la
 * suscripción salen del mismo consentimiento.
 */
export const RAFFLE_COPY = {
  eyebrow: "Último paso",
  title: "Sumate al sorteo",
  body: "Dejanos tu mail: entrás al sorteo y te sumamos al newsletter de Movo para avisarte cuando lleguemos a tu ciudad. Te podés dar de baja cuando quieras.",
  emailLabel: "Mail para el sorteo y el newsletter (opcional)",
  emailPlaceholder: "tu@mail.com",
  invalid: "Revisá el mail, parece que falta algo.",
  submit: "Anotarme",
  skip: "Ahora no",
  joined: (email: string) => `Quedaste anotado en el sorteo con ${email}.`,
} as const

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

const LS_PENDING = "movo-juegos-newsletter-pending"

interface PendingSubscription {
  email: string
  name?: string
}

const readPending = (): PendingSubscription[] => {
  try {
    return JSON.parse(
      localStorage.getItem(LS_PENDING) || "[]"
    ) as PendingSubscription[]
  } catch {
    return []
  }
}
const writePending = (v: PendingSubscription[]) => {
  try {
    localStorage.setItem(LS_PENDING, JSON.stringify(v))
  } catch {}
}

/** `true` si quedó suscripto o si el servidor rechazó el mail (no tiene sentido reintentar). */
async function post(sub: PendingSubscription) {
  try {
    const r = await fetch("/api/juegos/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(sub),
    })
    return r.ok || r.status === 400
  } catch {
    return false
  }
}

/** Suscribe sin bloquear la pantalla; sin red, queda en cola en el iPad. */
export function subscribeFromGame(email: string, name?: string) {
  const sub = { email, ...(name ? { name } : {}) }
  void post(sub).then((ok) => {
    if (!ok) writePending([...readPending(), sub])
  })
}

/** Reintenta la cola (lo llaman los juegos junto con la de partidas). */
export async function flushNewsletterQueue() {
  const pend = readPending()
  if (!pend.length) return
  const fail: PendingSubscription[] = []
  for (const sub of pend) if (!(await post(sub))) fail.push(sub)
  const added = readPending().slice(pend.length)
  writePending([...fail, ...added])
}

export const newsletterPendingCount = () => readPending().length
