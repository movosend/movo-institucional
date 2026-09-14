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
    <section className="relative overflow-hidden border-t border-border bg-[#F8F8FA] px-5 py-16 md:px-10 md:py-[100px] dark:bg-[#0D0D0F]">
      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
            style={{
              background: "rgba(198,242,74,0.08)",
              border: "1px solid rgba(198,242,74,0.18)",
            }}
          >
            <span className="live-dot" />
            <span className="text-[11px] font-semibold tracking-[0.08em] text-[#9FC72E] uppercase dark:text-[#C6F24A]">
              Cómo funciona
            </span>
          </div>

          <h2
            className="mb-4 text-foreground"
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
            className="mx-auto text-muted-foreground"
            style={{
              fontSize: 17,
              maxWidth: 440,
              lineHeight: 1.65,
            }}
          >
            Sin sucursales, sin burocracia. Solo personas que se mueven y
            aprovechan el camino.
          </p>
        </div>

        {/* Steps grid */}
        <div className="mb-10 grid grid-cols-1 gap-[2px] md:mb-14 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="group relative border border-border bg-foreground/[0.025] transition-colors duration-[var(--motion-hover)] hover:bg-foreground/[0.042]"
              style={{
                padding: "32px 28px 36px",
                borderRadius:
                  i === 0
                    ? "10px 10px 0 0"
                    : i === STEPS.length - 1
                      ? "0 0 10px 10px"
                      : undefined,
              }}
            >
              <div
                className="mb-5 font-mono text-[11px] font-semibold tracking-[0.1em] text-[#9FC72E] dark:text-[#C6F24A]"
              >
                {step.num}
              </div>

              <div
                className="mb-6 flex items-center justify-center text-[#9FC72E] dark:text-[#C6F24A]"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  background: "rgba(198,242,74,0.08)",
                  border: "1px solid rgba(198,242,74,0.15)",
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
                className="mb-2.5 text-foreground"
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
                className="text-muted-foreground"
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                {step.desc}
              </p>

              {/* Connector arrow — shown on desktop between steps */}
              {step.connector && (
                <div
                  className="absolute top-1/2 right-[-14px] z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground md:flex"
                  aria-hidden
                  style={{
                    width: 28,
                    height: 28,
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
            href="/como-funciona"
            className="group inline-flex items-center gap-2.5 rounded-md border border-foreground/10 bg-foreground/5 font-medium text-foreground/80 transition-all duration-[var(--motion-hover)] hover:border-foreground/[0.18] hover:bg-foreground/[0.09] hover:text-foreground active:scale-[0.98]"
            style={{
              padding: "14px 28px",
              fontSize: 15,
              letterSpacing: "-0.01em",
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
              className="transition-transform duration-[var(--motion-state)] group-hover:translate-x-1"
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
