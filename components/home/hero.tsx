"use client"

import { IPhoneMockup } from "@/components/home/iphone-mockup"

export function Hero() {
  return (
    <section
      className="relative flex min-h-svh items-center overflow-hidden px-5 pt-24 pb-16 md:px-10 md:pt-[120px] md:pb-20"
      id="hero"
    >
      {/* Lime orb glow */}
      <div
        className="animate-glow-pulse pointer-events-none absolute"
        style={{
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(198,242,74,0.12) 0%, transparent 70%)",
          top: -200,
          right: -100,
        }}
        aria-hidden
      />

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-10 md:grid-cols-[1fr_420px] md:gap-20">
        {/* Left: copy + CTAs */}
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Headline */}
          <h1
            className="font-display text-foreground"
            style={{
              fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            <span
              style={{
                textDecoration: "underline",
                textDecorationColor: "#C6F24A",
                textDecorationThickness: 3,
                textUnderlineOffset: 4,
              }}
            >
              H
            </span>
            oy la{" "}
            <em className="not-italic" style={{ color: "#C6F24A" }}>
              logística
            </em>
            <br />
            está pensada para
            <br />
            <span className="text-foreground">grandes empresas.</span>
            <br />
            Nosotros la pensamos
            <br />
            para las{" "}
            <em className="not-italic" style={{ color: "#C6F24A" }}>
              personas.
            </em>
          </h1>

          {/* Subhead */}
          <p
            className="font-sans text-muted-foreground"
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              maxWidth: 480,
              fontWeight: 400,
            }}
          >
            Movo conecta tu paquete con personas que hacen ese camino todos los
            días. Sin sucursales, sin esperas.
          </p>

          {/* App store badges */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
              Próximamente
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <StoreBadge
                label="Disponible en"
                name="App Store"
                icon={
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                }
              />
              <StoreBadge
                label="Disponible en"
                name="Google Play"
                icon={
                  <path d="M3.18 23.76c.35.2.77.2 1.12 0l10.2-5.9-2.24-2.24L3.18 23.76zM.1 1.06C.04 1.28 0 1.52 0 1.76v20.48c0 .24.04.48.1.7l11.58-11.59L.1 1.06zM20.93 9.5l-2.43-1.4-2.52 2.52 2.52 2.52 2.45-1.41c.7-.4.7-1.43-.02-1.83zM4.3.24L14.5 6.14l-2.24 2.24L4.3.24C3.95.04 3.53.04 3.18.24L4.3.24z" />
                }
              />
            </div>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-4 pt-2 md:gap-6">
            <TrustItem icon={<polyline points="20 6 9 17 4 12" />}>
              KYC verificado
            </TrustItem>
            <div className="hidden h-4 w-px bg-foreground/10 sm:block" />
            <TrustItem
              icon={
                <>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </>
              }
            >
              Pagos seguros
            </TrustItem>
            <div className="hidden h-4 w-px bg-foreground/10 sm:block" />
            <TrustItem icon={<circle cx="12" cy="12" r="10" />}>
              GPS en tiempo real
            </TrustItem>
          </div>
        </div>

        {/* Right: iPhone mockup — hidden on mobile */}
        <div className="relative hidden items-center justify-center md:flex">
          {/* Stat floater top-left */}
          <div
            className="absolute z-10 animate-float-a rounded-[10px] border border-border bg-popover/92 shadow-[0_24px_60px_rgba(10,10,11,0.08),0_6px_16px_rgba(10,10,11,0.04)] dark:shadow-[0_24px_60px_rgba(10,10,11,0.16),0_6px_16px_rgba(10,10,11,0.06)]"
            style={{
              top: 60,
              left: -80,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              whiteSpace: "nowrap",
            }}
          >
            <div
              className="flex flex-shrink-0 items-center justify-center rounded-md"
              style={{
                width: 32,
                height: 32,
                background: "rgba(198,242,74,0.12)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C6F24A"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 16, height: 16 }}
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="flex flex-col gap-px">
              <span className="text-sm font-semibold text-foreground">
                En camino · 9 min
              </span>
              <span className="text-[11px] text-muted-foreground">
                Córdoba → Villa Carlos Paz
              </span>
            </div>
          </div>

          {/* iPhone */}
          <div className="animate-float-phone relative">
            <div
              className="animate-shadow-breath absolute bottom-[-30px] left-1/2 -translate-x-1/2"
              style={{
                height: 24,
                width: 180,
                background:
                  "radial-gradient(ellipse, rgba(198,242,74,0.25) 0%, transparent 70%)",
              }}
              aria-hidden
            />
            <IPhoneMockup
              src="/hero-updated.png"
              alt="Pantalla de seguimiento de un envío en Movo"
            />
          </div>

          {/* Stat floater bottom-right */}
          <div
            className="absolute animate-float-b rounded-[10px] border border-border bg-popover/92 shadow-[0_24px_60px_rgba(10,10,11,0.08),0_6px_16px_rgba(10,10,11,0.04)] dark:shadow-[0_24px_60px_rgba(10,10,11,0.16),0_6px_16px_rgba(10,10,11,0.06)]"
            style={{
              bottom: 100,
              right: -60,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              whiteSpace: "nowrap",
            }}
          >
            <div
              className="flex flex-shrink-0 items-center justify-center rounded-md"
              style={{
                width: 32,
                height: 32,
                background: "rgba(198,242,74,0.12)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C6F24A"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 16, height: 16 }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="flex flex-col gap-px">
              <span className="text-sm font-semibold text-foreground">
                Marcos R. · ★ 4.8
              </span>
              <span className="text-[11px] text-muted-foreground">
                Renault Kangoo · Verificado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="animate-scroll-fade absolute bottom-8 left-1/2 flex flex-col items-center gap-2"
        aria-hidden
      >
        <span className="text-[11px] tracking-[0.06em] text-foreground/40 uppercase">
          Scroll
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-4 w-4 text-foreground/40"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </div>
    </section>
  )
}

function StoreBadge({
  label,
  name,
  icon,
}: {
  label: string
  name: string
  icon: React.ReactNode
}) {
  return (
    <button
      className="inline-flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-foreground/10 bg-foreground/[0.06] transition-all duration-[var(--motion-hover)] hover:-translate-y-px hover:border-foreground/[0.18] hover:bg-foreground/10 active:scale-[0.98]"
      style={{ padding: "10px 18px" }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[22px] w-[22px] text-foreground/90"
      >
        {icon}
      </svg>
      <div className="flex flex-col">
        <span className="text-[10px] leading-tight tracking-[0.04em] text-muted-foreground">
          {label}
        </span>
        <span
          className="text-sm leading-tight font-semibold text-foreground/90"
          style={{ letterSpacing: "-0.01em" }}
        >
          {name}
        </span>
      </div>
    </button>
  )
}

function TrustItem({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#C6F24A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        {icon}
      </svg>
      {children}
    </div>
  )
}
