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
        <svg
          viewBox="0 0 600 600"
          width="660"
          height="660"
          fill="none"
          className="text-foreground"
        >
          <circle cx="300" cy="300" r="290" fill="currentColor" fillOpacity="0.02" />
          <circle cx="300" cy="300" r="260" fill="currentColor" fillOpacity="0.03" />
          <circle cx="300" cy="300" r="228" fill="currentColor" fillOpacity="0.06" />
          <circle cx="300" cy="300" r="194" fill="currentColor" fillOpacity="0.09" />
          <circle cx="300" cy="300" r="157" fill="currentColor" fillOpacity="0.04" />
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
            stroke="currentColor"
            strokeOpacity="0.07"
            strokeWidth="1"
          />
          <circle
            cx="300"
            cy="300"
            r="228"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.05"
            strokeWidth="1"
          />
          <circle
            cx="300"
            cy="300"
            r="290"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.03"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: 1200, zIndex: 1 }}
      >
        {/* Eyebrow */}
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-foreground/[0.09] bg-foreground/5 px-3.5 py-1.5">
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span
            className="text-muted-foreground"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
            }}
          >
            PF - Grupo 27 · Ingenieria en Sistemas de Informacion
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mb-6 text-foreground"
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
          className="text-muted-foreground"
          style={{
            fontSize: 18,
            lineHeight: 1.75,
            maxWidth: 560,
            marginBottom: 64,
          }}
        >
          Movo es nuestro Proyecto Final de Ingeniería en Sistemas de
          Información de la UTN Facultad Regional Córdoba. Mucho mas que un
          producto, es un proyecto.
        </p>

        {/* Institution card */}
        <div className="inline-flex items-center gap-4 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.04] px-5 py-4">
          <div
            className="flex shrink-0 items-center justify-center rounded-xl bg-foreground/[0.07]"
            style={{ width: 44, height: 44 }}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground/60"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div
              className="text-foreground/90"
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              Universidad Tecnológica Nacional
            </div>
            <div
              className="text-muted-foreground"
              style={{
                fontSize: 13,
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
