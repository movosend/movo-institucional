"use client"

import { useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { gsap, useGsap } from "@/lib/use-gsap"
import { GUTTER, IndexChip, SECTION_Y } from "@/components/site/primitives"

/** Foto de la sección. Reemplazar el archivo en /public para cambiarla. */
const PERSONA_SRC = "/persona.jpg"

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

const MASK =
  "radial-gradient(circle,#000 var(--r),transparent calc(var(--r) + 0.6px))"

export function Trust() {
  const ref = useRef<HTMLElement>(null)
  const [hasPhoto, setHasPhoto] = useState(true)

  useGsap(ref, (reduce) => {
    const mask = "[data-htmask]"
    if (reduce) return void gsap.set(mask, { "--r": "9px" })
    gsap.fromTo(
      mask,
      { "--r": "0px" },
      {
        "--r": "9px",
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          end: "center 45%",
          scrub: 0.4,
        },
      }
    )
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
          <div
            data-htmask=""
            className="absolute inset-0"
            style={
              {
                "--r": "0px",
                WebkitMaskImage: MASK,
                maskImage: MASK,
                WebkitMaskSize: "12px 12px",
                maskSize: "12px 12px",
              } as React.CSSProperties
            }
          >
            {hasPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                // Si falló antes de hidratar, onError no llega: se revisa al montar.
                ref={(img) => {
                  if (img?.complete && !img.naturalWidth) setHasPhoto(false)
                }}
                src={PERSONA_SRC}
                alt="Alguien de la red en su camino diario"
                onError={() => setHasPhoto(false)}
                className="size-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
