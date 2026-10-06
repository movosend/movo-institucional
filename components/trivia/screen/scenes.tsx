"use client"

import { css } from "@/lib/juegos/css"
import { COPY, PODIUM_DELAYS, SCORING } from "@/lib/trivia/config"
import {
  OPTION_KEYS,
  QUESTION_COUNT,
  fmtClock,
  fmtMoney,
  fmtPoints,
  fmtSeconds,
  type PublicQuestion,
} from "@/lib/trivia/engine"
import type {
  DayBoard,
  LiveGame,
  LobbyGame,
  Reveal,
  Standing,
} from "@/lib/trivia/types"

import { ArgentinaMap } from "../argentina-map"
import { Arrow, Bolt, Check, Cross } from "../icons"
import { Qr, displayUrl } from "../qr"
import { Brand, Header, TimeBar, TimerHeader, ordinal } from "./parts"

/**
 * Escenas de la TV (diseñadas a 1920×1080, ocupan todo el lienzo de `tv.tsx`), una por pantalla del prototipo "Movo Trivia Pantallas".
 * Los estilos son los del diseño, copiados con `css()` para compararlos línea a línea.
 */

const SCENE = (bg: string) =>
  css(
    `width:100%;height:100%;position:relative;overflow:hidden;background:${bg};color:#0A0A0B;animation:mvSceneIn .36s cubic-bezier(.22,1,.36,1) both`
  )

// ── 01 Lobby ─────────────────────────────────────────────────────────────────

export function LobbyScene({
  lobby,
  day,
  paused,
  manual,
  now,
  url,
}: {
  lobby: LobbyGame
  day: DayBoard
  paused: boolean
  /** Lobby manual: no hay cuenta, el stand inicia la partida. */
  manual: boolean
  now: number
  url: string
}) {
  const left = lobby.lobbyEndsAt ? Math.max(0, lobby.lobbyEndsAt - now) : 0
  const pct = lobby.lobbyEndsAt ? 1 - left / (lobby.lobbyS * 1000) : 0
  // Sin cuenta: en pausa (modo stand) o esperando al primer jugador.
  const waiting = !paused && !manual && !lobby.lobbyEndsAt
  // El panel derecho rota cada 10 s entre el mapa y el ranking del día.
  const ph = Math.floor(now / 10000) % 2
  const fill = `${(((now % 10000) / 10000) * 100).toFixed(1)}%`
  const tab = (on: boolean) =>
    css(
      `position:relative;overflow:hidden;display:flex;align-items:center;height:60px;padding:0 28px;border-radius:999px;background:${on ? "#0A0A0B" : "rgba(10,10,11,.1)"};color:${on ? "#FFFFFF" : "#0A0A0B"};font-size:24px;font-weight:600;transition:background .4s,color .4s`
    )
  const panel = (on: boolean, dy: string) => ({
    opacity: on ? 1 : 0,
    transform: `translateY(${on ? "0px" : dy})`,
  })

  return (
    <div style={SCENE("#C6F24A")}>
      <div
        style={css(
          "position:absolute;inset:0;background-image:radial-gradient(rgba(10,10,11,.16) 1.6px,transparent 1.6px);background-size:16px 16px;-webkit-mask-image:radial-gradient(ellipse at 0% 100%,#000 0%,transparent 55%);mask-image:radial-gradient(ellipse at 0% 100%,#000 0%,transparent 55%)"
        )}
      />
      <Header>
        <Brand label="Trivia" strong />
        <div
          style={css(
            "display:flex;align-items:center;gap:16px;font-size:24px;font-weight:600;letter-spacing:.08em;text-transform:uppercase"
          )}
        >
          <span
            style={css(
              "width:16px;height:16px;border-radius:999px;background:#0A0A0B;animation:mvTriviaPulse 2s ease-out infinite"
            )}
          />
          {COPY.lobbyCall}
        </div>
      </Header>

      <div
        style={css(
          "position:absolute;top:128px;left:72px;right:72px;bottom:176px;display:grid;grid-template-columns:820px minmax(0,1fr);gap:64px"
        )}
      >
        <div
          style={css(
            "display:flex;flex-direction:column;justify-content:space-between;padding:8px 0 16px"
          )}
        >
          <h1
            style={css(
              "margin:0;font-size:132px;line-height:.9;letter-spacing:-.055em;font-weight:600;white-space:pre-line"
            )}
          >
            {COPY.lobbyTitle}
          </h1>
          <div style={css("display:flex;gap:44px;align-items:flex-end")}>
            <div
              style={css(
                "flex:none;padding:24px;border-radius:14px;background:#FFFFFF;box-shadow:0 0 0 3px #0A0A0B;display:flex;flex-direction:column;gap:14px"
              )}
            >
              <Qr url={url} size={330} />
              <span
                style={css(
                  "font-family:var(--font-mono);font-size:24px;text-align:center"
                )}
              >
                {displayUrl(url)}
              </span>
            </div>
            <div
              style={css(
                "flex:1;display:flex;flex-direction:column;gap:10px;padding-bottom:12px"
              )}
            >
              <span
                style={css(
                  "font-size:22px;font-weight:600;letter-spacing:.08em;text-transform:uppercase"
                )}
              >
                {paused
                  ? COPY.lobbyPaused
                  : manual
                    ? lobby.count === 1
                      ? "Jugador en la sala"
                      : "Jugadores en la sala"
                    : waiting
                      ? COPY.lobbyWaiting
                      : "Arranca en"}
              </span>
              <span
                style={css(
                  `font-family:var(--font-mono);font-size:${paused ? 96 : 148}px;line-height:.95;letter-spacing:-.05em;font-weight:500;opacity:${waiting ? 0.3 : 1}`
                )}
              >
                {paused
                  ? "--:--"
                  : manual
                    ? String(lobby.count)
                    : fmtClock(waiting ? lobby.lobbyS * 1000 : left)}
              </span>
              {!manual && (
                <div
                  style={css(
                    "height:12px;border-radius:999px;background:rgba(10,10,11,.14);overflow:hidden;margin-top:8px"
                  )}
                >
                  <div
                    style={{
                      ...css(
                        "height:100%;background:#0A0A0B;transition:width .2s linear"
                      ),
                      width: `${Math.max(0, Math.min(1, pct)) * 100}%`,
                    }}
                  />
                </div>
              )}
              <span
                style={css("font-size:28px;line-height:1.3;margin-top:14px")}
              >
                {paused
                  ? COPY.lobbyPausedHint
                  : manual
                    ? COPY.lobbyManualHint
                    : waiting
                      ? COPY.lobbyWaitingHint
                      : COPY.lobbyHint}
              </span>
            </div>
          </div>
        </div>

        <div
          style={css(
            "display:flex;flex-direction:column;gap:20px;padding-top:8px"
          )}
        >
          <div style={css("display:flex;gap:12px")}>
            <span style={tab(ph === 0)}>
              La red de hoy
              <span
                style={{
                  ...css(
                    "position:absolute;left:0;bottom:0;height:5px;background:#C6F24A"
                  ),
                  width: ph === 0 ? fill : "0%",
                }}
              />
            </span>
            <span style={tab(ph === 1)}>
              Ranking del día
              <span
                style={{
                  ...css(
                    "position:absolute;left:0;bottom:0;height:5px;background:#C6F24A"
                  ),
                  width: ph === 1 ? fill : "0%",
                }}
              />
            </span>
          </div>
          <div
            style={css(
              "position:relative;flex:1;border-radius:14px;overflow:hidden"
            )}
          >
            <div
              style={{
                ...css(
                  "position:absolute;inset:0;background:#FFFFFF;transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)"
                ),
                ...panel(ph === 0, "-24px"),
              }}
            >
              <div
                style={css(
                  "position:absolute;top:0;bottom:0;left:320px;right:0"
                )}
              >
                <ArgentinaMap
                  mode="lobby"
                  w={572}
                  h={690}
                  pad={36}
                  cities={day.cities}
                />
              </div>
              <div
                style={css(
                  "position:absolute;left:48px;top:48px;bottom:48px;display:flex;flex-direction:column;justify-content:space-between"
                )}
              >
                <Stat value={day.played} label="jugaron hoy" />
                <Stat
                  value={day.cities.length}
                  label={day.cities.length === 1 ? "ciudad" : "ciudades"}
                />
              </div>
            </div>
            <div
              style={{
                ...css(
                  "position:absolute;inset:0;background:#0A0A0B;color:#FFFFFF;padding:48px;display:flex;flex-direction:column;justify-content:space-between;transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)"
                ),
                ...panel(ph === 1, "24px"),
              }}
            >
              <span
                style={css(
                  "font-size:52px;line-height:1.02;letter-spacing:-.04em;font-weight:600;text-wrap:balance"
                )}
              >
                {COPY.dayTitle}
              </span>
              <div style={css("display:flex;flex-direction:column;gap:10px")}>
                {day.top.length === 0 && (
                  <span
                    style={css("font-size:32px;line-height:1.3;color:#B4B4BC")}
                  >
                    {COPY.dayEmpty}
                  </span>
                )}
                {day.top.map((r, i) => (
                  <div
                    key={r.id}
                    style={css(
                      `display:grid;grid-template-columns:64px minmax(0,1fr) auto;align-items:center;gap:20px;padding:14px 28px;border-radius:10px;background:${i === 0 ? "#C6F24A" : "#1A1A1D"};color:${i === 0 ? "#0A0A0B" : "#FFFFFF"}`
                    )}
                  >
                    <span
                      style={css(
                        "font-family:var(--font-mono);font-size:34px;font-weight:500"
                      )}
                    >
                      {r.rank}
                    </span>
                    <span
                      style={css(
                        "font-size:38px;font-weight:600;letter-spacing:-.03em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                      )}
                    >
                      {r.name}
                    </span>
                    <span
                      style={css(
                        "font-family:var(--font-mono);font-size:38px;font-weight:500"
                      )}
                    >
                      {fmtPoints(r.score)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={css(
          "position:absolute;left:0;right:0;bottom:0;height:136px;background:#0A0A0B;color:#FFFFFF;display:flex;align-items:center;gap:36px;padding:0 0 0 72px"
        )}
      >
        <span
          style={css(
            "flex:none;display:flex;align-items:baseline;gap:14px;font-size:24px;font-weight:600;letter-spacing:.08em;text-transform:uppercase"
          )}
        >
          En la sala
          <span
            style={css(
              "font-family:var(--font-mono);font-size:56px;letter-spacing:-.03em;color:#C6F24A"
            )}
          >
            {lobby.count}
          </span>
        </span>
        <span
          style={css("flex:none;width:2px;height:56px;background:#3A3A40")}
        />
        <div
          style={css(
            "flex:1;min-width:0;display:flex;gap:14px;overflow:hidden"
          )}
        >
          {lobby.players.slice(0, 12).map((p, i) => (
            <span
              key={p.id}
              style={css(
                `flex:none;display:flex;align-items:baseline;gap:12px;padding:16px 28px;border-radius:999px;background:${i === 0 ? "#C6F24A" : "#27272B"};color:${i === 0 ? "#0A0A0B" : "#FFFFFF"};font-size:34px;font-weight:600;letter-spacing:-.02em;animation:mvChipIn .6s cubic-bezier(.22,1,.36,1)`
              )}
            >
              {p.name}
              <span style={css("font-size:24px;font-weight:400;opacity:.7")}>
                {p.city}
              </span>
            </span>
          ))}
          {lobby.players.length === 0 && (
            <span style={css("font-size:30px;color:#8A8A93;align-self:center")}>
              Esperando jugadores. Escaneá el QR para entrar.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span style={css("display:flex;flex-direction:column")}>
      <span
        style={css(
          "font-family:var(--font-mono);font-size:128px;line-height:1;letter-spacing:-.05em;font-weight:500"
        )}
      >
        {value}
      </span>
      <span style={css("font-size:30px;font-weight:600")}>{label}</span>
    </span>
  )
}

// ── 02 / 04 Pregunta ─────────────────────────────────────────────────────────

export function QuestionScene({
  game,
  q,
  question,
  remainingMs,
  limitMs,
}: {
  game: LiveGame
  q: number
  question: Exclude<PublicQuestion, { type: "price" }>
  remainingMs: number
  limitMs: number
}) {
  return (
    <div style={SCENE("#FFFFFF")}>
      <Header>
        <Brand label={`Pregunta ${q + 1} de ${QUESTION_COUNT}`} />
        <TimerHeader
          done={game.answered[q] ?? 0}
          total={game.players}
          verb="respondieron"
          remainingMs={remainingMs}
        />
      </Header>
      <TimeBar left={remainingMs / limitMs} />
      <div
        style={css(
          "position:absolute;top:200px;left:72px;right:72px;bottom:72px;display:flex;flex-direction:column;gap:56px"
        )}
      >
        <div style={css("display:flex;flex-direction:column;gap:20px")}>
          <span
            style={css(
              "font-size:22px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5A5A62"
            )}
          >
            {question.type === "mc"
              ? `Multiple choice · hasta ${fmtPoints(SCORING.base + SCORING.speed)} pts`
              : "Verdadero o falso"}
          </span>
          <h1
            style={css(
              question.type === "mc"
                ? "margin:0;font-size:84px;line-height:1.04;letter-spacing:-.04em;font-weight:600;max-width:1600px;text-wrap:balance"
                : "margin:0;font-size:80px;line-height:1.05;letter-spacing:-.04em;font-weight:600;max-width:1700px;text-wrap:balance"
            )}
          >
            {question.prompt}
          </h1>
        </div>
        {question.type === "mc" ? (
          <div
            style={css(
              "flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:24px"
            )}
          >
            {question.options.map((t, i) => (
              <div
                key={i}
                style={css(
                  "display:flex;align-items:center;gap:32px;padding:0 40px;border-radius:10px;border:2px solid #D5D5DB;background:#FFFFFF"
                )}
              >
                <span
                  style={css(
                    "flex:none;width:76px;height:76px;border-radius:999px;background:#0A0A0B;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:600"
                  )}
                >
                  {OPTION_KEYS[i]}
                </span>
                <span
                  style={css(
                    "font-size:46px;line-height:1.12;letter-spacing:-.025em;font-weight:500"
                  )}
                >
                  {t}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={css(
              "flex:1;display:grid;grid-template-columns:1fr 1fr;gap:24px"
            )}
          >
            <div
              style={css(
                "display:flex;align-items:center;justify-content:center;gap:28px;border-radius:10px;background:#0A0A0B;color:#FFFFFF;font-size:72px;font-weight:600;letter-spacing:-.04em"
              )}
            >
              <Check size={72} color="#C6F24A" width={2.5} />
              Verdadero
            </div>
            <div
              style={css(
                "display:flex;align-items:center;justify-content:center;gap:28px;border-radius:10px;border:3px solid #0A0A0B;font-size:72px;font-weight:600;letter-spacing:-.04em"
              )}
            >
              <Cross size={72} color="#0A0A0B" width={2.5} />
              Falso
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 03 Revelación ────────────────────────────────────────────────────────────

export function RevealScene({
  q,
  question,
  reveal,
}: {
  q: number
  question: Exclude<PublicQuestion, { type: "price" }>
  reveal: Reveal
}) {
  const options =
    question.type === "mc" ? question.options : ["Verdadero", "Falso"]
  const keys = question.type === "mc" ? OPTION_KEYS : ["V", "F"]
  return (
    <div style={SCENE("#FFFFFF")}>
      <Header>
        <Brand label={`Pregunta ${q + 1} de ${QUESTION_COUNT}`} />
        <span style={css("font-size:26px;color:#3A3A40")}>
          {reveal.correct} de {reveal.players} acertaron
        </span>
      </Header>
      <div
        style={css(
          "position:absolute;top:150px;left:72px;right:72px;bottom:64px;display:flex;flex-direction:column;gap:36px"
        )}
      >
        <h1
          style={css(
            "margin:0;font-size:56px;line-height:1.08;letter-spacing:-.035em;font-weight:600;text-wrap:balance"
          )}
        >
          {question.prompt}
        </h1>
        <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:20px")}>
          {options.map((t, i) => {
            const ok = i === reveal.answer
            const pct = reveal.answered
              ? Math.round(((reveal.counts[i] ?? 0) / reveal.answered) * 100)
              : 0
            return (
              <div
                key={i}
                style={css(
                  `position:relative;height:150px;border-radius:10px;border:${ok ? "3px solid #0A0A0B" : "2px solid #E6E6EA"};overflow:hidden;background:#FFFFFF`
                )}
              >
                <div
                  style={{
                    ...css(
                      `position:absolute;left:0;top:0;bottom:0;background:${ok ? "#C6F24A" : "#F1F1F3"};transition:width .6s cubic-bezier(.22,1,.36,1)`
                    ),
                    width: `${pct}%`,
                  }}
                />
                <div
                  style={css(
                    `position:relative;height:100%;display:flex;align-items:center;gap:28px;padding:0 36px;color:${ok ? "#0A0A0B" : "#8A8A93"}`
                  )}
                >
                  <span
                    style={css(
                      `flex:none;width:68px;height:68px;border-radius:999px;background:${ok ? "#0A0A0B" : "#E6E6EA"};color:${ok ? "#C6F24A" : "#8A8A93"};display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:600`
                    )}
                  >
                    {keys[i]}
                  </span>
                  <span
                    style={css(
                      "flex:1;font-size:38px;line-height:1.12;letter-spacing:-.02em;font-weight:500"
                    )}
                  >
                    {t}
                  </span>
                  <span
                    style={css(
                      "font-family:var(--font-mono);font-size:44px;font-weight:500"
                    )}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div
          style={css(
            "flex:1;display:grid;grid-template-columns:560px minmax(0,1fr);gap:20px"
          )}
        >
          <div
            style={css(
              "border-radius:10px;background:#0A0A0B;color:#FFFFFF;padding:36px 40px;display:flex;flex-direction:column;justify-content:space-between"
            )}
          >
            <span
              style={css(
                "display:flex;align-items:center;gap:12px;font-size:20px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#B4B4BC"
              )}
            >
              <Bolt size={24} color="#C6F24A" />
              El más rápido
            </span>
            {reveal.fastest ? (
              <div
                style={css(
                  "display:flex;align-items:flex-end;justify-content:space-between;gap:20px"
                )}
              >
                <span
                  style={css("display:flex;flex-direction:column;min-width:0")}
                >
                  <span
                    style={css(
                      "font-size:52px;font-weight:600;letter-spacing:-.035em"
                    )}
                  >
                    {reveal.fastest.name}
                  </span>
                  <span style={css("font-size:24px;color:#B4B4BC")}>
                    {reveal.fastest.city} · +{fmtPoints(reveal.fastest.points)}
                  </span>
                </span>
                <span
                  style={css(
                    "font-family:var(--font-mono);font-size:64px;color:#C6F24A;letter-spacing:-.03em;white-space:nowrap"
                  )}
                >
                  {fmtSeconds(reveal.fastest.ms)}
                </span>
              </div>
            ) : (
              <span
                style={css(
                  "font-size:40px;font-weight:600;letter-spacing:-.03em"
                )}
              >
                Nadie acertó esta vez.
              </span>
            )}
          </div>
          {reveal.fact && <FactCard fact={reveal.fact} />}
        </div>
      </div>
    </div>
  )
}

function FactCard({ fact }: { fact: string }) {
  return (
    <div
      style={css(
        "position:relative;border-radius:10px;background:#F8F8FA;border:1px solid rgba(10,10,11,.08);padding:36px 44px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden"
      )}
    >
      <svg
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        style={css(
          "position:absolute;inset:0;width:100%;height:100%;opacity:.5"
        )}
        fill="none"
        stroke="#B4B4BC"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="M0 150 C100 110 200 190 300 150 S500 110 600 150" />
        <path d="M0 165 C100 125 200 205 300 165 S500 125 600 165" />
        <path d="M0 180 C100 140 200 220 300 180 S500 140 600 180" />
      </svg>
      <span
        style={css(
          "position:relative;font-size:20px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5A5A62"
        )}
      >
        Dato Movo
      </span>
      <p
        style={css(
          "position:relative;margin:0;font-size:38px;line-height:1.2;letter-spacing:-.02em;font-weight:500;text-wrap:pretty"
        )}
      >
        {fact}
      </p>
    </div>
  )
}

// ── 05 Top 5 parcial ─────────────────────────────────────────────────────────

export function Top5Scene({
  after,
  standings,
  nextIsPrice,
}: {
  after: number
  standings: Standing[]
  nextIsPrice: boolean
}) {
  const left = QUESTION_COUNT - (after + 1)
  return (
    <div style={SCENE("#C6F24A")}>
      <Header>
        <Brand label={`${after + 1} de ${QUESTION_COUNT} · Top 5`} strong />
        <span
          style={css(
            "display:flex;align-items:center;gap:12px;height:60px;padding:0 26px;border-radius:999px;background:#0A0A0B;color:#C6F24A;font-size:26px;font-weight:600"
          )}
        >
          {nextIsPrice
            ? "Ahora, el precio justo · vale doble"
            : "Se viene el precio justo · vale doble"}
        </span>
      </Header>
      <div
        style={css(
          "position:absolute;top:168px;left:72px;right:72px;bottom:72px;display:grid;grid-template-columns:520px minmax(0,1fr);gap:96px"
        )}
      >
        <div
          style={css(
            "display:flex;flex-direction:column;justify-content:space-between;padding:12px 0"
          )}
        >
          <h1
            style={css(
              "margin:0;font-size:120px;line-height:.95;letter-spacing:-.05em;font-weight:600"
            )}
          >
            Así van.
          </h1>
          <p
            style={css(
              "margin:0;font-size:32px;line-height:1.3;color:#0A0A0B;text-wrap:pretty"
            )}
          >
            {left === 1
              ? "Queda una pregunta. Con el precio justo todavía se da vuelta."
              : `Quedan ${left} preguntas. Con el precio justo todavía se da vuelta.`}
          </p>
        </div>
        <div style={css("display:flex;flex-direction:column;gap:14px")}>
          {standings.slice(0, 5).map((t, i) => (
            <div
              key={t.id}
              style={css(
                `flex:1;max-height:180px;display:grid;grid-template-columns:80px minmax(0,1fr) 160px 200px;align-items:center;gap:24px;padding:0 36px;border-radius:10px;background:${i === 0 ? "#0A0A0B" : "#FFFFFF"};color:${i === 0 ? "#FFFFFF" : "#0A0A0B"};animation:mvChipIn .5s cubic-bezier(.22,1,.36,1) ${i * 0.06}s both`
              )}
            >
              <span
                style={css(
                  "font-family:var(--font-mono);font-size:48px;font-weight:500"
                )}
              >
                {t.rank}
              </span>
              <span
                style={css(
                  "display:flex;align-items:baseline;gap:18px;min-width:0;overflow:hidden"
                )}
              >
                <span
                  style={css(
                    "font-size:52px;font-weight:600;letter-spacing:-.035em;white-space:nowrap"
                  )}
                >
                  {t.name}
                </span>
                <span
                  style={css(
                    "font-size:26px;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
                  )}
                >
                  {t.city}
                </span>
              </span>
              <span
                style={css(
                  "display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:28px;opacity:.75"
                )}
              >
                {t.delta > 0
                  ? `↑ ${t.delta}`
                  : t.delta < 0
                    ? `↓ ${-t.delta}`
                    : "—"}
              </span>
              <span
                style={css(
                  "font-family:var(--font-mono);font-size:52px;font-weight:500;text-align:right;letter-spacing:-.03em"
                )}
              >
                {fmtPoints(t.score)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 06 El precio justo ───────────────────────────────────────────────────────

export function PriceScene({
  game,
  q,
  question,
  remainingMs,
  limitMs,
  cities,
}: {
  game: LiveGame
  q: number
  question: Extract<PublicQuestion, { type: "price" }>
  remainingMs: number
  limitMs: number
  cities: string[]
}) {
  return (
    <div style={SCENE("#FFFFFF")}>
      <Header>
        <Brand label={`Pregunta ${q + 1} de ${QUESTION_COUNT}`} />
        <TimerHeader
          done={game.answered[q] ?? 0}
          total={game.players}
          verb="eligieron precio"
          remainingMs={remainingMs}
        />
      </Header>
      <TimeBar left={remainingMs / limitMs} />
      <div
        style={css(
          "position:absolute;top:136px;left:0;right:0;bottom:0;display:grid;grid-template-columns:minmax(0,1fr) 760px"
        )}
      >
        <div
          style={css(
            "padding:72px 72px 72px;display:flex;flex-direction:column;gap:48px"
          )}
        >
          <div style={css("display:flex;flex-direction:column;gap:20px")}>
            <span
              style={css(
                "display:flex;align-items:center;gap:14px;font-size:22px;font-weight:600;letter-spacing:.08em;text-transform:uppercase"
              )}
            >
              <span
                style={css(
                  "padding:8px 16px;border-radius:999px;background:#C6F24A"
                )}
              >
                ×{SCORING.priceMultiplier}
              </span>
              El precio justo
            </span>
            <h1
              style={css(
                "margin:0;font-size:88px;line-height:1.02;letter-spacing:-.045em;font-weight:600;text-wrap:balance"
              )}
            >
              {question.prompt}
            </h1>
          </div>
          <div
            style={css(
              "display:flex;flex-direction:column;border-radius:14px;border:2px solid #0A0A0B;overflow:hidden"
            )}
          >
            <div
              style={css(
                "display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:32px;padding:36px 40px"
              )}
            >
              <RoutePoint label="Retiro" city={question.from} />
              <Arrow size={56} color="#0A0A0B" />
              <RoutePoint label="Entrega" city={question.to} />
            </div>
            <div
              style={css(
                "display:grid;grid-template-columns:1fr 1fr;border-top:2px solid #0A0A0B"
              )}
            >
              <span
                style={css(
                  "padding:28px 40px;display:flex;flex-direction:column;gap:4px;border-right:2px solid #0A0A0B"
                )}
              >
                <span style={css("font-size:22px;color:#5A5A62")}>
                  Distancia
                </span>
                <span
                  style={css(
                    "font-family:var(--font-mono);font-size:44px;font-weight:500"
                  )}
                >
                  {question.km} km
                </span>
              </span>
              <span
                style={css(
                  "padding:28px 40px;display:flex;flex-direction:column;gap:4px"
                )}
              >
                <span style={css("font-size:22px;color:#5A5A62")}>Paquete</span>
                <span
                  style={css(
                    "font-size:44px;font-weight:600;letter-spacing:-.025em"
                  )}
                >
                  {question.parcel}
                </span>
              </span>
            </div>
          </div>
          <p
            style={css("margin:0;font-size:32px;line-height:1.3;color:#3A3A40")}
          >
            Deslizá en tu celular. Gana el que más se acerca.
          </p>
        </div>
        <div
          style={css(
            "position:relative;background:#F8F8FA;border-left:1px solid rgba(10,10,11,.08)"
          )}
        >
          <div style={css("position:absolute;inset:0")}>
            <ArgentinaMap
              mode="route"
              w={760}
              h={944}
              pad={60}
              from={question.from}
              to={question.to}
              cities={cities}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RoutePoint({ label, city }: { label: string; city: string }) {
  return (
    <span style={css("display:flex;flex-direction:column;gap:6px")}>
      <span
        style={css(
          "font-size:20px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5A5A62"
        )}
      >
        {label}
      </span>
      <span
        style={css("font-size:56px;font-weight:600;letter-spacing:-.035em")}
      >
        {city}
      </span>
    </span>
  )
}

// ── 07 Precio justo · revelación ─────────────────────────────────────────────

/** Paso "redondo" para las marcas de la recta (5.000, 10.000…). */
function niceStep(range: number) {
  const raw = range / 7
  const mag = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!
}

export function PriceRevealScene({
  question,
  reveal,
}: {
  question: Extract<PublicQuestion, { type: "price" }>
  reveal: Reveal
}) {
  const { min, max } = question
  const pos = (v: number) =>
    `${(((Math.min(Math.max(v, min), max) - min) / (max - min)) * 100).toFixed(2)}%`
  const step = niceStep(max - min)
  const ticks: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) ticks.push(v)
  // Hasta 15 apuestas en la recta: las más cercanas al precio real.
  const guesses = [...(reveal.guesses ?? [])]
    .sort(
      (a, b) =>
        Math.abs(a.price - reveal.answer) - Math.abs(b.price - reveal.answer)
    )
    .slice(0, 15)
    .sort((a, b) => a.price - b.price)
  const lvl = [0, 96, 192]
  const closest = reveal.closest

  return (
    <div style={SCENE("#FFFFFF")}>
      <Header>
        <Brand
          label={`${question.from} → ${question.to} · ${question.parcel.toLowerCase()}`}
        />
        {reveal.avg !== undefined && (
          <span style={css("font-size:26px;color:#3A3A40")}>
            La sala promedió{" "}
            <span style={css("font-family:var(--font-mono);color:#0A0A0B")}>
              {fmtMoney(reveal.avg)}
            </span>
          </span>
        )}
      </Header>
      <div
        style={css(
          "position:absolute;top:150px;left:72px;right:72px;display:flex;align-items:flex-end;justify-content:space-between;gap:48px"
        )}
      >
        <div style={css("display:flex;flex-direction:column;gap:8px")}>
          <span
            style={css(
              "font-size:24px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5A5A62"
            )}
          >
            Con Movo cuesta
          </span>
          <span
            style={css(
              "font-size:184px;line-height:.9;letter-spacing:-.02em;font-weight:600;color:#0A0A0B;font-variant-numeric:tabular-nums"
            )}
          >
            {fmtMoney(reveal.answer)}
          </span>
        </div>
        {closest && (
          <div
            style={css(
              "display:flex;flex-direction:column;gap:10px;padding:28px 36px;border-radius:14px;background:#C6F24A;min-width:520px"
            )}
          >
            <span
              style={css(
                "font-size:20px;font-weight:600;letter-spacing:.08em;text-transform:uppercase"
              )}
            >
              Más cerca
            </span>
            <span
              style={css(
                "display:flex;align-items:baseline;justify-content:space-between;gap:24px"
              )}
            >
              <span
                style={css(
                  "font-size:56px;font-weight:600;letter-spacing:-.035em"
                )}
              >
                {closest.name}
              </span>
              <span style={css("font-family:var(--font-mono);font-size:40px")}>
                {fmtMoney(closest.price)}
              </span>
            </span>
            <span style={css("font-size:24px;color:#27272B")}>
              {closest.price === reveal.answer
                ? "Lo clavó"
                : `Le erró por ${fmtMoney(Math.abs(closest.price - reveal.answer))}`}{" "}
              · +{fmtPoints(closest.points)} pts
            </span>
          </div>
        )}
      </div>
      <div
        style={css(
          "position:absolute;left:72px;right:72px;top:500px;height:340px"
        )}
      >
        {guesses.map((g, i) => {
          const top = lvl[i % 3]
          const win = g.id === closest?.id
          return (
            <div
              key={g.id}
              style={{
                ...css(
                  "position:absolute;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px"
                ),
                left: pos(g.price),
                top,
              }}
            >
              <span
                style={css(
                  `padding:8px 16px;border-radius:999px;background:${win ? "#C6F24A" : "#F1F1F3"};color:#0A0A0B;font-size:24px;font-weight:600;white-space:nowrap`
                )}
              >
                {g.name} {fmtMoney(g.price)}
              </span>
              <span
                style={{
                  ...css(`width:2px;background:${win ? "#0A0A0B" : "#B4B4BC"}`),
                  height: 288 - top - 44,
                }}
              />
            </div>
          )
        })}
        <div
          style={{
            ...css(
              "position:absolute;top:0;bottom:-20px;width:4px;margin-left:-2px;background:#0A0A0B"
            ),
            left: pos(reveal.answer),
          }}
        />
        <div
          style={css(
            "position:absolute;left:0;right:0;top:288px;height:4px;background:#0A0A0B;border-radius:999px"
          )}
        />
        {ticks.map((v) => (
          <span
            key={v}
            style={{
              ...css(
                "position:absolute;top:304px;transform:translateX(-50%);font-family:var(--font-mono);font-size:22px;color:#5A5A62"
              ),
              left: pos(v),
            }}
          >
            {fmtMoney(v)}
          </span>
        ))}
      </div>
      {reveal.breakdown && (
        <div
          style={css(
            "position:absolute;left:72px;right:72px;bottom:56px;padding-top:28px;border-top:1px solid rgba(10,10,11,.12);display:flex;justify-content:space-between;align-items:baseline;gap:32px"
          )}
        >
          <span
            style={css(
              "font-size:24px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5A5A62"
            )}
          >
            Cómo lo calcula Movo
          </span>
          <span style={css("font-family:var(--font-mono);font-size:30px")}>
            {reveal.breakdown}
          </span>
        </div>
      )}
    </div>
  )
}

// ── 08 Podio ─────────────────────────────────────────────────────────────────

export function PodiumScene({
  game,
  day,
  nextAt,
  paused,
  now,
  url,
}: {
  game: LiveGame
  day: DayBoard
  nextAt: number | null
  paused: boolean
  now: number
  url: string
}) {
  const [first, second, third] = game.standings
  const ranks = game.dayRanks ?? {}
  const inDay = [first, second, third].filter((s) => s && ranks[s.id])
  const leader = day.top[0]
  const columns = [
    second && {
      s: second,
      h: 300,
      bg: "#E6E6EA",
      fg: "#0A0A0B",
      size: 88,
      nameSize: 48,
    },
    first && {
      s: first,
      h: 440,
      bg: "#0A0A0B",
      fg: "#C6F24A",
      size: 120,
      nameSize: 56,
    },
    third && {
      s: third,
      h: 210,
      bg: "#F1F1F3",
      fg: "#0A0A0B",
      size: 80,
      nameSize: 48,
    },
  ]

  return (
    <div style={SCENE("#FFFFFF")}>
      <div
        style={css(
          "position:absolute;inset:0;background-image:radial-gradient(rgba(10,10,11,.12) 1.5px,transparent 1.5px);background-size:16px 16px;-webkit-mask-image:radial-gradient(ellipse at 42% 100%,#000 0%,transparent 55%);mask-image:radial-gradient(ellipse at 42% 100%,#000 0%,transparent 55%)"
        )}
      />
      <Header>
        <Brand label={`Partida ${game.number} · final`} />
      </Header>
      <div
        style={css(
          "position:absolute;top:128px;left:72px;right:72px;bottom:0;display:grid;grid-template-columns:minmax(0,1fr) 500px;gap:64px"
        )}
      >
        <div style={css("display:flex;flex-direction:column")}>
          <h1
            style={css(
              "margin:24px 0 0;font-size:112px;line-height:.95;letter-spacing:-.05em;font-weight:600"
            )}
          >
            {first ? `Ganó ${first.name}.` : "Fin de la partida."}
          </h1>
          <div
            style={css(
              "flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:end"
            )}
          >
            {columns.map((c, i) =>
              c ? (
                <div
                  key={c.s.id}
                  style={css(
                    `display:flex;flex-direction:column;gap:20px;animation:mvFadeUp .5s cubic-bezier(.22,1,.36,1) ${[PODIUM_DELAYS[1], PODIUM_DELAYS[2], PODIUM_DELAYS[0]][i]}s both`
                  )}
                >
                  <span
                    style={css("display:flex;flex-direction:column;gap:2px")}
                  >
                    <span
                      style={css(
                        `font-size:${c.nameSize}px;font-weight:600;letter-spacing:-.035em`
                      )}
                    >
                      {c.s.name}
                    </span>
                    <span style={css("font-size:24px;color:#5A5A62")}>
                      {c.s.city} ·{" "}
                      <span style={css("font-family:var(--font-mono)")}>
                        {fmtPoints(c.s.score)}
                      </span>
                    </span>
                  </span>
                  <div
                    style={css(
                      `height:${c.h}px;border-radius:10px 10px 0 0;background:${c.bg};color:${c.fg};display:flex;justify-content:center;padding-top:${c.size > 100 ? 28 : 24}px;box-sizing:border-box;font-family:var(--font-mono);font-size:${c.size}px;font-weight:500`
                    )}
                  >
                    {c.s.rank}
                  </div>
                </div>
              ) : (
                <div key={i} />
              )
            )}
          </div>
        </div>
        <div
          style={css(
            "padding:24px 0 72px;display:flex;flex-direction:column;gap:20px"
          )}
        >
          <div
            style={css(
              "border-radius:14px;background:#0A0A0B;color:#FFFFFF;padding:32px;display:flex;flex-direction:column;gap:14px"
            )}
          >
            <span
              style={css(
                "font-size:20px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#B4B4BC"
              )}
            >
              Ranking del día
            </span>
            <span
              style={css(
                "font-size:36px;line-height:1.12;letter-spacing:-.025em;font-weight:600"
              )}
            >
              {inDay.length
                ? inDay
                    .map((s, i) =>
                      i === 0
                        ? `${s!.name} entra ${ordinal(ranks[s!.id])}.`
                        : `${s!.name}, ${ordinal(ranks[s!.id])}.`
                    )
                    .join(" ")
                : "Nadie de esta partida entró al top del día."}
            </span>
            {leader && (
              <span
                style={css("font-size:22px;line-height:1.35;color:#B4B4BC")}
              >
                {leader.id === first?.id
                  ? `${leader.name} queda arriba con `
                  : `${leader.name} sigue arriba con `}
                <span style={css("font-family:var(--font-mono);color:#C6F24A")}>
                  {fmtPoints(leader.score)}
                </span>
                .
              </span>
            )}
          </div>
          <div
            style={css(
              "border-radius:14px;border:2px solid #0A0A0B;padding:28px;display:flex;gap:24px;align-items:center"
            )}
          >
            <Qr url={url} size={210} />
            <span
              style={css(
                "display:flex;flex-direction:column;gap:8px;min-width:0"
              )}
            >
              <span
                style={css(
                  "font-size:20px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5A5A62"
                )}
              >
                {paused || nextAt ? "Próxima en" : "Próxima partida"}
              </span>
              {paused || nextAt ? (
                <span
                  style={css(
                    "font-family:var(--font-mono);font-size:64px;line-height:1;font-weight:500"
                  )}
                >
                  {paused ? "--:--" : fmtClock(nextAt! - now)}
                </span>
              ) : (
                <span
                  style={css(
                    "font-size:52px;line-height:1;letter-spacing:-.03em;font-weight:600"
                  )}
                >
                  Abierta
                </span>
              )}
              <span style={css("font-size:22px;color:#3A3A40")}>
                Escaneá y sumate.
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
