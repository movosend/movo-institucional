"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const NAV_MENUS = {
  como: {
    label: "Cómo funciona",
    colTitle: "Etapas del proceso",
    cols: 2,
    items: [
      {
        icon: (
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        ),
        title: "Verificación de identidad",
        desc: "KYC biométrico, DID y onboarding seguro.",
        href: "#kyc",
      },
      {
        icon: (
          <>
            <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </>
        ),
        title: "Solicitud de envío",
        desc: "El emisor crea el envío y el receptor lo acepta.",
        href: "#solicitud",
      },
      {
        icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
        title: "Motor de precios dinámico",
        desc: "Tarifa calculada por distancia, peso y demanda.",
        href: "#precios",
      },
      {
        icon: (
          <>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </>
        ),
        title: "Asignación y ruta óptima",
        desc: "El sistema elige la ruta de menor desvío.",
        href: "#asignacion",
      },
      {
        icon: (
          <>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </>
        ),
        title: "Seguimiento en tiempo real",
        desc: "GPS en vivo con ETA y registro fotográfico.",
        href: "#tracking",
      },
      {
        icon: (
          <>
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <path d="M3 17h3v3H3z" />
          </>
        ),
        title: "Cryptographic Handshake",
        desc: "Entrega verificada con firma digital y GPS.",
        href: "#handshake",
      },
      {
        icon: (
          <>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </>
        ),
        title: "Sistema de pagos",
        desc: "Hold, captura y split payment automático.",
        href: "#pago",
      },
    ],
  },
  nosotros: {
    label: "Quiénes somos",
    colTitle: "El proyecto",
    cols: 1,
    items: [
      {
        icon: (
          <>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </>
        ),
        title: "Nuestra historia",
        desc: "Cómo nació Movo y para qué existe.",
        href: "#historia",
      },
      {
        icon: (
          <>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </>
        ),
        title: "El equipo",
        desc: "Las personas que construyen la red.",
        href: "#equipo",
      },
      {
        icon: (
          <>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </>
        ),
        title: "Prensa",
        desc: "Recursos y contacto para medios.",
        href: "#prensa",
      },
    ],
  },
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      {children}
    </svg>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const toggle = (key: string) =>
    setOpenMenu((prev) => (prev === key ? null : key))

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-16 flex items-center px-10 transition-all duration-200",
        scrolled
          ? "bg-ink-950/82 backdrop-blur-xl border-b border-white/[0.07]"
          : "border-b border-transparent"
      )}
      style={scrolled ? { background: "rgba(10,10,11,0.82)" } : undefined}
    >
      <div className="max-w-[1200px] mx-auto w-full flex items-center">
        {/* Logo */}
        <a href="#" className="flex items-center flex-shrink-0 mr-10" aria-label="Movo">
          <svg viewBox="0 0 220 56" fill="none" height="30" width="118">
            <rect x="0" y="4" width="48" height="48" rx="12" fill="#0A0A0B" />
            <circle cx="24" cy="28" r="24" fill="#FFFFFF" fillOpacity="0.15" />
            <circle cx="24" cy="28" r="22.5" fill="#FFFFFF" fillOpacity="0.30" />
            <circle cx="24" cy="28" r="20.7" fill="#FFFFFF" fillOpacity="0.58" />
            <circle cx="24" cy="28" r="18.6" fill="#FFFFFF" fillOpacity="0.90" />
            <circle cx="24" cy="28" r="16.3" fill="#0A0A0B" />
            <text
              x="62"
              y="40"
              fontFamily="Inter, ui-sans-serif, system-ui"
              fontWeight="600"
              fontSize="36"
              letterSpacing="-0.04em"
              fill="#FFFFFF"
            >
              movo
            </text>
          </svg>
        </a>

        {/* Nav links */}
        <ul className="flex items-center gap-0 list-none flex-1">
          {(Object.entries(NAV_MENUS) as [keyof typeof NAV_MENUS, (typeof NAV_MENUS)[keyof typeof NAV_MENUS]][]).map(
            ([key, menu]) => (
              <li key={key} className="relative">
                <button
                  onClick={() => toggle(key)}
                  className={cn(
                    "flex items-center gap-[5px] px-4 py-2 text-sm font-medium rounded-md",
                    "transition-colors duration-[120ms] cursor-pointer select-none",
                    openMenu === key
                      ? "text-white bg-white/[0.06]"
                      : "text-white/70 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  {menu.label}
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    className={cn(
                      "w-[14px] h-[14px] opacity-50 transition-transform duration-200",
                      openMenu === key && "rotate-180 opacity-100"
                    )}
                  >
                    <polyline points="4,6 8,10 12,6" />
                  </svg>
                </button>

                {/* Submenu dropdown */}
                <div
                  className={cn(
                    "absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2",
                    "border border-white/[0.09] rounded-[14px]",
                    "p-5 transition-all duration-200 z-[200]",
                    menu.cols === 2
                      ? "grid grid-cols-2 gap-x-8 gap-y-1 min-w-[560px]"
                      : "grid grid-cols-1 gap-y-1 min-w-[320px]",
                    openMenu === key
                      ? "opacity-100 visible pointer-events-auto translate-y-0"
                      : "opacity-0 invisible pointer-events-none -translate-y-1.5"
                  )}
                  style={{
                    background: "rgba(18,18,22,0.97)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <p
                    className="col-span-full text-[11px] font-semibold tracking-[0.08em] uppercase px-3 pb-2 pt-1"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {menu.colTitle}
                  </p>
                  {menu.items.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer group"
                      style={{ transition: "background 120ms" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        <NavIcon>{item.icon}</NavIcon>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span
                          className="text-sm font-medium transition-colors duration-[120ms] group-hover:text-[#C6F24A]"
                          style={{ color: "rgba(255,255,255,0.88)" }}
                        >
                          {item.title}
                        </span>
                        <span className="text-xs leading-snug" style={{ color: "rgba(255,255,255,0.38)" }}>
                          {item.desc}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </li>
            )
          )}

        </ul>
      </div>
    </nav>
  )
}
