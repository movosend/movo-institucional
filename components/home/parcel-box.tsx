"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"
import gsap from "gsap"

const CONFETTI_COUNT = 60
const CONFETTI_COLORS = ["#C6F24A", "#FFFFFF", "#D5D5DB", "#C79A62", "#9FC72E"]

// Bounds del panel frontal dentro de la foto (medidos sobre la imagen real:
// public/cardboard-box.webp, 1205×627, recortada ajustada al cuerpo de la
// caja — el cuerpo ocupa ~x 2.8%–97.2%, y 2.9%–97.1% del frame). Se usan
// como inset (top/left/right/bottom) para que la etiqueta quede *adentro*
// del panel con margen de cartón visible en los cuatro lados.
//
// OJO: esto tiene que ser `inset`/`top`/`bottom`, nunca `padding-top` o
// `padding-bottom` en porcentaje — en CSS, el padding vertical en % se
// calcula siempre contra el ANCHO del contenedor, nunca contra su alto.
const PANEL_INSET = { left: 10, right: 10, top: 21, bottom: 8 }

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

/**
 * Caja de cartón (foto real) con la etiqueta de despacho apoyada en el
 * panel frontal. Al confirmar la suscripción, revienta confeti detrás de
 * la caja: se lo ve asomar por arriba y a los costados.
 */
export function ParcelBox({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const confettiRef = useRef<HTMLDivElement>(null)
  const firedRef = useRef(false)

  useEffect(() => {
    if (!open || firedRef.current) return
    firedRef.current = true

    const confettiLayer = confettiRef.current
    if (!confettiLayer || prefersReducedMotion()) return

    const timeline = gsap.timeline()

    // La caja acusa el golpe, como si algo pegara contra las paredes por dentro.
    timeline.to(boxRef.current, {
      keyframes: [
        { y: -5, rotate: -0.6, duration: 0.09, ease: "power2.out" },
        { y: 1, rotate: 0.5, duration: 0.1, ease: "power2.inOut" },
        { y: 0, rotate: 0, duration: 0.28, ease: "bounce.out" },
      ],
    })

    const pieces: HTMLSpanElement[] = []
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const piece = document.createElement("span")
      const isSquare = Math.random() > 0.5
      piece.style.cssText = [
        "position:absolute",
        "left:50%",
        "top:0",
        `width:${gsap.utils.random(5, 10, 1)}px`,
        `height:${isSquare ? gsap.utils.random(5, 10, 1) : gsap.utils.random(8, 15, 1)}px`,
        "border-radius:1px",
        `background:${gsap.utils.random(CONFETTI_COLORS)}`,
        "will-change:transform,opacity",
      ].join(";")
      confettiLayer.appendChild(piece)
      pieces.push(piece)
    }

    timeline.add(() => {
      pieces.forEach((piece, i) => {
        // Reparto en abanico ancho hacia arriba, como si saliera de adentro.
        const spread = (i / CONFETTI_COUNT - 0.5) * 380
        const angle = gsap.utils.random(-Math.PI * 0.72, -Math.PI * 0.28)
        const power = gsap.utils.random(150, 340)

        gsap
          .timeline()
          .fromTo(
            piece,
            { x: spread, y: -6, opacity: 1 },
            {
              x: `+=${Math.cos(angle) * power * 0.45}`,
              y: `+=${Math.sin(angle) * power}`,
              duration: gsap.utils.random(0.45, 0.75),
              ease: "power2.out",
            }
          )
          .to(
            piece,
            {
              y: `+=${gsap.utils.random(260, 440)}`,
              x: `+=${gsap.utils.random(-50, 50)}`,
              opacity: 0,
              duration: gsap.utils.random(0.9, 1.5),
              ease: "power1.in",
            },
            ">-0.1"
          )

        gsap.to(piece, {
          rotate: gsap.utils.random(-540, 540),
          duration: gsap.utils.random(1.1, 1.9),
          ease: "none",
        })
      })
    }, "-=0.2")

    return () => {
      timeline.kill()
      pieces.forEach((piece) => {
        gsap.killTweensOf(piece)
        piece.remove()
      })
    }
  }, [open])

  return (
    <div className="relative mx-auto w-full">
      {/* Confetti: detrás de la caja, asoma por arriba y los costados */}
      <div
        ref={confettiRef}
        className="pointer-events-none absolute inset-x-0 top-[10%] z-0 h-0"
        aria-hidden
      />

      <div
        ref={boxRef}
        className="relative z-10 mx-auto w-full"
        style={{ aspectRatio: "1205 / 627" }}
      >
        <Image
          src="/box.png"
          alt=""
          aria-hidden
          width={600}
          height={313}
          className="pointer-events-none mx-auto object-contain select-none"
          style={{ filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.6))" }}
          priority={false}
        />

        {/* Etiqueta, apoyada sobre el panel frontal de la caja — con margen
            de cartón visible alrededor, no pegada a los bordes del panel.
            En mobile ancla arriba (no centrada) para que si el contenido no
            entra en el panel, se extienda hacia abajo por fuera de la caja
            en vez de desbordarse por los dos lados; en desktop sí entra
            completo, así que se centra como antes. */}
        <div
          className="absolute flex items-start justify-center sm:items-center"
          style={{
            left: `${PANEL_INSET.left}%`,
            right: `${PANEL_INSET.right}%`,
            top: `${PANEL_INSET.top}%`,
            bottom: `${PANEL_INSET.bottom}%`,
          }}
        >
          <div
            style={{
              width: "min(420px, 100%)",
              transform: "rotate(-0.6deg)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
