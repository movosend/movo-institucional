"use client"

/**
 * Sonido de la TV, todo sintetizado con WebAudio (sin archivos). El navegador exige un
 * gesto antes de sonar: la TV muestra "Clic para activar el sonido" hasta el primer clic.
 *
 * Todo pasa por un mismo bus: efectos y música → volumen general → compresor → parlantes,
 * con una reverb corta (impulso de ruido generado acá) que le da cuerpo a los tonos. Las
 * notas salen de Do mayor y el "motivo Movo" (sol, do, mi, sol) vuelve en el arranque, la
 * revelación y el podio.
 */
import { audioCtx, initAudio } from "@/lib/juegos/audio"

import { PODIUM_DELAYS } from "./config"
import type { SoundSettings } from "./sound-settings"

interface Bus {
  ctx: AudioContext
  master: GainNode
  sfx: GainNode
  music: GainNode
  reverb: GainNode
  noise: AudioBuffer
}

let bus: Bus | null = null
/** Hasta el primer gesto no se crea nada: un contexto creado desde un timer queda mudo. */
let enabled = false
let settings: SoundSettings = { volume: 0.8, muted: false, music: false }
let ducked = false

/** Nivel de la música respecto de los efectos (siempre por debajo). */
const MUSIC_LEVEL = 0.32
const DUCK_LEVEL = 0.35

function impulse(ctx: AudioContext, seconds: number) {
  const len = Math.round(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
  }
  return buf
}

function getBus(): Bus | null {
  if (!enabled) return null
  const ctx = audioCtx()
  if (!ctx) return null
  if (bus?.ctx === ctx) return bus
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -16
  comp.knee.value = 10
  comp.ratio.value = 4
  comp.attack.value = 0.004
  comp.release.value = 0.2
  comp.connect(ctx.destination)

  const master = ctx.createGain()
  master.connect(comp)

  const conv = ctx.createConvolver()
  conv.buffer = impulse(ctx, 1.8)
  const wet = ctx.createGain()
  wet.gain.value = 0.28
  conv.connect(wet).connect(master)
  const reverb = ctx.createGain()
  reverb.connect(conv)

  const sfx = ctx.createGain()
  sfx.connect(master)
  const music = ctx.createGain()
  music.gain.value = 0
  music.connect(master)
  music.connect(reverb)

  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1

  bus = { ctx, master, sfx, music, reverb, noise }
  applyLevels(true)
  return bus
}

function applyLevels(instant = false) {
  if (!bus) return
  const t = bus.ctx.currentTime
  const master = settings.muted ? 0 : settings.volume
  const music = settings.music ? MUSIC_LEVEL * (ducked ? DUCK_LEVEL : 1) : 0
  if (instant) {
    bus.master.gain.value = master
    bus.music.gain.value = music
    return
  }
  bus.master.gain.setTargetAtTime(master, t, 0.05)
  bus.music.gain.setTargetAtTime(music, t, 0.6)
}

export function enableSound(): boolean {
  try {
    initAudio()
    enabled = true
    const b = getBus()
    if (b && settings.music) startMusic()
    return b != null
  } catch {
    return false
  }
}

export const soundEnabled = () => bus?.ctx.state === "running"

/** Volumen, silencio y música, desde el modo stand (`sound-settings.ts`). */
export function applySoundSettings(next: SoundSettings) {
  settings = next
  applyLevels()
  if (next.music) startMusic()
  else stopMusic()
}

/** Durante la partida la música baja para que se escuchen los efectos. */
export function duckMusic(on: boolean) {
  if (ducked === on) return
  ducked = on
  applyLevels()
}

// ── Síntesis ──

/** Nota MIDI → Hz. 60 = do central. */
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

interface ToneOpts {
  type?: OscillatorType
  gain?: number
  /** Segundo oscilador desafinado (cents); 0 = uno solo. */
  detune?: number
  attack?: number
  /** Frecuencia de un pasa-bajos; sin él, la señal pasa limpia. */
  cutoff?: number
  /** Glide de frecuencia hasta este valor (Hz) durante la nota. */
  glideTo?: number
  glideTime?: number
  /** Cuánto va a la reverb (0..1). */
  send?: number
  out?: "sfx" | "music"
}

function tone(freq: number, at: number, dur: number, o: ToneOpts = {}) {
  const b = getBus()
  if (!b) return
  const {
    type = "sine",
    gain = 0.18,
    detune = 0,
    attack = 0.008,
    cutoff,
    glideTo,
    glideTime = dur,
    send = 0.25,
    out = "sfx",
  } = o
  const { ctx } = b
  const t = ctx.currentTime + at
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0, t)
  amp.gain.linearRampToValueAtTime(gain, t + attack)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + attack + dur)
  let head: AudioNode = amp
  if (cutoff) {
    const f = ctx.createBiquadFilter()
    f.type = "lowpass"
    f.frequency.value = cutoff
    f.connect(amp)
    head = f
  }
  const dest = out === "music" ? b.music : b.sfx
  amp.connect(dest)
  if (send > 0 && out === "sfx") {
    const s = ctx.createGain()
    s.gain.value = send
    amp.connect(s).connect(b.reverb)
  }
  for (const cents of detune ? [-detune, detune] : [0]) {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (glideTo)
      osc.frequency.exponentialRampToValueAtTime(glideTo, t + glideTime)
    osc.detune.value = cents
    const g = ctx.createGain()
    g.gain.value = detune ? 0.6 : 1
    osc.connect(g).connect(head)
    osc.start(t)
    osc.stop(t + attack + dur + 0.05)
  }
}

interface NoiseOpts {
  gain?: number
  filter?: BiquadFilterType
  from?: number
  to?: number
  q?: number
  attack?: number
  send?: number
}

function noise(at: number, dur: number, o: NoiseOpts = {}) {
  const b = getBus()
  if (!b) return
  const {
    gain = 0.12,
    filter = "bandpass",
    from = 1200,
    to = from,
    q = 1,
    attack = 0.005,
    send = 0.3,
  } = o
  const { ctx } = b
  const t = ctx.currentTime + at
  const src = ctx.createBufferSource()
  src.buffer = b.noise
  const f = ctx.createBiquadFilter()
  f.type = filter
  f.Q.value = q
  f.frequency.setValueAtTime(from, t)
  if (to !== from) f.frequency.exponentialRampToValueAtTime(to, t + dur)
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0, t)
  amp.gain.linearRampToValueAtTime(gain, t + attack)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + attack + dur)
  src.connect(f).connect(amp).connect(b.sfx)
  if (send > 0) {
    const s = ctx.createGain()
    s.gain.value = send
    amp.connect(s).connect(b.reverb)
  }
  src.start(t, Math.random() * 1.5)
  src.stop(t + attack + dur + 0.05)
}

/** Nota con cuerpo: dos triángulos desafinados y un pasa-bajos. */
const bell = (m: number, at: number, dur = 0.35, gain = 0.14) =>
  tone(hz(m), at, dur, { type: "triangle", gain, detune: 6, cutoff: 4200 })

/** Golpe grave (bombo / timbal). */
const boom = (at: number, from = 140, gain = 0.5) => {
  tone(from, at, 0.5, { gain, glideTo: 42, glideTime: 0.35, send: 0.15 })
  noise(at, 0.06, { gain: 0.18, filter: "lowpass", from: 2000, send: 0 })
}

/** Redoble: golpes de ruido cada vez más seguidos y más fuertes. */
const roll = (at: number, dur: number, peak = 0.12) => {
  let t = 0
  let i = 0
  while (t < dur) {
    const k = t / dur
    noise(at + t, 0.05, {
      gain: peak * (0.35 + 0.65 * k),
      filter: "bandpass",
      from: 1800,
      q: 0.8,
      send: 0.15,
    })
    t += 0.075 - 0.045 * k
    i++
    if (i > 80) break
  }
}

/** Barrido de aire (subida o bajada). */
const whoosh = (at: number, dur: number, up = true, gain = 0.1) =>
  noise(at, dur, {
    gain,
    filter: "bandpass",
    from: up ? 350 : 4000,
    to: up ? 4000 : 350,
    q: 1.4,
    attack: dur * 0.7,
    send: 0.4,
  })

const PENTA = [72, 74, 76, 79, 81, 84, 86, 88]
const MOTIF = [67, 72, 76, 79]

export const SFX = {
  /** Entra alguien al lobby: una nota de la pentatónica que sube con cada uno. */
  join: (n = 0) => {
    const m = PENTA[n % PENTA.length]
    bell(m, 0, 0.3, 0.12)
    bell(m + 12, 0.06, 0.25, 0.05)
  },
  /** Muestra de volumen (al cambiarlo desde el modo stand). */
  preview: () => {
    bell(72, 0, 0.25)
    bell(79, 0.1, 0.35)
  },
  /** Últimos segundos del lobby: woodblock, más agudo en el último. */
  lobbyTick: (s: number) => {
    const f = s === 1 ? 1568 : 1046
    tone(f, 0, 0.08, { gain: 0.16, glideTo: f * 0.7, glideTime: 0.08 })
    noise(0, 0.02, { gain: 0.08, from: 3000, q: 2, send: 0.1 })
  },
  /** Arranca la partida: golpe, barrido y el motivo completo en acorde. */
  start: () => {
    boom(0, 160, 0.6)
    whoosh(0, 0.25, false, 0.08)
    MOTIF.forEach((m, i) => bell(m, 0.04 + i * 0.07, 0.9, 0.12))
    tone(hz(48), 0.04, 1.2, { type: "sawtooth", gain: 0.08, cutoff: 600 })
  },
  /** Arranca una pregunta: barrido hacia arriba y dos notas del motivo. */
  question: () => {
    whoosh(0, 0.32, true, 0.09)
    bell(72, 0.3, 0.2)
    bell(79, 0.4, 0.4)
  },
  /** Llega una respuesta: "pop" más agudo cuanto más gente respondió. */
  answer: (frac: number, at = 0) => {
    const m = PENTA[Math.min(PENTA.length - 1, Math.floor(frac * PENTA.length))]
    tone(hz(m), at, 0.09, {
      gain: 0.16,
      glideTo: hz(m) * 0.55,
      glideTime: 0.07,
      send: 0.1,
    })
  },
  /** Respondieron todos. */
  allAnswered: (at = 0) =>
    [72, 76, 79, 84].forEach((m, i) => bell(m, at + i * 0.06, 0.3, 0.11)),
  /** Cuenta final de la pregunta: se acelera y sube de tono (s = segundos que quedan). */
  tick: (s: number) => {
    const per = s >= 4 ? 1 : s >= 2 ? 2 : 4
    const base = 880 + (5 - s) * 110
    for (let i = 0; i < per; i++) {
      const f = base + i * 30
      tone(f, i / per, 0.05, {
        type: "square",
        gain: 0.05 + (5 - s) * 0.012,
        cutoff: 3000,
        send: 0.05,
      })
    }
  },
  /** Se acaba el tiempo + redoble + acorde de la respuesta. */
  reveal: (fromQuestion: boolean) => {
    let at = 0
    if (fromQuestion) {
      tone(hz(55), 0, 0.4, {
        type: "square",
        gain: 0.07,
        detune: 25,
        cutoff: 900,
      })
      tone(hz(43), 0, 0.45, { type: "sawtooth", gain: 0.06, cutoff: 500 })
      at = 0.15
    }
    roll(at, 0.45, 0.1)
    const c = at + 0.5
    boom(c, 120, 0.35)
    ;[72, 76, 79, 86].forEach((m) => bell(m, c, 1.1, 0.09))
    bell(84, c + 0.08, 0.8, 0.06)
  },
  /** Top 5: barrido y un tic por fila, en sincronía con la entrada de las filas. */
  top5: () => {
    whoosh(0, 0.3, false, 0.08)
    for (let i = 0; i < 5; i++) bell(PENTA[4 - i], 0.12 + i * 0.06, 0.15, 0.07)
  },
  /**
   * Podio por escalones, en sincronía con `PODIUM_DELAYS` (config.ts): 3.º, 2.º,
   * redoble y fanfarria para el 1.º.
   */
  podium: () => {
    const [d3, d2, d1] = PODIUM_DELAYS
    boom(d3, 110, 0.4)
    bell(67, d3, 0.4, 0.1)
    boom(d2, 130, 0.45)
    bell(72, d2, 0.4, 0.11)
    roll(d2 + 0.35, d1 - d2 - 0.4, 0.13)
    boom(d1, 160, 0.6)
    MOTIF.forEach((m, i) => bell(m, d1 + i * 0.09, 0.5, 0.13))
    const end = d1 + MOTIF.length * 0.09
    ;[60, 64, 67, 72, 76, 84].forEach((m) => bell(m, end, 1.6, 0.08))
    tone(hz(36), end, 1.6, { type: "sawtooth", gain: 0.08, cutoff: 400 })
    // Chispas
    for (let i = 0; i < 8; i++)
      bell(
        PENTA[(i * 3) % PENTA.length] + 12,
        end + 0.15 + i * 0.09,
        0.2,
        0.035
      )
  },
}

// ── Música del lobby ──
// Generativa: pad de cuatro acordes (Cmaj7, Am7, Fmaj7, G6) con un arpegio lento encima.
// Se programa con poca anticipación y un timer, así que se puede cortar en cualquier momento.

const BPM = 92
const EIGHTH = 60 / BPM / 2
const CHORDS = [
  [60, 64, 67, 71],
  [57, 60, 64, 67],
  [53, 57, 60, 64],
  [55, 59, 62, 64],
]
const ARP = [0, 1, 2, 3, 2, 1, 2, 3]
const STEPS_PER_CHORD = 16

let musicTimer: ReturnType<typeof setInterval> | undefined
let musicStop: ReturnType<typeof setTimeout> | undefined
let nextAt = 0
let step = 0

function pad(notes: number[], at: number, dur: number) {
  const b = getBus()
  if (!b) return
  const t = b.ctx.currentTime + at
  notes.forEach((m) => {
    const amp = b.ctx.createGain()
    amp.gain.setValueAtTime(0, t)
    amp.gain.linearRampToValueAtTime(0.05, t + 1.2)
    amp.gain.setValueAtTime(0.05, t + dur - 0.2)
    amp.gain.linearRampToValueAtTime(0, t + dur + 1.2)
    const f = b.ctx.createBiquadFilter()
    f.type = "lowpass"
    f.frequency.value = 900
    f.connect(amp).connect(b.music)
    for (const c of [-8, 8]) {
      const osc = b.ctx.createOscillator()
      osc.type = "sawtooth"
      osc.frequency.value = hz(m)
      osc.detune.value = c
      osc.connect(f)
      osc.start(t)
      osc.stop(t + dur + 1.3)
    }
  })
}

function scheduleMusic() {
  const b = getBus()
  if (!b || b.ctx.state !== "running") return
  const now = b.ctx.currentTime
  if (nextAt < now) nextAt = now + 0.05
  while (nextAt < now + 0.4) {
    const at = nextAt - now
    const chord = CHORDS[Math.floor(step / STEPS_PER_CHORD) % CHORDS.length]
    const inChord = step % STEPS_PER_CHORD
    if (inChord === 0) {
      pad(chord, at, STEPS_PER_CHORD * EIGHTH)
      tone(hz(chord[0] - 24), at, STEPS_PER_CHORD * EIGHTH * 0.9, {
        gain: 0.16,
        attack: 0.4,
        out: "music",
      })
    }
    const m = chord[ARP[inChord % ARP.length]] + 12
    tone(hz(m), at, 0.4, {
      type: "triangle",
      gain: inChord % 4 === 0 ? 0.1 : 0.06,
      cutoff: 2400,
      out: "music",
    })
    step++
    nextAt += EIGHTH
  }
}

function startMusic() {
  clearTimeout(musicStop)
  musicStop = undefined
  if (musicTimer) return
  step = 0
  nextAt = 0
  scheduleMusic()
  musicTimer = setInterval(scheduleMusic, 100)
}

function stopMusic() {
  if (!musicTimer || musicStop) return
  // El volumen ya baja con applyLevels; el timer sigue hasta que se apaga del todo.
  musicStop = setTimeout(() => {
    clearInterval(musicTimer)
    musicTimer = undefined
    musicStop = undefined
  }, 2500)
}
