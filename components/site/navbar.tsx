"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { GUTTER, LogoMark } from "@/components/site/primitives"

const LINKS = [
  {
    href: "/como-funciona",
    label: "[01] Cómo funciona",
    match: "/como-funciona",
  },
  { href: "/el-proyecto", label: "[02] El proyecto", match: "/el-proyecto" },
  { href: "/el-proyecto#equipo", label: "[03] El equipo", match: null },
  { href: "/blog", label: "[04] Blog", match: "/blog" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-100 flex h-14 items-center justify-between gap-4 border-b border-white/10 bg-ink-950 font-mono text-[13px]",
        GUTTER
      )}
    >
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5 font-sans text-xl font-semibold tracking-[-0.04em] hover:opacity-85"
      >
        <LogoMark />
        movo
      </Link>
      <div className="flex [scrollbar-width:none] gap-1 overflow-x-auto text-ink-300">
        {LINKS.map((l) => {
          const active = l.match !== null && pathname.startsWith(l.match)
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
              {l.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
