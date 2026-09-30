"use client"

import Link from "next/link"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { FEATURED_FAQ } from "@/content/faq"
import { FaqItem } from "@/components/faq/faq-item"
import {
  ArrowIcon,
  CornerBrackets,
  GUTTER,
  SECTION_Y,
} from "@/components/site/primitives"

export function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section
      id="faq"
      className={cn("relative bg-lime-500 text-ink-950", SECTION_Y, GUTTER)}
    >
      <div className="relative mb-12 py-8 text-center">
        <CornerBrackets />
        <h2 className="m-0 text-[clamp(3rem,8vw,8rem)] leading-[.9] font-semibold tracking-[-0.06em]">
          Preguntas frecuentes
        </h2>
      </div>
      <div className="mx-auto flex max-w-[980px] flex-col border-t-[1.5px] border-ink-950">
        {FEATURED_FAQ.map((f, i) => (
          <FaqItem
            key={f.id}
            index={i}
            question={f.q}
            open={open === i}
            onToggle={() => setOpen(open === i ? -1 : i)}
          >
            <p className="m-0 max-w-[60ch] text-lg leading-normal text-pretty">
              {f.a}
            </p>
          </FaqItem>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
        <Link
          href="/faq"
          className="group inline-flex h-[52px] items-center gap-2.5 rounded-lg bg-ink-950 px-[22px] text-base font-medium text-white hover:bg-ink-800"
        >
          Ver todas las preguntas
          <ArrowIcon
            stroke="#C6F24A"
            className="transition-transform duration-[120ms] group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
        <Link
          href="/faq#glosario"
          className="text-base font-medium underline decoration-[1.5px] underline-offset-4 hover:opacity-75"
        >
          Ir al glosario
        </Link>
      </div>
    </section>
  )
}
