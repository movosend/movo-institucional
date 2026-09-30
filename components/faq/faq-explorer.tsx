"use client"

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import {
  BookOpen,
  Car,
  Check,
  Code,
  Link2,
  MapPin,
  Package,
  QrCode,
  ScanFace,
  Search,
  Send,
  ShieldCheck,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { prefersReducedMotion } from "@/lib/use-gsap"
import type { FaqSection, GlossaryTerm } from "@/content/faq"
import { FaqItem } from "@/components/faq/faq-item"
import { Answer, Highlight, matches, tokenize } from "@/components/faq/search"
import { Eyebrow, GUTTER } from "@/components/site/primitives"

const SUGGESTIONS = ["pago", "identidad", "QR", "cancelar", "datos"]

/** Ícono de cada sección en el índice. */
const ICONS: Record<string, LucideIcon> = {
  proyecto: Package,
  identidad: ScanFace,
  enviar: Send,
  transportar: Car,
  handshake: QrCode,
  seguimiento: MapPin,
  dinero: Wallet,
  privacidad: ShieldCheck,
  equipo: Users,
  tecnologia: Code,
  glosario: BookOpen,
}

export function FaqExplorer({
  sections,
  glossary,
}: {
  sections: FaqSection[]
  glossary: GlossaryTerm[]
}) {
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const tokens = useMemo(() => tokenize(deferredQuery), [deferredQuery])
  const searching = tokens.length > 0

  // Navegando se abren a mano; buscando, las coincidencias arrancan abiertas.
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const [prevQuery, setPrevQuery] = useState(deferredQuery)
  if (prevQuery !== deferredQuery) {
    setPrevQuery(deferredQuery)
    setCollapsed(new Set())
  }

  const [active, setActive] = useState(sections[0].id)
  const [copied, setCopied] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingScroll = useRef<string | null>(null)

  const results = useMemo(
    () =>
      sections
        .map((s) => ({
          ...s,
          items: searching
            ? s.items.filter((i) =>
                matches(tokens, i.q, i.a, s.label, s.eyebrow, s.title)
              )
            : s.items,
        }))
        .filter((s) => s.items.length > 0),
    [sections, tokens, searching]
  )
  const terms = useMemo(
    () =>
      searching
        ? glossary.filter((g) => matches(tokens, g.term, g.def))
        : glossary,
    [glossary, tokens, searching]
  )
  const total = results.reduce((n, s) => n + s.items.length, 0)
  const counts = new Map(results.map((s) => [s.id, s.items.length]))

  const isOpen = (id: string) => (searching ? !collapsed.has(id) : open.has(id))

  const toggle = (id: string) => {
    const flip = (set: Set<string>) => {
      const next = new Set(set)
      if (!next.delete(id)) next.add(id)
      return next
    }
    if (searching) setCollapsed(flip)
    else setOpen(flip)
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    })
    history.replaceState(null, "", `#${id}`)
  }

  // Ir a algo que la búsqueda ocultó: se limpia y se scrollea tras el render.
  const goTo = (id: string) => {
    if (document.getElementById(id)) return scrollTo(id)
    pendingScroll.current = id
    setQuery("")
  }

  useEffect(() => {
    if (!pendingScroll.current) return
    const id = pendingScroll.current
    if (!document.getElementById(id)) return
    pendingScroll.current = null
    scrollTo(id)
  })

  // Deep link a una pregunta (/faq#cuando-se-cobra): se abre y se centra.
  useEffect(() => {
    const ids = new Set(sections.flatMap((s) => s.items.map((i) => i.id)))
    const onHash = () => {
      const id = decodeURIComponent(location.hash.slice(1))
      if (!ids.has(id)) return
      setQuery("")
      setOpen((prev) => new Set(prev).add(id))
      pendingScroll.current = id
    }
    const raf = requestAnimationFrame(onHash)
    window.addEventListener("hashchange", onHash)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("hashchange", onHash)
    }
  }, [sections])

  // "/" enfoca el buscador desde cualquier parte de la página.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (e.key !== "/" || el.isContentEditable) return
      if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Sección activa del índice según lo que está a la vista.
  const visibleIds = results.map((s) => s.id).join(",")
  useEffect(() => {
    const els = [...visibleIds.split(","), "glosario"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: "-30% 0px -65% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [visibleIds])

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/faq#${id}`)
      setCopied(id)
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600)
    } catch {
      // Sin permiso de portapapeles: no hay nada útil para mostrar.
    }
  }

  const index = [
    ...sections.map((s) => ({ id: s.id, label: s.label })),
    { id: "glosario", label: "Glosario" },
  ].map((s) => ({ ...s, Icon: ICONS[s.id] ?? BookOpen }))
  const countFor = (id: string) =>
    id === "glosario" ? terms.length : (counts.get(id) ?? 0)

  return (
    <div className="bg-ink-950 text-white [--faq-offset:13.5rem] lg:[--faq-offset:10rem]">
      {/* Buscador fijo bajo la navbar */}
      <div
        className={cn(
          "sticky top-14 z-40 border-b border-white/10 bg-ink-950/95 py-4 backdrop-blur",
          GUTTER
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-6">
          <div className="relative w-full max-w-[720px]">
            <label htmlFor="faq-search" className="sr-only">
              Buscar en las preguntas frecuentes
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-400"
            />
            <input
              ref={inputRef}
              id="faq-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              placeholder="Buscá: pago, identidad, QR…"
              autoComplete="off"
              spellCheck={false}
              className="h-14 w-full rounded-lg border border-white/15 bg-ink-900 pr-14 pl-12 text-lg text-white outline-none placeholder:text-ink-500 focus:border-white/45 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  inputRef.current?.focus()
                }}
                aria-label="Borrar búsqueda"
                className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-ink-300 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute top-1/2 right-4 flex size-6 -translate-y-1/2 items-center justify-center rounded border border-white/15 font-mono text-xs text-ink-400 max-md:hidden">
                /
              </kbd>
            )}
          </div>
          <p
            aria-live="polite"
            className="m-0 shrink-0 font-mono text-[13px] text-ink-400 max-sm:hidden"
          >
            {searching
              ? `${total} ${total === 1 ? "resultado" : "resultados"}`
              : `${total} preguntas`}
          </p>
        </div>

        {/* Índice en mobile: chips con scroll horizontal */}
        <nav
          aria-label="Secciones"
          className="-mx-[clamp(16px,3vw,40px)] mt-3 [scrollbar-width:none] overflow-x-auto px-[clamp(16px,3vw,40px)] lg:hidden"
        >
          <div className="flex w-max gap-2">
            {index.map((s) => {
              const n = countFor(s.id)
              if (searching && n === 0) return null
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    goTo(s.id)
                  }}
                  className={cn(
                    "flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap",
                    active === s.id
                      ? "border-white bg-white text-ink-950"
                      : "border-white/20 text-ink-300"
                  )}
                >
                  <s.Icon className="size-3.5 shrink-0" aria-hidden />
                  {s.label}
                  {searching && (
                    <span className="font-mono text-xs opacity-60">{n}</span>
                  )}
                </a>
              )
            })}
          </div>
        </nav>
      </div>

      <div
        className={cn(
          "mx-auto grid max-w-[1400px] gap-16 pt-14 pb-[120px] lg:grid-cols-[200px_minmax(0,1fr)]",
          GUTTER
        )}
      >
        {/* Índice en escritorio */}
        <nav aria-label="Secciones" className="max-lg:hidden">
          <ol className="sticky top-[176px] m-0 flex list-none flex-col gap-0.5 p-0">
            {index.map((s) => {
              const n = countFor(s.id)
              const empty = searching && n === 0
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? "true" : undefined}
                    aria-disabled={empty || undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!empty) goTo(s.id)
                    }}
                    className={cn(
                      "grid grid-cols-[28px_1fr_auto] items-center border-l-2 py-2 pl-3 text-[15px] transition-colors duration-[120ms]",
                      active === s.id
                        ? "border-white font-medium text-white"
                        : "border-white/10 text-ink-400 hover:text-white",
                      empty && "pointer-events-none opacity-35"
                    )}
                  >
                    <s.Icon className="size-4 opacity-70" aria-hidden />
                    {s.label}
                    {searching && (
                      <span className="font-mono text-xs opacity-60">{n}</span>
                    )}
                  </a>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="flex min-w-0 flex-col gap-20">
          {results.map((s) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-titulo`}
              className="scroll-mt-[var(--faq-offset)]"
            >
              <Eyebrow>{s.eyebrow}</Eyebrow>
              <h2
                id={`${s.id}-titulo`}
                className="mt-3 mb-8 text-[clamp(28px,3.4vw,48px)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance"
              >
                {s.title}
              </h2>
              <div className="border-t-[1.5px] border-white/12">
                {s.items.map((item, i) => (
                  <FaqItem
                    key={item.id}
                    id={item.id}
                    index={i}
                    tone="dark"
                    question={<Highlight text={item.q} tokens={tokens} />}
                    open={isOpen(item.id)}
                    onToggle={() => toggle(item.id)}
                  >
                    <p className="m-0 max-w-[62ch] text-lg leading-normal text-pretty">
                      <Answer
                        text={item.a}
                        tokens={tokens}
                        glossary={glossary}
                        onTerm={(id) => goTo(`glosario-${id}`)}
                      />
                    </p>
                    <button
                      type="button"
                      onClick={() => copyLink(item.id)}
                      className="mt-4 inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs text-ink-500 hover:text-white"
                    >
                      {copied === item.id ? (
                        <Check className="size-3.5" aria-hidden />
                      ) : (
                        <Link2 className="size-3.5" aria-hidden />
                      )}
                      {copied === item.id ? "Link copiado" : "Copiar link"}
                    </button>
                  </FaqItem>
                ))}
              </div>
            </section>
          ))}

          {searching && total === 0 && terms.length === 0 && (
            <div className="rounded-lg border border-white/12 p-[clamp(24px,4vw,48px)]">
              <p className="m-0 text-[clamp(22px,2.4vw,32px)] font-semibold tracking-[-0.03em]">
                No encontramos nada para «{deferredQuery.trim()}».
              </p>
              <p className="mt-3 mb-6 text-lg text-ink-300">
                Probá con otras palabras:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="h-10 cursor-pointer rounded-full border border-white/20 px-4 text-[15px] text-ink-200 hover:border-white hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {terms.length > 0 && (
            <section
              id="glosario"
              aria-labelledby="glosario-titulo"
              className="scroll-mt-[var(--faq-offset)]"
            >
              <Eyebrow>Para consultar rápido</Eyebrow>
              <h2
                id="glosario-titulo"
                className="mt-3 mb-8 text-[clamp(28px,3.4vw,48px)] leading-[1.05] font-semibold tracking-[-0.04em]"
              >
                Glosario
              </h2>
              <dl className="m-0 grid gap-x-12 md:grid-cols-2">
                {terms.map((g) => (
                  <div
                    key={g.id}
                    id={`glosario-${g.id}`}
                    className="scroll-mt-[var(--faq-offset)] border-t border-white/12 py-6 target:border-white"
                  >
                    <dt className="text-xl font-semibold tracking-[-0.02em]">
                      <Highlight text={g.term} tokens={tokens} />
                    </dt>
                    <dd className="mt-2 ml-0 text-[17px] leading-normal text-pretty text-ink-300">
                      <Highlight text={g.def} tokens={tokens} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
