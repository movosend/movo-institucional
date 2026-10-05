import type { TileLayerOptions } from "leaflet"

import { ROUTE_SCENARIOS, type RouteScenario } from "./route-scenarios"

/** Mapa claro (ArcGIS World Light Gray), mismo que el prototipo con `mapStyle: 'light'`. */
export const tileUrl = (layer: "Base" | "Reference") =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_${layer}/MapServer/tile/{z}/{y}/{x}`

/**
 * Fondo del contenedor del mapa: el gris de los tiles claros. Lo que se ve mientras un
 * tile carga es este color, no un cuadrado negro.
 */
export const MAP_BG = "#E1E1DF"

/**
 * - `keepBuffer`: conserva más tiles fuera de pantalla, así al ir y volver (loop de
 *   atracción, `fitBounds` entre rutas) no se descargan y vuelven a pedir.
 * - `updateWhenZooming: false`: no pide tiles de cada nivel intermedio durante la
 *   animación de zoom, solo al terminar (menos parpadeo).
 * - `crossOrigin`: respuestas CORS (ArcGIS manda `Access-Control-Allow-Origin: *`), que el
 *   service worker puede guardar en cache sin el costo de las respuestas opacas.
 */
export const TILE_OPTIONS: TileLayerOptions = {
  maxZoom: 16,
  keepBuffer: 6,
  updateWhenZooming: false,
  crossOrigin: true,
}

const WARM_FLAG = "movo-juegos-tiles-warm-v3"

type Bounds = { s: number; n: number; w: number; e: number }

/** Tiles que cubren un rectángulo en un zoom dado (esquema XYZ). */
function tilesIn(b: Bounds, z: number) {
  const n = 2 ** z
  const x = (lng: number) => Math.floor(((lng + 180) / 360) * n)
  const y = (lat: number) => {
    const r = (lat * Math.PI) / 180
    return Math.floor(
      ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n
    )
  }
  const tiles: [number, number][] = []
  for (let tx = x(b.w); tx <= x(b.e); tx++)
    for (let ty = y(b.n); ty <= y(b.s); ty++) tiles.push([tx, ty])
  return tiles
}

/** Rectángulo de las paradas de una ciudad, agrandado `pad` veces su tamaño por lado. */
function scenarioBounds(sc: RouteScenario, pad: number): Bounds {
  const lat = sc.pool.map((p) => p[2])
  const lng = sc.pool.map((p) => p[3])
  const s = Math.min(...lat)
  const n = Math.max(...lat)
  const w = Math.min(...lng)
  const e = Math.max(...lng)
  const dLat = (n - s) * pad
  const dLng = (e - w) * pad
  return { s: s - dLat, n: n + dLat, w: w - dLng, e: e + dLng }
}

/**
 * Lo que se precalienta, en el orden en que se pide:
 * - Argentina continental en zoom 4-7: el juego de precios (el loop de atracción llega
 *   hasta zoom 7).
 * - Cada ciudad del optimizador en zoom 10-15, con margen porque el panel tapa parte del
 *   mapa y el encuadre deja aire alrededor de las paradas. En zoom 15 el margen es menor:
 *   ahí los tiles son muchos y solo se llega con pocas paradas juntas.
 */
function warmTiles(): [number, number, number][] {
  const out: [number, number, number][] = []
  const argentina = { s: -55, n: -21.8, w: -73.6, e: -53.6 }
  for (let z = 4; z <= 7; z++)
    for (const [x, y] of tilesIn(argentina, z)) out.push([z, x, y])
  for (const sc of ROUTE_SCENARIOS)
    for (let z = 10; z <= 15; z++)
      for (const [x, y] of tilesIn(scenarioBounds(sc, z < 15 ? 0.5 : 0.25), z))
        out.push([z, x, y])
  return out
}

/**
 * Registra el service worker que cachea los tiles (`public/juegos-tiles-sw.js`) y, la
 * primera vez en cada dispositivo, precalienta Argentina y las ciudades del optimizador
 * (~4.300 tiles, unas decenas de MB) en segundo plano, de a poco para no competir con el
 * mapa visible. El service worker solo existe en HTTPS (o localhost): abierto por la IP de
 * la red local no hay cache y cada tile se pide a ArcGIS.
 */
export function setupTileCache() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
  navigator.serviceWorker
    .register("/juegos-tiles-sw.js", { scope: "/juegos" })
    .then(() => navigator.serviceWorker.ready)
    .then(() => {
      try {
        if (localStorage.getItem(WARM_FLAG)) return
      } catch {
        return
      }
      void warm()
    })
    .catch((e) => console.warn("[juegos] service worker de tiles", e))
}

let warming = false

async function warm() {
  // El hub y cada juego llaman a `setupTileCache`: una sola pasada por página.
  if (warming) return
  warming = true
  const urls: string[] = []
  for (const [z, x, y] of warmTiles())
    for (const layer of ["Base", "Reference"] as const)
      urls.push(
        tileUrl(layer)
          .replace("{z}", String(z))
          .replace("{x}", String(x))
          .replace("{y}", String(y))
      )
  // Primera carga: el service worker toma control con `clients.claim()` apenas se
  // activa. Sin controlador el fetch no pasaría por él y no quedaría nada en cache.
  if (!navigator.serviceWorker.controller) {
    await new Promise((r) => {
      navigator.serviceWorker.addEventListener("controllerchange", r, {
        once: true,
      })
      setTimeout(r, 3000)
    })
  }
  if (!navigator.serviceWorker.controller) {
    warming = false
    return
  }
  let failed = 0
  for (let i = 0; i < urls.length; i += 6) {
    const res = await Promise.all(
      urls
        .slice(i, i + 6)
        .map((u) =>
          fetch(u, { mode: "cors", credentials: "omit" }).catch(() => null)
        )
    )
    failed += res.filter((r) => !r?.ok).length
    await new Promise((r) => setTimeout(r, 100))
  }
  warming = false
  // Si el wifi falló a mitad de camino, no se marca: se completa la próxima vez (lo que
  // ya quedó en cache sale del service worker sin volver a la red).
  if (failed > urls.length * 0.02) return
  try {
    localStorage.setItem(WARM_FLAG, String(Date.now()))
  } catch {}
}
