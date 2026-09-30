"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { cn } from "@/lib/utils"
import { gsap, pageZoom, useGsap } from "@/lib/use-gsap"

const VIDEO_ID = "YckhECkDyuM"
const BIG_TEXT =
  "text-[clamp(2.4rem,6vw,6.5rem)] leading-none font-semibold tracking-[-0.05em] md:absolute md:top-1/2 md:-translate-y-1/2"

const FINE_POINTER = "(hover: hover) and (pointer: fine)"
function subscribeFinePointer(cb: () => void) {
  const mq = window.matchMedia(FINE_POINTER)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

export function Film() {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  // En táctiles el video se reproduce dentro de la tarjeta al tocar play.
  const [inline, setInline] = useState(false)

  // El video de fondo solo en dispositivos con mouse: en iOS el autoplay
  // puede bloquearse y deja un botón de play de YouTube que no se puede tocar.
  const bgVideo = useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false
  )

  useGsap(ref, (reduce) => {
    // Tamaño de pantalla completa en px CSS, compensando el zoom de página.
    const fullW = () => window.innerWidth / pageZoom()
    const fullH = () => window.innerHeight / pageZoom()
    // En mobile la tarjeta mantiene 16:9 y crece hasta el ancho completo.
    const mobileH = () => fullW() * 0.5625
    const mm = gsap.matchMedia()

    mm.add(
      { desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" },
      (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean }
        const endSize = {
          width: fullW,
          height: desktop ? fullH : mobileH,
          borderRadius: 0,
        }
        if (reduce) {
          gsap.set("[data-vcard]", endSize)
          gsap.set(["[data-vleft]", "[data-vright]"], { opacity: 0 })
          gsap.set("[data-vbtn]", {
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
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            "[data-vcard]",
            desktop
              ? { width: "30vw", height: "16.9vw", borderRadius: 14 }
              : { width: "72vw", height: "40.5vw", borderRadius: 14 },
            { ...endSize, ease: "power2.inOut", duration: 1 },
            0
          )
          .to(
            "[data-vleft]",
            desktop
              ? { xPercent: -140, opacity: 0, ease: "power2.in", duration: 0.6 }
              : { yPercent: -80, opacity: 0, ease: "power2.in", duration: 0.6 },
            0
          )
          .to(
            "[data-vright]",
            desktop
              ? { xPercent: 140, opacity: 0, ease: "power2.in", duration: 0.6 }
              : { yPercent: 80, opacity: 0, ease: "power2.in", duration: 0.6 },
            0
          )
          .to(
            "[data-vbtn]",
            { opacity: 1, pointerEvents: "auto", duration: 0.15 },
            0.8
          )
      }
    )
    return () => mm.revert()
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <section
        ref={ref}
        id="film"
        className="relative h-[calc(var(--screen-h)*2)] md:h-[calc(var(--screen-h)*3)]"
      >
        <div className="sticky top-0 flex h-[var(--screen-h)] flex-col items-center justify-center gap-5 overflow-hidden md:flex-row md:gap-0">
          <div
            data-vleft=""
            className={`${BIG_TEXT} md:left-[clamp(20px,4vw,64px)]`}
          >
            Movo está
          </div>
          <div
            data-vright=""
            className={`${BIG_TEXT} order-last md:right-[clamp(20px,4vw,64px)] md:order-none md:text-right`}
          >
            en camino
          </div>
          <div
            data-vcard=""
            className="relative h-[40.5vw] w-[72vw] shrink-0 overflow-hidden rounded-[14px] bg-ink-900 bg-cover bg-center bg-no-repeat shadow-[0_30px_80px_rgba(0,0,0,.5)] md:h-[16.9vw] md:w-[30vw]"
            style={{
              backgroundImage: `url(https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg)`,
            }}
          >
            {bgVideo && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&modestbranding=1&playsinline=1&rel=0`}
                allow="autoplay; encrypted-media"
                title="Film de lanzamiento de Movo"
                tabIndex={-1}
                className="pointer-events-none absolute top-1/2 left-1/2 h-[max(100%,calc(var(--screen-w)*.5625))] w-[max(100%,calc(var(--screen-h)*1.7778))] min-w-full -translate-1/2 border-0"
              />
            )}
            {inline ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&controls=1&modestbranding=1&playsinline=1&rel=0`}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title="Film de lanzamiento de Movo"
                className="absolute inset-0 z-10 size-full border-0"
              />
            ) : (
              !bgVideo && (
                <button
                  type="button"
                  onClick={() => setInline(true)}
                  aria-label="Reproducir el film"
                  className="absolute top-1/2 left-1/2 z-10 flex size-16 -translate-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-lime-500 text-ink-950 shadow-[0_10px_30px_rgba(0,0,0,.4)] active:scale-[.96] [@media(hover:hover)_and_(pointer:fine)]:hidden"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="ml-1 size-6"
                    aria-hidden
                  >
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                </button>
              )
            )}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,11,.78)_0%,rgba(10,10,11,0)_45%)]" />
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 flex items-end justify-end gap-4 p-[clamp(14px,2vw,32px)]",
                // En táctiles se usa el play central.
                !bgVideo && "hidden"
              )}
            >
              <button
                data-vbtn=""
                type="button"
                onClick={() => setOpen(true)}
                className="pointer-events-none flex h-11 shrink-0 cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-lime-500 pr-4 pl-3.5 text-sm font-semibold text-ink-950 opacity-0 hover:bg-lime-400 active:scale-[.98] md:h-[52px] md:pr-5 md:pl-4 md:text-base"
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
          <div className="relative aspect-video w-[min(100%,calc((var(--screen-h)-140px)*1.778))] overflow-hidden rounded-[14px] bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
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
