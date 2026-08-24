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
        icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
        title: "Verificación de identidad",
        desc: "KYC biométrico, liveness detection y DID descentralizado.",
        href: "/como-funciona",
      },
      {
        icon: (
          <>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </>
        ),
        title: "Solicitud y precio dinámico",
        desc: "El emisor define el paquete y el receptor lo acepta antes de publicarlo.",
        href: "/como-funciona",
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
        title: "Selección del transportista",
        desc: "Subasta abierta con score de reputación y hold de fondos automático.",
        href: "/como-funciona",
      },
      {
        icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
        title: "Ruta optimizada",
        desc: "El motor sugiere paradas que maximizan ingresos con mínimo desvío.",
        href: "/como-funciona",
      },
      {
        icon: (
          <>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>
        ),
        title: "Retiro verificado",
        desc: "Primer handshake criptográfico: QR firmado + validación GPS en 60 s.",
        href: "/como-funciona",
      },
      {
        icon: (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </>
        ),
        title: "Seguimiento en tiempo real",
        desc: "GPS en vivo, ETA dinámica y chat entre las tres partes.",
        href: "/como-funciona",
      },
      {
        icon: <polyline points="20 6 9 17 4 12" />,
        title: "Entrega y pago automático",
        desc: "Segundo handshake criptográfico y split payment liberado al instante.",
        href: "/como-funciona",
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
        title: "El proyecto",
        desc: "Cómo nació Movo, nuestro PF de Ingenieria",
        href: "/el-proyecto",
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
        desc: "Las 5 personas detras del proyecto.",
        href: "/el-equipo",
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const menuTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const hamburgerRef = useRef<HTMLButtonElement>(null)

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (openMenu) {
        const trigger = menuTriggerRefs.current[openMenu]
        setOpenMenu(null)
        trigger?.focus()
      } else if (mobileOpen) {
        setMobileOpen(false)
        hamburgerRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [openMenu, mobileOpen])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const toggle = (key: string) =>
    setOpenMenu((prev) => (prev === key ? null : key))

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          "fixed top-0 right-0 left-0 z-[100] flex h-16 items-center px-5 md:px-10 transition-all duration-[var(--motion-state)]",
          scrolled
            ? "border-b border-white/[0.07] bg-ink-950/82 backdrop-blur-xl"
            : "border-b border-transparent"
        )}
        style={scrolled ? { background: "rgba(10,10,11,0.82)" } : undefined}
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center">
          {/* Logo */}
          <a
            href="/"
            className="mr-10 flex flex-shrink-0 items-center"
            aria-label="Movo"
          >
            <svg viewBox="0 0 220 56" fill="none" height="30" width="118">
              <rect x="0" y="4" width="48" height="48" rx="12" fill="#0A0A0B" />
              <circle cx="24" cy="28" r="24" fill="#FFFFFF" fillOpacity="0.15" />
              <circle
                cx="24"
                cy="28"
                r="22.5"
                fill="#FFFFFF"
                fillOpacity="0.30"
              />
              <circle
                cx="24"
                cy="28"
                r="20.7"
                fill="#FFFFFF"
                fillOpacity="0.58"
              />
              <circle
                cx="24"
                cy="28"
                r="18.6"
                fill="#FFFFFF"
                fillOpacity="0.90"
              />
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

          {/* Desktop nav links */}
          <ul className="hidden md:flex flex-1 list-none items-center gap-0">
            {(
              Object.entries(NAV_MENUS) as [
                keyof typeof NAV_MENUS,
                (typeof NAV_MENUS)[keyof typeof NAV_MENUS],
              ][]
            ).map(([key, menu]) => (
              <li key={key} className="relative">
                <button
                  ref={(el) => {
                    menuTriggerRefs.current[key] = el
                  }}
                  onClick={() => toggle(key)}
                  aria-expanded={openMenu === key}
                  aria-haspopup="true"
                  className={cn(
                    "mr-2 flex items-center gap-[5px] rounded-md px-4 py-2 text-sm font-medium",
                    "cursor-pointer transition-colors duration-[var(--motion-hover)] select-none",
                    openMenu === key
                      ? "bg-white/[0.06] text-white"
                      : "text-white/70 hover:bg-white/[0.06] hover:text-white"
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
                      "h-[14px] w-[14px] opacity-50 transition-transform duration-[var(--motion-state)]",
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
                    "rounded-[14px] border border-white/[0.09]",
                    "z-[200] p-5 transition-all duration-[var(--motion-state)]",
                    menu.cols === 2
                      ? "grid min-w-[560px] grid-cols-2 gap-x-8 gap-y-1"
                      : "grid min-w-[320px] grid-cols-1 gap-y-1",
                    openMenu === key
                      ? "pointer-events-auto visible translate-y-0 opacity-100"
                      : "pointer-events-none invisible -translate-y-1.5 opacity-0"
                  )}
                  style={{
                    background: "rgba(18,18,22,0.97)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    boxShadow:
                      "0 24px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <p
                    className="col-span-full px-3 pt-1 pb-2 text-[11px] font-semibold tracking-[0.08em] uppercase"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {menu.colTitle}
                  </p>
                  {menu.items.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className="group flex cursor-pointer items-start gap-3 rounded-[10px] px-3 py-2.5"
                      style={{ transition: "background var(--motion-hover)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.06)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        <NavIcon>{item.icon}</NavIcon>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span
                          className="text-sm font-medium transition-colors duration-[var(--motion-hover)] group-hover:text-[#C6F24A]"
                          style={{ color: "rgba(255,255,255,0.88)" }}
                        >
                          {item.title}
                        </span>
                        <span
                          className="text-xs leading-snug"
                          style={{ color: "rgba(255,255,255,0.38)" }}
                        >
                          {item.desc}
                        </span>
                      </div>
                    </a>
                  ))}

                  {key === "como" && (
                    <div
                      className="col-span-full mt-2 pt-2"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <a
                        href="/como-funciona"
                        className="group flex items-center justify-between rounded-[10px] px-3 py-2.5"
                        style={{ transition: "background var(--motion-hover)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(198,242,74,0.07)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#C6F24A" }}
                        >
                          Ver el proceso completo — 7 etapas
                        </span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#C6F24A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-[var(--motion-state)] group-hover:translate-x-1"
                          style={{ width: 14, height: 14 }}
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </li>
            ))}
            <li>
              <a
                href="/blog"
                className="mr-2 flex items-center gap-[5px] rounded-md px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-[var(--motion-hover)] hover:bg-white/[0.06] hover:text-white"
              >
                Blog
              </a>
            </li>
          </ul>

          {/* Hamburger — mobile only */}
          <button
            ref={hamburgerRef}
            className="ml-auto flex items-center justify-center w-10 h-10 rounded-md md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {mobileOpen ? (
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="8" x2="21" y2="8" />
                <line x1="3" y1="16" x2="21" y2="16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[90] flex flex-col pt-16 md:hidden overflow-y-auto",
          "transition-all duration-[var(--motion-state)]",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        style={{
          background: "rgba(10,10,11,0.98)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="flex flex-col px-5 pb-10 gap-1">
          <div className="mt-4">
            <p
              className="text-[11px] font-semibold tracking-[0.1em] uppercase px-3 pt-5 pb-2"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Contenido
            </p>
            <a
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-[10px] px-3 py-3 active:bg-white/[0.06]"
              style={{ transition: "background var(--motion-hover)" }}
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.88)" }}>
                  Blog
                </span>
                <span className="text-xs leading-snug" style={{ color: "rgba(255,255,255,0.38)" }}>
                  Logística colaborativa y novedades de Movo.
                </span>
              </div>
            </a>
          </div>
          {(
            Object.entries(NAV_MENUS) as [
              keyof typeof NAV_MENUS,
              (typeof NAV_MENUS)[keyof typeof NAV_MENUS],
            ][]
          ).map(([key, menu], sectionIdx) => (
            <div key={key} className={sectionIdx > 0 ? "mt-4" : ""}>
              <p
                className="text-[11px] font-semibold tracking-[0.1em] uppercase px-3 pt-5 pb-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {menu.colTitle}
              </p>
              {menu.items.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-[10px] px-3 py-3 active:bg-white/[0.06]"
                  style={{ transition: "background var(--motion-hover)" }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <NavIcon>{item.icon}</NavIcon>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "rgba(255,255,255,0.88)" }}
                    >
                      {item.title}
                    </span>
                    <span
                      className="text-xs leading-snug"
                      style={{ color: "rgba(255,255,255,0.38)" }}
                    >
                      {item.desc}
                    </span>
                  </div>
                </a>
              ))}
              {key === "como" && (
                <a
                  href="/como-funciona"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-[10px] px-3 py-3 mt-1"
                  style={{
                    background: "rgba(198,242,74,0.07)",
                    border: "1px solid rgba(198,242,74,0.12)",
                  }}
                >
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#C6F24A" }}
                  >
                    Ver el proceso completo — 7 etapas
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C6F24A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: 14, height: 14, flexShrink: 0 }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
