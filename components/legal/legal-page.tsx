import Link from "next/link"

import { cn } from "@/lib/utils"
import { loadLegalDocument } from "@/content/legal/render"

const DOCS = {
  terminos: {
    file: "terminos-y-condiciones.md",
    href: "/terminos-y-condiciones",
    label: "Términos",
    fallback: "Términos y condiciones",
  },
  privacidad: {
    file: "politica-privacidad.md",
    href: "/politica-de-privacidad",
    label: "Privacidad",
    fallback: "Política de privacidad",
  },
} as const

export function LegalPage({ doc }: { doc: keyof typeof DOCS }) {
  const current = DOCS[doc]
  const { title, meta, toc, html } = loadLegalDocument(current.file)

  return (
    <div className="min-h-screen bg-lime-500 text-ink-950 selection:bg-ink-950 selection:text-lime-500">
      <header className="mx-auto max-w-[1200px] px-[clamp(20px,4vw,48px)] pt-[calc(56px+clamp(80px,14vh,160px))] pb-14">
        <div className="mb-8 flex gap-1.5">
          {Object.entries(DOCS).map(([key, d]) => (
            <Link
              key={key}
              href={d.href}
              aria-current={key === doc ? "page" : undefined}
              className={cn(
                "flex h-11 items-center rounded-md px-4 text-[15px] font-medium",
                key === doc
                  ? "bg-ink-950 text-white"
                  : "bg-white/55 text-ink-950 hover:bg-white/75"
              )}
            >
              {d.label}
            </Link>
          ))}
        </div>
        <div className="mb-4 font-mono text-sm">Movo · Documento legal</div>
        <h1 className="m-0 text-[clamp(3rem,8vw,7.5rem)] leading-[.9] font-semibold tracking-[-0.06em] text-balance">
          {title || current.fallback}
        </h1>
        {meta && <div className="mt-6 text-lg font-medium">{meta}</div>}
      </header>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-[clamp(24px,5vw,72px)] px-[clamp(20px,4vw,48px)] pb-[120px] md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <aside className="flex flex-col gap-0.5 overflow-auto border-t-[1.5px] border-ink-950 pt-3 md:sticky md:top-20 md:max-h-[calc(var(--screen-h)-110px)]">
          <span className="mb-2 font-mono text-xs tracking-[.08em] uppercase">
            Índice
          </span>
          {toc.map((h) => (
            <a
              key={h.href}
              href={h.href}
              className="py-1.5 text-sm leading-[1.35] hover:underline"
            >
              {h.text}
            </a>
          ))}
        </aside>
        <article
          className="legal-doc max-w-[720px] min-w-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
