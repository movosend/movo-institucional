/**
 * Filtro de nombres para la TV de la trivia: los nombres se ven en grande frente a todo el
 * stand. Normaliza acentos, mayúsculas, números usados como letras (`p3t0`) y letras
 * repetidas antes de buscar. Lo que se escape se oculta desde el modo stand de la TV.
 * Se usa en el celular (aviso al escribir) y en el server (validación real).
 */
const ROOTS = [
  "boludo",
  "boluda",
  "pelotudo",
  "pelotuda",
  "forro",
  "forra",
  "puto",
  "puta",
  "trolo",
  "trola",
  "pija",
  "concha",
  "chota",
  "culo",
  "cogid",
  "coger",
  "garch",
  "pajero",
  "pajera",
  "mierda",
  "sorete",
  "hdp",
  "lpm",
  "ctm",
  "mogolico",
  "mogolica",
  "tarado",
  "tarada",
  "idiota",
  "imbecil",
  "negro de mierda",
  "hitler",
  "violador",
  "pedofilo",
  "fuck",
  "shit",
  "bitch",
  "dick",
  "cock",
  "porn",
]

const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
}

function squash(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[013457@$]/g, (c) => LEET[c] ?? c)
    .replace(/[^a-zñ ]/g, "")
    .replace(/(.)\1+/g, "$1")
}

const SQUASHED = ROOTS.map(squash)

export function isOffensive(text: string): boolean {
  const s = squash(text)
  const compact = s.replace(/ /g, "")
  return SQUASHED.some(
    (w) => s.includes(w) || compact.includes(w.replace(/ /g, ""))
  )
}
