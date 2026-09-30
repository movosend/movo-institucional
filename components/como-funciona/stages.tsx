"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { gsap, pageZoom, useGsap } from "@/lib/use-gsap"
import { Eyebrow, GUTTER } from "@/components/site/primitives"

const ICONS = [
  ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M9 12l2 2 4-4"],
  [
    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z",
    "M15 10a3 3 0 1 1-6 0a3 3 0 1 1 6 0",
  ],
  [
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    "M13 7a4 4 0 1 1-8 0a4 4 0 1 1 8 0",
    "M23 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  ["M22 12h-4l-3 9L9 3l-3 9H2"],
  [
    "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z",
    "M7 11V7a5 5 0 0 1 10 0v4",
  ],
  [
    "M22 12a10 10 0 1 1-20 0a10 10 0 1 1 20 0",
    "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
    "M2 12h20",
  ],
  ["M20 6 9 17l-5-5"],
]

const DOM = {
  id: ["Identidad y confianza", "#C6F24A"],
  ops: ["Operaciones logísticas", "#2B6BFF"],
  pay: ["Pagos y economía", "#F5B93A"],
} as const

const STAGES: {
  id: string
  d: keyof typeof DOM
  title: string
  desc: string
  tech: string[]
}[] = [
  {
    id: "identidad",
    d: "id",
    title: "Identidad verificada antes de tocar un paquete",
    desc: "Nadie puede enviar ni transportar en Movo sin haber demostrado quién es. KYC con verificación biométrica real: liveness detection, DNI frente y dorso, y un identificador propio. Una identidad que no se puede falsificar con una cuenta nueva.",
    tech: [
      "KYC delegado a Didit.me (POST /sessions). Movo no almacena imágenes de documentos ni biometría.",
      "Liveness detection: verifica presencia física, previene bypass con fotos o videos.",
      "Post-verificación se genera un perfil de identidad confirmada vinculado al usuario en el backend de Movo.",
      "Ese perfil es el ancla de toda transacción: firma, custodia y reputación quedan asociadas a una persona real.",
    ],
  },
  {
    id: "solicitud",
    d: "ops",
    title: "Creás el envío y el receptor lo acepta",
    desc: "El emisor define el paquete: tipo, dimensiones, peso estimado, dirección de retiro y de entrega. El sistema calcula un precio sugerido al instante. Pero antes de publicarse, el receptor tiene que aceptarlo. Nadie recibe un paquete que no pidió.",
    tech: [
      "Motor de precios dinámico: Tarifa = (Distancia × TarifaKm) + (Peso × TarifaKg) + BonusUrgencia + FactorDemanda.",
      "Distancia calculada con Google Maps Distance Matrix API.",
      "5 categorías de paquete: carta/documento, encomienda estándar, ítem cotidiano, objeto frágil, ítem urgente.",
      "Notificación push al receptor con Aceptar / Rechazar. Sin aceptación, el envío no llega al tablero de transportistas.",
    ],
  },
  {
    id: "transportista",
    d: "ops",
    title: "La red conecta con el transportista ideal",
    desc: "Con el sí del receptor, el envío se publica en el tablero de oportunidades. Los transportistas verificados aceptan el precio sugerido o hacen una contraoferta. Ves el ranking de ofertas junto con la reputación de cada uno.",
    tech: [
      "Sistema de subastas: el transportista acepta la tarifa sugerida o envía contraoferta con precio y justificación.",
      "Score de reputación por calificación ponderada de transacciones anteriores (emisores y receptores).",
      "Al confirmar transportista das tu consentimiento de pago; el hold no se activa hasta el retiro físico.",
      "Validación adicional: licencia de conducir verificada + tarjeta precargada para comisiones en efectivo.",
    ],
  },
  {
    id: "ruta",
    d: "ops",
    title: "La ruta se optimiza para el transportista",
    desc: "El transportista declara su viaje: origen, destino, fecha y hora. El motor detecta los envíos compatibles y sugiere paradas intermedias que suman ingresos con el mínimo desvío. Ve la ruta en el mapa antes de confirmar.",
    tech: [
      "Variante del VRPTW (Vehicle Routing Problem with Time Windows) con un único vehículo.",
      "Input: ruta declarada R = (origen, destino, horario) y envíos S con coordenadas y ventanas horarias.",
      "Output: secuencia de paradas P que minimiza distancia total respetando ventanas comprometidas.",
      "MVP con algoritmo greedy. Ejemplo: Córdoba → Luque con desvío ≤ 18 km incorpora 2 envíos en ruta.",
    ],
  },
  {
    id: "retiro",
    d: "id",
    title: "Retiro verificado: el primer handshake",
    desc: "El emisor entrega el paquete al transportista y ese momento queda registrado de forma inmutable. Los dos tienen que estar en el mismo lugar: un QR de vida corta, una firma digital y validación GPS hacen imposible falsificarlo a distancia.",
    tech: [
      "El emisor genera un nonce único (256 bits) firmado con su clave privada.",
      "Nonce + firma se codifican en un QR con TTL de 60 segundos.",
      "El backend verifica firma, nonce no reutilizado, TTL vigente y distancia GPS entre ambos ≤ 100 m.",
      "Si todo pasa, se activa el hold de fondos (Auth & Capture) sobre la tarjeta del emisor.",
      "Se registra el evento con timestamp, coordenadas, hash del nonce y ambos perfiles verificados.",
      "Post-MVP: NFC como alternativa al QR, mismo protocolo criptográfico.",
    ],
  },
  {
    id: "tracking",
    d: "ops",
    title: "En camino: el paquete tiene ojos",
    desc: "Durante todo el trayecto, emisor y receptor ven la ubicación del transportista en el mapa. El tiempo estimado se actualiza solo. Y si surge una pregunta, hay chat en vivo entre las tres partes.",
    tech: [
      "Posición transmitida por WebSockets o Server-Sent Events, cada 10–30 segundos.",
      "Historial de posiciones almacenado para auditoría en caso de disputa.",
      "ETA recalculada según tráfico y posición real.",
      "Notificaciones push: retirado, en camino, a 15 minutos, entregado.",
    ],
  },
  {
    id: "entrega",
    d: "pay",
    title: "Entrega verificada, pago liberado solo",
    desc: "Al llegar, un segundo handshake confirma la entrega con el receptor presente. En ese instante el pago se distribuye: el transportista recibe su parte y Movo cobra su comisión. Tu plata nunca estuvo en riesgo.",
    tech: [
      "Segundo handshake: mismo protocolo QR/NFC, ahora entre transportista y receptor.",
      "El transportista fotografía el paquete; el receptor acepta el estado al escanear.",
      "Al confirmar, el backend invoca capture:true sobre la autorización de Mercado Pago.",
      "Split payment: Movo procesa solo su comisión; el resto va directo al transportista.",
      "Movo nunca es perceptor del total: evita retención de IIBB sobre montos ajenos.",
    ],
  },
]

const stickyTop = (i: number) => 80 + i * 14

export function Stages() {
  const ref = useRef<HTMLElement>(null)
  const [layoutKey, setLayoutKey] = useState(0)

  // Al cambiar el viewport se recalcula si las tarjetas entran apiladas.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(t)
      t = setTimeout(() => setLayoutKey((k) => k + 1), 250)
    }
    window.addEventListener("resize", onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  useGsap(
    ref,
    (reduce) => {
      const cards = Array.from(
        ref.current!.querySelectorAll<HTMLElement>("[data-card]")
      )
      cards.forEach((c, i) => {
        c.style.position = "sticky"
        c.style.top = stickyTop(i) + "px"
      })
      const fits = cards.every(
        (c, i) =>
          c.offsetHeight <=
          window.innerHeight / pageZoom() - (140 + i * 14) - 16
      )
      if (!fits)
        cards.forEach((c) => {
          c.style.position = "relative"
          c.style.top = "auto"
        })

      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: reduce ? 0 : 70, scale: reduce ? 1 : 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        )
        if (reduce) return
        gsap.from(card.querySelector("[data-num]"), {
          yPercent: 100,
          duration: 0.8,
          ease: "power4.out",
          scrollTrigger: {
            trigger: card,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        })
        gsap.from(card.querySelectorAll("[data-ti]"), {
          x: -14,
          opacity: 0,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: card,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
        })
        if (fits && i < cards.length - 1) {
          const r = i % 2 ? 0.8 : -0.8
          const st = {
            trigger: cards[i + 1],
            start: "top 75%",
            end: "top 30%",
            scrub: 0.6,
          }
          gsap.to(card, {
            scale: 0.95,
            rotation: r * 0.5,
            x: r * 4,
            backgroundColor: "#0E0E10",
            ease: "power2.inOut",
            scrollTrigger: st,
          })
          gsap.to(card.querySelector("[data-inner]"), {
            opacity: 0,
            ease: "power1.in",
            scrollTrigger: { ...st, end: "top 45%" },
          })
        }
      })
    },
    [layoutKey]
  )

  return (
    <section
      ref={ref}
      className="relative bg-ink-950 py-[clamp(80px,12vh,140px)]"
    >
      <div
        className={cn(
          "mb-10 flex flex-wrap items-end justify-between gap-6",
          GUTTER
        )}
      >
        <div className="flex flex-col gap-4">
          <Eyebrow>7 etapas — del envío a la entrega</Eyebrow>
          <h2 className="m-0 text-[clamp(2.4rem,5vw,5rem)] leading-[.95] font-semibold tracking-[-0.05em] text-balance">
            Cada paso tiene un mecanismo.
            <br />
            <span className="text-ink-500">
              Nada queda librado a la buena fe.
            </span>
          </h2>
        </div>
      </div>

      <div className={cn("flex flex-col gap-6", GUTTER)}>
        {STAGES.map((s, i) => {
          const [domain, color] = DOM[s.d]
          return (
            <article
              key={s.id}
              id={s.id}
              data-card=""
              className="sticky origin-top scroll-mt-20 overflow-hidden rounded-md border border-white/12 bg-ink-900 shadow-[0_-12px_40px_rgba(0,0,0,.45)]"
              style={{ top: stickyTop(i), zIndex: i + 1 }}
            >
              <div
                data-inner=""
                className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))]"
              >
                <div className="relative box-border flex min-h-[340px] flex-col gap-5 overflow-hidden p-[clamp(24px,3vw,40px)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.05"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none absolute -right-5 -bottom-5 size-[220px]"
                    aria-hidden
                  >
                    {ICONS[i].map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </svg>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="mr-4 block overflow-hidden pt-[.06em] pr-[.3em] pb-[.02em] leading-none">
                      <span
                        data-num=""
                        className="inline-block text-[clamp(4rem,7vw,7rem)] leading-none font-semibold tracking-[-0.07em] text-lime-500"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/14 px-3 py-1.5 font-mono text-[11px] tracking-[.08em] text-ink-200 uppercase">
                      <span
                        className="size-[7px] rounded-full"
                        style={{ background: color }}
                      />
                      {domain}
                    </span>
                  </div>
                  <h3 className="relative m-0 text-[clamp(26px,2.8vw,40px)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance">
                    {s.title}
                  </h3>
                  <p className="relative m-0 max-w-[56ch] text-[17px] leading-[1.6] text-pretty text-ink-300">
                    {s.desc}
                  </p>
                </div>
                <div className="flex flex-col gap-4 border-l border-white/8 bg-[#0E0E10] p-[clamp(24px,3vw,40px)]">
                  <span className="font-mono text-xs tracking-[.08em] text-ink-400 uppercase">
                    Detalle técnico
                  </span>
                  <ul className="m-0 flex list-none flex-col border-t border-white/8 p-0">
                    {s.tech.map((text, j) => (
                      <li
                        key={j}
                        data-ti=""
                        className="grid grid-cols-[32px_minmax(0,1fr)] gap-2 border-b border-white/8 py-3 text-sm leading-[1.6] text-ink-300"
                      >
                        <span className="pt-0.5 font-mono text-xs text-ink-500">
                          {String(j + 1).padStart(2, "0")}
                        </span>
                        <span className="text-pretty">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div
                className="h-0.5 opacity-50"
                style={{
                  background: `linear-gradient(90deg,${color} 0%,rgba(0,0,0,0) 60%)`,
                }}
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
