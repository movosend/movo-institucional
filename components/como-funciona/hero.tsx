"use client"

import { useRef } from "react"

import { cn } from "@/lib/utils"
import { gsap, useGsap } from "@/lib/use-gsap"
import {
  Em,
  GUTTER,
  LimeGrid,
  MaskLine,
  PackageIcon,
  TickerBar,
} from "@/components/site/primitives"

const PERSONAS = [
  {
    role: "Emisor",
    name: "Alena",
    desc: "Necesita mandar las llaves de su depto en Córdoba a su mamá en Villa María. El correo le cobra más que el duplicado.",
    pill: "Envía el paquete",
  },
  {
    role: "Transportista",
    name: "Pedro",
    desc: "Viaja todos los miércoles de Córdoba a Villa María por trabajo. Tiene lugar en la Kangoo y suma plata en el camino.",
    pill: "Lleva el paquete",
  },
  {
    role: "Receptor",
    name: "Alina",
    desc: "La mamá de Alena. Recibe las llaves ese mismo día, confirma con un QR y listo.",
    pill: "Recibe el paquete",
  },
]

const STOPS = ["16.666%", "50%", "83.333%"]

export function ComoHero() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, (reduce) => {
    const root = ref.current!
    const pkg = root.querySelector<HTMLElement>("[data-hpkg]")!
    const fill = root.querySelector<HTMLElement>("[data-hfill]")!
    const ico = pkg.querySelector("svg")!
    const cards = Array.from(
      root.querySelectorAll<HTMLElement>("[data-persona]")
    )
    const hl = (i: number) =>
      cards.forEach((c, j) =>
        gsap.to(c, {
          backgroundColor: j === i ? "rgba(10,10,11,1)" : "rgba(10,10,11,0)",
          color: j === i ? "#FFFFFF" : "#0A0A0B",
          duration: 0.35,
          ease: "power2.out",
        })
      )

    if (reduce) return void hl(0)

    gsap.from("[data-line]", {
      yPercent: 105,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.1,
      delay: 0.1,
    })
    gsap.from(cards, {
      y: 24,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.1,
      delay: 0.5,
    })

    gsap
      .timeline({ repeat: -1, delay: 1.2 })
      .call(() => hl(0))
      .to({}, { duration: 1.6 })
      .to(pkg, { left: "50%", rotate: 90, duration: 1.3, ease: "power2.inOut" })
      .to(ico, { rotate: -90, duration: 1.3, ease: "power2.inOut" }, "<")
      .to(fill, { width: "33.333%", duration: 1.3, ease: "power2.inOut" }, "<")
      .call(() => hl(1))
      .to({}, { duration: 1.6 })
      .to(pkg, {
        left: "83.333%",
        rotate: 180,
        duration: 1.3,
        ease: "power2.inOut",
      })
      .to(ico, { rotate: -180, duration: 1.3, ease: "power2.inOut" }, "<")
      .to(fill, { width: "66.666%", duration: 1.3, ease: "power2.inOut" }, "<")
      .call(() => hl(2))
      .to(pkg, { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1 })
      .to({}, { duration: 1.8 })
      .to([pkg, fill], { opacity: 0, duration: 0.3 })
      .set(pkg, { left: "16.666%", rotate: 0 })
      .set(ico, { rotate: 0 })
      .set(fill, { width: 0 })
      .to([pkg, fill], { opacity: 1, duration: 0.3 })
  })

  return (
    <section
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-lime-500 pt-[104px] pb-[clamp(48px,8vh,88px)] text-ink-950",
        GUTTER
      )}
    >
      <LimeGrid at="50% 30%" />
      <TickerBar items={["Proceso punta a punta", "7 etapas", "3 personas"]} />
      <h1 className="relative mt-10 mb-7 text-[clamp(2.2rem,7.6vw,8.5rem)] leading-[.9] font-semibold tracking-[-0.06em] [font-variation-settings:'opsz'_32]">
        <MaskLine>Cómo Movo mueve</MaskLine>
        <MaskLine>
          un paquete de <Em>punto A</Em>
        </MaskLine>
        <MaskLine>
          a <Em>punto B.</Em>
        </MaskLine>
      </h1>
      <p className="relative mt-0 mb-14 max-w-[560px] text-xl leading-[1.45] font-medium text-pretty">
        Desde que el emisor abre la app hasta que el receptor firma la entrega.
        Un flujo diseñado para que confíes en un desconocido como si fuera
        alguien conocido.
      </p>

      <div className="relative">
        <div className="relative mb-4 h-12 max-md:hidden" aria-hidden>
          <div className="absolute top-1/2 right-[16.666%] left-[16.666%] border-t-2 border-dashed border-ink-950/35" />
          <div
            data-hfill=""
            className="absolute top-[calc(50%-1.5px)] left-[16.666%] h-[3px] w-0 bg-ink-950"
          />
          {STOPS.map((left) => (
            <span
              key={left}
              className="absolute top-1/2 -mt-[7px] -ml-[7px] box-border size-3.5 rounded-full border-2 border-ink-950 bg-lime-500"
              style={{ left }}
            />
          ))}
          <div
            data-hpkg=""
            className="absolute top-0 left-[16.666%] -ml-6 flex size-12 items-center justify-center rounded-lg bg-ink-950 text-lime-500"
          >
            <PackageIcon className="size-[22px]" />
          </div>
        </div>
        <div className="grid grid-cols-1 overflow-hidden rounded-md border-[1.5px] border-ink-950 md:grid-cols-3">
          {PERSONAS.map((p, i) => (
            <div
              key={p.role}
              data-persona=""
              className={cn(
                "flex flex-col gap-3 p-[clamp(18px,2.4vw,32px)] text-ink-950",
                i > 0 &&
                  "border-t-[1.5px] border-ink-950 md:border-t-0 md:border-l-[1.5px]"
              )}
            >
              <span className="font-mono text-xs tracking-[.08em] uppercase opacity-70">
                {String(i + 1).padStart(2, "0")} · {p.role}
              </span>
              <span className="text-[clamp(28px,3.4vw,48px)] leading-none font-semibold tracking-[-0.05em]">
                {p.name}
              </span>
              <span className="grow text-base leading-normal text-pretty opacity-85">
                {p.desc}
              </span>
              <span className="inline-flex items-center gap-2 self-start rounded-full border border-current px-3 py-1.5 text-[13px] font-medium">
                {p.pill}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
