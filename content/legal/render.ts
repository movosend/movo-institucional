import fs from "fs"
import path from "path"
import { marked, type Tokens } from "marked"

const LEGAL_DIR = path.join(process.cwd(), "public", "legal")

const INTERNAL_LINKS: Record<string, string> = {
  "./terminos-y-condiciones.md": "/terminos-y-condiciones",
  "./politica-privacidad.md": "/politica-de-privacidad",
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

/** Turns each índice line ("N. Section title") into a link to its matching "## N. Section title" heading. */
function linkTableOfContents(raw: string): string {
  const lines = raw.split("\n")

  const headingTexts = new Set<string>()
  for (const line of lines) {
    const match = /^## (.+)$/.exec(line.trim())
    if (match) headingTexts.add(match[1].trim())
  }

  return lines
    .map((line) => {
      const match = /^(\d+\.\s+)(.+)$/.exec(line)
      if (!match) return line
      const [, prefix, title] = match
      const headingText = `${prefix}${title}`.trim()
      if (!headingTexts.has(headingText)) return line
      return `${prefix}[${title}](#${slugify(headingText)})`
    })
    .join("\n")
}

const renderer = new marked.Renderer()
renderer.heading = ({ tokens, depth, text }: Tokens.Heading) => {
  const id = slugify(text)
  const content = renderer.parser!.parseInline(tokens)
  return `<h${depth} id="${id}">${content}</h${depth}>\n`
}

export function renderLegalDocument(fileName: string): string {
  const filePath = path.join(LEGAL_DIR, fileName)
  const raw = fs.readFileSync(filePath, "utf-8")

  const withToc = linkTableOfContents(raw)
  const withResolvedLinks = withToc.replace(
    /\]\((\.\/(?:terminos-y-condiciones|politica-privacidad)\.md)\)/g,
    (match, href) => `](${INTERNAL_LINKS[href] ?? href})`,
  )

  return marked.parse(withResolvedLinks, { async: false, renderer })
}
