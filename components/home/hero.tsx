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

const HERO_BARS = [
  3, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 1, 2, 3, 1, 4, 1, 1, 2, 1, 3, 2, 1, 1, 4, 1,
  2, 1, 1, 3, 1, 2, 4, 1, 1, 2, 1, 3, 1, 1,
]

export function Hero() {
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
    gsap.to("[data-line]", {
      xPercent: (i: number) => (i % 2 ? 6 : -4),
      ease: "none",
      scrollTrigger: {
        trigger: ref.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    })
  })

  return (
    <section
      ref={ref}
      id="top"
      className={cn(
        "relative flex min-h-[var(--screen-h)] flex-col justify-between overflow-hidden bg-lime-500 pt-[104px] pb-10 text-ink-950",
        GUTTER
      )}
    >
      <LimeGrid />
      <TickerBar
        dot
        items={[
          "Próximamente",
          "Disponible en App Store",
          "Disponible en Google Play",
          "Argentina · 2026",
        ]}
      />
      <h1 className="relative my-10 text-[clamp(3rem,8.4vw,9.5rem)] leading-[.9] font-semibold tracking-[-0.06em] [font-variation-settings:'opsz'_32]">
        <MaskLine>
          Hoy la <Em>logística</Em> está
        </MaskLine>
        <MaskLine>pensada para empresas.</MaskLine>
        <MaskLine>Movo la piensa</MaskLine>
        <MaskLine>
          para <Em>personas.</Em>
        </MaskLine>
      </h1>
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <p className="m-0 max-w-[460px] text-xl leading-[1.45] font-medium text-pretty">
          Movo conecta tu paquete con personas que hacen ese camino todos los
          días. Sin sucursales, sin esperas.
        </p>
        <div className="flex h-7 items-center" aria-hidden>
          {HERO_BARS.map((w, i) => (
            <span
              key={i}
              className="mr-0.5 block h-full bg-ink-950"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
