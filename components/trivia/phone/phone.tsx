"use client"

import "@/components/juegos/juegos.css"
import "../trivia.css"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"

import {
  flushAnswers,
  flushEmail,
  joinGame,
  livePhase,
  loadProfile,
  newPlayerId,
  saveProfile,
  sendAnswer,
  sendEmail,
  serverNow,
  useNow,
  usePendingAnswers,
  useTriviaState,
  type Profile,
} from "@/lib/trivia/client"
import { css } from "@/lib/juegos/css"
import { withEmoji } from "@/lib/trivia/emojis"
import { fmtClock, questionLimitS } from "@/lib/trivia/engine"
import type { TriviaState } from "@/lib/trivia/types"

import { Body, H1, Logo, NamePill, Primary, Screen, Bar, Muted } from "./parts"
import {
  ChoiceResult,
  ChoiceView,
  CityStep,
  ClosedView,
  FinalView,
  InProgressView,
  LobbyView,
  NameStep,
  OfflineView,
  PositionView,
  PriceResult,
  PriceView,
  type FinalSnapshot,
} from "./views"

/**
 * Celular del jugador (/trivia, lo abre el QR de la TV). Ingreso en dos pasos (nombre y
 * ciudad, guardados en el celular) y después sigue la partida con el reloj sincronizado.
 * Las respuestas se guardan primero en el celular y se reintentan solas si no hay señal.
 */
export function TriviaPhone() {
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [step, setStep] = useState<"name" | "city" | "play">("name")
  const [draftName, setDraftName] = useState("")
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<{
    step: "name" | "city"
    msg: string
  }>()
  const [joinedGame, setJoinedGame] = useState<string | null>(null)
  const autoJoined = useRef(false)

  const join = useCallback(async (p: Profile) => {
    setJoining(true)
    setJoinError(undefined)
    const r = await joinGame(p)
    setJoining(false)
    if (r.ok) {
      setJoinedGame(r.gameId)
      if (r.emoji && r.emoji !== p.emoji) {
        const withEmoji = { ...p, emoji: r.emoji }
        saveProfile(withEmoji)
        setProfile(withEmoji)
      }
      return true
    }
    if (r.status === 422) {
      setJoinError({ step: "name", msg: r.message ?? "Probá con otro nombre." })
      setStep("name")
    } else
      setJoinError({
        step: "city",
        msg:
          r.status === 0
            ? "Sin señal. Probá de nuevo en un momento."
            : (r.message ?? "No pudimos sumarte. Probá de nuevo."),
      })
    return false
  }, [])

  useEffect(() => {
    // localStorage solo existe en el navegador: se lee después de montar.
    const p = loadProfile()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true)
    void flushAnswers()
    void flushEmail()
    if (p) {
      setProfile(p)
      setDraftName(p.name)
      setStep("play")
      if (!autoJoined.current) {
        autoJoined.current = true
        void join(p)
      }
    }
  }, [join])

  if (!ready) return <Screen>{null}</Screen>

  if (step === "name")
    return (
      <Entry
        render={(status) => (
          <NameStep
            status={status}
            initial={draftName}
            error={joinError?.step === "name" ? joinError.msg : undefined}
            onNext={(name) => {
              setDraftName(name)
              setJoinError(undefined)
              setStep("city")
            }}
          />
        )}
      />
    )

  if (step === "city" || !profile)
    return (
      <Entry
        render={(status) => (
          <CityStep
            status={status}
            busy={joining}
            error={joinError?.step === "city" ? joinError.msg : undefined}
            onBack={() => setStep("name")}
            onJoin={async (city, province) => {
              const p: Profile = {
                id: profile?.id ?? newPlayerId(),
                name: draftName,
                city,
                province,
              }
              saveProfile(p)
              setProfile(p)
              if (await join(p)) setStep("play")
            }}
          />
        )}
      />
    )

  return (
    <Play
      profile={profile}
      joining={joining}
      joinedGame={joinedGame}
      onJoin={() => void join(profile)}
      onEdit={() => setStep("name")}
    />
  )
}

/** Ingreso (nombre y ciudad): con la pantalla del stand apagada no se puede entrar. */
function Entry({ render }: { render: (status: ReactNode) => ReactNode }) {
  const { state } = useTriviaState({ role: "player" })
  const now = useNow(500)
  if (state && !state.open) return <ClosedView />
  return render(<NextGameStatus state={state} now={now} />)
}

/**
 * Aviso arriba del ingreso: cuánto falta para que arranque la partida, así quien está
 * escribiendo su nombre sabe si llega o si va a esperar la siguiente.
 */
function NextGameStatus({
  state,
  now,
}: {
  state: TriviaState | null
  now: number
}) {
  if (!state || !now) return null
  const cur = state.current
  const playing = cur && !["ended", "lobby"].includes(livePhase(cur, now).kind)
  const ends = state.lobby.lobbyEndsAt
  const text = state.paused
    ? "La trivia está en pausa. Arranca en un ratito."
    : playing
      ? ends
        ? `Hay una partida en curso. La próxima arranca en ~${fmtClock(ends - now)}.`
        : "Hay una partida en curso. Entrás en la próxima."
      : state.manualLobby
        ? "La partida la arranca el stand en un momento."
        : ends
          ? `La partida arranca en ${fmtClock(ends - now)}.`
          : "Sos el primero: la partida arranca cuando entres."
  const live = !state.paused && !playing
  return (
    <span
      role="status"
      style={css(
        "align-self:flex-start;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:999px;background:#F1F1F3;font-size:15px;font-weight:500;line-height:1.3;color:#27272B"
      )}
    >
      <span
        style={css(
          `flex:none;width:8px;height:8px;border-radius:999px;background:${live ? "#C6F24A" : "#8A8A93"};box-shadow:0 0 0 2px #0A0A0B`
        )}
      />
      {text}
    </span>
  )
}

function Play({
  profile,
  joining,
  joinedGame,
  onJoin,
  onEdit,
}: {
  profile: Profile
  joining: boolean
  joinedGame: string | null
  onJoin: () => void
  onEdit: () => void
}) {
  const { state, offline } = useTriviaState({
    role: "player",
    playerId: profile.id,
  })
  const now = useNow(200)
  const pending = usePendingAnswers()
  // "🦊 Juli": el emoji llega al entrar (o en el estado, si cambió de celular).
  const name = withEmoji(profile.name, profile.emoji ?? state?.me?.emoji)
  const [final, setFinal] = useState<FinalSnapshot | null>(null)
  const [local, setLocal] = useState<
    Record<string, { choice?: number; price?: number; ms: number }>
  >({})

  // Snapshot del resultado durante el podio: queda en pantalla cuando la partida termina.
  const podium = podiumSnapshot(state, now)
  const podiumKey = podium ? JSON.stringify(podium) : ""
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (podium) setFinal(podium)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podiumKey])

  // Si entró con la trivia cerrada, lo sumamos solo cuando se abre (salvo que ya haya
  // jugado: quien terminó y no tocó "jugar de nuevo" puede haberse ido).
  const open = state?.open
  const prevOpen = useRef(open)
  useEffect(() => {
    const was = prevOpen.current
    prevOpen.current = open
    if (was === false && open && !final && !state?.me?.inLobby) onJoin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!state || !now) return offline ? <OfflineView /> : <Screen>{null}</Screen>

  const me = state.me
  const cur = state.current
  const phase = livePhase(cur, now)
  const inLobby = !!me?.inLobby || joinedGame === state.lobby.id

  // ── Jugando ──
  if (
    cur &&
    me?.inCurrent &&
    phase.kind !== "ended" &&
    phase.kind !== "lobby"
  ) {
    const of = cur.players

    if (phase.kind === "podium" && final)
      return (
        <FinalView
          name={name}
          final={final}
          inNext={inLobby}
          hasEmail={me.hasEmail}
          busy={joining}
          onPlayAgain={onJoin}
          onEmail={(email) => sendEmail(profile.id, email)}
        />
      )

    if (phase.kind === "top5")
      return (
        <PositionView
          after={phase.after}
          name={name}
          rank={me.rank}
          of={of}
          score={me.score}
          fifthScore={cur.standings[4]?.score}
          nextIsPrice={cur.questions[phase.after + 1]?.type === "price"}
        />
      )

    if (phase.kind === "question" || phase.kind === "reveal") {
      const q = phase.q
      const question = cur.questions[q]
      const key = `${cur.id}:${q}`
      const server = me.answers.find((a) => a.q === q)
      const mine = local[key] ?? server
      const isPending = pending.some((a) => a.gameId === cur.id && a.q === q)
      const limit = question
        ? questionLimitS(cur.timeline, question.type) * 1000
        : 1
      const reveal = cur.reveals.find((r) => r.q === q)

      if (question && (phase.kind === "question" || !reveal)) {
        const remaining = phase.kind === "question" ? phase.end - now : 0
        // El tiempo corre desde que el celular mostró la pregunta (si llegó tarde por mala
        // señal, no se le descuenta al jugador); el server lo acota igual.
        const record = (
          a: { choice?: number; price?: number },
          shownAt: number
        ) => {
          if (phase.kind !== "question" || mine) return
          const ms = Math.max(
            0,
            Math.round(serverNow() - Math.max(phase.start, shownAt))
          )
          setLocal((m) => ({ ...m, [key]: { ...a, ms } }))
          sendAnswer({ gameId: cur.id, playerId: profile.id, q, ms, ...a })
        }
        if (question.type === "price")
          return (
            <PriceView
              key={key}
              q={q}
              question={question}
              remaining={remaining}
              limit={limit}
              sent={mine?.price}
              sentMs={mine?.ms}
              pending={isPending}
              onConfirm={(price, shownAt) => record({ price }, shownAt)}
            />
          )
        return (
          <ChoiceView
            key={key}
            q={q}
            question={question}
            remaining={remaining}
            limit={limit}
            picked={mine?.choice ?? (phase.kind === "reveal" ? -1 : undefined)}
            sentMs={mine?.ms}
            pending={isPending}
            onPick={(choice, shownAt) => record({ choice }, shownAt)}
          />
        )
      }

      if (question && reveal) {
        if (question.type === "price")
          return (
            <PriceResult
              q={q}
              reveal={reveal}
              guess={server?.price ?? mine?.price}
              points={server?.points}
              name={name}
              score={me.score}
              min={question.min}
              max={question.max}
            />
          )
        return (
          <ChoiceResult
            q={q}
            question={question}
            reveal={reveal}
            picked={server?.choice ?? mine?.choice}
            ms={server?.ms ?? mine?.ms}
            points={server?.points}
            name={name}
            score={me.score}
            rank={me.rank}
            prevRank={me.prevRank}
            of={of}
          />
        )
      }
    }
  }

  // ── Pantalla del stand apagada ──
  if (!state.open) return <ClosedView />

  // ── Terminó su partida y todavía no se anotó en la próxima ──
  if (final && !inLobby)
    return (
      <FinalView
        name={name}
        final={final}
        inNext={false}
        hasEmail={!!me?.hasEmail}
        busy={joining}
        onPlayAgain={onJoin}
        onEmail={(email) => sendEmail(profile.id, email)}
      />
    )

  // ── En la sala ──
  if (inLobby) {
    const playing = cur && phase.kind !== "ended" && phase.kind !== "lobby"
    if (playing) {
      const q =
        phase.kind === "question" || phase.kind === "reveal"
          ? phase.q + 1
          : phase.kind === "top5"
            ? phase.after + 1
            : cur.questions.length
      return (
        <InProgressView
          name={name}
          q={q}
          startsIn={
            state.lobby.lobbyEndsAt ? state.lobby.lobbyEndsAt - now : null
          }
        />
      )
    }
    return (
      <LobbyView
        name={name}
        city={profile.city}
        count={Math.max(state.lobby.count, 1)}
        left={
          state.lobby.lobbyEndsAt
            ? Math.max(0, state.lobby.lobbyEndsAt - now)
            : null
        }
        paused={state.paused}
        manual={state.manualLobby}
        cities={state.day.cities}
      />
    )
  }

  // ── Todavía no entró (falló el auto-ingreso o volvió después de jugar) ──
  return (
    <Screen>
      <Bar>
        <Logo label="Trivia" />
        <NamePill>{name}</NamePill>
      </Bar>
      <Body pad="40px 20px 32px" gap={18}>
        <H1>¿Jugamos, {name}?</H1>
        <Muted size={17}>Te sumamos a la próxima partida de la pantalla.</Muted>
        <div style={{ flex: 1 }} />
        <button
          onClick={onEdit}
          style={{
            border: 0,
            background: "none",
            padding: 8,
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 600,
            color: "#5A5A62",
            cursor: "pointer",
          }}
        >
          Cambiar nombre o ciudad
        </button>
        <Primary onClick={onJoin} disabled={joining}>
          {joining ? "Entrando…" : "Entrar a la partida"}
        </Primary>
      </Body>
    </Screen>
  )
}

function podiumSnapshot(
  state: TriviaState | null,
  now: number
): FinalSnapshot | null {
  const cur = state?.current
  const me = state?.me
  if (!cur || !me?.inCurrent || !now) return null
  if (livePhase(cur, now).kind !== "podium") return null
  return {
    gameId: cur.id,
    number: cur.number,
    rank: me.rank,
    of: cur.players,
    score: me.score,
    dayBest: me.dayBest,
    leader: state.day.top[0]?.score,
  }
}
