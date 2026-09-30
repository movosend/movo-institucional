"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { ArrowIcon, GUTTER, LogoMark } from "@/components/site/primitives"

const LINKS = [
  {
    href: "/como-funciona",
    num: "01",
    label: "Cómo funciona",
    match: "/como-funciona",
  },
  {
    href: "/el-proyecto",
    num: "02",
    label: "El proyecto",
    match: "/el-proyecto",
  },
  { href: "/el-proyecto#equipo", num: "03", label: "El equipo", match: null },
  { href: "/blog", num: "04", label: "Blog", match: "/blog" },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Se cierra al navegar.
  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    setOpen(false)
  }

  // Menú abierto: bloquea el scroll del fondo y escucha Escape.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => {
      root.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  // Si la ventana pasa a escritorio con el menú abierto, se cierra.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const onChange = () => mq.matches && setOpen(false)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const isActive = (match: string | null) =>
    match !== null && pathname.startsWith(match)

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-100 flex h-14 items-center justify-between gap-4 border-b border-white/10 bg-ink-950 font-mono text-[13px]",
          GUTTER
        )}
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-2.5 font-sans text-xl font-semibold tracking-[-0.04em] hover:opacity-85"
        >
          <LogoMark />
          movo
        </Link>
        <div className="hidden gap-1 text-ink-300 md:flex">
          {LINKS.map((l) => {
            const active = isActive(l.match)
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded px-3.5 py-2.5 whitespace-nowrap hover:bg-ink-800 hover:text-white",
                  active && "bg-ink-800 text-white"
                )}
              >
                [{l.num}] {l.label}
              </Link>
            )
          })}
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
          className="-mr-2.5 flex h-11 cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2.5 text-ink-300 hover:text-white md:hidden"
        >
          {open ? "Cerrar" : "Menú"}
          {open ? (
            <X className="size-5" aria-hidden />
          ) : (
            <Menu className="size-5" aria-hidden />
          )}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className={cn(
            "fixed inset-x-0 top-14 bottom-0 z-99 flex animate-[menuIn_200ms_cubic-bezier(0.4,0,0.2,1)_both] flex-col justify-between overflow-y-auto bg-ink-950 pt-6 pb-[max(24px,env(safe-area-inset-bottom))] motion-reduce:animate-none md:hidden",
            GUTTER
          )}
        >
          <ul className="m-0 flex list-none flex-col border-t border-white/10 p-0">
            {LINKS.map((l) => {
              const active = isActive(l.match)
              return (
                <li key={l.href} className="border-b border-white/10">
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-baseline gap-4 py-5 text-[2rem] leading-none font-semibold tracking-[-0.04em]",
                      active ? "text-white" : "text-ink-300"
                    )}
                  >
                    <span className="font-mono text-[13px] font-normal tracking-normal text-ink-500">
                      {l.num}
                    </span>
                    {l.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <Link
            href="/#lista"
            onClick={() => setOpen(false)}
            className="mt-10 inline-flex h-[52px] items-center justify-center gap-2.5 rounded-lg border border-white/18 bg-ink-800 px-[22px] text-base font-medium text-white"
          >
            Sumarme a la lista de espera
            <ArrowIcon stroke="#C6F24A" />
          </Link>
        </div>
      )}
    </>
  )
}
