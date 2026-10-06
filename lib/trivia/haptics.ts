"use client"

/**
 * Vibración del celular del jugador. Solo existe en Android (Safari de iPhone no tiene
 * `navigator.vibrate`); donde no está, no pasa nada y queda el feedback visual.
 */
export function buzz(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator)
      navigator.vibrate(pattern)
  } catch {}
}

export const HAPTIC = {
  /** Sale una pregunta nueva. */
  question: () => buzz(25),
  /** Respuesta enviada. */
  sent: () => buzz(15),
  correct: () => buzz([40, 50, 70]),
  wrong: () => buzz([90, 60, 90]),
  timeout: () => buzz(120),
  /** Precio justo clavado. */
  perfect: () => buzz([40, 40, 40, 40, 120]),
}
