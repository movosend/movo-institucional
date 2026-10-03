import type { TileLayerOptions } from "leaflet"

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

const WARM_FLAG = "movo-juegos-tiles-warm-v1"

/** Tiles de Argentina continental en un zoom dado (esquema XYZ). */
function argentinaTiles(z: number) {
  const n = 2 ** z
  const x = (lng: number) => Math.floor(((lng + 180) / 360) * n)
  const y = (lat: number) => {
    const r = (lat * Math.PI) / 180
    return Math.floor(
      ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n
    )
  }
  const tiles: [number, number][] = []
  for (let tx = x(-73.6); tx <= x(-53.6); tx++)
    for (let ty = y(-21.8); ty <= y(-55); ty++) tiles.push([tx, ty])
  return tiles
}

/**
 * Registra el service worker que cachea los tiles (`public/juegos-tiles-sw.js`) y, la
 * primera vez en cada dispositivo, precalienta Argentina en zoom 4-7 (~440 tiles, unos
 * pocos MB) en segundo plano, de a poco para no competir con el mapa visible.
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

async function warm() {
  const urls: string[] = []
  for (let z = 4; z <= 7; z++)
    for (const [x, y] of argentinaTiles(z))
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
  if (!navigator.serviceWorker.controller) return
  for (let i = 0; i < urls.length; i += 6) {
    await Promise.all(
      urls
        .slice(i, i + 6)
        .map((u) =>
          fetch(u, { mode: "cors", credentials: "omit" }).catch(() => null)
        )
    )
    await new Promise((r) => setTimeout(r, 150))
  }
  try {
    localStorage.setItem(WARM_FLAG, String(Date.now()))
  } catch {}
}
