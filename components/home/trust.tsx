"use client"

import { useRef } from "react"

import { cn } from "@/lib/utils"
import { gsap, useGsap } from "@/lib/use-gsap"
import {
  GUTTER,
  IndexChip,
  LimeGrid,
  SECTION_Y,
} from "@/components/site/primitives"

/** Captura de la app que se muestra dentro del iPhone. */
const SCREEN_SRC = "/hero-updated.png"

// Hueco transparente de public/iphone-frame.png (1666×3368): x 106–1567, y 83–3283.
const FRAME_W = 1666
const FRAME_H = 3368
const SCREEN = {
  left: `${(106 / FRAME_W) * 100}%`,
  right: `${100 - (1567 / FRAME_W) * 100}%`,
  top: `${(83 / FRAME_H) * 100}%`,
  bottom: `${100 - (3283 / FRAME_H) * 100}%`,
}

const TECHS = [
  {
    idx: "01",
    title: "Sabés quién es",
    tech: "KYC biométrico",
    desc: "Cada persona de la red valida su identidad con DNI y una selfie en vivo antes de llevar o enviar nada.",
  },
  {
    idx: "02",
    title: "Entrega con doble firma",
    tech: "QR criptográfico",
    desc: "Al retirar y al entregar, ambas partes escanean un código firmado que no se puede falsificar. Queda registro de todo.",
  },
  {
    idx: "03",
    title: "Lo ves moverse",
    tech: "GPS en vivo",
    desc: "Seguís el paquete en el mapa durante todo el camino, con tiempo estimado de llegada.",
  },
  {
    idx: "04",
    title: "Tu plata, protegida",
    tech: "Pago retenido",
    desc: "El pago queda en espera hasta que el paquete llega. Recién ahí se libera, solo.",
  },
]

export function Trust() {
  const ref = useRef<HTMLElement>(null)

  // El iPhone sube un poco mientras la sección entra en pantalla.
  useGsap(ref, (reduce) => {
    if (reduce) return
    gsap.fromTo(
      "[data-phone]",
      { yPercent: 12 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "center center",
          scrub: 0.4,
        },
      }
    )
    gsap.from("[data-floater]", {
      opacity: 0,
      y: 16,
      scale: 0.96,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.15,
      scrollTrigger: { trigger: "[data-phone]", start: "top 70%" },
    })
  })

  return (
    <section ref={ref} className={cn("relative bg-ink-950", SECTION_Y, GUTTER)}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,5vw,72px)]">
        <div className="flex flex-col gap-7">
          <h2 className="m-0 text-[clamp(2.6rem,6vw,6rem)] leading-[.92] font-semibold tracking-[-0.055em] text-balance">
            La tecnología está para que confíes.
          </h2>
          <div className="flex flex-col border-t border-white/14">
            {TECHS.map((t) => (
              <div
                key={t.idx}
                className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 border-b border-white/14 py-5"
              >
                <IndexChip>{t.idx}</IndexChip>
                <div className="flex flex-col gap-1.5">
                  <span className="flex flex-wrap items-baseline gap-2.5">
                    <span className="text-[22px] font-semibold tracking-[-0.03em]">
                      {t.title}
                    </span>
                    <span className="font-mono text-xs tracking-[.06em] text-ink-400 uppercase">
                      {t.tech}
                    </span>
                  </span>
                  <span className="max-w-[52ch] text-base leading-normal text-pretty text-ink-300">
                    {t.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-[10px] bg-lime-500">
          <LimeGrid />
          <div
            data-phone=""
            className="absolute top-[7%] left-1/2 h-[86%] -translate-x-1/2"
            style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }}
          >
            {/* El flotado va en un div aparte: GSAP ya anima el transform de data-phone. */}
            <div className="animate-float-phone relative size-full">
              {/* Captura, recortada al hueco de pantalla del marco */}
              <div
                className="absolute overflow-hidden bg-black"
                style={{ ...SCREEN, borderRadius: "9% / 4.5%" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SCREEN_SRC}
                  alt="Detalle de un envío en la app de Movo: ruta en el mapa, retiro, costo y receptor verificado"
                  draggable={false}
                  className="absolute inset-0 size-full object-cover object-top select-none"
                />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/iphone-frame.png"
                alt=""
                aria-hidden
                draggable={false}
                className="pointer-events-none absolute inset-0 size-full drop-shadow-[0_30px_40px_rgba(10,10,11,0.35)] select-none"
              />
            </div>
            <Floater
              className="top-[10%] -left-[60%] sm:top-[14%] sm:-left-[42%]"
              float="animate-float-a"
              title="En camino · 9 min"
              detail="Córdoba → Villa Carlos Paz"
              icon={<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />}
            />
            <Floater
              className="-right-[60%] bottom-[12%] sm:-right-[40%] sm:bottom-[20%]"
              float="animate-float-b"
              title="Marcos R. · ★ 4.8"
              detail="Renault Kangoo · Verificado"
              icon={
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/** Tarjeta flotante sobre el mockup (estado del envío, transportista). */
function Floater({
  className,
  float,
  title,
  detail,
  icon,
}: {
  className: string
  float: string
  title: string
  detail: string
  icon: React.ReactNode
}) {
  // El wrapper lo anima GSAP al entrar; el interior flota con CSS.
  return (
    <div data-floater="" className={cn("absolute z-10", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-white/10 bg-ink-900/92 px-2 py-1.5 whitespace-nowrap shadow-[0_24px_60px_rgba(10,10,11,0.28),0_6px_16px_rgba(10,10,11,0.16)] backdrop-blur-md sm:gap-2.5 sm:rounded-[10px] sm:px-3.5 sm:py-2.5",
          float
        )}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-lime-500/12 sm:size-8">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C6F24A"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3 sm:size-4"
            aria-hidden
          >
            {icon}
          </svg>
        </span>
        <span className="flex flex-col gap-px">
          <span className="text-[11px] font-semibold text-white sm:text-sm">
            {title}
          </span>
          <span className="text-[11px] text-ink-400 max-sm:hidden">
            {detail}
          </span>
        </span>
      </div>
    </div>
  )
}
