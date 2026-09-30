"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { gsap, useGsap } from "@/lib/use-gsap"

export function Footer() {
  const pathname = usePathname()
  const ref = useRef<HTMLElement>(null)

  useGsap(
    ref,
    (reduce) => {
      if (reduce) return
      gsap.from("[data-wordmark]", {
        yPercent: 40,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-wordmark]",
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      })
    },
    [pathname]
  )

  return (
    <footer
      ref={ref}
      className={cn(
        "overflow-hidden bg-ink-950 px-[clamp(20px,4vw,64px)] pt-12",
        pathname.startsWith("/el-proyecto") && "border-t border-white/10"
      )}
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-6 text-[15px] text-ink-300">
        <div className="flex flex-wrap gap-6">
          <Link href="/politica-de-privacidad" className="hover:opacity-85">
            Política de privacidad
          </Link>
          <Link href="/terminos-y-condiciones" className="hover:opacity-85">
            Términos y condiciones
          </Link>
          <a href="https://github.com/movosend" className="hover:opacity-85">
            GitHub
          </a>
          <a href="https://instagram.com/movosend" className="hover:opacity-85">
            Instagram
          </a>
        </div>
        <span>© 2026 Movo</span>
      </div>
      <div
        data-wordmark=""
        aria-hidden
        className="mx-[-0.04em] mt-10 text-center text-[clamp(8rem,31vw,34rem)] leading-[.74] font-semibold tracking-[-0.075em] text-ink-800 select-none"
      >
        movo
      </div>
    </footer>
  )
}
