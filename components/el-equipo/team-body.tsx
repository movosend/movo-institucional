"use client"

const MEMBERS = [
  { name: "Alena Ariza", id: "95359", photo: "/team-pictures/alena.png" },
  {
    name: "Juan Cruz Bordino Blanche",
    id: "95008",
    photo: "/team-pictures/juancruz.jpeg",
  },
  { name: "Lucas Dalmagro", id: "94366", photo: "/team-pictures/lucas.jpeg" },
  { name: "Pedro Yorlano", id: "95197", photo: "/team-pictures/pedro.jpeg" },
  { name: "Tomás Vergara", id: "94197", photo: "/team-pictures/tomas.jpeg" },
]

const PRACTICES = [
  {
    label: "Sprints de 2 semanas",
    desc: "Iteraciones cortas con planning, weekly y standup para mantener el ritmo sin burocracia.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
  },
  {
    label: "Code review cruzado",
    desc: "Todo cambio pasa por al menos un integrante distinto al autor antes de mergearse a develop.",
    icon: (
      <>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </>
    ),
  },
  {
    label: "Retrospectivas al cierre",
    desc: "Al final de cada sprint el equipo analiza qué funcionó y define acciones concretas de mejora.",
    icon: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </>
    ),
  },
]

function PracticeIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      className="text-muted-foreground"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

function MemberCard({ name, id, photo }: (typeof MEMBERS)[0]) {
  return (
    <div className="flex flex-col items-center gap-3 md:gap-4">
      {/* Grayscale photo */}
      <div
        className="border border-border"
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={photo}
          alt={name}
          className="grayscale"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            display: "block",
          }}
        />
      </div>

      {/* Name & ID */}
      <div className="text-center">
        <div
          className="text-foreground/90"
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            marginBottom: 3,
          }}
        >
          {name}
        </div>
        <div
          className="text-muted-foreground"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.04em",
          }}
        >
          Leg. {id}
        </div>
      </div>
    </div>
  )
}

export function TeamBody() {
  return (
    <>
      {/* ── Team members ─────────────────────────────────────────── */}
      <section className="px-5 pb-16 md:px-10 md:pb-24">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
            {MEMBERS.map((m) => (
              <MemberCard key={m.id} {...m} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Methodology ──────────────────────────────────────────── */}
      <section className="px-5 py-16 md:px-10 md:py-20 border-t border-border">
        <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-start">
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
                Cómo trabajamos
              </p>
              <h2
                className="text-foreground"
                style={{
                  fontSize: "clamp(1.9rem, 3vw, 2.6rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.12,
                  marginBottom: 28,
                }}
              >
                Un equipo plano,
                <br />
                <span className="text-muted-foreground">
                  sin jerarquías.
                </span>
              </h2>
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  marginBottom: 20,
                }}
              >
                Los cinco integrantes somos desarrolladores. No hay un Tech Lead
                ni un Arquitecto con autoridad formal: las decisiones técnicas
                se toman en equipo, la responsabilidad es compartida y la
                revisión de código es cruzada.
              </p>
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                }}
              >
                Trabajamos con Scrum adaptado: sprints de dos semanas,
                ceremonias mínimas y un backlog priorizado. El rol de Scrum
                Master rota cada mes para que todos vivamos las dos
                perspectivas.
              </p>
            </div>

            {/* Right: practices */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PRACTICES.map((p) => (
                <div
                  key={p.label}
                  className="bg-foreground/[0.03] border border-border"
                  style={{
                    borderRadius: 14,
                    padding: "22px 24px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 18,
                  }}
                >
                  <div
                    className="bg-foreground/[0.06]"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <PracticeIcon>{p.icon}</PracticeIcon>
                  </div>
                  <div>
                    <div
                      className="text-foreground/90"
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                        marginBottom: 6,
                      }}
                    >
                      {p.label}
                    </div>
                    <div
                      className="text-muted-foreground"
                      style={{
                        fontSize: 13,
                        lineHeight: 1.65,
                      }}
                    >
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tooling: Linear ──────────────────────────────────────── */}
      <section className="px-5 py-16 md:px-10 md:py-20 md:pb-24 border-t border-border">
        <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
            {/* Left: tooling text */}
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
                Gestión del proyecto
              </p>
              <h2
                className="mb-5 text-foreground"
                style={{
                  fontSize: "clamp(1.9rem, 3vw, 2.6rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.12,
                }}
              >
                Backlog vivo,
                <br />
                <span className="text-muted-foreground">
                  visibilidad total.
                </span>
              </h2>
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                }}
              >
                Usamos Linear para gestionar el backlog, los sprints y el
                seguimiento de issues. Cada historia tiene criterios de
                aceptación, story points estimados y un responsable. El tablero
                es la única fuente de verdad sobre el estado del proyecto.
              </p>
            </div>

            {/* Right: Linear card */}
            <div>
              <div
                className="bg-foreground/[0.03] border border-border"
                style={{
                  borderRadius: 18,
                  padding: "28px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                }}
              >
                {/* Linear logo + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    className="bg-foreground/[0.06]"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 11,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/linear-logo.webp"
                      className="w-6 dark:invert"
                      alt=""
                    />
                  </div>
                  <div>
                    <div
                      className="text-foreground/90"
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Linear
                    </div>
                    <div
                      className="text-muted-foreground"
                      style={{
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      Project management
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div
                  className="border border-border"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 1,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  {[
                    {
                      value: "+35",
                      label: "User Stories iniciales",
                    },
                    { value: "9 meses", label: "Duración estimada" },
                    {
                      value: "Control",
                      label: "Seguimiento total",
                    },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      className={`bg-foreground/[0.03] ${i > 0 ? "border-l border-border" : ""}`}
                      style={{
                        padding: "12px 12px",
                      }}
                    >
                      <div
                        className="text-foreground/75"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 16,
                          fontWeight: 500,
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                          marginBottom: 6,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="text-muted-foreground"
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.02em",
                          lineHeight: 1.4,
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
