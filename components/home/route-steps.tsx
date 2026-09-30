"use client"

import Link from "next/link"
import { useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { gsap, pageZoom, ScrollTrigger, useGsap } from "@/lib/use-gsap"
import {
  ArrowIcon,
  Eyebrow,
  GUTTER,
  PackageIcon,
} from "@/components/site/primitives"

const STEPS = [
  {
    num: "01",
    status: "Confirmado",
    title: "Publicás el envío",
    desc: "Origen, destino y tamaño. Recibís ofertas antes de confirmar.",
  },
  {
    num: "02",
    status: "Retirado",
    title: "Retiro confirmado",
    desc: "Alguien que ya hace ese camino lo retira. Pago y retiro de forma segura.",
  },
  {
    num: "03",
    status: "En camino",
    title: "Seguimiento en vivo",
    desc: "Ruta, tiempo estimado y chat entre las tres partes.",
  },
  {
    num: "04",
    status: "Entregado",
    title: "Se cobra",
    desc: "Al confirmarse la entrega, los fondos se liberan al transportista.",
  },
]

export function RouteSteps() {
  const ref = useRef<HTMLElement>(null)
  const [rp, setRp] = useState(0)
  const active = Math.min(3, Math.floor(rp / 25.01))

  useGsap(ref, () => {
    let last = -1
    const track = ref.current!.querySelector<HTMLElement>("[data-track]")!
    const pkg = ref.current!.querySelector<HTMLElement>("[data-rpkg]")!
    const fill = ref.current!.querySelector<HTMLElement>("[data-rfill]")!
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        const max = Math.max(
          0,
          track.scrollWidth - window.innerWidth / pageZoom()
        )
        gsap.to(track, { x: -max * s.progress, duration: 0.3, overwrite: true })
        // La caja recorre el riel sin salirse: de borde a borde, no de centro a centro.
        const w =
          (pkg.parentElement!.offsetWidth - pkg.offsetWidth) * s.progress
        gsap.to(pkg, { x: w, duration: 0.3, overwrite: true })
        fill.style.width = w + "px"
        const next = Math.round(s.progress * 100)
        if (next !== last) setRp((last = next))
      },
    })
  })

  return (
    <section
      ref={ref}
      id="ruta"
      className="relative h-[calc(var(--screen-h)*3.4)] border-t border-white/10 bg-ink-950"
    >
      <div className="sticky top-0 box-border flex h-[var(--screen-h)] flex-col justify-center gap-8 overflow-hidden pt-14 md:gap-12">
        <div
          className={cn(
            "flex flex-wrap items-end justify-between gap-6",
            GUTTER
          )}
        >
          <div className="flex flex-col gap-4">
            <Eyebrow>
              Cómo funciona · {STEPS[active].status} · {rp}%
            </Eyebrow>
            <h2 className="m-0 text-[clamp(2.4rem,5vw,5rem)] leading-[.95] font-semibold tracking-[-0.05em]">
              De A a B,
              <br />
              en cuatro pasos.
            </h2>
          </div>
          <Link
            href="/como-funciona"
            className="inline-flex h-[52px] items-center gap-2.5 rounded-lg border border-white/18 px-5 text-base font-medium hover:bg-ink-800 max-sm:hidden"
          >
            Ver el proceso completo
            <ArrowIcon stroke="#C6F24A" />
          </Link>
        </div>

        <div className="relative mx-[clamp(16px,3vw,40px)] h-12">
          <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-ink-600" />
          <div
            data-rfill=""
            className="absolute top-[calc(50%-1.5px)] left-6 h-[3px] w-0 bg-lime-500"
          />
          <div className="absolute inset-x-4 inset-y-0 flex items-center justify-between">
            {STEPS.map((s, i) => (
              <span
                key={s.num}
                className="size-4 rounded-full border-2 bg-ink-950"
                style={{ borderColor: i <= active ? "#C6F24A" : "#3A3A40" }}
              />
            ))}
          </div>
          <div
            data-rpkg=""
            className="absolute top-0 left-0 flex size-12 items-center justify-center rounded-lg bg-lime-500 text-ink-950"
          >
            <PackageIcon className="size-[22px]" />
          </div>
        </div>

        <div data-track="" className={cn("flex w-max gap-4", GUTTER)}>
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className="box-border grid w-[min(78vw,520px)] shrink-0 grid-cols-[auto_1fr] gap-4 rounded-md border bg-ink-900 p-5 transition-[border-color] duration-200 md:gap-6 md:p-7"
              style={{
                borderColor:
                  i === active
                    ? "rgba(198,242,74,.6)"
                    : "rgba(255,255,255,.12)",
              }}
            >
              <span className="text-[clamp(3.5rem,7vw,7rem)] leading-[.8] font-semibold tracking-[-0.07em] text-lime-500">
                {s.num}
              </span>
              <div className="flex flex-col gap-2.5">
                <span className="font-mono text-xs tracking-[.08em] text-ink-400 uppercase">
                  {s.status}
                </span>
                <span className="text-[clamp(24px,2.4vw,34px)] leading-[1.05] font-semibold tracking-[-0.04em]">
                  {s.title}
                </span>
                <span className="text-base leading-normal text-pretty text-ink-300 md:text-[17px]">
                  {s.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
