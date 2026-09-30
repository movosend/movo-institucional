import fs from "fs"
import path from "path"
import { marked, type Tokens } from "marked"

const LEGAL_DIR = path.join(process.cwd(), "public", "legal")

const INTERNAL_LINKS: Record<string, string> = {
  "./terminos-y-condiciones.md": "/terminos-y-condiciones",
  "./politica-privacidad.md": "/politica-de-privacidad",
}

export type LegalDocument = {
  title: string
  meta: string
  toc: { text: string; href: string }[]
  html: string
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

const renderer = new marked.Renderer()
renderer.heading = ({ tokens, depth, text }: Tokens.Heading) => {
  const id = slugify(text)
  const content = renderer.parser!.parseInline(tokens)
  return `<h${depth} id="${id}">${content}</h${depth}>\n`
}

/**
 * Lee un documento legal en markdown y lo prepara para la página de Legales:
 * extrae título, metadatos (versión y fecha) y el índice lateral, y quita el
 * índice escrito a mano porque lo reemplaza la barra lateral.
 */
export function loadLegalDocument(fileName: string): LegalDocument {
  const md = fs.readFileSync(path.join(LEGAL_DIR, fileName), "utf-8")

  const title = (md.match(/^#\s+(.+)$/m)?.[1] ?? "").replace(
    / de MOVO| de Movo/i,
    ""
  )
  const upd = md.match(/\*\*Última actualización\*\*:\s*(.+)/)?.[1] ?? ""
  const ver = md.match(/\*\*Versión\*\*:\s*(.+)/)?.[1] ?? ""
  const meta = [upd && `Última actualización: ${upd}`, ver && `Versión ${ver}`]
    .filter(Boolean)
    .join(" · ")

  const body = md
    .replace(/^#\s+.+$/m, "")
    .replace(/^\*\*(Versión|Última actualización|Vigencia)\*\*:.*$/gm, "")
    .replace(/⚠️\s*/g, "")
    .replace(/^##\s+.*índice.*\n(?:[ \t]*\n|[ \t]*(?:\d+\.|[-*])\s.*\n)*/im, "")
    .replace(
      /\]\((\.\/(?:terminos-y-condiciones|politica-privacidad)\.md)\)/g,
      (match, href: string) => `](${INTERNAL_LINKS[href] ?? href})`
    )

  const toc = [...body.matchAll(/^##\s+(.+)$/gm)]
    .map((m) => m[1].trim())
    .filter((t) => !/índice/i.test(t) && !/aviso/i.test(t))
    .map((text) => ({ text, href: `#${slugify(text)}` }))

  return {
    title,
    meta,
    toc,
    html: marked.parse(body, { async: false, renderer }),
  }
}
