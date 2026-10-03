"use client"

import "@/components/juegos/juegos.css"
import "../trivia.css"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { css } from "@/lib/juegos/css"
import { livePhase, useNow, useTriviaState } from "@/lib/trivia/client"
import { questionLimitS } from "@/lib/trivia/engine"
import { SFX, enableSound } from "@/lib/trivia/sfx"
import type { TriviaState } from "@/lib/trivia/types"

import { WifiOff } from "../icons"
import { useTriviaUrl } from "../qr"
import {
  LobbyScene,
  PodiumScene,
  PriceRevealScene,
  PriceScene,
  QuestionScene,
  RevealScene,
  Top5Scene,
} from "./scenes"
import { StandPanel } from "./stand-panel"

/**
 * Lienzo de la TV: ocupa siempre toda la ventana, sin franjas negras. Las medidas del
 * diseño (pensado a 1920×1080) se escalan con el lado que más ajusta, y el otro lado del
 * lienzo se estira: en una pantalla 16:10 queda de 1920×1200 y las escenas (posiciones
 * relativas y grillas flexibles) reparten ese espacio.
 */
function useStage() {
  const size = useSyncExternalStore(
    (cb) => {
      window.addEventListener("resize", cb)
      return () => window.removeEventListener("resize", cb)
    },
    () => `${window.innerWidth}x${window.innerHeight}`,
    () => "1920x1080"
  )
  const [vw, vh] = size.split("x").map(Number)
  const scale = Math.min(vw / 1920, vh / 1080)
  return { scale, w: vw / scale, h: vh / scale }
}

function useFullscreen() {
  return useSyncExternalStore(
    (cb) => {
      document.addEventListener("fullscreenchange", cb)
      return () => document.removeEventListener("fullscreenchange", cb)
    },
    () => !!document.fullscreenElement,
    () => false
  )
}

function Scene({
  state,
  now,
  url,
}: {
  state: TriviaState
  now: number
  url: string
}) {
  const game = state.current
  const phase = livePhase(game, now)
  if (!game || phase.kind === "ended" || phase.kind === "lobby")
    return (
      <LobbyScene
        lobby={state.lobby}
        day={state.day}
        paused={state.paused}
        now={now}
        url={url}
      />
    )

  if (phase.kind === "podium")
    return (
      <PodiumScene
        game={game}
        day={state.day}
        nextAt={state.lobby.lobbyEndsAt}
        paused={state.paused}
        now={now}
        url={url}
      />
    )

  if (phase.kind === "top5")
    return (
      <Top5Scene
        after={phase.after}
        standings={game.standings}
        nextIsPrice={game.questions[phase.after + 1]?.type === "price"}
      />
    )

  const question = game.questions[phase.q]
  if (!question)
    return (
      <LobbyScene
        lobby={state.lobby}
        day={state.day}
        paused={state.paused}
        now={now}
        url={url}
      />
    )
  const remainingMs = phase.end - now
  const limitMs = questionLimitS(game.timeline, question.type) * 1000

  if (phase.kind === "question") {
    if (question.type === "price")
      return (
        <PriceScene
          game={game}
          q={phase.q}
          question={question}
          remainingMs={remainingMs}
          limitMs={limitMs}
          cities={state.day.cities.map((c) => c.name)}
        />
      )
    return (
      <QuestionScene
        game={game}
        q={phase.q}
        question={question}
        remainingMs={remainingMs}
        limitMs={limitMs}
      />
    )
  }

  // Revelación: si los datos todavía no llegaron (reloj apenas adelantado), sigue la pregunta en 0:00.
  const reveal = game.reveals.find((r) => r.q === phase.q)
  if (!reveal) {
    return question.type === "price" ? (
      <PriceScene
        game={game}
        q={phase.q}
        question={question}
        remainingMs={0}
        limitMs={limitMs}
        cities={[]}
      />
    ) : (
      <QuestionScene
        game={game}
        q={phase.q}
        question={question}
        remainingMs={0}
        limitMs={limitMs}
      />
    )
  }
  return question.type === "price" ? (
    <PriceRevealScene question={question} reveal={reveal} />
  ) : (
    <RevealScene q={phase.q} question={question} reveal={reveal} />
  )
}

/** Clave de la escena para disparar sonidos al cambiar. */
function sceneKey(state: TriviaState | null, now: number) {
  if (!state?.current) return "lobby"
  const p = livePhase(state.current, now)
  return p.kind === "question" || p.kind === "reveal"
    ? `${p.kind}:${p.q}`
    : p.kind
}

export function TriviaTV() {
  const { state, offline, refresh } = useTriviaState({ role: "tv" })
  const now = useNow(100)
  const url = useTriviaUrl()
  const stage = useStage()
  const fullscreen = useFullscreen()
  const [sound, setSound] = useState(false)
  const [stand, setStand] = useState(false)
  // Los controles (pantalla completa, sonido) solo aparecen al mover el mouse: en la TV,
  // quieta, no tapan nada.
  const [controls, setControls] = useState(true)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const showControls = () => {
    setControls(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setControls(false), 3000)
  }
  useEffect(() => {
    hideTimer.current = setTimeout(() => setControls(false), 5000)
    return () => clearTimeout(hideTimer.current)
  }, [])
  const taps = useRef<number[]>([])

  // Sonidos al cambiar de escena, cuando entra alguien y en los últimos 3 s.
  const key = sceneKey(state, now)
  const lastKey = useRef(key)
  const lastCount = useRef(state?.lobby.count ?? 0)
  const lastSecond = useRef(0)
  useEffect(() => {
    if (!sound || !state) return
    if (key !== lastKey.current) {
      if (key.startsWith("question")) SFX.question()
      else if (key.startsWith("reveal")) SFX.reveal()
      else if (key === "podium") SFX.podium()
      lastKey.current = key
    }
    if (state.lobby.count > lastCount.current) SFX.join()
    lastCount.current = state.lobby.count
    if (state.current) {
      const p = livePhase(state.current, now)
      if (p.kind === "question") {
        const s = Math.ceil((p.end - now) / 1000)
        if (s <= 3 && s > 0 && s !== lastSecond.current) SFX.tick()
        lastSecond.current = s
      }
    }
  }, [key, now, sound, state])

  const onCornerTap = () => {
    const t = Date.now()
    taps.current = [...taps.current.filter((x) => t - x < 2500), t]
    if (taps.current.length >= 5) {
      taps.current = []
      setStand(true)
    }
  }

  return (
    <div
      className="mv-game mv-trivia"
      onClick={() => {
        if (!sound) setSound(enableSound())
      }}
      onMouseMove={showControls}
      style={{
        ...css(
          "position:fixed;inset:0;z-index:200;background:#0A0A0B;overflow:hidden;font-family:var(--font-sans);user-select:none;-webkit-user-select:none"
        ),
        cursor: controls ? "default" : "none",
      }}
    >
      <div
        style={{
          ...css("position:absolute;left:0;top:0;transform-origin:0 0"),
          width: stage.w,
          height: stage.h,
          transform: `scale(${stage.scale})`,
        }}
      >
        {state && now ? (
          <Scene state={state} now={now} url={url} />
        ) : (
          <div style={css("width:100%;height:100%;background:#C6F24A")} />
        )}
      </div>

      {/* Esquina superior izquierda: 5 toques abren el modo stand. */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          onCornerTap()
        }}
        style={css(
          "position:absolute;top:0;left:0;width:120px;height:120px;z-index:5"
        )}
      />

      <div
        style={css(
          "position:absolute;right:16px;bottom:16px;z-index:5;display:flex;gap:8px;font-family:var(--font-sans);font-size:13px;font-weight:600"
        )}
      >
        {offline && (
          <span
            style={css(
              "display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:#E5484D;color:#FFFFFF"
            )}
          >
            <WifiOff size={14} color="#FFFFFF" />
            Sin conexión, reintentando
          </span>
        )}
        {controls && !fullscreen && (
          <button
            onClick={() => void document.documentElement.requestFullscreen?.()}
            style={css(
              "border:0;padding:6px 12px;border-radius:999px;background:#0A0A0B;color:#FFFFFF;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer"
            )}
          >
            Pantalla completa
          </button>
        )}
        {controls && !sound && (
          <span
            style={css(
              "padding:6px 12px;border-radius:999px;background:rgba(10,10,11,.75);color:#FFFFFF"
            )}
          >
            Clic para activar el sonido
          </span>
        )}
      </div>

      {stand && (
        <StandPanel
          onClose={() => setStand(false)}
          onChange={refresh}
          paused={state?.paused ?? false}
        />
      )}
    </div>
  )
}
