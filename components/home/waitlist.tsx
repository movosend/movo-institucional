"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { gsap } from "gsap"

import { cn } from "@/lib/utils"
import { prefersReducedMotion } from "@/lib/use-gsap"
import { GUTTER, SECTION_Y } from "@/components/site/primitives"

const BARS = [
  3, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 1, 2, 3, 1, 4, 1, 1, 2, 1, 3, 2, 1, 1, 4, 1,
  2, 1, 1, 3, 1, 2, 4, 1, 1, 2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 1, 2, 1,
]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const CONFETTI_COLORS = ["#C6F24A", "#FFFFFF", "#D5D5DB", "#C79A62", "#9FC72E"]

const LABEL =
  "block mb-1 text-[10px] font-medium tracking-[.18em] uppercase text-ink-500"
const INPUT =
  "w-full min-w-0 box-border bg-transparent border-0 border-b border-ink-200 pb-1 text-ink-950 font-normal tracking-[-0.01em] outline-none transition-[border-color] duration-200 focus:border-ink-950"
const PAPER_BG =
  "radial-gradient(120px 90px at 8% 6%,rgba(176,152,104,0.10),transparent 70%),radial-gradient(150px 110px at 94% 88%,rgba(176,152,104,0.12),transparent 72%),radial-gradient(90px 70px at 78% 12%,rgba(150,130,96,0.07),transparent 70%),linear-gradient(148deg,rgba(0,0,0,0.035) 0%,transparent 34%,rgba(0,0,0,0.03) 100%)"
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")"

type Status = "idle" | "loading" | "success" | "error"

function makeCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let c = "MV-"
  for (let i = 0; i < 5; i++) c += a[Math.floor(Math.random() * a.length)]
  return c
}

function Perforation() {
  const notch =
    "absolute size-3.5 -top-[7px] rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.28)]"
  return (
    <div className="relative z-10 h-0">
      <div className="absolute inset-x-0 top-0 h-px bg-[repeating-linear-gradient(to_right,#B4B4BC_0_6px,transparent_6px_12px)]" />
      <span className={cn(notch, "-left-[7px]")} />
      <span className={cn(notch, "-right-[7px]")} />
    </div>
  )
}

export function Waitlist() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")
  const [code, setCode] = useState("")
  const boxRef = useRef<HTMLDivElement>(null)
  const confettiRef = useRef<HTMLDivElement>(null)

  const sealed = status === "success"
  const complete =
    EMAIL_RE.test(email.trim()) && !!firstName.trim() && !!lastName.trim()

  // La caja acusa el golpe y revienta confeti detrás.
  function fireConfetti() {
    const layer = confettiRef.current
    if (!layer || prefersReducedMotion()) return
    const tl = gsap.timeline()
    tl.to(boxRef.current, {
      keyframes: [
        { y: -5, rotate: -0.6, duration: 0.09, ease: "power2.out" },
        { y: 1, rotate: 0.5, duration: 0.1, ease: "power2.inOut" },
        { y: 0, rotate: 0, duration: 0.28, ease: "bounce.out" },
      ],
    })
    const pieces: HTMLSpanElement[] = []
    for (let i = 0; i < 60; i++) {
      const p = document.createElement("span")
      const sq = Math.random() > 0.5
      p.style.cssText = [
        "position:absolute",
        "left:50%",
        "top:0",
        `width:${gsap.utils.random(5, 10, 1)}px`,
        `height:${sq ? gsap.utils.random(5, 10, 1) : gsap.utils.random(8, 15, 1)}px`,
        "border-radius:1px",
        `background:${gsap.utils.random(CONFETTI_COLORS)}`,
      ].join(";")
      layer.appendChild(p)
      pieces.push(p)
    }
    tl.add(
      () =>
        pieces.forEach((p, i) => {
          const spread = (i / 60 - 0.5) * 380
          const ang = gsap.utils.random(-Math.PI * 0.72, -Math.PI * 0.28)
          const pw = gsap.utils.random(150, 340)
          gsap
            .timeline({ onComplete: () => p.remove() })
            .fromTo(
              p,
              { x: spread, y: -6, opacity: 1 },
              {
                x: `+=${Math.cos(ang) * pw * 0.45}`,
                y: `+=${Math.sin(ang) * pw}`,
                duration: gsap.utils.random(0.45, 0.75),
                ease: "power2.out",
              }
            )
            .to(
              p,
              {
                y: `+=${gsap.utils.random(260, 440)}`,
                x: `+=${gsap.utils.random(-50, 50)}`,
                opacity: 0,
                duration: gsap.utils.random(0.9, 1.5),
                ease: "power1.in",
              },
              ">-0.1"
            )
          gsap.to(p, {
            rotate: gsap.utils.random(-540, 540),
            duration: gsap.utils.random(1.1, 1.9),
            ease: "none",
          })
        }),
      "-=0.2"
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "loading" || !complete) return
    setStatus("loading")
    setError("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok)
        throw new Error(
          data.error || "No pudimos registrarte. Probá de nuevo en un momento."
        )
      setFirstName(firstName.trim())
      setEmail(email.trim())
      setCode(makeCode())
      setStatus("success")
      requestAnimationFrame(fireConfetti)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos registrarte.")
      setStatus("error")
    }
  }

  return (
    <section
      id="lista"
      className={cn("relative bg-ink-950", SECTION_Y, GUTTER)}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(40px,6vw,80px)]">
        <div className="flex flex-col gap-6 lg:order-2">
          <h2 className="m-0 text-[clamp(2.6rem,6vw,6rem)] leading-[.92] font-semibold tracking-[-0.055em] text-balance">
            Movo abre ciudad por ciudad.
          </h2>
          <p className="m-0 max-w-[36ch] text-xl leading-[1.45] text-ink-300">
            Guardá tu lugar en la primera.
          </p>
        </div>

        <div className="relative w-full max-w-[600px] animate-[labelIn_360ms_cubic-bezier(0.4,0,0.2,1)_both] justify-self-center lg:order-1">
          <div
            ref={confettiRef}
            className="pointer-events-none absolute inset-x-0 top-[10%] z-0 h-0"
          />
          <div
            ref={boxRef}
            className="relative z-10 w-full min-[370px]:aspect-[1181/1153]"
          >
            {/* next/image la sirve en AVIF/WebP al ancho justo y en diferido. */}
            <Image
              src="/box.png"
              alt=""
              fill
              sizes="(min-width: 640px) 600px, 100vw"
              draggable={false}
              className="pointer-events-none object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] select-none max-[369px]:hidden"
            />
            <div className="pointer-events-none flex items-center justify-center min-[370px]:absolute min-[370px]:top-[17%] min-[370px]:right-[8%] min-[370px]:bottom-[5%] min-[370px]:left-[7%]">
              <div className="pointer-events-auto w-[min(420px,100%)] rotate-[-0.6deg]">
                <div
                  className="relative overflow-hidden rounded bg-[#FBFAF6] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                  style={{ backgroundImage: PAPER_BG }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[.34] mix-blend-multiply"
                    style={{ backgroundImage: NOISE }}
                  />
                  <div className="relative flex items-center justify-between px-4 pt-2.5 pb-2 sm:px-5 sm:pt-3.5 sm:pb-2.5">
                    <span className="text-[11px] font-medium tracking-[.18em] text-ink-500 uppercase">
                      Movo · Lista de espera
                    </span>
                    <span className="flex items-center gap-2">
                      <span
                        className="size-[7px] rounded-full"
                        style={{
                          background: sealed ? "#C6F24A" : "#B4B4BC",
                          animation: sealed
                            ? "livePulse 2s ease-in-out infinite"
                            : "none",
                        }}
                      />
                      <span
                        className="text-[11px] font-medium tracking-[.18em] uppercase"
                        style={{ color: sealed ? "#0A0A0B" : "#5A5A62" }}
                      >
                        {sealed ? "Confirmado" : "Abierta"}
                      </span>
                    </span>
                  </div>
                  <Perforation />
                  <div className="relative px-4 py-3 sm:px-5 sm:py-4">
                    {!sealed ? (
                      <form onSubmit={submit} noValidate>
                        <div className="mb-2 grid grid-cols-2 gap-3 sm:mb-3">
                          <div>
                            <label htmlFor="nl-first" className={LABEL}>
                              Nombre
                            </label>
                            <input
                              id="nl-first"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Tomas"
                              autoComplete="given-name"
                              className={cn(INPUT, "text-base")}
                            />
                          </div>
                          <div>
                            <label htmlFor="nl-last" className={LABEL}>
                              Apellido
                            </label>
                            <input
                              id="nl-last"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Olmos"
                              autoComplete="family-name"
                              className={cn(INPUT, "text-base")}
                            />
                          </div>
                        </div>
                        <label htmlFor="nl-email" className={LABEL}>
                          Correo del destinatario
                        </label>
                        <input
                          id="nl-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@email.com"
                          autoComplete="email"
                          className={cn(INPUT, "text-[17px] sm:text-[19px]")}
                        />
                        <div className="mt-2 flex min-h-7 items-center justify-between gap-3 sm:mt-3 sm:gap-4">
                          <p
                            className="m-0 text-xs leading-[1.4] sm:text-[13px] sm:leading-[1.45]"
                            style={{
                              color: status === "error" ? "#B4231F" : "#8A8A93",
                            }}
                            aria-live="polite"
                          >
                            {status === "error"
                              ? error
                              : "Un aviso cuando abramos. Nada más."}
                          </p>
                          {complete && (
                            <button
                              type="submit"
                              className="flex h-9 shrink-0 animate-[fieldIn_200ms_cubic-bezier(0.4,0,0.2,1)_both] cursor-pointer items-center gap-2 rounded-lg border-0 bg-lime-500 px-4 text-sm font-medium text-ink-950 hover:opacity-90 sm:h-10 sm:px-5"
                            >
                              {status === "loading" ? "Enviando" : "Sumarme"}
                              <svg
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="size-3.5"
                                aria-hidden
                              >
                                <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-medium tracking-[.18em] text-ink-500 uppercase">
                            Tu número de seguimiento
                          </span>
                          <span className="text-[clamp(22px,6vw,32px)] leading-[1.35] font-semibold tracking-[.05em] text-ink-950">
                            {code}
                          </span>
                          <p className="mt-1 mb-0 max-w-[64%] text-xs leading-[1.4] break-words text-ink-500 sm:max-w-[62%] sm:text-[13px] sm:leading-normal">
                            Gracias, {firstName}. Te escribimos a{" "}
                            <span className="text-ink-700">{email}</span> el día
                            que abramos los envíos en tu ciudad.
                          </p>
                        </div>
                        <div className="pointer-events-none absolute right-[18px] -bottom-1.5 animate-[stampIn_200ms_cubic-bezier(0.34,1.4,0.64,1)_both] opacity-[.82]">
                          <Stamp />
                        </div>
                      </>
                    )}
                  </div>
                  <Perforation />
                  <div className="relative flex items-end justify-between gap-6 px-4 pt-2 pb-2.5 sm:px-5 sm:pt-2.5 sm:pb-3">
                    <div
                      className="flex h-4 items-end gap-0.5 overflow-hidden"
                      aria-hidden
                    >
                      {BARS.map((w, i) => (
                        <span
                          key={i}
                          className="block origin-bottom"
                          style={{
                            width: w,
                            height: i % 7 === 0 ? "100%" : "78%",
                            background: sealed ? "#0A0A0B" : "#B4B4BC",
                            animation: sealed
                              ? `barPrint 200ms cubic-bezier(0.4,0,0.2,1) ${i * 4}ms both`
                              : "none",
                          }}
                        />
                      ))}
                    </div>
                    <span className="shrink-0 text-[10px] font-medium tracking-[.18em] text-ink-400 uppercase">
                      Argentina
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stamp() {
  return (
    <svg viewBox="0 0 120 120" width="112" height="112" fill="none" aria-hidden>
      <defs>
        <path
          id="stamp-arc"
          d="M60 60 m -44 0 a 44 44 0 1 1 88 0 a 44 44 0 1 1 -88 0"
        />
      </defs>
      <circle
        cx="60"
        cy="60"
        r="55"
        stroke="#0A0A0B"
        strokeWidth="2"
        strokeOpacity="0.75"
      />
      <circle
        cx="60"
        cy="60"
        r="48"
        stroke="#0A0A0B"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <text
        fill="#0A0A0B"
        fillOpacity="0.8"
        fontSize="10"
        fontWeight="600"
        letterSpacing="2.6"
      >
        <textPath href="#stamp-arc" startOffset="50%" textAnchor="middle">
          MOVO · ARGENTINA · MOVO · ARGENTINA
        </textPath>
      </text>
      <path
        d="M28 60 h64"
        stroke="#0A0A0B"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      <text
        x="60"
        y="55"
        textAnchor="middle"
        fill="#0A0A0B"
        fillOpacity="0.85"
        fontSize="13"
        fontWeight="600"
        letterSpacing="1.4"
      >
        EN LISTA
      </text>
      <text
        x="60"
        y="74"
        textAnchor="middle"
        fill="#0A0A0B"
        fillOpacity="0.6"
        fontSize="9"
        fontWeight="500"
        letterSpacing="1.8"
      >
        2026
      </text>
    </svg>
  )
}
