"use client"

import { useEffect, useRef, useState } from "react"

import { ParcelBox } from "@/components/home/parcel-box"

type Status = "idle" | "loading" | "success" | "error"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Anchos fijos: el patrón debe ser idéntico en server y cliente.
const BARS = [
  3, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 1, 2, 3, 1, 4, 1, 1, 2, 1, 3, 2, 1, 1, 4, 1,
  2, 1, 1, 3, 1, 2, 4, 1, 1, 2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 1, 2, 1,
]

function trackingCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 5; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `MV-${code}`
}

const MICRO = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
} as const

export function Newsletter() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")
  const [code, setCode] = useState("")
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Revelado al entrar en viewport.
  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const complete =
    EMAIL_RE.test(email.trim()) && !!firstName.trim() && !!lastName.trim()
  const sealed = status === "success"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "loading" || !complete) return

    setStatus("loading")
    setError("")

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName }),
      })
      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setStatus("error")
        setError(data.error ?? "No pudimos registrarte. Probá de nuevo.")
        return
      }

      setCode(trackingCode())
      setStatus("success")
    } catch {
      setStatus("error")
      setError("No pudimos registrarte. Revisá tu conexión e intentá de nuevo.")
    }
  }

  return (
    <section className="px-5 py-20 md:px-10 md:py-28" id="newsletter">
      <div
        ref={sectionRef}
        className={`mx-auto w-full max-w-[900px] ${visible ? "animate-label-in" : "opacity-0"}`}
      >
        <h2
          className="font-display mb-9 text-center text-white"
          style={{
            fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "-0.04em",
          }}
        >
          Movo abre ciudad por ciudad.
          <br />
          Guardá tu lugar en la primera.
        </h2>

        {/* Caja de cartón con la etiqueta de despacho pegada */}
        <ParcelBox open={sealed}>
          <div
            className="paper-worn relative overflow-hidden"
            style={{
              borderRadius: 4,
              boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset",
            }}
          >
            {/* Cabecera */}
            <div className="relative flex items-center justify-between px-4 pt-3 pb-2 sm:px-5 sm:pt-3.5 sm:pb-2.5">
              <span style={{ ...MICRO, fontSize: 11, color: "var(--ink-500)" }}>
                Movo · Lista de espera
              </span>
              <span className="flex items-center gap-2">
                {sealed ? (
                  <span className="live-dot" style={{ width: 7, height: 7 }} />
                ) : (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--ink-300)",
                    }}
                  />
                )}
                <span
                  style={{
                    ...MICRO,
                    fontSize: 11,
                    color: sealed ? "var(--ink-950)" : "var(--ink-500)",
                  }}
                >
                  {sealed ? "Confirmado" : "Abierta"}
                </span>
              </span>
            </div>

            <Perforation />

            {/* Cuerpo */}
            <div className="relative px-4 py-3 sm:px-5 sm:py-4">
              {sealed ? (
                <div className="flex flex-col gap-1">
                  <span style={{ ...MICRO, color: "var(--ink-500)" }}>
                    Tu número de seguimiento
                  </span>
                  <span
                    style={{
                      color: "var(--ink-950)",
                      fontSize: "clamp(22px, 6vw, 32px)",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      lineHeight: 1.35,
                    }}
                  >
                    {code}
                  </span>
                  <p
                    className="mt-1 max-w-[62%] text-[13px]"
                    style={{ color: "var(--ink-500)", lineHeight: 1.5 }}
                  >
                    Gracias, {firstName.trim()}. Te escribimos a{" "}
                    <span style={{ color: "var(--ink-700)" }}>
                      {email.trim()}
                    </span>{" "}
                    el día que abramos los envíos en tu ciudad.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-2 grid grid-cols-2 gap-2 sm:mb-3 sm:gap-3">
                    <Field
                      id="newsletter-first-name"
                      label="Nombre"
                      value={firstName}
                      onChange={setFirstName}
                      autoComplete="given-name"
                      placeholder="Tomas"
                    />
                    <Field
                      id="newsletter-last-name"
                      label="Apellido"
                      value={lastName}
                      onChange={setLastName}
                      autoComplete="family-name"
                      placeholder="Olmos"
                    />
                  </div>

                  <Field
                    id="newsletter-email"
                    label="Correo del destinatario"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    placeholder="tu@email.com"
                    invalid={status === "error"}
                    large
                  />

                  <div className="mt-2 flex min-h-[28px] items-center justify-between gap-4 sm:mt-3">
                    <p
                      role="status"
                      aria-live="polite"
                      className="text-[13px]"
                      style={{
                        color:
                          status === "error" ? "#B4231F" : "var(--ink-400)",
                        lineHeight: 1.45,
                      }}
                    >
                      {status === "error"
                        ? error
                        : "Un aviso cuando abramos. Nada más."}
                    </p>

                    {complete && (
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="animate-field-in group flex h-10 shrink-0 items-center gap-2 rounded-lg px-5 text-[14px] font-medium transition-opacity duration-[var(--motion-hover)] hover:opacity-90 disabled:opacity-55"
                        style={{ background: "#C6F24A", color: "#0A0A0B" }}
                      >
                        {status === "loading" ? "Enviando" : "Sumarme"}
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5 transition-transform duration-[var(--motion-hover)] group-hover:translate-x-0.5 motion-reduce:transform-none"
                          aria-hidden
                        >
                          <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
                        </svg>
                      </button>
                    )}
                  </div>
                </form>
              )}

              {sealed && <Stamp />}
            </div>

            <Perforation />

            {/* Pie */}
            <div className="relative flex items-end justify-between gap-6 px-4 pt-2 pb-2.5 sm:px-5 sm:pt-2.5 sm:pb-3">
              <Barcode
                color={sealed ? "var(--ink-950)" : "var(--ink-300)"}
                printing={sealed}
              />
              <span
                className="shrink-0"
                style={{ ...MICRO, color: "var(--ink-400)" }}
              >
                Argentina
              </span>
            </div>
          </div>
        </ParcelBox>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  type = "text",
  invalid,
  large,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  type?: string
  invalid?: boolean
  large?: boolean
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block"
        style={{ ...MICRO, color: "var(--ink-500)" }}
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className="w-full min-w-0 bg-transparent pb-1 transition-colors duration-[var(--motion-state)] outline-none placeholder:text-ink-300 focus:border-b-[var(--ink-950)]"
        style={{
          color: "var(--ink-950)",
          fontSize: large ? 19 : 16,
          fontWeight: 400,
          letterSpacing: "-0.01em",
          borderBottom: "1px solid var(--ink-200)",
        }}
      />
    </div>
  )
}

/** Sello de tinta que cae sobre la etiqueta al confirmar. */
function Stamp() {
  return (
    <div
      className="animate-stamp-in pointer-events-none absolute"
      style={{ right: 18, bottom: -6, opacity: 0.82 }}
      aria-hidden
    >
      <svg viewBox="0 0 120 120" width="112" height="112" fill="none">
        <defs>
          <path
            id="stamp-arc"
            d="M60 60 m -44 0 a 44 44 0 1 1 88 0 a 44 44 0 1 1 -88 0"
          />
        </defs>
        <circle
          cx="60"
          cy="60"
          r="55"
          stroke="var(--ink-950)"
          strokeWidth="2"
          strokeOpacity="0.75"
        />
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke="var(--ink-950)"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
        <text
          fill="var(--ink-950)"
          fillOpacity="0.8"
          fontSize="10"
          fontWeight="600"
          letterSpacing="2.6"
        >
          <textPath href="#stamp-arc" startOffset="50%" textAnchor="middle">
            MOVO · ARGENTINA · MOVO · ARGENTINA
          </textPath>
        </text>
        <path
          d="M28 60 h64"
          stroke="var(--ink-950)"
          strokeWidth="1"
          strokeOpacity="0.45"
        />
        <text
          x="60"
          y="55"
          textAnchor="middle"
          fill="var(--ink-950)"
          fillOpacity="0.85"
          fontSize="13"
          fontWeight="600"
          letterSpacing="1.4"
        >
          EN LISTA
        </text>
        <text
          x="60"
          y="74"
          textAnchor="middle"
          fill="var(--ink-950)"
          fillOpacity="0.6"
          fontSize="9"
          fontWeight="500"
          letterSpacing="1.8"
        >
          2026
        </text>
      </svg>
    </div>
  )
}

function Barcode({ color, printing }: { color: string; printing?: boolean }) {
  return (
    <div className="flex h-4 items-end gap-[2px] overflow-hidden" aria-hidden>
      {BARS.map((w, i) => (
        <span
          key={i}
          className={printing ? "animate-bar-print" : undefined}
          style={{
            width: w,
            height: i % 7 === 0 ? "100%" : "78%",
            background: color,
            animationDelay: printing ? `${i * 4}ms` : undefined,
          }}
        />
      ))}
    </div>
  )
}

/** Línea troquelada con las muescas laterales de un comprobante. */
function Perforation() {
  return (
    <div className="relative z-10 h-0" aria-hidden>
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: 1,
          backgroundImage:
            "repeating-linear-gradient(to right, var(--ink-300) 0 6px, transparent 6px 12px)",
        }}
      />
      {(["left", "right"] as const).map((side) => (
        <span
          key={side}
          className="absolute rounded-full"
          style={{
            width: 14,
            height: 14,
            [side]: -7,
            top: -7,
            background: "transparent",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.28)",
          }}
        />
      ))}
    </div>
  )
}
