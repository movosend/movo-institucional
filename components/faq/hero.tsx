"use client"

import { useRef } from "react"

import { cn } from "@/lib/utils"
import { gsap, useGsap } from "@/lib/use-gsap"
import { Em, GUTTER, LimeGrid, MaskLine } from "@/components/site/primitives"

export function FaqHero() {
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
  })

  return (
    <section
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-lime-500 pt-[clamp(120px,18vh,180px)] pb-[clamp(40px,6vh,72px)] text-ink-950",
        GUTTER
      )}
    >
      <LimeGrid at="50% 30%" />
      <div className="relative flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <h1 className="m-0 text-[clamp(3rem,10vw,11rem)] leading-[.95] font-semibold tracking-[-0.065em] [font-variation-settings:'opsz'_32]">
          <MaskLine>Preguntas</MaskLine>
          <MaskLine>
            <Em>frecuentes.</Em>
          </MaskLine>
        </h1>
        <p className="relative m-0 max-w-[420px] pb-3 text-xl leading-[1.45] font-medium text-pretty">
          Cómo funciona un envío, cómo se cuidan tu identidad y tu plata, y
          quiénes están detrás de Movo. Buscá lo que necesites o recorré por
          tema.
        </p>
      </div>
    </section>
  )
}
