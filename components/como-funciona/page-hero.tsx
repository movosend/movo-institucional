"use client"

export function PageHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: 40, paddingRight: 40 }}
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
          <span
            className="text-[11px] font-semibold tracking-[0.08em] uppercase font-mono"
            style={{ color: "#C6F24A" }}
          >
            Proceso punta a punta
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-white mb-6"
          style={{
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.04,
            maxWidth: 820,
          }}
        >
          Cómo Movo mueve{" "}
          <br />
          un paquete de{" "}
          <em className="not-italic" style={{ color: "#C6F24A" }}>
            punto A
          </em>{" "}
          <br />a{" "}
          <em className="not-italic" style={{ color: "#C6F24A" }}>
            punto B.
          </em>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.5)",
            maxWidth: 600,
            marginBottom: 64,
          }}
        >
          Desde que el emisor abre la app hasta que el receptor firma la entrega.
          Un flujo diseñado para que podás confiar en un desconocido como si fuera
          alguien conocido.
        </p>

        {/* Chrome intro card */}
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{
            background: "var(--chrome-gradient)",
            boxShadow:
              "0 2px 48px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.5) inset",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          {/* Column grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
            }}
          >
            {PERSONAS.map((p, i) => (
              <div
                key={p.role}
                style={{
                  padding: "32px 36px 28px",
                  borderRight:
                    i < PERSONAS.length - 1
                      ? "1px solid rgba(0,0,0,0.09)"
                      : undefined,
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
                    fontSize: 28,
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
                    marginBottom: 24,
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
