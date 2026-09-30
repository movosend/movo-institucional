"use client"

import { useRef } from "react"

import { cn } from "@/lib/utils"
import { gsap, useGsap } from "@/lib/use-gsap"
import {
  Em,
  GUTTER,
  LimeGrid,
  MaskLine,
  TickerBar,
} from "@/components/site/primitives"

const RINGS = [
  { r: 290, o: 0.04 },
  { r: 260, o: 0.06 },
  { r: 228, o: 0.09 },
  { r: 194, o: 0.14 },
]

export function ProyectoHero() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, (reduce) => {
    if (reduce) return
    gsap.from("[data-line]", {
      yPercent: 105,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.1,
      delay: 0.1,
    })
    gsap.from("[data-ring]", {
      scale: 0,
      svgOrigin: "300 300",
      duration: 1.2,
      ease: "expo.out",
      stagger: -0.08,
      delay: 0.2,
    })
    gsap.from("[data-pupil]", {
      scale: 0,
      svgOrigin: "300 300",
      duration: 1,
      ease: "expo.out",
      delay: 0.55,
    })
    gsap.to("[data-iris]", {
      rotation: 360,
      svgOrigin: "300 300",
      duration: 24,
      ease: "none",
      repeat: -1,
    })
    // la apertura se cierra al scrollear
    const st = {
      trigger: ref.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
    }
    gsap.to("[data-pupil]", {
      attr: { r: 60 },
      ease: "none",
      scrollTrigger: st,
    })
    gsap.to("[data-rings]", { yPercent: -30, ease: "none", scrollTrigger: st })
  })

  return (
    <section
      ref={ref}
      id="top"
      className={cn(
        "relative box-border flex min-h-[calc(var(--screen-h)*.92)] flex-col justify-between overflow-hidden bg-lime-500 pt-[104px] pb-10 text-ink-950",
        GUTTER
      )}
    >
      <LimeGrid />
      <div
        data-rings=""
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[-12vw] aspect-square w-[min(62vw,760px)] -translate-y-1/2"
      >
        <svg viewBox="0 0 600 600" className="size-full overflow-visible">
          {RINGS.map((c) => (
            <circle
              key={c.r}
              data-ring=""
              cx="300"
              cy="300"
              r={c.r}
              fill="#0A0A0B"
              fillOpacity={c.o}
            />
          ))}
          <circle data-pupil="" cx="300" cy="300" r="157" fill="#0A0A0B" />
          <circle
            data-iris=""
            cx="300"
            cy="300"
            r="100"
            fill="none"
            stroke="#C6F24A"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />
        </svg>
      </div>
      <TickerBar
        dot
        items={[
          "PF · Grupo 27",
          "UTN · Facultad Regional Córdoba",
          "Ingeniería en Sistemas de Información",
          "2026",
        ]}
      />
      <h1 className="relative my-10 text-[clamp(2.2rem,8.4vw,9.5rem)] leading-[.9] font-semibold tracking-[-0.06em] [font-variation-settings:'opsz'_32]">
        <MaskLine>Ingeniería aplicada</MaskLine>
        <MaskLine>a un problema</MaskLine>
        <MaskLine>
          <Em>real.</Em>
        </MaskLine>
      </h1>
      <p className="relative m-0 max-w-[500px] text-xl leading-[1.45] font-medium text-pretty">
        Movo es nuestro Proyecto Final de Ingeniería en Sistemas de Información
        en la UTN Facultad Regional Córdoba. Mucho más que un producto: un
        proyecto.
      </p>
    </section>
  )
}
