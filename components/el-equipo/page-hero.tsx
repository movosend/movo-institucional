"use client"

export function TeamPageHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        paddingTop: 140,
        paddingBottom: 80,
        paddingLeft: 40,
        paddingRight: 40,
      }}
    >
      {/* Decorative rings */}
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
            PF - Grupo 26 · Ingenieria en Sistemas de Informacion
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
          Cinco estudiantes,
          <br />
          un solo{" "}
          <em className="not-italic" style={{ color: "#C6F24A" }}>
            equipo.
          </em>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.5)",
            maxWidth: 580,
          }}
        >
          Sin jerarquías fijas, sin silos. Un equipo dinámico y autogestionado
          donde cada integrante es, ante todo, desarrollador.
        </p>
      </div>
    </section>
  )
}
