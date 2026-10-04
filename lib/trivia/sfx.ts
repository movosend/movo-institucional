"use client"

/**
 * Efectos cortos de la TV, generados con WebAudio (sin archivos). El navegador exige un
 * gesto antes de sonar: la TV muestra "Activar sonido" hasta el primer clic.
 */
import { audioCtx, initAudio } from "@/lib/juegos/audio"

let ctx: AudioContext | null = null

export function enableSound(): boolean {
  try {
    initAudio()
    ctx = audioCtx()
    return ctx != null
  } catch {
    return false
  }
}

export const soundEnabled = () => ctx?.state === "running"

function tone(
  freq: number,
  at: number,
  dur: number,
  { type = "sine", gain = 0.18 }: { type?: OscillatorType; gain?: number } = {}
) {
  const ctx = audioCtx()
  if (!ctx) return
  const t = ctx.currentTime + at
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  amp.gain.setValueAtTime(0, t)
  amp.gain.linearRampToValueAtTime(gain, t + 0.01)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(amp).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export const SFX = {
  /** Entra alguien al lobby. */
  join: () => tone(880, 0, 0.12, { type: "triangle", gain: 0.12 }),
  /** Últimos segundos de una pregunta. */
  tick: () => tone(1200, 0, 0.05, { type: "square", gain: 0.05 }),
  /** Arranca una pregunta. */
  question: () => {
    tone(523, 0, 0.12, { type: "triangle" })
    tone(784, 0.1, 0.18, { type: "triangle" })
  },
  /** Se revela la respuesta. */
  reveal: () => {
    tone(659, 0, 0.14)
    tone(988, 0.12, 0.28)
  },
  /** Podio. */
  podium: () => {
    ;[523, 659, 784, 1047].forEach((f, i) =>
      tone(f, i * 0.12, 0.3, { type: "triangle", gain: 0.16 })
    )
  },
}
