"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { CornerBrackets, GUTTER, SECTION_Y } from "@/components/site/primitives"

const FAQ = [
  {
    q: "¿Qué pasa si el paquete se pierde o llega dañado?",
    a: "Cada envío está cubierto desde el retiro hasta la entrega. Si algo sale mal, abrís un reclamo desde la app y el pago queda retenido hasta resolverlo.",
  },
  {
    q: "¿Cómo sé que puedo confiar en quien lo lleva?",
    a: "Todas las personas de la red pasan verificación biométrica de identidad. Además ves su reputación, sus viajes anteriores y seguís la ruta en vivo.",
  },
  {
    q: "¿Cuánto cuesta enviar algo?",
    a: "La tarifa se calcula según distancia y tamaño, y la ves antes de confirmar. Sin cargos escondidos.",
  },
  {
    q: "¿Cuándo le llega el pago a quien lleva el paquete?",
    a: "Apenas se confirma la entrega con el segundo código QR. El pago se libera solo, sin trámites.",
  },
  {
    q: "¿Qué no puedo enviar?",
    a: "Nada ilegal, peligroso o perecedero sin embalaje adecuado. La lista completa está en los términos y condiciones.",
  },
  {
    q: "¿En qué ciudades funciona?",
    a: "Movo abre ciudad por ciudad. Sumate a la lista de espera y te avisamos cuando llegue a la tuya.",
  },
]

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
        {FAQ.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className="border-b-[1.5px] border-ink-950">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="grid min-h-[76px] w-full cursor-pointer grid-cols-[48px_1fr_36px] items-center gap-3 border-0 bg-transparent py-3 text-left text-ink-950"
              >
                <span className="font-mono text-[13px] font-medium">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[clamp(18px,1.8vw,24px)] font-semibold tracking-[-0.025em]">
                  {f.q}
                </span>
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded",
                    isOpen
                      ? "bg-ink-950 text-lime-500"
                      : "bg-transparent text-ink-950"
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              {isOpen && (
                <p className="m-0 max-w-[60ch] pb-7 text-lg leading-normal text-pretty sm:pr-12 sm:pl-[60px]">
                  {f.a}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
