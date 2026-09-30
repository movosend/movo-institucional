"use client"

import Link from "next/link"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { gsap, useGsap } from "@/lib/use-gsap"
import {
  ArrowIcon,
  CornerBrackets,
  Em,
  GUTTER,
  MaskLine,
  SECTION_Y,
} from "@/components/site/primitives"

export function ComoClosing() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, (reduce) => {
    if (reduce) return
    gsap.from("[data-cline]", {
      yPercent: 105,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ref.current, start: "top 70%" },
    })
  })

  return (
    <section
      ref={ref}
      className={cn("relative bg-lime-500 text-ink-950", SECTION_Y, GUTTER)}
    >
      <div className="relative flex flex-col items-center gap-8 px-[clamp(16px,3vw,40px)] py-[clamp(32px,5vw,64px)] text-center">
        <CornerBrackets />
        <h2 className="m-0 text-[clamp(2.6rem,6.4vw,7rem)] leading-[.92] font-semibold tracking-[-0.06em]">
          <MaskLine attr="data-cline" tight>
            La plataforma gana
          </MaskLine>
          <MaskLine attr="data-cline" tight>
            cuando <Em tracking={false}>vos</Em> ganás.
          </MaskLine>
        </h2>
        <p className="m-0 max-w-[36ch] text-xl leading-[1.45] font-medium">
          Movo cobra comisión solo en envíos completados.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/#lista"
            className="inline-flex h-[52px] items-center gap-2.5 rounded-lg bg-ink-950 px-[22px] text-base font-medium text-white hover:bg-ink-800"
          >
            Sumarme a la lista de espera
            <ArrowIcon stroke="#C6F24A" />
          </Link>
          <Link
            href="/el-proyecto"
            className="inline-flex h-[52px] items-center rounded-lg border-[1.5px] border-ink-950 px-[22px] text-base font-medium hover:bg-ink-950/8"
          >
            Conocé el proyecto
          </Link>
        </div>
      </div>
    </section>
  )
}
