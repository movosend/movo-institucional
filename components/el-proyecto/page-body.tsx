"use client"

const DISCIPLINES = [
  {
    title: "Arquitectura de Sistemas",
    desc: "Diseño de APIs, servicios distribuidos y decisiones de arquitectura que sostienen la confiabilidad y la escala del sistema.",
    icon: (
      <>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </>
    ),
  },
  {
    title: "Seguridad de la Información",
    desc: "KYC biométrico, criptografía aplicada y contratos verificados entre partes que no se conocen.",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    title: "Diseño de Producto",
    desc: "UX research, sistema de diseño, prototipado iterativo y validación con usuarios reales en un mercado concreto.",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </>
    ),
  },
  {
    title: "Infraestructura & DevOps",
    desc: "Deployment en cloud, integración continua, observabilidad y alta disponibilidad en un sistema de producción.",
    icon: (
      <>
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </>
    ),
  },
  {
    title: "Gestión de Proyectos",
    desc: "Metodologías ágiles, documentación técnica, gestión del alcance y coordinación de equipo bajo restricciones reales.",
    icon: (
      <>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="12" y2="16" />
      </>
    ),
  },
  {
    title: "Investigación Aplicada",
    desc: "Análisis de mercado, marcos regulatorios de logística, benchmarking de soluciones existentes y validación de hipótesis.",
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
]

function DisciplineIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      {children}
    </svg>
  )
}

export function ProjectPageBody() {
  return (
    <>
      {/* ── Section: La motivación ───────────────────────────────── */}
      <section className="px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
          {/* Lime rule */}
          <div
            style={{
              width: 48,
              height: 3,
              background: "#C6F24A",
              borderRadius: 2,
              marginBottom: 40,
            }}
          />

          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-20">
            {/* Left: heading */}
            <div>
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 20,
                }}
              >
                La motivación
              </p>
              <h2
                className="text-foreground"
                style={{
                  fontSize: "clamp(1.9rem, 3vw, 2.6rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.12,
                }}
              >
                Una observación
                <br />
                simple.
                <br />
                <span className="text-muted-foreground">
                  Una solución compleja.
                </span>
              </h2>
            </div>

            {/* Right: narrative */}
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <p
                className="text-muted-foreground"
                style={{ fontSize: 16, lineHeight: 1.8 }}
              >
                En Argentina, la logística del último kilómetro es cara, lenta e
                informal. Miles de personas viajan todos los días entre ciudades
                con espacio disponible en sus vehículos. Esa capacidad ociosa
                existe: simplemente no hay una plataforma confiable para
                activarla.
              </p>
              <p
                className="text-muted-foreground"
                style={{ fontSize: 16, lineHeight: 1.8 }}
              >
                Movo nació como la respuesta a esa observación: una red P2P de
                logística donde cualquier persona puede ser transportista en su
                próximo viaje, y cualquiera puede enviar un paquete con alguien
                que ya va.
              </p>
              <p
                className="text-muted-foreground"
                style={{ fontSize: 16, lineHeight: 1.8 }}
              >
                El problema es simple de enunciar. La solución no tanto:
                requiere confianza verificada, pagos atómicos, seguimientos y
                una experiencia que reduzca la fricción al mínimo posible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Las disciplinas ─────────────────────────────── */}
      <section className="border-t border-border px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
          <p
            className="text-muted-foreground"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              marginBottom: 20,
            }}
          >
            Más que una app
          </p>
          <h2
            className="mb-4 text-foreground"
            style={{
              fontSize: "clamp(1.9rem, 3vw, 2.6rem)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
              maxWidth: 620,
            }}
          >
            Un proyecto que abarca toda la carrera.
          </h2>
          <p
            className="text-muted-foreground"
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              maxWidth: 520,
              marginBottom: 44,
            }}
          >
            Elegimos este problema porque no hay forma de resolverlo bien sin
            integrar múltiples áreas de la Ingeniería en Sistemas al mismo
            tiempo, para construir una solucion innovadora. Movo no es solo un
            ejercicio académico, es un sistema real, con restricciones reales.
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-3.5">
            {DISCIPLINES.map((d) => (
              <div
                key={d.title}
                className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-foreground/[0.03]"
                style={{ padding: "22px 22px 20px" }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-foreground/[0.06]">
                  <DisciplineIcon>{d.icon}</DisciplineIcon>
                </div>
                <div>
                  <div
                    className="text-foreground/90"
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      marginBottom: 8,
                    }}
                  >
                    {d.title}
                  </div>
                  <div
                    className="text-muted-foreground"
                    style={{ fontSize: 14, lineHeight: 1.65 }}
                  >
                    {d.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: La carrera ──────────────────────────────────── */}
      <section className="border-t border-border px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-20">
            {/* Left */}
            <div>
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 20,
                }}
              >
                La carrera
              </p>
              <h2
                className="mb-6 text-foreground"
                style={{
                  fontSize: "clamp(1.9rem, 3vw, 2.6rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.12,
                }}
              >
                Cinco años para aprender a construir lo que importa.
              </h2>
              <p
                className="text-muted-foreground"
                style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}
              >
                Ingeniería en Sistemas de Información es una carrera de cinco
                años donde aprendimos a pensar como ingeniero: identificar
                problemas, diseñar soluciones, evaluar alternativas y construir
                sistemas que funcionen en el mundo real.
              </p>
              <p
                className="text-muted-foreground"
                style={{ fontSize: 16, lineHeight: 1.8 }}
              >
                El PF es el momento en que todo converge. Un proyecto integrador
                que demuestra que podés articular el conocimiento de toda la
                carrera en algo concreto, útil y sostenible.
              </p>
            </div>

            {/* Right: stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  number: "5",
                  unit: "años",
                  label: "de formación en Ingeniería en Sistemas",
                },
                {
                  number: "ISI",
                  unit: "",
                  label: "Ingeniería en Sistemas de Información - UTN FRC",
                },
                {
                  number: "PF",
                  unit: "",
                  label: "Proyecto Final - capstone de la carrera",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-5 rounded-xl border border-border bg-foreground/[0.03]"
                  style={{ padding: "20px 22px" }}
                >
                  <div
                    className="text-foreground/90"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 26,
                      fontWeight: 500,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                      minWidth: 52,
                    }}
                  >
                    {s.number}
                    {s.unit && (
                      <span
                        className="text-muted-foreground"
                        style={{
                          fontSize: 13,
                          marginLeft: 4,
                          fontWeight: 400,
                        }}
                      >
                        {s.unit}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-muted-foreground"
                    style={{ fontSize: 14, lineHeight: 1.5 }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Cierre ─────────────────────────────────────── */}
      <section className="px-5 py-12 pb-20 md:px-10 md:py-16 md:pb-24">
        <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
          <div
            className="border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_12px_28px_rgba(10,10,11,0.08)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(10,10,11,0.22)]"
            style={{
              borderRadius: 18,
              padding: "40px 28px",
              position: "relative",
              overflow: "hidden",
              background: "var(--obsidian-gradient)",
            }}
          >
            {/* Background wave lines */}
            <svg
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: 0.4,
              }}
              preserveAspectRatio="xMidYMid slice"
              viewBox="0 0 1000 200"
              className="text-foreground"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <path
                  key={i}
                  d={`M0 ${40 + i * 28} C200 ${20 + i * 28}, 400 ${60 + i * 28}, 600 ${40 + i * 28} S900 ${20 + i * 28}, 1000 ${40 + i * 28}`}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.07"
                  strokeWidth="1"
                />
              ))}
            </svg>

            <div style={{ position: "relative", zIndex: 1, maxWidth: 680 }}>
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 24,
                }}
              >
                El proyecto
              </p>
              <p
                className="text-foreground"
                style={{
                  fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.3,
                  marginBottom: 32,
                }}
              >
                No es solo un producto de software. Es la consolidación de cinco
                años de ingeniería, en un dominio que nos importa.
              </p>
              <a
                href="/como-funciona"
                className="inline-flex items-center gap-3 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground/90 transition-colors duration-[var(--motion-hover)] hover:bg-muted"
                style={{ letterSpacing: "-0.01em", textDecoration: "none" }}
              >
                Ver cómo funciona el sistema
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
