"use client"

/**
 * AudioContext compartido por los juegos, pensado para Safari de iPad:
 * - Se crea y se reanuda dentro de un gesto real (touchend / click). `pointerdown` no
 *   desbloquea el audio en iOS, y un contexto creado desde un timer queda mudo.
 * - Safari lo pasa a "interrupted" (no "suspended") al bloquear la pantalla, cambiar de app
 *   o recibir una llamada: hay que reanudarlo en ese estado también.
 * - `audioSession.type = "playback"` hace que suene aunque el iPad tenga el interruptor
 *   de silencio / el modo silencio activado (Web Audio lo respeta por defecto).
 */
type AudioWindow = Window & {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

let ctx: AudioContext | null = null
let listening = false

function ensure(): AudioContext | null {
  if (ctx) return ctx
  try {
    const w = window as AudioWindow
    const Ctx = w.AudioContext || w.webkitAudioContext
    if (!Ctx) return null
    ctx = new Ctx()
    try {
      const nav = navigator as Navigator & { audioSession?: { type: string } }
      if (nav.audioSession) nav.audioSession.type = "playback"
    } catch {}
    return ctx
  } catch {
    return null
  }
}

function wake() {
  const c = ctx
  if (!c) return
  if (c.state !== "running") void c.resume().catch(() => {})
}

/** Desbloqueo con un buffer vacío: es lo que iOS pide en el primer gesto. */
function unlock() {
  const c = ensure()
  if (!c) return
  wake()
  try {
    const src = c.createBufferSource()
    src.buffer = c.createBuffer(1, 1, 22050)
    src.connect(c.destination)
    src.start(0)
  } catch {}
}

/**
 * Instala los listeners globales (idempotente). Hay que llamarlo al montar el juego.
 * Se quedan activos: cada gesto vuelve a reanudar el contexto si Safari lo interrumpió.
 */
export function initAudio() {
  if (listening || typeof window === "undefined") return
  listening = true
  for (const ev of ["touchend", "click", "keydown"])
    window.addEventListener(ev, unlock, { capture: true, passive: true })
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) wake()
  })
}

/** Contexto listo para programar sonidos (lo reanuda si estaba suspendido o interrumpido). */
export function audioCtx(): AudioContext | null {
  const c = ensure()
  if (c) wake()
  return c
}
