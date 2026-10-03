/** `?stand=feria-utn-2026`: identifica el evento/kiosco en las métricas. Mismo formato que valida el backend. */
const EVENT_TAG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

export function parseEventTag(
  value: string | string[] | undefined
): string | undefined {
  const tag = Array.isArray(value) ? value[0] : value
  return tag && EVENT_TAG_RE.test(tag) ? tag : undefined
}

export function withStand(href: string, eventTag?: string) {
  return eventTag ? `${href}?stand=${encodeURIComponent(eventTag)}` : href
}
