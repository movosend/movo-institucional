import type { CSSProperties } from "react"

/**
 * Convierte un `style="..."` del prototipo de Claude Design a un objeto de estilo de
 * React, para copiar los estilos tal cual (sin reinterpretarlos con utilidades de
 * Tailwind) y poder compararlos línea a línea con el diseño. Cacheado por string: los
 * estilos estáticos se parsean una sola vez.
 */
const cache = new Map<string, CSSProperties>()

const toCamel = (prop: string) =>
  prop
    .trim()
    .replace(
      /^-(webkit|moz|ms)-/,
      (_, vendor: string) => vendor[0].toUpperCase() + vendor.slice(1) + "-"
    )
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

export function css(source: string): CSSProperties {
  const hit = cache.get(source)
  if (hit) return hit
  const style: Record<string, string> = {}
  for (const decl of source.split(";")) {
    const i = decl.indexOf(":")
    if (i === -1) continue
    const prop = decl.slice(0, i).trim()
    const value = decl.slice(i + 1).trim()
    if (prop && value) style[toCamel(prop)] = value
  }
  if (cache.size < 2000) cache.set(source, style)
  return style as CSSProperties
}
