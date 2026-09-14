"use client"

export function PageHero() {
  return (
    <section
      className="relative overflow-hidden px-5 pt-28 pb-16 md:px-10 md:pt-[140px] md:pb-20"
    >
      {/* Wave motif background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{ zIndex: 0 }}
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <path
              key={i}
              d={`M0 ${80 + i * 80} C240 ${60 + i * 80}, 480 ${100 + i * 80}, 720 ${80 + i * 80} S1200 ${60 + i * 80}, 1440 ${80 + i * 80}`}
              fill="none"
              stroke="#C6F24A"
              strokeWidth="1"
              strokeOpacity={0.055 - i * 0.003}
            />
          ))}
        </svg>
      </div>

      <div className="max-w-[1200px] mx-auto w-full relative" style={{ zIndex: 1 }}>
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8"
          style={{
            background: "rgba(198,242,74,0.08)",
            border: "1px solid rgba(198,242,74,0.18)",
          }}
        >
          <span className="live-dot" />
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase font-mono text-[#9FC72E] dark:text-[#C6F24A]">
            Proceso punta a punta
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-foreground mb-6"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 5rem)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.04,
            maxWidth: 820,
          }}
        >
          Cómo Movo mueve{" "}
          <br className="hidden sm:block" />
          un paquete de{" "}
          <em className="not-italic text-[#9FC72E] dark:text-[#C6F24A]">
            punto A
          </em>{" "}
          <br className="hidden sm:block" />a{" "}
          <em className="not-italic text-[#9FC72E] dark:text-[#C6F24A]">
            punto B.
          </em>
        </h1>

        {/* Subtitle */}
        <p
          className="mb-12 md:mb-16 text-muted-foreground"
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            maxWidth: 600,
          }}
        >
          Desde que el emisor abre la app hasta que el receptor firma la entrega.
          Un flujo diseñado para que podás confiar en un desconocido como si fuera
          alguien conocido.
        </p>

        {/* Chrome intro card */}
        <div
          className="w-full rounded-2xl overflow-hidden border border-black/10 shadow-[0_2px_48px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.5)_inset] dark:border-white/60 dark:shadow-[0_2px_48px_rgba(0,0,0,0.28),0_1px_0_rgba(255,255,255,0.5)_inset]"
          style={{ background: "var(--chrome-gradient)" }}
        >
          {/* Personas — stack on mobile, 3-col on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-black/[0.09] md:divide-y-0 md:divide-x">
            {PERSONAS.map((p) => (
              <div
                key={p.role}
                style={{
                  padding: "28px 28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                }}
              >
                {/* Role label */}
                <div
                  className="font-mono text-[10px] font-semibold tracking-[0.12em] uppercase mb-3"
                  style={{ color: "rgba(10,10,11,0.45)" }}
                >
                  {p.role}
                </div>

                {/* Name */}
                <div
                  className="mb-3"
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: "#0A0A0B",
                    lineHeight: 1.1,
                  }}
                >
                  {p.name}
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "rgba(10,10,11,0.6)",
                    flexGrow: 1,
                    marginBottom: 20,
                  }}
                >
                  {p.desc}
                </p>

                {/* Action pill */}
                <div
                  className="inline-flex items-center gap-1.5 self-start rounded-full px-3.5 py-1.5"
                  style={{
                    background: "rgba(0,0,0,0.06)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(10,10,11,0.7)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  <span style={{ opacity: 0.6 }}>{p.pillIcon}</span>
                  {p.pill}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const PERSONAS = [
  {
    role: "Emisor",
    name: "Alena",
    desc: "Necesita mandar las llaves de su depto en Córdoba a su mamá en Villa María. Andreani le cobra más caro que el duplicado.",
    pill: "Envía el paquete",
    pillIcon: "→",
  },
  {
    role: "Transportista",
    name: "Pedro",
    desc: "Viaja todos los miércoles de Córdoba a Villa María por trabajo. Tiene espacio en su Kangoo y quiere sumar algo de plata al camino.",
    pill: "Lleva el paquete",
    pillIcon: "⏱",
  },
  {
    role: "Receptor",
    name: "Alina",
    desc: "La mamá de Alena en Villa María. Recibirá las llaves ese mismo día, confirma la entrega con un código QR y listo.",
    pill: "Recibe el paquete",
    pillIcon: "✓",
  },
]
