"use client"

const STEPS = [
  {
    num: "01 — Enviás",
    icon: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    title: "Creás el envío",
    desc: "Indicás origen, destino y tamaño. El receptor lo acepta. La tarifa se calcula al instante, sin sorpresas.",
    connector: true,
  },
  {
    num: "02 — En camino",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    title: "Alguien que ya va lo lleva",
    desc: "Un vecino verificado que hace ese camino todos los días. GPS en vivo durante todo el trayecto.",
    connector: true,
  },
  {
    num: "03 — Llegó",
    icon: <polyline points="20 6 9 17 4 12" />,
    title: "Entrega verificada, pago automático",
    desc: "Firma digital y foto de entrega. El pago se libera solo, sin intervención manual. Todo queda registrado.",
    connector: false,
  },
]

export function HowItWorks() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        padding: "100px 40px",
        background: "#0D0D0F",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >

      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(198,242,74,0.08)",
              border: "1px solid rgba(198,242,74,0.18)",
            }}
          >
            <span className="live-dot" />
            <span
              className="text-[11px] font-semibold tracking-[0.08em] uppercase"
              style={{ color: "#C6F24A" }}
            >
              Cómo funciona
            </span>
          </div>

          <h2
            className="text-white mb-4"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1.08,
            }}
          >
            Simple{" "}
            <em className="not-italic" style={{ color: "#C6F24A" }}>
              por diseño.
            </em>
          </h2>

          <p
            className="mx-auto"
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.42)",
              maxWidth: 440,
              lineHeight: 1.65,
            }}
          >
            Sin sucursales, sin burocracia. Solo personas que se mueven y
            aprovechan el camino.
          </p>
        </div>

        {/* Steps grid */}
        <div
          className="mb-14"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative group"
              style={{
                padding: "36px 36px 40px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                transition: "background 200ms",
                borderRadius:
                  i === 0
                    ? "10px 0 0 10px"
                    : i === STEPS.length - 1
                    ? "0 10px 10px 0"
                    : undefined,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.042)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.025)")
              }
            >
              <div
                className="font-mono text-[11px] font-semibold tracking-[0.1em] mb-5"
                style={{ color: "#C6F24A" }}
              >
                {step.num}
              </div>

              <div
                className="flex items-center justify-center mb-6"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  background: "rgba(198,242,74,0.08)",
                  border: "1px solid rgba(198,242,74,0.15)",
                  color: "#C6F24A",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 20, height: 20 }}
                >
                  {step.icon}
                </svg>
              </div>

              <div
                className="text-white mb-2.5"
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                }}
              >
                {step.title}
              </div>

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                {step.desc}
              </p>

              {/* Connector arrow between steps */}
              {step.connector && (
                <div
                  className="absolute right-[-14px] top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
                  aria-hidden
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#0A0A0B",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.25)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ width: 12, height: 12 }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA link */}
        <div className="flex justify-center">
          <a
            href="#"
            className="inline-flex items-center gap-2.5 rounded-md font-medium transition-all duration-[120ms] active:scale-[0.98] group"
            style={{
              padding: "14px 28px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 15,
              color: "rgba(255,255,255,0.8)",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = "rgba(255,255,255,0.09)"
              el.style.borderColor = "rgba(255,255,255,0.18)"
              el.style.color = "#FFFFFF"
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = "rgba(255,255,255,0.05)"
              el.style.borderColor = "rgba(255,255,255,0.1)"
              el.style.color = "rgba(255,255,255,0.8)"
            }}
          >
            Ver el proceso completo — 7 pasos
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C6F24A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:translate-x-1"
              style={{ width: 16, height: 16 }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
