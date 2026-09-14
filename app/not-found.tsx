"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/home/navbar"
import { AnimatedGrid } from "@/components/home/animated-grid"

const TRACKING_CODE = "MVX-404-ERR-7C2F"

function RouteSVG() {
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="relative mx-auto w-full max-w-[340px] select-none"
      aria-hidden
    >
      <svg
        viewBox="0 0 340 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full text-foreground"
      >
        {/* Grid dots */}
        {Array.from({ length: 7 }, (_, col) =>
          Array.from({ length: 5 }, (_, row) => (
            <circle
              key={`${col}-${row}`}
              cx={30 + col * 47}
              cy={20 + row * 44}
              r="1.5"
              fill="currentColor"
              fillOpacity="0.12"
            />
          ))
        )}

        {/* Confused route path */}
        <path
          d="M 40 180 C 60 180 70 140 100 140 C 130 140 120 100 150 90 C 170 83 160 60 190 70 C 220 80 200 120 230 110 C 255 102 240 140 260 130 C 280 120 270 80 300 90"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        <path
          d="M 40 180 C 60 180 70 140 100 140 C 130 140 120 100 150 90 C 170 83 160 60 190 70 C 220 80 200 120 230 110 C 255 102 240 140 260 130 C 280 120 270 80 300 90"
          stroke="#C6F24A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="900"
          strokeDashoffset={drawn ? 0 : 900}
          style={{
            transition: drawn
              ? "stroke-dashoffset 2.4s cubic-bezier(0.4,0,0.2,1)"
              : "none",
          }}
        />

        {/* Origin pin — green */}
        <circle cx="40" cy="180" r="6" fill="#C6F24A" />
        <circle cx="40" cy="180" r="3" fill="var(--background)" />

        {/* Waypoint markers */}
        {[
          { cx: 100, cy: 140 },
          { cx: 150, cy: 90 },
          { cx: 190, cy: 70 },
          { cx: 230, cy: 110 },
          { cx: 260, cy: 130 },
        ].map((pt, i) => (
          <circle
            key={i}
            cx={pt.cx}
            cy={pt.cy}
            r="4"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="1"
          />
        ))}

        {/* Lost package pin at end */}
        <g
          className="animate-pin-bounce"
          style={{ transformOrigin: "300px 90px" }}
        >
          {/* Pin body */}
          <path
            d="M300 58 C300 58 316 76 316 87 C316 96 309 103 300 103 C291 103 284 96 284 87 C284 76 300 58 300 58Z"
            fill="#E5484D"
          />
          <circle cx="300" cy="87" r="7" fill="var(--background)" fillOpacity="0.85" />
          {/* Question mark inside */}
          <text
            x="300"
            y="91.5"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#E5484D"
            fontFamily="Inter, ui-sans-serif"
          >
            ?
          </text>
        </g>

        {/* Pin shadow */}
        <ellipse
          cx="300"
          cy="106"
          rx="10"
          ry="3"
          fill="rgba(0,0,0,0.35)"
          className="animate-pin-shadow"
          style={{ transformOrigin: "300px 106px" }}
        />
      </svg>
    </div>
  )
}

function TrackingChip() {
  const [tick, setTick] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setTick((v) => !v), 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="inline-flex items-center gap-3 rounded-lg border px-4 py-2.5"
      style={{
        background: "rgba(229,72,77,0.06)",
        borderColor: "rgba(229,72,77,0.18)",
      }}
    >
      <span
        className="h-2 w-2 flex-shrink-0 rounded-full transition-opacity duration-300"
        style={{
          background: "#E5484D",
          opacity: tick ? 1 : 0.2,
        }}
      />
      <span
        className="text-xs tracking-[0.12em] uppercase"
        style={{
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          color: "rgba(229,72,77,0.9)",
          letterSpacing: "0.12em",
        }}
      >
        {TRACKING_CODE}
      </span>
      <span
        className="text-[10px] tracking-widest text-muted-foreground uppercase"
        style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
      >
        · PERDIDO
      </span>
    </div>
  )
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedGrid />
      <div className="relative z-10">
        <Navbar />

        <main className="flex min-h-screen flex-col items-center justify-center px-5 pt-24 pb-20 text-center">
          {/* Section label */}

          {/* Big 404 — chrome metallic */}
          <div className="relative mb-6 select-none" aria-hidden>
            <span
              className="font-display chrome-text block"
              style={{ fontSize: "clamp(96px, 22vw, 192px)", lineHeight: 1 }}
            >
              404
            </span>
            {/* Glitch layer */}
            <span
              className="font-display chrome-text animate-glitch pointer-events-none absolute inset-0 block"
              style={{
                fontSize: "clamp(96px, 22vw, 192px)",
                lineHeight: 1,
                opacity: 0.7,
              }}
              aria-hidden
            >
              404
            </span>
          </div>

          {/* Heading */}
          <h1
            className="font-display mb-3 text-foreground/90"
            style={{ fontSize: "clamp(20px, 4vw, 28px)" }}
          >
            Este paquete se perdió en tránsito
          </h1>

          <p
            className="mb-8 max-w-sm leading-relaxed text-muted-foreground"
            style={{ fontSize: "15px" }}
          >
            La ruta que buscás no existe en nuestro sistema.
            <br />
            Puede que fue movida, eliminada o nunca existió.
          </p>

          {/* Tracking chip */}
          <div className="mb-10">
            <TrackingChip />
          </div>

          {/* Route SVG */}
          <div className="mb-12 w-full max-w-[340px]">
            <RouteSVG />
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <a
              href="/"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors duration-[120ms] hover:bg-primary/90"
            >
              Volver al inicio
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-[120ms] group-hover:translate-x-0.5"
                style={{ width: 14, height: 14 }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>

            <a
              href="/como-funciona"
              className="inline-flex items-center gap-2 rounded-lg border border-foreground/12 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors duration-[120ms] hover:border-foreground/20 hover:text-foreground"
            >
              Cómo funciona Movo
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}
