import type { GlossaryTerm } from "@/content/faq"

/** Minúsculas y sin tildes, para que "envio" encuentre "envío". */
function foldChar(ch: string) {
  return ch
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

export function fold(text: string) {
  return Array.from(text, foldChar).join("")
}

/**
 * Palabras de la búsqueda. Las de 4+ letras pierden la última, así "pago"
 * encuentra "pagar" y "envios" encuentra "envío".
 */
export function tokenize(query: string) {
  return fold(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (t.length >= 4 ? t.slice(0, -1) : t))
}

/** Todas las palabras de la búsqueda aparecen en alguno de los textos. */
export function matches(tokens: string[], ...texts: string[]) {
  const hay = fold(texts.join(" "))
  return tokens.every((t) => hay.includes(t))
}

/** Rangos [inicio, fin) en `text` donde aparece alguna de las palabras. */
function findRanges(text: string, tokens: string[]) {
  // Texto plegado + índice original de cada caracter plegado.
  let folded = ""
  const origin: number[] = []
  Array.from(text).forEach((ch, i) => {
    for (const f of foldChar(ch)) {
      folded += f
      origin.push(i)
    }
  })
  const chars = Array.from(text)
  const ranges: [number, number][] = []
  for (const t of tokens) {
    let from = folded.indexOf(t)
    while (from !== -1) {
      // El resaltado llega hasta el final de la palabra ("pag" → "pagar").
      let end = origin[from + t.length - 1] + 1
      while (end < chars.length && /\p{L}/u.test(chars[end])) end++
      ranges.push([origin[from], end])
      from = folded.indexOf(t, from + t.length)
    }
  }
  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const r of ranges) {
    const last = merged.at(-1)
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([...r])
  }
  return { chars, merged }
}

export function Highlight({
  text,
  tokens,
}: {
  text: string
  tokens: string[]
}) {
  if (!tokens.length) return text
  const { chars, merged } = findRanges(text, tokens)
  if (!merged.length) return text
  const out: React.ReactNode[] = []
  let cursor = 0
  merged.forEach(([start, end]) => {
    if (start > cursor) out.push(chars.slice(cursor, start).join(""))
    out.push(
      <mark
        key={start}
        className="rounded-[3px] bg-lime-500 px-0.5 text-ink-950"
      >
        {chars.slice(start, end).join("")}
      </mark>
    )
    cursor = end
  })
  if (cursor < chars.length) out.push(chars.slice(cursor).join(""))
  return out
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Respuesta con la primera aparición de cada término del glosario enlazada a
 * su definición, y las coincidencias de la búsqueda resaltadas.
 */
export function Answer({
  text,
  tokens,
  glossary,
  onTerm,
}: {
  text: string
  tokens: string[]
  glossary: GlossaryTerm[]
  onTerm: (id: string) => void
}) {
  const hits: { start: number; end: number; id: string }[] = []
  for (const g of glossary) {
    for (const alias of g.aliases) {
      const m = new RegExp(
        `(?<![\\p{L}])${escapeRe(alias)}(?![\\p{L}])`,
        "iu"
      ).exec(text)
      if (m) {
        hits.push({ start: m.index, end: m.index + m[0].length, id: g.id })
        break
      }
    }
  }
  hits.sort((a, b) => a.start - b.start)

  const out: React.ReactNode[] = []
  let cursor = 0
  for (const h of hits) {
    if (h.start < cursor) continue
    out.push(
      <Highlight
        key={`t${cursor}`}
        text={text.slice(cursor, h.start)}
        tokens={tokens}
      />
    )
    out.push(
      <a
        key={h.id}
        href={`#glosario-${h.id}`}
        onClick={(e) => {
          e.preventDefault()
          onTerm(h.id)
        }}
        className="underline decoration-ink-500 decoration-dotted underline-offset-4 hover:text-white hover:decoration-white"
      >
        <Highlight text={text.slice(h.start, h.end)} tokens={tokens} />
      </a>
    )
    cursor = h.end
  }
  out.push(<Highlight key="rest" text={text.slice(cursor)} tokens={tokens} />)
  return out
}
