"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { gsap, pageZoom, useGsap } from "@/lib/use-gsap"
import {
  ArrowIcon,
  Em,
  Eyebrow,
  GUTTER,
  IndexChip,
  MaskLine,
  SECTION_Y,
  TickerBar,
} from "@/components/site/primitives"

const pad = (i: number) => String(i + 1).padStart(2, "0")
const H2_SPLIT =
  "m-0 text-[clamp(2.6rem,5.4vw,5.5rem)] leading-[.92] font-semibold tracking-[-0.055em]"
const H2 =
  "m-0 text-[clamp(2.4rem,5vw,5rem)] leading-[.95] font-semibold tracking-[-0.05em] text-balance"
const BODY = "flex flex-col gap-4 text-[17px] leading-[1.6] text-ink-300"

/** Cuenta desde 0 los elementos `[data-count]` al entrar en viewport. */
function animateCounts(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const n = parseFloat(el.dataset.count ?? "")
    if (!n) return
    const o = { v: 0 }
    gsap.to(o, {
      v: n,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
      onUpdate: () => {
        el.textContent = String(Math.round(o.v))
      },
    })
  })
}

/* ─── 01 · La motivación ─────────────────────────────────────── */

const MOTIVATION = [
  "En Argentina, la logística del último kilómetro es cara, lenta e informal. Miles de personas viajan todos los días entre ciudades con lugar libre en sus vehículos.",
  "Esa capacidad ociosa existe. Simplemente no hay una plataforma confiable para activarla.",
  "Movo nació como respuesta: una red donde cualquiera puede llevar un paquete en su próximo viaje, y cualquiera puede enviarlo con alguien que ya va.",
]

export function Motivation() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, (reduce) => {
    if (reduce) return void gsap.set("[data-w]", { opacity: 1 })
    gsap.to("[data-w]", {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-read]",
        start: "top 80%",
        end: "bottom 65%",
        scrub: 0.4,
      },
    })
  })

  return (
    <section ref={ref} className={cn("relative bg-ink-950", SECTION_Y, GUTTER)}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,6vw,96px)]">
        <div className="sticky top-24 flex flex-col gap-5">
          <Eyebrow>01 · La motivación</Eyebrow>
          <h2 className={H2_SPLIT}>
            Una observación simple.
            <br />
            <span className="text-ink-500">Una solución compleja.</span>
          </h2>
        </div>
        <div data-read="" className="flex flex-col gap-7 pt-2">
          {MOTIVATION.map((p) => (
            <p
              key={p}
              className="m-0 text-[clamp(20px,1.9vw,26px)] leading-[1.4] font-medium tracking-[-0.02em] text-pretty"
            >
              {p.split(" ").map((w, i) => (
                <span key={i} data-w="" className="opacity-40">
                  {w}{" "}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── 02 · Disciplinas ───────────────────────────────────────── */

const DISCIPLINES = [
  {
    title: "Arquitectura de sistemas",
    desc: "Diseño de APIs, servicios distribuidos y decisiones que sostienen la confiabilidad y la escala.",
    icon: ["M12 2 2 7l10 5 10-5-10-5z", "m2 17 10 5 10-5", "m2 12 10 5 10-5"],
  },
  {
    title: "Seguridad de la información",
    desc: "KYC biométrico, criptografía aplicada y contratos verificados entre partes que no se conocen.",
    icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  },
  {
    title: "Diseño de producto",
    desc: "Investigación, sistema de diseño, prototipado iterativo y validación con usuarios reales.",
    icon: [
      "M22 12a10 10 0 1 1-20 0a10 10 0 1 1 20 0",
      "M8 14s1.5 2 4 2 4-2 4-2",
      "M9 9h.01",
      "M15 9h.01",
    ],
  },
  {
    title: "Infraestructura y DevOps",
    desc: "Deploy en cloud, integración continua, observabilidad y alta disponibilidad en producción.",
    icon: [
      "M4 2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z",
      "M4 14h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z",
      "M6 6h.01",
      "M6 18h.01",
    ],
  },
  {
    title: "Gestión de proyectos",
    desc: "Metodologías ágiles, documentación técnica, gestión del alcance y coordinación bajo restricciones reales.",
    icon: [
      "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      "M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z",
      "M9 12h6",
      "M9 16h3",
    ],
  },
  {
    title: "Investigación aplicada",
    desc: "Análisis de mercado, marcos regulatorios de logística, benchmarking y validación de hipótesis.",
    icon: ["M19 11a8 8 0 1 1-16 0a8 8 0 1 1 16 0", "m21 21-4.35-4.35"],
  },
]

export function Disciplines() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, (reduce) => {
    if (reduce) return
    gsap.from("[data-dcell]", {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power3.out",
      stagger: { each: 0.08, grid: "auto", from: "start" },
      scrollTrigger: { trigger: "[data-disc]", start: "top 80%" },
    })
  })

  return (
    <section
      ref={ref}
      className={cn(
        "relative border-t border-white/10 bg-ink-950",
        SECTION_Y,
        GUTTER
      )}
    >
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[820px] flex-col gap-5">
          <Eyebrow>02 · Más que una app</Eyebrow>
          <h2 className={H2}>Un proyecto que abarca toda la carrera.</h2>
        </div>
        <p className="m-0 max-w-[44ch] text-[17px] leading-[1.55] text-pretty text-ink-300">
          No hay forma de resolver este problema bien sin integrar varias áreas
          de la ingeniería a la vez. Movo no es un ejercicio académico: es un
          sistema real, con restricciones reales.
        </p>
      </div>
      <div
        data-disc=""
        className="grid grid-cols-[repeat(auto-fit,minmax(max(min(100%,320px),calc((100%-2px)/3)),1fr))] gap-px overflow-hidden rounded-md border border-white/12 bg-white/12"
      >
        {DISCIPLINES.map((d, i) => (
          <div
            key={d.title}
            data-dcell=""
            className="relative box-border flex min-h-60 flex-col gap-5 bg-ink-950 p-7 transition-[background] duration-200 hover:bg-ink-900"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-md border border-lime-500/30 bg-ink-800 text-lime-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                  aria-hidden
                >
                  {d.icon.map((p) => (
                    <path key={p} d={p} />
                  ))}
                </svg>
              </span>
              <span className="font-mono text-xs text-ink-500">{pad(i)}</span>
            </div>
            <div className="mt-auto flex flex-col gap-2.5">
              <span className="text-2xl leading-[1.1] font-semibold tracking-[-0.035em]">
                {d.title}
              </span>
              <span className="text-[15px] leading-[1.55] text-pretty text-ink-300">
                {d.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── 03 · La carrera ────────────────────────────────────────── */

const CAREER = [
  {
    big: "5",
    count: "5",
    unit: "años",
    label: "de formación en Ingeniería en Sistemas",
  },
  {
    big: "ISI",
    count: "",
    unit: "UTN FRC",
    label: "Ingeniería en Sistemas de Información",
  },
  {
    big: "PF",
    count: "",
    unit: "2026",
    label: "Proyecto Final: el capstone de la carrera",
  },
]

export function Career() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, (reduce) => {
    if (reduce) return
    animateCounts(ref.current!)
    gsap.from("[data-stat]", {
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: "[data-stat]", start: "top 85%" },
    })
  })

  return (
    <section
      ref={ref}
      className={cn(
        "relative border-t border-white/10 bg-ink-950",
        SECTION_Y,
        GUTTER
      )}
    >
      <div className="mb-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-[clamp(32px,6vw,96px)]">
        <div className="flex flex-col gap-5">
          <Eyebrow>03 · La carrera</Eyebrow>
          <h2 className={H2}>
            Cinco años para aprender a construir lo que importa.
          </h2>
        </div>
        <div className={BODY}>
          <p className="m-0 text-pretty">
            Ingeniería en Sistemas de Información es una carrera de cinco años
            donde aprendimos a pensar como ingenieros: identificar problemas,
            diseñar soluciones, evaluar alternativas y construir sistemas que
            funcionen en el mundo real.
          </p>
          <p className="m-0 text-pretty">
            El PF es el momento en que todo converge: un proyecto integrador que
            articula el conocimiento de toda la carrera en algo concreto, útil y
            sostenible.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] border-t border-white/14">
        {CAREER.map((c) => (
          <div
            key={c.big}
            data-stat=""
            className="flex flex-col gap-4 border-b border-white/14 pt-8 pb-2"
          >
            <span className="flex items-baseline gap-2.5">
              <span
                data-count={c.count}
                className="text-[clamp(5rem,11vw,11rem)] leading-[.8] font-semibold tracking-[-0.07em] text-lime-500"
              >
                {c.big}
              </span>
              <span className="font-mono text-sm text-ink-400">{c.unit}</span>
            </span>
            <span className="max-w-[28ch] text-[17px] leading-[1.45] text-ink-300">
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── El equipo ──────────────────────────────────────────────── */

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

export function Team() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, (reduce) => {
    if (reduce) return
    gsap.from("[data-tline]", {
      yPercent: 105,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ref.current, start: "top 70%" },
    })
    ref
      .current!.querySelectorAll<HTMLElement>("[data-member]")
      .forEach((m, i) => {
        gsap.from(m, {
          opacity: 0,
          duration: 0.9,
          ease: "power1.out",
          delay: i * 0.1,
          scrollTrigger: { trigger: ref.current, start: "top 45%" },
        })
      })
  })

  // Al llegar desde "[03] El equipo" el layout todavía se está asentando:
  // se re-alinea la sección bajo la nav una vez montados los ScrollTriggers.
  useEffect(() => {
    if (location.hash !== "#equipo") return
    const t = setTimeout(() => {
      const el = ref.current
      if (el)
        window.scrollTo(
          0,
          el.getBoundingClientRect().top + window.scrollY - 56 * pageZoom()
        )
    }, 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      ref={ref}
      id="equipo"
      className={cn(
        "relative scroll-mt-14 bg-lime-500 text-ink-950",
        SECTION_Y,
        GUTTER
      )}
    >
      <TickerBar
        dot
        className="mb-10"
        items={["El equipo", "5 desarrolladores", "0 jerarquías", "Grupo 27"]}
      />
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2 className="m-0 text-[clamp(3rem,7.4vw,8rem)] leading-[.9] font-semibold tracking-[-0.06em]">
          <MaskLine attr="data-tline" tight>
            Cinco estudiantes,
          </MaskLine>
          <MaskLine attr="data-tline" tight>
            un solo <Em tracking={false}>equipo.</Em>
          </MaskLine>
        </h2>
        <p className="m-0 max-w-[36ch] text-xl leading-[1.45] font-medium text-pretty">
          Sin jerarquías fijas, sin silos. Un equipo autogestionado donde cada
          integrante es, ante todo, desarrollador.
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-4">
        {MEMBERS.map((m) => (
          <figure key={m.id} data-member="" className="m-0 flex flex-col gap-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] bg-ink-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.photo}
                alt={m.name}
                className="absolute inset-0 block size-full object-cover object-top contrast-[1.05] grayscale"
              />
            </div>
            <figcaption className="flex flex-col gap-1 border-t-[1.5px] border-ink-950 pt-2.5">
              <span className="text-lg leading-[1.15] font-semibold tracking-[-0.025em]">
                {m.name}
              </span>
              <span className="font-mono text-xs font-medium tracking-[.04em]">
                Leg. {m.id}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ─── 04 · Cómo trabajamos ───────────────────────────────────── */

const PRACTICES = [
  {
    label: "Sprints de 2 semanas",
    desc: "Iteraciones cortas con planning, weekly y standup para mantener el ritmo sin burocracia.",
  },
  {
    label: "Code review cruzado",
    desc: "Todo cambio pasa por al menos un integrante distinto al autor antes de mergearse a develop.",
  },
  {
    label: "Retrospectivas al cierre",
    desc: "Al final de cada sprint analizamos qué funcionó y definimos acciones concretas de mejora.",
  },
]

export function Practices() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, (reduce) => {
    if (reduce) return
    gsap.from("[data-prac]", {
      x: -24,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: { trigger: "[data-prac]", start: "top 85%" },
    })
  })

  return (
    <section ref={ref} className={cn("relative bg-ink-950", SECTION_Y, GUTTER)}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,6vw,96px)]">
        <div className="flex flex-col gap-6">
          <Eyebrow>04 · Cómo trabajamos</Eyebrow>
          <h2 className={H2_SPLIT}>
            Un equipo plano,
            <br />
            <span className="text-ink-500">sin jerarquías.</span>
          </h2>
          <div className={cn(BODY, "max-w-[52ch]")}>
            <p className="m-0 text-pretty">
              Los cinco somos desarrolladores. No hay tech lead ni arquitecto
              con autoridad formal: las decisiones técnicas se toman en equipo y
              la responsabilidad es compartida.
            </p>
            <p className="m-0 text-pretty">
              Trabajamos con Scrum adaptado: sprints de dos semanas, ceremonias
              mínimas y un backlog priorizado. El rol de Scrum Master rota cada
              mes para que todos vivamos las dos perspectivas.
            </p>
          </div>
        </div>
        <div className="flex flex-col border-t border-white/14">
          {PRACTICES.map((p, i) => (
            <div
              key={p.label}
              data-prac=""
              className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 border-b border-white/14 py-6"
            >
              <IndexChip>{pad(i)}</IndexChip>
              <div className="flex flex-col gap-1.5">
                <span className="text-[22px] font-semibold tracking-[-0.03em]">
                  {p.label}
                </span>
                <span className="text-base leading-normal text-pretty text-ink-300">
                  {p.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── 05 · Gestión del proyecto ──────────────────────────────── */

const LINEAR = [
  { pre: "+", big: "35", count: "35", label: "User stories iniciales" },
  { pre: "", big: "9", count: "9", label: "Meses de duración estimada" },
  { pre: "", big: "1", count: "", label: "Tablero como fuente de verdad" },
]

export function Management() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, (reduce) => {
    if (!reduce) animateCounts(ref.current!)
  })

  const gridMask =
    "radial-gradient(ellipse 70% 80% at 80% 50%,#000,transparent)"

  return (
    <section
      ref={ref}
      className={cn("relative bg-ink-950 pb-[clamp(80px,12vh,140px)]", GUTTER)}
    >
      <div className="relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] overflow-hidden rounded-md border border-white/12 bg-ink-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.04) 1px,transparent 1px)",
            backgroundSize: "24px 24px",
            WebkitMaskImage: gridMask,
            maskImage: gridMask,
          }}
        />
        <div className="relative flex flex-col gap-5 p-[clamp(28px,4vw,56px)]">
          <Eyebrow>05 · Gestión del proyecto</Eyebrow>
          <h2 className="m-0 text-[clamp(2.2rem,4vw,4rem)] leading-[.95] font-semibold tracking-[-0.05em]">
            Backlog vivo,
            <br />
            <span className="text-ink-500">visibilidad total.</span>
          </h2>
          <p className="m-0 max-w-[48ch] text-[17px] leading-[1.6] text-pretty text-ink-300">
            Usamos Linear para el backlog, los sprints y el seguimiento de
            issues. Cada historia tiene criterios de aceptación, story points y
            un responsable. El tablero es la única fuente de verdad.
          </p>
          <span className="mt-2 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-md bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/linear-logo.webp" alt="" className="w-6" />
            </span>
            <span className="flex flex-col">
              <span className="text-base font-semibold">Linear</span>
              <span className="text-[13px] text-ink-400">
                Project management
              </span>
            </span>
          </span>
        </div>
        <div className="relative grid grid-cols-3 content-center gap-px p-[clamp(28px,4vw,56px)]">
          {LINEAR.map((l) => (
            <div
              key={l.label}
              className="flex flex-col gap-2.5 border-l border-white/12 px-3"
            >
              <span className="flex items-baseline gap-1.5 text-[clamp(2.4rem,4.4vw,4.2rem)] leading-[.9] font-semibold tracking-[-0.06em]">
                <span>{l.pre}</span>
                <span data-count={l.count}>{l.big}</span>
              </span>
              <span className="font-mono text-xs leading-[1.4] tracking-[.04em] text-ink-400">
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Cierre ─────────────────────────────────────────────────── */

const CLOSING =
  "No es solo un producto de software. Es la consolidación de cinco años de ingeniería, en un dominio que nos importa."

export function Closing() {
  const ref = useRef<HTMLElement>(null)

  useGsap(ref, (reduce) => {
    if (reduce) return void gsap.set("[data-w2]", { opacity: 1 })
    gsap.to("[data-w2]", {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-read2]",
        start: "top 80%",
        end: "bottom 55%",
        scrub: 0.4,
      },
    })
  })

  return (
    <section
      ref={ref}
      className={cn(
        "relative border-t border-white/10 bg-ink-950 pt-[clamp(40px,8vh,80px)] pb-[clamp(80px,12vh,140px)]",
        GUTTER
      )}
    >
      <div className="flex max-w-[1100px] flex-col gap-8">
        <Eyebrow>El proyecto</Eyebrow>
        <p
          data-read2=""
          className="m-0 text-[clamp(2rem,4.4vw,4.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance"
        >
          {CLOSING.split(" ").map((w, i) => (
            <span key={i} data-w2="" className="opacity-[.16]">
              {w}{" "}
            </span>
          ))}
        </p>
        <Link
          href="/como-funciona"
          className="inline-flex h-[52px] items-center gap-2.5 self-start rounded-lg bg-lime-500 px-[22px] text-base font-semibold text-ink-950 hover:bg-lime-400"
        >
          Ver cómo funciona el sistema
          <ArrowIcon />
        </Link>
      </div>
    </section>
  )
}
