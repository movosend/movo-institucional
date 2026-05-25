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
      stroke="rgba(255,255,255,0.45)"
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
    <div className="flex flex-col items-center gap-4">
      {/* Grayscale photo */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
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
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "rgba(255,255,255,0.88)",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            marginBottom: 4,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "rgba(255,255,255,0.28)",
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
      <section style={{ padding: "0 40px 96px" }}>
        <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
          {/* Lime rule */}
          <div
            style={{
              width: 48,
              height: 3,
              background: "#C6F24A",
              borderRadius: 2,
              marginBottom: 52,
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 20,
            }}
          >
            {MEMBERS.map((m) => (
              <MemberCard key={m.id} {...m} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Methodology ──────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 40px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "start",
            }}
          >
            {/* Left */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 20,
                }}
              >
                Cómo trabajamos
              </p>
              <h2
                className="text-white"
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
                <span style={{ color: "rgba(255,255,255,0.32)" }}>
                  sin jerarquías.
                </span>
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 20,
                }}
              >
                Los cinco integrantes somos desarrolladores. No hay un Tech Lead
                ni un Arquitecto con autoridad formal: las decisiones técnicas
                se toman en equipo, la responsabilidad es compartida y la
                revisión de código es cruzada.
              </p>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.5)",
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
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "22px 24px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.06)",
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
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.88)",
                        letterSpacing: "-0.01em",
                        marginBottom: 6,
                      }}
                    >
                      {p.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.65,
                        color: "rgba(255,255,255,0.38)",
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
      <section
        style={{
          padding: "80px 40px 100px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
            }}
          >
            {/* Left: tooling text */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 20,
                }}
              >
                Gestión del proyecto
              </p>
              <h2
                className="mb-5 text-white"
                style={{
                  fontSize: "clamp(1.9rem, 3vw, 2.6rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.12,
                }}
              >
                Backlog vivo,
                <br />
                <span style={{ color: "rgba(255,255,255,0.32)" }}>
                  visibilidad total.
                </span>
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.5)",
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
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 18,
                  padding: "32px 36px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 28,
                }}
              >
                {/* Linear logo + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 11,
                      background: "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {/* Linear logomark approximation */}
                    <img
                      src="/linear-logo.webp"
                      className="w-6 invert"
                      alt=""
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.88)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Linear
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.32)",
                        marginTop: 2,
                      }}
                    >
                      Project management
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 1,
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {[
                    {
                      value: "+35",
                      label: "User Stories iniciales prev. refinamiento",
                    },
                    { value: "9 meses", label: "Duracion est. del proyecto" },
                    {
                      value: "Control",
                      label: "Seguimiento total del progreso",
                    },
                  ].map((s, i) => (
                    <div
                      key={s.label}
                      style={{
                        padding: "14px 16px",
                        background: "rgba(255,255,255,0.03)",
                        borderLeft:
                          i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 18,
                          fontWeight: 500,
                          color: "rgba(255,255,255,0.75)",
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                          marginBottom: 6,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.28)",
                          letterSpacing: "0.03em",
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
