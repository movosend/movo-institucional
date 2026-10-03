/**
 * Emoji que acompaña el nombre de cada jugador en la TV y en su celular, para que se
 * encuentre rápido entre muchos nombres. Excepción pedida para la trivia a la regla de
 * "sin emoji" del design system. Solo animales, comida y objetos: sin caras, manos ni
 * tonos de piel.
 */
// prettier-ignore
export const PLAYER_EMOJIS = [
  "🦊", "🐼", "🐸", "🦁", "🐯", "🐨", "🐵", "🦉", "🐙", "🦄",
  "🐝", "🐢", "🐬", "🦋", "🐧", "🦀", "🐳", "🦒", "🦓", "🐘",
  "🦔", "🦦", "🦥", "🐞", "🦜", "🐿️", "🌵", "🌻", "🍉", "🍍",
  "🥑", "🌮", "🍩", "🧉", "🍕", "⚽", "🎸", "🚀", "🎈", "🎲",
  "🧩", "⭐", "🔥", "🌈", "🍀", "🏀", "🎧", "📦",
]

/** Uno al azar que no esté usando nadie de la sala (si están todos, cualquiera). */
export function pickEmoji(taken: Iterable<string | null | undefined>): string {
  const used = new Set(taken)
  const free = PLAYER_EMOJIS.filter((e) => !used.has(e))
  const pool = free.length ? free : PLAYER_EMOJIS
  return pool[Math.floor(Math.random() * pool.length)]
}

/** "🦊 Juli" */
export const withEmoji = (name: string, emoji?: string | null) =>
  emoji ? `${emoji} ${name}` : name
