/**
 * Localidades para el paso "¿De dónde venís?" de la trivia y para ubicar a cada jugador en
 * el mapa de la TV. Suma a las ciudades de los otros juegos (`lib/juegos/cities.ts`) más
 * localidades del interior, sobre todo de Córdoba (la feria). Las coordenadas son
 * aproximadas: alcanzan para un punto en el mapa del país. Si alguien escribe una ciudad
 * que no está, se acepta igual y no se dibuja.
 */
import { CITIES, norm, type City } from "@/lib/juegos/cities"

const EXTRA: City[] = [
  // Córdoba
  ["Río Tercero", "Córdoba", -32.173, -64.114],
  ["Río Segundo", "Córdoba", -31.652, -63.91],
  ["Río Ceballos", "Córdoba", -31.165, -64.322],
  ["Alta Gracia", "Córdoba", -31.659, -64.43],
  ["Jesús María", "Córdoba", -30.981, -64.094],
  ["San Francisco", "Córdoba", -31.428, -62.083],
  ["Bell Ville", "Córdoba", -32.626, -62.689],
  ["Marcos Juárez", "Córdoba", -32.697, -62.106],
  ["Villa Dolores", "Córdoba", -31.946, -65.19],
  ["Cosquín", "Córdoba", -31.245, -64.466],
  ["La Falda", "Córdoba", -31.089, -64.484],
  ["Cruz del Eje", "Córdoba", -30.726, -64.806],
  ["Deán Funes", "Córdoba", -30.42, -64.35],
  ["Laboulaye", "Córdoba", -34.127, -63.39],
  ["Villa General Belgrano", "Córdoba", -31.978, -64.556],
  ["Unquillo", "Córdoba", -31.231, -64.316],
  ["Mendiolaza", "Córdoba", -31.267, -64.3],
  ["Malagueño", "Córdoba", -31.465, -64.358],
  ["La Calera", "Córdoba", -31.343, -64.335],
  ["Colonia Caroya", "Córdoba", -31.02, -64.093],
  ["Arroyito", "Córdoba", -31.42, -63.05],
  ["Oncativo", "Córdoba", -31.913, -63.682],
  ["Oliva", "Córdoba", -32.041, -63.569],
  ["Hernando", "Córdoba", -32.427, -63.733],
  ["Morteros", "Córdoba", -30.712, -62.003],
  ["Las Varillas", "Córdoba", -31.872, -62.719],
  ["Huinca Renancó", "Córdoba", -34.84, -64.375],
  ["Corral de Bustos", "Córdoba", -33.282, -62.185],
  ["Leones", "Córdoba", -32.661, -62.297],
  ["Luque", "Córdoba", -31.646, -63.344],
  ["Villa del Rosario", "Córdoba", -31.556, -63.535],
  ["Santa Rosa de Calamuchita", "Córdoba", -32.069, -64.537],
  ["Mina Clavero", "Córdoba", -31.721, -65.006],
  ["Embalse", "Córdoba", -32.18, -64.4],
  ["General Cabrera", "Córdoba", -32.813, -63.873],
  ["Villa Allende", "Córdoba", -31.296, -64.296],
  ["Saldán", "Córdoba", -31.302, -64.307],
  ["Monte Cristo", "Córdoba", -31.343, -63.944],
  ["Pilar", "Córdoba", -31.68, -63.88],
  ["Despeñaderos", "Córdoba", -31.816, -64.29],
  // Santa Fe y Litoral
  ["Reconquista", "Santa Fe", -29.15, -59.65],
  ["Esperanza", "Santa Fe", -31.449, -60.931],
  ["Casilda", "Santa Fe", -33.044, -61.168],
  ["Firmat", "Santa Fe", -33.459, -61.484],
  ["Villa Constitución", "Santa Fe", -33.227, -60.33],
  ["Cañada de Gómez", "Santa Fe", -32.816, -61.395],
  ["Rufino", "Santa Fe", -34.264, -62.711],
  ["Gualeguay", "Entre Ríos", -33.142, -59.31],
  ["Concepción del Uruguay", "Entre Ríos", -32.484, -58.232],
  ["Victoria", "Entre Ríos", -32.618, -60.155],
  ["Goya", "Corrientes", -29.144, -59.265],
  ["Presidencia Roque Sáenz Peña", "Chaco", -26.785, -60.438],
  ["Oberá", "Misiones", -27.487, -55.12],
  // Buenos Aires
  ["Mar de Ajó", "Buenos Aires", -36.72, -56.677],
  ["Necochea", "Buenos Aires", -38.555, -58.74],
  ["Azul", "Buenos Aires", -36.777, -59.858],
  ["Chivilcoy", "Buenos Aires", -34.896, -60.017],
  ["Trenque Lauquen", "Buenos Aires", -35.97, -62.73],
  ["Tres Arroyos", "Buenos Aires", -38.375, -60.275],
  ["San Isidro", "Buenos Aires", -34.471, -58.528],
  ["Lomas de Zamora", "Buenos Aires", -34.761, -58.406],
  ["Avellaneda", "Buenos Aires", -34.662, -58.365],
  ["Merlo", "Buenos Aires", -34.665, -58.728],
  ["Escobar", "Buenos Aires", -34.348, -58.795],
  // Cuyo y Norte
  ["Godoy Cruz", "Mendoza", -32.925, -68.845],
  ["Luján de Cuyo", "Mendoza", -33.036, -68.878],
  ["Villa Mercedes", "San Luis", -33.675, -65.457],
  ["Merlo", "San Luis", -32.343, -65.014],
  ["Tafí Viejo", "Tucumán", -26.732, -65.259],
  ["Yerba Buena", "Tucumán", -26.816, -65.316],
  ["Tartagal", "Salta", -22.516, -63.801],
  ["Orán", "Salta", -23.137, -64.325],
  ["Palpalá", "Jujuy", -24.256, -65.212],
  ["La Banda", "Santiago del Estero", -27.735, -64.242],
  ["Termas de Río Hondo", "Santiago del Estero", -27.493, -64.86],
  ["Chilecito", "La Rioja", -29.163, -67.497],
  // Patagonia
  ["Cipolletti", "Río Negro", -38.934, -67.99],
  ["Plottier", "Neuquén", -38.966, -68.233],
  ["Rawson", "Chubut", -43.3, -65.102],
  ["Caleta Olivia", "Santa Cruz", -46.439, -67.528],
  ["General Pico", "La Pampa", -35.666, -63.758],
]

export const LOCALIDADES: City[] = [...CITIES, ...EXTRA]

/** Busca por prefijo de cualquier palabra, sin acentos. Primero las de Córdoba (la feria). */
export function searchLocalidades(query: string, limit = 4): City[] {
  const q = norm(query.trim())
  if (q.length < 2) return []
  const hits = LOCALIDADES.filter((c) => {
    const n = norm(c[0])
    return n.startsWith(q) || n.split(/[\s-]+/).some((w) => w.startsWith(q))
  })
  hits.sort(
    (a, b) =>
      Number(norm(b[0]).startsWith(q)) - Number(norm(a[0]).startsWith(q)) ||
      Number(b[1] === "Córdoba") - Number(a[1] === "Córdoba") ||
      a[0].localeCompare(b[0], "es")
  )
  return hits.slice(0, limit)
}

/** Coordenadas por nombre de ciudad (+ provincia si hay dos con el mismo nombre). */
export function findLocalidad(name: string, province?: string | null) {
  const n = norm(name.trim())
  return (
    LOCALIDADES.find(
      (c) => norm(c[0]) === n && (!province || c[1] === province)
    ) ?? LOCALIDADES.find((c) => norm(c[0]) === n)
  )
}
