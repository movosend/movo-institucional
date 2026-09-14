"use client"

export function ProjectPageHero() {
  return (
    <section className="relative overflow-hidden px-5 pt-28 pb-16 md:px-10 md:pt-[140px] md:pb-20">
      {/* Aperture rings — decorative, partially off-screen right */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -220,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <svg viewBox="0 0 600 600" width="660" height="660" fill="none">
          <circle cx="300" cy="300" r="290" fill="white" fillOpacity="0.02" />
          <circle cx="300" cy="300" r="260" fill="white" fillOpacity="0.03" />
          <circle cx="300" cy="300" r="228" fill="white" fillOpacity="0.06" />
          <circle cx="300" cy="300" r="194" fill="white" fillOpacity="0.09" />
          <circle cx="300" cy="300" r="157" fill="white" fillOpacity="0.04" />
          <circle
            cx="300"
            cy="300"
            r="100"
            fill="none"
            stroke="rgba(198,242,74,0.18)"
            strokeWidth="1"
          />
          <circle
            cx="300"
            cy="300"
            r="157"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
          <circle
            cx="300"
            cy="300"
            r="228"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
          <circle
            cx="300"
            cy="300"
            r="290"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: 1200, zIndex: 1 }}
      >
        {/* Eyebrow */}
        <div
          className="mb-8 inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.38)",
              fontFamily: "var(--font-mono)",
            }}
          >
            PF - Grupo 27 · Ingenieria en Sistemas de Informacion
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mb-6 text-white"
          style={{
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.04,
            maxWidth: 820,
          }}
        >
          Ingeniería aplicada
          <br />a un problema{" "}
          <em className="not-italic" style={{ color: "#C6F24A" }}>
            real.
          </em>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.5)",
            maxWidth: 560,
            marginBottom: 64,
          }}
        >
          Movo es nuestro Proyecto Final de Ingeniería en Sistemas de
          Información de la UTN Facultad Regional Córdoba. Mucho mas que un
          producto, es un proyecto.
        </p>

        {/* Institution card */}
        <div
          className="inline-flex items-center gap-4 rounded-2xl px-5 py-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-xl"
            style={{
              width: 44,
              height: 44,
              background: "rgba(255,255,255,0.07)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              Universidad Tecnológica Nacional
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.38)",
                marginTop: 3,
                lineHeight: 1.4,
              }}
            >
              Facultad Regional Córdoba · Ingeniería en Sistemas de Información
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
