"use client"

/**
 * Volumen, silencio y música de la TV. Se guardan en localStorage de esa pantalla, así que
 * el control en otra ventana del mismo navegador (`/juegos/trivia/control` abierto desde la
 * TV) los cambia en vivo por el evento `storage`; desde otro dispositivo no aplican.
 */
import { useEffect, useState, useSyncExternalStore } from "react"

export interface SoundSettings {
  /** 0..1 */
  volume: number
  muted: boolean
  /** Música de fondo en el lobby (baja durante la partida). */
  music: boolean
}

const KEY = "movo-trivia-sound"
const TV_KEY = "movo-trivia-tv-alive"
const LOCAL_EVENT = "movo-trivia-sound"
export const DEFAULT_SOUND: SoundSettings = {
  volume: 0.8,
  muted: false,
  music: false,
}

let cacheRaw: string | null = null
let cache: SoundSettings = DEFAULT_SOUND

function read(): SoundSettings {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {}
  if (raw === cacheRaw) return cache
  cacheRaw = raw
  try {
    const v = raw ? (JSON.parse(raw) as Partial<SoundSettings>) : {}
    cache = {
      volume:
        typeof v.volume === "number"
          ? Math.min(1, Math.max(0, v.volume))
          : DEFAULT_SOUND.volume,
      muted: v.muted === true,
      music: v.music === true,
    }
  } catch {
    cache = DEFAULT_SOUND
  }
  return cache
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(LOCAL_EVENT, cb)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(LOCAL_EVENT, cb)
  }
}

export function useSoundSettings(): SoundSettings {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_SOUND)
}

export function setSoundSettings(patch: Partial<SoundSettings>) {
  const next = { ...read(), ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

/** La TV avisa que está abierta en este navegador (para mostrar el sonido en el control). */
export function useMarkTvAlive() {
  useEffect(() => {
    const mark = () => {
      try {
        localStorage.setItem(TV_KEY, String(Date.now()))
      } catch {}
    }
    mark()
    const id = setInterval(mark, 5000)
    return () => {
      clearInterval(id)
      try {
        localStorage.removeItem(TV_KEY)
      } catch {}
    }
  }, [])
}

/** Hay una TV abierta en este mismo navegador. */
export function useTvHere(): boolean {
  const [here, setHere] = useState(false)
  useEffect(() => {
    const check = () => {
      let ts = 0
      try {
        ts = Number(localStorage.getItem(TV_KEY)) || 0
      } catch {}
      setHere(Date.now() - ts < 15000)
    }
    check()
    const id = setInterval(check, 5000)
    return () => clearInterval(id)
  }, [])
  return here
}
