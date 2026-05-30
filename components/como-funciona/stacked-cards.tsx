"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const STACK_OFFSETS = [
  { rotate: -0.7, x: -5 },
  { rotate: 0.9, x: 6 },
  { rotate: -1.2, x: -7 },
  { rotate: 0.6, x: 4 },
  { rotate: -0.8, x: -6 },
  { rotate: 1.1, x: 5 },
]

const STAGE_IDS = [
  "identidad",
  "solicitud",
  "transportista",
  "ruta",
  "retiro",
  "tracking",
  "entrega",
]

const STAGES = [
  {
    num: "01",
    domain: "Identidad y Confianza",
    domainColor: "#C6F24A",
    title: "Identidad verificada antes de tocar un paquete",
    desc: "Nadie puede enviar ni transportar en Movo sin haber demostrado quién es. KYC con verificación biométrica real: liveness detection, DNI frente y dorso, y generación de un identificador descentralizado propio. Una identidad que no se puede falsificar con una cuenta nueva.",
    technical: [
      "KYC delegado a Didit.me (POST /sessions). Movo no almacena imágenes de documentos ni biometría.",
      "Liveness detection: verifica presencia física, previene bypass con fotos o videos.",
      "Post-verificación se genera un perfil de identidad confirmada vinculado al usuario en el backend de Movo.",
      "Ese perfil es el ancla de toda transacción: firma, custodia y reputación quedan asociadas a una persona real.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    num: "02",
    domain: "Operaciones Logísticas",
    domainColor: "#2B6BFF",
    title: "Creás el envío y el receptor lo acepta",
    desc: "El emisor define el paquete: tipo, dimensiones, peso estimado, dirección de retiro y de entrega. El sistema calcula un precio sugerido al instante. Pero antes de publicarse al mercado, el receptor debe aceptar explícitamente. Nadie recibe un paquete que no pidió.",
    technical: [
      "Motor de precios dinámico: Tarifa = (Distancia × TarifaKm) + (Peso × TarifaKg) + BonusUrgencia + FactorDemanda.",
      "Distancia calculada con Google Maps Distance Matrix API.",
      "5 categorías de paquete: Carta/documento, Encomienda estándar, Ítem cotidiano, Objeto frágil, Ítem urgente.",
      "Notificación push al receptor con botón Aceptar / Rechazar. Sin aceptación, el envío no llega al tablero de transportistas.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    num: "03",
    domain: "Operaciones Logísticas",
    domainColor: "#2B6BFF",
    title: "El mercado conecta con el transportista ideal",
    desc: "Una vez aceptado por el receptor, el envío se publica en el tablero de oportunidades. Los transportistas verificados pueden aceptar el precio sugerido o presentar contraofertas. El emisor ve el ranking de ofertas combinado con el score de reputación de cada transportista. Al confirmar, los fondos quedan retenidos automáticamente.",
    technical: [
      "Sistema de subastas: el transportista puede aceptar tarifa sugerida o enviar contraoferta con precio y justificación.",
      "Score de reputación visible por calificación ponderada de transacciones anteriores (emisores y receptores).",
      "Al confirmar transportista el emisor da su consentimiento de pago, pero el hold no se activa hasta el retiro físico del paquete.",
      "Validación adicional para transportistas: licencia de conducir verificada + tarjeta precargada para comisiones en efectivo.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    num: "04",
    domain: "Operaciones Logísticas",
    domainColor: "#2B6BFF",
    title: "La ruta se optimiza para el transportista",
    desc: "El transportista declara su viaje: origen, destino, fecha y hora de partida. El motor logístico detecta todos los envíos compatibles con esa ruta y sugiere paradas intermedias que maximizan los ingresos con el mínimo desvío. El transportista ve la ruta optimizada en el mapa antes de confirmar.",
    technical: [
      "Variante del VRPTW (Vehicle Routing Problem with Time Windows) con un único vehículo.",
      "Input: ruta declarada R = (origen, destino, horario), conjunto de envíos S con coordenadas y ventanas horarias.",
      "Output: secuencia de paradas P que minimiza distancia total respetando ventanas comprometidas.",
      "MVP con algoritmo greedy. Ejemplo: Córdoba → Luque con desvío ≤ 18km incorpora 2 envíos adicionales en ruta.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    num: "05",
    domain: "Identidad y Confianza",
    domainColor: "#C6F24A",
    title: "Retiro verificado: el primer handshake criptográfico",
    desc: "El emisor entrega el paquete al transportista. Este momento queda registrado de forma criptográficamente inmutable: ambas partes deben estar físicamente presentes en el mismo lugar. Un QR de vida corta, una firma digital y validación GPS hacen que sea imposible falsificar el retiro de forma remota.",
    technical: [
      "El emisor genera un nonce único (256 bits) firmado con su clave privada: firma = sign(privateKey, nonce).",
      "El nonce + firma se codifican en un QR con TTL de 60 segundos.",
      "El transportista escanea el QR. El backend verifica: (a) firma válida con clave pública del emisor, (b) nonce no reutilizado, (c) TTL no expirado, (d) distancia GPS entre ambos ≤ 100m.",
      "Si todo pasa: se activa el hold de fondos (Auth & Capture) sobre la tarjeta del emisor — minimizando el tiempo de hold dado que Mercado Pago los cancela a los 7 días.",
      "Se registra evento de transferencia con timestamp, coordenadas, hash del nonce y referencias a ambos perfiles verificados.",
      "Post-MVP: NFC como alternativa al QR, mismo protocolo criptográfico subyacente.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    num: "06",
    domain: "Operaciones Logísticas",
    domainColor: "#2B6BFF",
    title: "En camino: el paquete tiene ojos",
    desc: "Durante todo el trayecto, el emisor y el receptor pueden ver la ubicación del transportista en tiempo real sobre el mapa. Las horas estimadas de entrega se actualizan dinámicamente. Si surge alguna pregunta, hay un canal de chat en vivo entre las tres partes.",
    technical: [
      "Posición del transportista transmitida por WebSockets o Server-Sent Events, actualización cada 10–30 segundos.",
      "Historial de posiciones almacenado para auditoría en caso de disputa.",
      "ETA recalculada dinámicamente en función del tráfico y posición real.",
      "Chat en tiempo real (WebSockets) entre emisor, transportista y receptor durante el envío activo.",
      "Notificaciones push en eventos clave: paquete retirado, en camino, a 15 minutos del destino, entregado.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    num: "07",
    domain: "Pagos y Economía",
    domainColor: "#F5B93A",
    title: "Entrega verificada, pago automático liberado",
    desc: "Al llegar, el segundo handshake criptográfico confirma la entrega con el receptor físicamente presente. En ese instante, sin intervención manual, el hold se captura y el pago se distribuye: el transportista recibe su parte, Movo cobra su comisión. El dinero del emisor nunca estuvo en riesgo.",
    technical: [
      "Segundo Cryptographic Handshake: mismo protocolo QR/NFC, ahora entre transportista (cedente) y receptor.",
      "El transportista fotografía el paquete al entregar. El receptor acepta el estado al escanear el QR.",
      "Al confirmar entrega: el backend invoca capture:true sobre la autorización preexistente de Mercado Pago.",
      "Split Payment automático: Movo procesa solo su comisión. El saldo va directo a la cuenta Mercado Pago del transportista.",
      "En pagos en efectivo: comisión de Movo se debita automáticamente de la tarjeta precargada del transportista.",
      "Ventaja fiscal: Movo nunca es perceptor del total, evita retención de IIBB provincial sobre montos ajenos.",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
]

export function StackedCards() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return

        gsap.fromTo(
          card,
          { y: 70, scale: 0.97 },
          {
            y: 0,
            scale: 1,
            duration: 0.55,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 86%",
              toggleActions: "play none none reverse",
            },
          }
        )

        if (i < STAGES.length - 1) {
          const offset = STACK_OFFSETS[i % STACK_OFFSETS.length]
          gsap.to(card, {
            scale: 0.96,
            rotation: offset.rotate,
            x: offset.x,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: cardsRef.current[i + 1],
              start: "top 72%",
              end: "top 28%",
              scrub: 0.6,
            },
          })
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="px-5 pt-10 pb-20 md:px-10 md:pt-[60px] md:pb-[120px]"
      style={{ position: "relative" }}
    >
      {/* Section header */}
      <div className="max-w-[1200px] mx-auto mb-10 md:mb-16">
        <div
          className="font-mono text-[11px] font-semibold tracking-[0.1em] uppercase mb-4"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          7 etapas — del envío a la entrega
        </div>
        <h2
          className="text-white"
          style={{
            fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            maxWidth: 560,
          }}
        >
          Cada paso tiene un mecanismo.
          <br />
          <span style={{ color: "rgba(255,255,255,0.4)" }}>
            Nada queda librado a la buena fe.
          </span>
        </h2>
      </div>

      {/* Cards stack */}
      <div
        className="max-w-[1200px] mx-auto"
        style={{ display: "flex", flexDirection: "column", gap: 24 }}
      >
        {STAGES.map((stage, i) => (
          <div
            key={stage.num}
            id={STAGE_IDS[i]}
            ref={(el) => {
              if (el) cardsRef.current[i] = el
            }}
            style={{
              position: "sticky",
              top: 72 + i * 14,
              zIndex: i + 1,
              borderRadius: 16,
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              transformOrigin: "top center",
            }}
          >
            {/* Card inner — stacks on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-[360px]">
              {/* Left: business content */}
              <div
                className="relative overflow-hidden flex flex-col justify-between border-b border-white/[0.06] md:border-b-0 md:border-r md:border-white/[0.06]"
                style={{
                  padding: "32px 28px",
                }}
              >
                {/* Watermark icon */}
                <div
                  className="absolute right-6 bottom-6 pointer-events-none hidden md:block"
                  aria-hidden
                  style={{
                    width: 140,
                    height: 140,
                    color: "rgba(255,255,255,0.03)",
                  }}
                >
                  {stage.icon}
                </div>

                <div>
                  {/* Step number + domain badge */}
                  <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <span
                      className="font-mono text-[13px] font-semibold"
                      style={{ color: stage.domainColor }}
                    >
                      {stage.num}
                    </span>
                    <span
                      className="text-[11px] font-semibold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full"
                      style={{
                        background: `${stage.domainColor}14`,
                        border: `1px solid ${stage.domainColor}28`,
                        color: stage.domainColor,
                      }}
                    >
                      {stage.domain}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-white mb-4"
                    style={{
                      fontSize: "clamp(1.15rem, 2vw, 1.75rem)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.2,
                    }}
                  >
                    {stage.title}
                  </h3>

                  {/* Business description */}
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    {stage.desc}
                  </p>
                </div>
              </div>

              {/* Right: technical details */}
              <div
                className="flex flex-col justify-center"
                style={{
                  padding: "32px 28px",
                  background: "rgba(255,255,255,0.018)",
                  borderTop: "none",
                }}
              >
                <div
                  className="font-mono text-[10px] font-semibold tracking-[0.1em] uppercase mb-5"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Detalle técnico
                </div>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {stage.technical.map((item, j) => (
                    <li
                      key={j}
                      className="flex gap-3"
                      style={{
                        fontSize: 13,
                        lineHeight: 1.65,
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      <span
                        style={{
                          color: stage.domainColor,
                          opacity: 0.7,
                          flexShrink: 0,
                          marginTop: 2,
                          fontSize: 11,
                        }}
                      >
                        ◆
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom accent line */}
            <div
              style={{
                height: 2,
                background: `linear-gradient(90deg, ${stage.domainColor}40 0%, ${stage.domainColor}00 60%)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Closing note */}
      <div
        className="max-w-[1200px] mx-auto mt-16 md:mt-20 text-center px-0"
      >
        <div
          className="inline-flex items-center gap-3 px-5 py-4 rounded-2xl text-left"
          style={{
            background: "rgba(198,242,74,0.06)",
            border: "1px solid rgba(198,242,74,0.15)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#C6F24A",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "-0.01em",
            }}
          >
            La plataforma gana cuando el usuario gana.{" "}
            <span style={{ color: "rgba(255,255,255,0.3)" }}>
              Comisión solo en envíos exitosamente completados.
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}
