"use client"

import { useEffect, useRef, useState } from "react"

import { gsap, useGsap } from "@/lib/use-gsap"

const VIDEO_ID = "YckhECkDyuM"
const BIG_TEXT =
  "absolute top-1/2 -translate-y-1/2 text-[clamp(2.4rem,6vw,6.5rem)] leading-none font-semibold tracking-[-0.05em]"

export function Film() {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)

  useGsap(ref, (reduce) => {
    if (reduce) {
      gsap.set("[data-vcard]", {
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
      })
      gsap.set(["[data-vleft]", "[data-vright]"], { opacity: 0 })
      gsap.set(["[data-vcap]", "[data-vbtn]"], {
        opacity: 1,
        pointerEvents: "auto",
      })
      return
    }
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      })
      .fromTo(
        "[data-vcard]",
        { width: "30vw", height: "16.9vw", borderRadius: 14 },
        {
          width: "100vw",
          height: "100vh",
          borderRadius: 0,
          ease: "power2.inOut",
          duration: 1,
        },
        0
      )
      .to(
        "[data-vleft]",
        { xPercent: -140, opacity: 0, ease: "power2.in", duration: 0.6 },
        0
      )
      .to(
        "[data-vright]",
        { xPercent: 140, opacity: 0, ease: "power2.in", duration: 0.6 },
        0
      )
      .to("[data-vcap]", { opacity: 1, duration: 0.2 }, 0.8)
      .to(
        "[data-vbtn]",
        { opacity: 1, pointerEvents: "auto", duration: 0.15 },
        0.8
      )
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <section ref={ref} id="film" className="relative h-[300vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          <div
            data-vleft=""
            className={`${BIG_TEXT} left-[clamp(20px,4vw,64px)]`}
          >
            Movo está
          </div>
          <div
            data-vright=""
            className={`${BIG_TEXT} right-[clamp(20px,4vw,64px)] text-right`}
          >
            en camino
          </div>
          <div
            data-vcard=""
            className="relative h-[16.9vw] w-[30vw] overflow-hidden rounded-[14px] bg-ink-900 bg-cover bg-center bg-no-repeat shadow-[0_30px_80px_rgba(0,0,0,.5)]"
            style={{
              backgroundImage: `url(https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg)`,
            }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&modestbranding=1&playsinline=1&rel=0`}
              allow="autoplay; encrypted-media"
              title="Film de lanzamiento de Movo"
              tabIndex={-1}
              className="pointer-events-none absolute top-1/2 left-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78vh)] min-w-full -translate-1/2 border-0"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,11,.78)_0%,rgba(10,10,11,0)_45%)]" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-[clamp(14px,2vw,32px)]">
              <div data-vcap="" className="flex flex-col gap-1.5 opacity-0">
                <span className="font-mono text-xs tracking-[.08em] text-lime-500 uppercase">
                  Film de lanzamiento
                </span>
              </div>
              <button
                data-vbtn=""
                type="button"
                onClick={() => setOpen(true)}
                className="pointer-events-none flex h-[52px] shrink-0 cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-lime-500 pr-5 pl-4 text-base font-semibold text-ink-950 opacity-0 hover:bg-lime-400 active:scale-[.98]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-[18px]"
                  aria-hidden
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
                Ver con sonido
              </button>
            </div>
          </div>
        </div>
      </section>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Film de lanzamiento de Movo"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-300 flex items-center justify-center bg-ink-950/94 p-[clamp(16px,4vw,64px)]"
        >
          <div className="relative aspect-video w-[min(100%,calc((100vh-140px)*1.778))] overflow-hidden rounded-[14px] bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title="Film de lanzamiento de Movo"
              className="absolute inset-0 size-full border-0"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
            className="absolute top-4 right-4 h-12 cursor-pointer rounded-lg border border-white/20 bg-ink-800 px-[18px] text-[15px] font-medium text-white"
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  )
}
