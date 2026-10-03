/* Service worker de los juegos (/juegos): cache-first para los tiles del mapa (ArcGIS).
   El mapa se mueve todo el tiempo (loop de atracción, rutas), así que sin esto cada
   vuelta vuelve a pedir tiles y se ven cuadrados vacíos mientras cargan. También sirve
   si el wifi de la feria se corta un rato. Solo toca requests de tiles, nada más. */

const CACHE = "movo-juegos-tiles-v1"
const MAX_ENTRIES = 12000
const TILE_RE = /^https:\/\/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/Canvas\/World_Light_Gray_(Base|Reference)\/MapServer\/tile\//

self.addEventListener("install", () => self.skipWaiting())

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("movo-juegos-tiles-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

let writes = 0

async function trim(cache) {
  const keys = await cache.keys()
  // `keys()` respeta el orden de inserción: se van los más viejos.
  for (let i = 0; i < keys.length - MAX_ENTRIES; i++) await cache.delete(keys[i])
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET" || !TILE_RE.test(request.url)) return
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(request.url)
      if (hit) return hit
      const response = await fetch(request.url, { mode: "cors", credentials: "omit" })
      if (response.ok) {
        event.waitUntil(
          cache.put(request.url, response.clone()).then(() => (++writes % 200 === 0 ? trim(cache) : undefined))
        )
      }
      return response
    })
  )
})
