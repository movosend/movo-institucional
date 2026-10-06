"use client"

import { useEffect, useState } from "react"

import { serverNow } from "@/lib/trivia/client"

import { css } from "@/lib/juegos/css"
import { COPY, NAME_MAX, SCORING } from "@/lib/trivia/config"
import { isOffensive } from "@/lib/trivia/badwords"
import { HAPTIC } from "@/lib/trivia/haptics"
import {
  OPTION_KEYS,
  QUESTION_COUNT,
  fmtClock,
  fmtMoney,
  fmtPoints,
  fmtSeconds,
  type PublicQuestion,
} from "@/lib/trivia/engine"
import { isEmail } from "@/components/juegos/raffle"
import { searchLocalidades } from "@/lib/trivia/localidades"
import type { DayBoard, Reveal } from "@/lib/trivia/types"

import { ArgentinaMap } from "../argentina-map"
import { ArrowUp, Check, Clock, Cross, Search, WifiOff } from "../icons"
import {
  Bar,
  Body,
  Eyebrow,
  FactBox,
  H1,
  Logo,
  Muted,
  NamePill,
  Primary,
  Screen,
  TimeLine,
  TimerPill,
} from "./parts"

const INPUT =
  "height:60px;padding:0 18px;border-radius:6px;border:2px solid #0A0A0B;display:flex;align-items:center;font-family:inherit;font-size:22px;font-weight:500;color:#0A0A0B;background:#FFFFFF;outline:none;width:100%;box-sizing:border-box"

// ── Ingreso ──────────────────────────────────────────────────────────────────

export function NameStep({
  status,
  initial,
  error,
  onNext,
}: {
  status?: React.ReactNode
  initial: string
  error?: string
  onNext: (name: string) => void
}) {
  const [name, setName] = useState(initial)
  const clean = name.trim().replace(/\s+/g, " ")
  const bad = clean.length > 0 && isOffensive(clean)
  return (
    <Screen>
      <Bar>
        <Logo label="Trivia" />
      </Bar>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (clean && !bad) onNext(clean)
        }}
        style={css(
          "flex:1;padding:28px 20px 32px;display:flex;flex-direction:column;gap:24px"
        )}
      >
        {status}
        <div style={css("display:flex;flex-direction:column;gap:10px")}>
          <Eyebrow>Paso 1 de 2</Eyebrow>
          <H1>¿Cómo te llamamos?</H1>
        </div>
        <input
          autoFocus
          value={name}
          maxLength={NAME_MAX}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
          enterKeyHint="next"
          aria-label="Tu nombre"
          className="mv-input"
          style={css(INPUT)}
        />
        <span
          style={css(
            `font-size:16px;margin-top:-12px;color:${bad || error ? "#E5484D" : "#5A5A62"}`
          )}
        >
          {bad
            ? "Probá con otro nombre."
            : (error ??
              `Así aparecés en la pantalla. Hasta ${NAME_MAX} letras.`)}
        </span>
        <p
          style={css(
            "margin:0;padding:14px 16px;border-radius:6px;background:#F1F1F3;font-size:15px;line-height:1.4;color:#3A3A40"
          )}
        >
          {COPY.nameRules}
        </p>
        <div style={css("flex:1")} />
        <Primary disabled={!clean || bad}>Seguir</Primary>
      </form>
    </Screen>
  )
}

export function CityStep({
  status,
  busy,
  error,
  onBack,
  onJoin,
}: {
  status?: React.ReactNode
  busy: boolean
  error?: string
  onBack: () => void
  onJoin: (city: string, province?: string) => void
}) {
  const [query, setQuery] = useState("")
  const [picked, setPicked] = useState<{
    city: string
    province?: string
  } | null>(null)
  const hits = picked ? [] : searchLocalidades(query, 4)
  const free = query.trim()
  return (
    <Screen>
      <Bar>
        <Logo label="Trivia" />
        <button
          onClick={onBack}
          style={css(
            "border:0;background:none;padding:8px 0;font-family:inherit;font-size:15px;font-weight:600;color:#5A5A62;cursor:pointer"
          )}
        >
          Cambiar nombre
        </button>
      </Bar>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const choice = picked ?? (free ? { city: free } : null)
          if (choice && !busy) onJoin(choice.city, choice.province)
        }}
        style={css(
          "flex:1;padding:28px 20px 32px;display:flex;flex-direction:column;gap:20px"
        )}
      >
        {status}
        <div style={css("display:flex;flex-direction:column;gap:10px")}>
          <Eyebrow>Paso 2 de 2</Eyebrow>
          <H1>¿De dónde venís?</H1>
          <p
            style={css("margin:0;font-size:17px;line-height:1.4;color:#3A3A40")}
          >
            Te sumamos al mapa de la pantalla.
          </p>
        </div>
        <label style={{ ...css(INPUT), gap: 12 }}>
          <Search size={22} color="#8A8A93" />
          <input
            autoFocus
            value={picked ? picked.city : query}
            onChange={(e) => {
              setPicked(null)
              setQuery(e.target.value)
            }}
            maxLength={60}
            enterKeyHint="go"
            aria-label="Tu ciudad"
            placeholder="Escribí tu ciudad"
            style={css(
              "flex:1;min-width:0;border:0;outline:none;background:none;font-family:inherit;font-size:22px;font-weight:500;color:#0A0A0B"
            )}
          />
        </label>
        <div style={css("display:flex;flex-direction:column;gap:8px")}>
          {picked && (
            <div
              style={css(
                "min-height:60px;padding:0 16px;border-radius:6px;background:#0A0A0B;color:#FFFFFF;display:flex;align-items:center;justify-content:space-between;gap:12px"
              )}
            >
              <span style={css("font-size:19px;font-weight:600")}>
                {picked.city}
              </span>
              <span
                style={css(
                  "display:flex;align-items:center;gap:8px;font-size:15px;color:#B4B4BC"
                )}
              >
                {picked.province}
                <Check size={18} color="#C6F24A" width={2.5} />
              </span>
            </div>
          )}
          {hits.map((c) => (
            <button
              type="button"
              key={c[0] + c[1]}
              onClick={() => setPicked({ city: c[0], province: c[1] })}
              style={css(
                "min-height:60px;padding:0 16px;border-radius:6px;border:1px solid rgba(10,10,11,.12);background:#FFFFFF;display:flex;align-items:center;justify-content:space-between;gap:12px;font-family:inherit;color:#0A0A0B;text-align:left;cursor:pointer"
              )}
            >
              <span style={css("font-size:19px;font-weight:500")}>{c[0]}</span>
              <span style={css("font-size:15px;color:#5A5A62")}>{c[1]}</span>
            </button>
          ))}
          {!picked &&
            free.length >= 2 &&
            hits.every((c) => c[0].toLowerCase() !== free.toLowerCase()) && (
              <button
                type="button"
                onClick={() => setPicked({ city: free })}
                style={css(
                  "min-height:52px;padding:0 16px;border-radius:6px;border:1px dashed rgba(10,10,11,.2);background:#FFFFFF;display:flex;align-items:center;font-family:inherit;font-size:16px;color:#3A3A40;text-align:left;cursor:pointer"
                )}
              >
                Usar «{free}»
              </button>
            )}
        </div>
        {error && (
          <span style={css("font-size:16px;color:#E5484D")}>{error}</span>
        )}
        <div style={css("flex:1")} />
        <Primary disabled={(!picked && !free) || busy}>
          {busy ? "Entrando…" : "Entrar a la partida"}
        </Primary>
      </form>
    </Screen>
  )
}

// ── Sala ─────────────────────────────────────────────────────────────────────

export function LobbyView({
  name,
  city,
  count,
  left,
  paused,
  manual,
  cities,
}: {
  name: string
  city: string
  count: number
  left: number | null
  paused: boolean
  /** Lobby manual: arranca cuando el stand lo indica. */
  manual: boolean
  cities: DayBoard["cities"]
}) {
  return (
    <Screen>
      <Bar>
        <Logo />
        <NamePill>{name}</NamePill>
      </Bar>
      <Body pad="24px 20px 32px" gap={20}>
        <span
          style={css(
            "display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase"
          )}
        >
          <span
            style={css(
              "width:8px;height:8px;border-radius:999px;background:#C6F24A;box-shadow:0 0 0 2px #0A0A0B"
            )}
          />
          En la sala · {count} {count === 1 ? "jugador" : "jugadores"}
        </span>
        <H1>Estás adentro, {name}. Mirá la pantalla.</H1>
        <div
          style={css(
            "display:flex;align-items:baseline;justify-content:space-between;padding:18px 20px;border-radius:6px;background:#F1F1F3"
          )}
        >
          <span style={css("font-size:17px;color:#3A3A40")}>
            {paused
              ? "En pausa"
              : manual
                ? "Arranca con el stand"
                : "Arranca en"}
          </span>
          <span
            style={css(
              "font-family:var(--font-mono);font-size:40px;font-weight:500;letter-spacing:-.03em"
            )}
          >
            {paused || left === null ? "--:--" : fmtClock(left)}
          </span>
        </div>
        <div
          style={css(
            "position:relative;flex:1;min-height:240px;border-radius:10px;border:1px solid rgba(10,10,11,.08);overflow:hidden"
          )}
        >
          <div style={css("position:absolute;inset:0")}>
            <ArgentinaMap
              mode="mine"
              w={350}
              h={330}
              pad={18}
              cities={cities}
              mine={city}
            />
          </div>
          <span
            style={css(
              "position:absolute;left:14px;bottom:12px;right:14px;font-size:15px;line-height:1.35;color:#27272B"
            )}
          >
            {city} ya está en el mapa.
          </span>
        </div>
        <Muted>
          Respondé rápido: hasta {fmtPoints(SCORING.base + SCORING.speed)}{" "}
          puntos por pregunta.
        </Muted>
      </Body>
    </Screen>
  )
}

export function InProgressView({
  name,
  q,
  startsIn,
}: {
  name: string
  /** Pregunta por la que va la partida en curso (0 = todavía ninguna). */
  q: number
  startsIn: number | null
}) {
  return (
    <Screen>
      <Bar>
        <Logo />
        <NamePill>{name}</NamePill>
      </Bar>
      <Body pad="40px 20px 32px" gap={22}>
        <Clock size={40} color="#0A0A0B" width={1.75} />
        <H1>Hay una partida en curso.</H1>
        <p style={css("margin:0;font-size:19px;line-height:1.4;color:#3A3A40")}>
          Ya estás anotado para la próxima. Mientras, mirá la pantalla.
        </p>
        <div
          style={css(
            "display:flex;flex-direction:column;gap:12px;padding:20px;border-radius:6px;background:#F1F1F3"
          )}
        >
          <div
            style={css(
              "display:flex;justify-content:space-between;align-items:baseline"
            )}
          >
            <span style={css("font-size:16px;color:#3A3A40")}>
              Van por la pregunta
            </span>
            <span
              style={css(
                "font-family:var(--font-mono);font-size:22px;font-weight:500"
              )}
            >
              {Math.min(q, QUESTION_COUNT)} de {QUESTION_COUNT}
            </span>
          </div>
          <div
            style={css(
              `display:grid;grid-template-columns:repeat(${QUESTION_COUNT},1fr);gap:4px`
            )}
          >
            {Array.from({ length: QUESTION_COUNT }, (_, i) => (
              <span
                key={i}
                style={css(
                  `height:6px;border-radius:999px;background:${i < q ? "#0A0A0B" : "#D5D5DB"}`
                )}
              />
            ))}
          </div>
          <div
            style={css(
              "display:flex;justify-content:space-between;align-items:baseline;margin-top:6px"
            )}
          >
            <span style={css("font-size:16px;color:#3A3A40")}>
              Tu partida arranca en
            </span>
            <span
              style={css(
                "font-family:var(--font-mono);font-size:22px;font-weight:500"
              )}
            >
              {startsIn === null ? "--:--" : `~${fmtClock(startsIn)}`}
            </span>
          </div>
        </div>
        <div style={css("flex:1")} />
        <Muted>{COPY.rejoinHint}</Muted>
      </Body>
    </Screen>
  )
}

// ── Pregunta ─────────────────────────────────────────────────────────────────

function QuestionBar({
  q,
  ms,
  label,
}: {
  q: number
  ms: number
  label?: string
}) {
  return (
    <Bar>
      <Eyebrow>{label ?? `Pregunta ${q + 1} de ${QUESTION_COUNT}`}</Eyebrow>
      <TimerPill ms={ms} />
    </Bar>
  )
}

export function ChoiceView({
  q,
  question,
  remaining,
  limit,
  picked,
  sentMs,
  pending,
  onPick,
}: {
  q: number
  question: Extract<PublicQuestion, { type: "mc" | "tf" }>
  remaining: number
  limit: number
  picked?: number
  sentMs?: number
  pending: boolean
  onPick: (choice: number, shownAt: number) => void
}) {
  const [shownAt] = useState(serverNow)
  const done = picked !== undefined
  return (
    <Screen>
      <QuestionBar q={q} ms={remaining} />
      <TimeLine left={remaining / limit} />
      <Body pad="24px 20px 28px" gap={22}>
        {question.type === "tf" && <Eyebrow>Verdadero o falso</Eyebrow>}
        <H1 size={27} style={question.type === "tf" ? "margin-top:-10px" : ""}>
          {question.prompt}
        </H1>
        {question.type === "mc" ? (
          <div
            style={css("flex:1;display:flex;flex-direction:column;gap:10px")}
          >
            {question.options.map((t, i) => {
              const p = picked === i
              return (
                <button
                  key={i}
                  disabled={done}
                  onClick={() => onPick(i, shownAt)}
                  className="mv-press"
                  style={css(
                    `flex:1;min-height:72px;display:flex;align-items:center;gap:14px;padding:0 16px;border-radius:8px;border:2px solid ${done ? (p ? "#0A0A0B" : "#E6E6EA") : "#D5D5DB"};background:${p ? "#0A0A0B" : "#FFFFFF"};color:${p ? "#FFFFFF" : "#0A0A0B"};opacity:${done && !p ? 0.45 : 1};font-family:inherit;text-align:left;cursor:pointer;transition:opacity .2s,background .2s,transform .12s`
                  )}
                >
                  <span
                    style={css(
                      `flex:none;width:36px;height:36px;border-radius:999px;background:${done ? (p ? "#C6F24A" : "#E6E6EA") : "#0A0A0B"};color:${done ? "#0A0A0B" : "#FFFFFF"};display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:600`
                    )}
                  >
                    {OPTION_KEYS[i]}
                  </span>
                  <span
                    style={css(
                      "font-size:19px;line-height:1.2;font-weight:500"
                    )}
                  >
                    {t}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div
            style={css("flex:1;display:flex;flex-direction:column;gap:12px")}
          >
            {[0, 1].map((i) => {
              const p = picked === i
              const isTrue = i === 0
              const dark = done ? p : isTrue
              return (
                <button
                  key={i}
                  disabled={done}
                  onClick={() => onPick(i, shownAt)}
                  className="mv-press"
                  style={css(
                    `flex:1;min-height:96px;display:flex;align-items:center;justify-content:center;gap:14px;border-radius:8px;border:2px solid #0A0A0B;background:${dark ? "#0A0A0B" : "#FFFFFF"};color:${dark ? "#FFFFFF" : "#0A0A0B"};opacity:${done && !p ? 0.45 : 1};font-family:inherit;font-size:28px;font-weight:600;letter-spacing:-.025em;cursor:pointer;transition:opacity .2s,transform .12s`
                  )}
                >
                  {isTrue ? (
                    <Check
                      size={30}
                      color={dark ? "#C6F24A" : "#0A0A0B"}
                      width={2.5}
                    />
                  ) : (
                    <Cross
                      size={30}
                      color={dark ? "#C6F24A" : "#0A0A0B"}
                      width={2.5}
                    />
                  )}
                  {isTrue ? "Verdadero" : "Falso"}
                </button>
              )
            })}
          </div>
        )}
        {done && <SentNote ms={sentMs} pending={pending} />}
      </Body>
    </Screen>
  )
}

function SentNote({
  ms,
  pending,
  extra,
}: {
  ms?: number
  pending: boolean
  extra?: string
}) {
  return (
    <div
      style={css(
        "display:flex;align-items:center;gap:12px;padding:16px;border-radius:6px;background:#F1F1F3;font-size:16px;line-height:1.35;color:#27272B"
      )}
    >
      {pending ? (
        <WifiOff size={22} color="#0A0A0B" style={css("flex:none")} />
      ) : (
        <Check size={22} color="#0A0A0B" style={css("flex:none")} />
      )}
      {pending
        ? "Sin señal, reintentando. Tu tiempo ya quedó guardado."
        : `${extra ?? ""}Enviada${ms !== undefined ? ` en ${fmtSeconds(ms)}` : ""}. Esperá a los demás.`}
    </div>
  )
}

/** Paso del slider: ~70 posiciones en el rango, redondeado a 100 / 500. */
const priceStep = (min: number, max: number) =>
  (max - min) / 70 >= 400 ? 500 : 100

export function PriceView({
  q,
  question,
  remaining,
  limit,
  sent,
  sentMs,
  pending,
  onConfirm,
}: {
  q: number
  question: Extract<PublicQuestion, { type: "price" }>
  remaining: number
  limit: number
  sent?: number
  sentMs?: number
  pending: boolean
  onConfirm: (price: number, shownAt: number) => void
}) {
  const [shownAt] = useState(serverNow)
  const step = priceStep(question.min, question.max)
  // Arranca en el medio: el precio real cae en otro lugar en cada ruta (questions.ts).
  const mid =
    Math.round((question.min + (question.max - question.min) * 0.5) / step) *
    step
  const [value, setValue] = useState(mid)
  const v = sent ?? value
  const pct = ((v - question.min) / (question.max - question.min)) * 100
  const done = sent !== undefined
  const clamp = (x: number) => Math.min(question.max, Math.max(question.min, x))
  return (
    <Screen>
      <QuestionBar
        q={q}
        ms={remaining}
        label={`${q + 1} de ${QUESTION_COUNT} · vale doble`}
      />
      <TimeLine left={remaining / limit} />
      <Body pad="24px 20px 28px" gap={20}>
        <H1 size={27}>{question.prompt}</H1>
        <div
          style={css(
            "padding:16px;border-radius:6px;background:#F1F1F3;display:flex;flex-direction:column;gap:6px"
          )}
        >
          <span
            style={css("font-size:20px;font-weight:600;letter-spacing:-.02em")}
          >
            {question.from} → {question.to}
          </span>
          <span style={css("font-size:16px;color:#3A3A40")}>
            {question.parcel} ·{" "}
            <span style={css("font-family:var(--font-mono)")}>
              {question.km} km
            </span>
          </span>
        </div>
        <div
          style={css(
            "flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px"
          )}
        >
          <span
            style={css(
              "text-align:center;font-family:var(--font-mono);font-size:64px;font-weight:500;letter-spacing:-.04em"
            )}
          >
            {fmtMoney(v)}
          </span>
          <div style={css("position:relative;height:44px")}>
            <div
              style={css(
                "position:absolute;left:0;right:0;top:18px;height:8px;border-radius:999px;background:#E6E6EA"
              )}
            />
            <div
              style={{
                ...css(
                  "position:absolute;left:0;top:18px;height:8px;border-radius:999px;background:#0A0A0B"
                ),
                width: `${pct}%`,
              }}
            />
            <input
              type="range"
              min={question.min}
              max={question.max}
              step={step}
              value={v}
              disabled={done}
              onChange={(e) => setValue(Number(e.target.value))}
              aria-label="Tu precio"
              className="mv-trivia-range"
            />
          </div>
          <div
            style={css(
              "display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:15px;color:#5A5A62"
            )}
          >
            <span>{fmtMoney(question.min)}</span>
            <span>{fmtMoney(question.max)}</span>
          </div>
          {!done && (
            <div
              style={css("display:grid;grid-template-columns:1fr 1fr;gap:10px")}
            >
              {[-step * 5, step * 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setValue(clamp(value + d))}
                  className="mv-press"
                  style={css(
                    "height:52px;border-radius:999px;border:1.5px solid #D5D5DB;background:#FFFFFF;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:18px;color:#0A0A0B;cursor:pointer"
                  )}
                >
                  {d < 0 ? "−" : "+"}
                  {fmtPoints(Math.abs(d))}
                </button>
              ))}
            </div>
          )}
        </div>
        {done ? (
          <SentNote
            ms={sentMs}
            pending={pending}
            extra={`${fmtMoney(sent)}. `}
          />
        ) : (
          <Primary onClick={() => onConfirm(value, shownAt)} icon="none">
            Confirmar precio
            <Check size={20} color="#C6F24A" width={2.25} />
          </Primary>
        )}
      </Body>
    </Screen>
  )
}

// ── Revelación ───────────────────────────────────────────────────────────────

function rankLine(
  rank: number | undefined,
  prev: number | undefined,
  of: number,
  left: number
) {
  if (!rank) return ""
  const tail = left > 0 ? (left === 1 ? " Queda 1." : ` Quedan ${left}.`) : ""
  if (!prev || prev === rank) return `Seguís ${rank}° de ${of}.${tail}`
  return rank < prev
    ? `Subiste al ${rank}° de ${of}.${tail}`
    : `Bajaste al ${rank}° de ${of}.${tail}`
}

export function ChoiceResult({
  q,
  question,
  reveal,
  picked,
  ms,
  points,
  name,
  score,
  rank,
  prevRank,
  of,
}: {
  q: number
  question: Extract<PublicQuestion, { type: "mc" | "tf" }>
  reveal: Reveal
  picked?: number
  ms?: number
  points?: number
  name: string
  score: number
  rank?: number
  prevRank?: number
  of: number
}) {
  const ok = picked !== undefined && picked === reveal.answer
  const left = QUESTION_COUNT - (q + 1)
  useEffect(() => {
    if (ok) HAPTIC.correct()
    else if (picked === undefined) HAPTIC.timeout()
    else HAPTIC.wrong()
    // Solo al aparecer el resultado de cada pregunta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])
  const answerText =
    question.type === "tf"
      ? reveal.answer === 0
        ? "Era verdadero."
        : "Era falso."
      : `Era la ${OPTION_KEYS[reveal.answer]}: ${question.options[reveal.answer]}.`
  return (
    <Screen bg={ok ? "#C6F24A" : "#0A0A0B"} fg={ok ? "#0A0A0B" : "#FFFFFF"}>
      <Bar>
        <Eyebrow color={ok ? "#27272B" : "#B4B4BC"}>
          Pregunta {q + 1} de {QUESTION_COUNT}
        </Eyebrow>
        <NamePill dark={ok ? "ink" : "soft"}>
          {name} · {fmtPoints(score)}
        </NamePill>
      </Bar>
      <Body pad="40px 20px 24px" gap={18}>
        {ok ? (
          <span
            style={css(
              "width:64px;height:64px;border-radius:999px;background:#0A0A0B;display:flex;align-items:center;justify-content:center;animation:mvPop .36s cubic-bezier(.22,1,.36,1) both"
            )}
          >
            <Check size={34} color="#C6F24A" width={2.5} />
          </span>
        ) : (
          <span
            style={css(
              `width:64px;height:64px;border-radius:999px;border:2px solid ${picked === undefined ? "#8A8A93" : "#E5484D"};box-sizing:border-box;display:flex;align-items:center;justify-content:center;${picked === undefined ? "" : "animation:mvShake .36s ease-in-out"}`
            )}
          >
            {picked === undefined ? (
              <Clock size={30} color="#8A8A93" width={2.25} />
            ) : (
              <Cross size={30} color="#E5484D" width={2.5} />
            )}
          </span>
        )}
        <H1 size={ok || question.type === "tf" ? 52 : 36}>
          {ok
            ? "Correcta."
            : picked === undefined
              ? "Se acabó el tiempo."
              : answerText}
        </H1>
        {!ok && picked === undefined && (
          <span style={css("font-size:18px;color:#B4B4BC")}>{answerText}</span>
        )}
        <span
          style={css(
            `font-family:var(--font-mono);font-size:44px;font-weight:500;letter-spacing:-.03em;color:${ok ? "#0A0A0B" : "#8A8A93"}`
          )}
        >
          +{fmtPoints(points ?? 0)}
        </span>
        <span style={css(`font-size:18px;color:${ok ? "#27272B" : "#B4B4BC"}`)}>
          {ok && ms !== undefined ? `Respondiste en ${fmtSeconds(ms)} · ` : ""}
          {rankLine(rank, prevRank, of, left)}
        </span>
        <div style={css("flex:1")} />
        {reveal.fact && <FactBox fact={reveal.fact} dark={!ok} />}
      </Body>
    </Screen>
  )
}

export function PriceResult({
  q,
  reveal,
  guess,
  points,
  name,
  score,
  min,
  max,
}: {
  q: number
  reveal: Reveal
  guess?: number
  points?: number
  name: string
  score: number
  min: number
  max: number
}) {
  const real = reveal.answer
  const pos = (v: number) =>
    ((Math.min(Math.max(v, min), max) - min) / (max - min)) * 100
  const diff = guess === undefined ? 0 : guess - real
  useEffect(() => {
    if (guess === undefined) HAPTIC.timeout()
    else if (diff === 0) HAPTIC.perfect()
    else if (points) HAPTIC.correct()
    else HAPTIC.wrong()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])
  const title =
    guess === undefined
      ? "No llegaste a elegir precio."
      : diff === 0
        ? "Lo clavaste."
        : diff < 0
          ? `Te quedaste corto por ${fmtMoney(-diff)}.`
          : `Te pasaste por ${fmtMoney(diff)}.`
  return (
    <Screen>
      <Bar>
        <Eyebrow>
          {q + 1} de {QUESTION_COUNT}
        </Eyebrow>
        <NamePill>
          {name} · {fmtPoints(score)}
        </NamePill>
      </Bar>
      <Body pad="32px 20px 28px" gap={16}>
        <Eyebrow>Costaba</Eyebrow>
        <span
          style={css(
            "font-family:var(--font-mono);font-size:56px;line-height:1;font-weight:500;letter-spacing:-.04em"
          )}
        >
          {fmtMoney(real)}
        </span>
        <H1 size={30} style="margin-top:8px">
          {title}
        </H1>
        {guess !== undefined && (
          <div style={css("position:relative;height:72px;margin-top:8px")}>
            <div
              style={css(
                "position:absolute;left:0;right:0;top:40px;height:4px;border-radius:999px;background:#E6E6EA"
              )}
            />
            <div
              style={{
                ...css(
                  "position:absolute;top:40px;height:4px;background:#0A0A0B"
                ),
                left: `${Math.min(pos(guess), pos(real))}%`,
                width: `${Math.abs(pos(guess) - pos(real))}%`,
              }}
            />
            <span
              style={{
                ...css(
                  "position:absolute;top:0;transform:translateX(-50%);font-size:13px;font-weight:600;padding:3px 8px;border-radius:999px;background:#C6F24A"
                ),
                left: `${pos(guess)}%`,
              }}
            >
              Vos
            </span>
            <span
              style={{
                ...css(
                  "position:absolute;top:0;transform:translateX(-50%);font-size:13px;font-weight:600;padding:3px 8px;border-radius:999px;background:#0A0A0B;color:#FFFFFF"
                ),
                left: `${pos(real)}%`,
              }}
            >
              Real
            </span>
            <span
              style={{
                ...css(
                  "position:absolute;top:34px;width:16px;height:16px;margin-left:-8px;border-radius:999px;background:#C6F24A;box-shadow:0 0 0 2px #0A0A0B"
                ),
                left: `${pos(guess)}%`,
              }}
            />
            <span
              style={{
                ...css(
                  "position:absolute;top:32px;width:4px;height:20px;margin-left:-2px;background:#0A0A0B"
                ),
                left: `${pos(real)}%`,
              }}
            />
          </div>
        )}
        <div
          style={css(
            "display:flex;justify-content:space-between;align-items:baseline;padding:16px 0;border-top:1px solid rgba(10,10,11,.08);border-bottom:1px solid rgba(10,10,11,.08)"
          )}
        >
          <span style={css("font-size:17px;color:#3A3A40")}>
            Puntos (×{SCORING.priceMultiplier})
          </span>
          <span
            style={css(
              "font-family:var(--font-mono);font-size:26px;font-weight:500"
            )}
          >
            +{fmtPoints(points ?? 0)}
          </span>
        </div>
        <div style={css("flex:1")} />
        {reveal.breakdown && (
          <p
            style={css(
              "margin:0;font-size:16px;line-height:1.45;color:#3A3A40"
            )}
          >
            {reveal.breakdown}. Así cotiza Movo cada envío.
          </p>
        )}
      </Body>
    </Screen>
  )
}

// ── Top 5 parcial ────────────────────────────────────────────────────────────

export function PositionView({
  after,
  name,
  rank,
  of,
  score,
  fifthScore,
  nextIsPrice,
}: {
  after: number
  name: string
  rank?: number
  of: number
  score: number
  fifthScore?: number
  nextIsPrice: boolean
}) {
  const gap =
    rank && rank > 5 && fifthScore !== undefined ? fifthScore - score : 0
  return (
    <Screen>
      <Bar>
        <Eyebrow>
          {after + 1} de {QUESTION_COUNT}
        </Eyebrow>
        <NamePill>{name}</NamePill>
      </Bar>
      <Body pad="40px 20px 28px" gap={14}>
        <Eyebrow>Tu posición</Eyebrow>
        <div style={css("display:flex;align-items:baseline;gap:12px")}>
          <span
            style={css(
              "font-size:96px;line-height:.9;letter-spacing:-.06em;font-weight:600"
            )}
          >
            {rank ?? "-"}°
          </span>
          <span style={css("font-size:22px;color:#5A5A62")}>de {of}</span>
        </div>
        <span
          style={css(
            "font-family:var(--font-mono);font-size:28px;font-weight:500"
          )}
        >
          {fmtPoints(score)} pts
        </span>
        <div
          style={css(
            "display:flex;align-items:center;gap:10px;padding:16px;border-radius:6px;background:#F1F1F3;font-size:17px;line-height:1.35;margin-top:12px"
          )}
        >
          <ArrowUp size={20} color="#0A0A0B" style={css("flex:none")} />
          {rank && rank <= 5
            ? "Estás en el top 5 de la partida."
            : `Estás a ${fmtPoints(Math.max(gap, 0))} del 5°.`}
        </div>
        <div style={css("flex:1")} />
        <div
          style={css(
            "padding:20px;border-radius:6px;background:#0A0A0B;color:#FFFFFF;display:flex;flex-direction:column;gap:6px"
          )}
        >
          <span
            style={css(
              "font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
            )}
          >
            {nextIsPrice ? "Ahora" : "Se viene"}
          </span>
          <span
            style={css(
              "font-size:22px;line-height:1.2;font-weight:600;letter-spacing:-.02em"
            )}
          >
            El precio justo vale doble. Preparate.
          </span>
        </div>
      </Body>
    </Screen>
  )
}

// ── Final ────────────────────────────────────────────────────────────────────

export interface FinalSnapshot {
  gameId: string
  number: number
  rank?: number
  of: number
  score: number
  dayBest?: { rank: number; score: number }
  leader?: number
}

export function FinalView({
  name,
  final,
  inNext,
  hasEmail,
  busy,
  onPlayAgain,
  onEmail,
}: {
  name: string
  final: FinalSnapshot
  inNext: boolean
  hasEmail: boolean
  busy: boolean
  onPlayAgain: () => void
  onEmail: (email: string) => Promise<boolean>
}) {
  return (
    <Screen>
      <Bar>
        <Eyebrow>Partida {final.number} · final</Eyebrow>
        <NamePill>{name}</NamePill>
      </Bar>
      <Body pad="32px 20px 28px" gap={14}>
        <Eyebrow>Terminaste</Eyebrow>
        <div style={css("display:flex;align-items:baseline;gap:12px")}>
          <span
            style={css(
              "font-size:96px;line-height:.9;letter-spacing:-.06em;font-weight:600"
            )}
          >
            {final.rank ?? "-"}°
          </span>
          <span style={css("font-size:22px;color:#5A5A62")}>de {final.of}</span>
        </div>
        <span
          style={css(
            "font-family:var(--font-mono);font-size:28px;font-weight:500"
          )}
        >
          {fmtPoints(final.score)} pts
        </span>
        <div
          style={css(
            "margin-top:10px;border-radius:6px;background:#0A0A0B;color:#FFFFFF;padding:20px;display:flex;flex-direction:column;gap:12px"
          )}
        >
          <span
            style={css(
              "font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#B4B4BC"
            )}
          >
            Ranking del día
          </span>
          <div
            style={css(
              "display:flex;justify-content:space-between;align-items:baseline"
            )}
          >
            <span style={css("font-size:17px;color:#B4B4BC")}>
              Tu mejor partida
            </span>
            <span style={css("font-family:var(--font-mono);font-size:20px")}>
              {final.dayBest
                ? `#${final.dayBest.rank} · ${fmtPoints(final.dayBest.score)}`
                : "--"}
            </span>
          </div>
          {final.leader !== undefined && (
            <div
              style={css(
                "display:flex;justify-content:space-between;align-items:baseline"
              )}
            >
              <span style={css("font-size:17px;color:#B4B4BC")}>
                El #1 tiene
              </span>
              <span
                style={css(
                  "font-family:var(--font-mono);font-size:20px;color:#C6F24A"
                )}
              >
                {fmtPoints(final.leader)}
              </span>
            </div>
          )}
        </div>
        {!hasEmail && <EmailForm onSubmit={onEmail} />}
        <div style={css("flex:1")} />
        <p
          style={css("margin:0;font-size:15px;line-height:1.45;color:#3A3A40")}
        >
          {COPY.podiumFooter}
        </p>
        {inNext ? (
          <div
            style={css(
              "height:58px;border-radius:8px;background:#F1F1F3;display:flex;align-items:center;justify-content:center;gap:10px;font-size:17px;font-weight:600"
            )}
          >
            <Check size={20} color="#0A0A0B" width={2.25} />
            Ya estás anotado para la próxima
          </div>
        ) : (
          <Primary onClick={onPlayAgain} disabled={busy}>
            {busy ? "Entrando…" : "Jugar la próxima"}
          </Primary>
        )}
      </Body>
    </Screen>
  )
}

function EmailForm({
  onSubmit,
}: {
  onSubmit: (email: string) => Promise<boolean>
}) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "invalid" | "sending" | "done">(
    "idle"
  )
  if (state === "done")
    return (
      <div
        style={css(
          "display:flex;align-items:center;gap:10px;padding:16px;border-radius:6px;background:#F1F1F3;font-size:16px;line-height:1.35"
        )}
      >
        <Check size={20} color="#0A0A0B" style={css("flex:none")} />
        {COPY.emailDone(email.trim())}
      </div>
    )
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!isEmail(email.trim())) return setState("invalid")
        setState("sending")
        // Si no hay red queda guardado y se reintenta solo; para la persona ya está.
        void onSubmit(email.trim()).finally(() => setState("done"))
      }}
      style={css(
        "margin-top:10px;display:flex;flex-direction:column;gap:10px;padding:18px;border-radius:6px;border:1px solid rgba(10,10,11,.12)"
      )}
    >
      <span style={css("font-size:17px;font-weight:600;letter-spacing:-.01em")}>
        {COPY.emailTitle}
      </span>
      <span style={css("font-size:15px;line-height:1.4;color:#3A3A40")}>
        {COPY.emailBody}
      </span>
      <div style={css("display:flex;gap:8px")}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state === "invalid") setState("idle")
          }}
          placeholder={COPY.emailPlaceholder}
          aria-label="Tu mail"
          className="mv-input"
          style={css(
            "flex:1;min-width:0;height:52px;padding:0 14px;border-radius:6px;border:2px solid #0A0A0B;font-family:inherit;font-size:17px;color:#0A0A0B;background:#FFFFFF;outline:none"
          )}
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="mv-press"
          style={css(
            "flex:none;height:52px;padding:0 18px;border:0;border-radius:8px;background:#0A0A0B;color:#FFFFFF;font-family:inherit;font-size:16px;font-weight:600;cursor:pointer"
          )}
        >
          {COPY.emailSubmit}
        </button>
      </div>
      {state === "invalid" && (
        <span style={css("font-size:14px;color:#E5484D")}>
          {COPY.emailInvalid}
        </span>
      )}
    </form>
  )
}

// ── Sin servidor ─────────────────────────────────────────────────────────────

export function OfflineView() {
  return (
    <Screen>
      <Bar>
        <Logo label="Trivia" />
      </Bar>
      <Body pad="40px 20px 32px" gap={18}>
        <WifiOff size={40} color="#0A0A0B" width={1.75} />
        <H1>Estamos conectando con la pantalla.</H1>
        <p style={css("margin:0;font-size:19px;line-height:1.4;color:#3A3A40")}>
          Si tu señal está floja, esperá unos segundos: se reintenta solo.
        </p>
      </Body>
    </Screen>
  )
}

/** La pantalla del stand está apagada: no se puede entrar (ver `trivia_screen_live`). */
export function ClosedView() {
  return (
    <Screen>
      <Bar>
        <Logo label="Trivia" />
      </Bar>
      <Body pad="40px 20px 32px" gap={18}>
        <Clock size={40} color="#0A0A0B" width={1.75} />
        <H1>{COPY.closedTitle}</H1>
        <p style={css("margin:0;font-size:19px;line-height:1.4;color:#3A3A40")}>
          {COPY.closedBody}
        </p>
      </Body>
    </Screen>
  )
}
