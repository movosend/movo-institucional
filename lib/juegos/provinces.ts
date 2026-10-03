import type { GeometryCollection } from "geojson"
import type * as Leaflet from "leaflet"

import provincias from "./provincias.json"

const PANE = "provincias"

/**
 * Límites entre provincias, siempre visibles: los tiles claros de ArcGIS casi no los
 * muestran en los zooms del mapa de Argentina. `provincias.json` sale de la capa
 * `ign:provincia` del IGN, solo los bordes compartidos (las costas y fronteras ya vienen en
 * los tiles), simplificada a 500 m con mapshaper (`-simplify interval=500 -innerlines`).
 *
 * Va en un pane propio entre los tiles (200) y las rutas (400), sin eventos.
 */
export function addProvinceLines(L: typeof Leaflet, map: Leaflet.Map) {
  const pane = map.createPane(PANE)
  pane.style.zIndex = "350"
  pane.style.pointerEvents = "none"
  return L.geoJSON(provincias as GeometryCollection, {
    pane: PANE,
    interactive: false,
    style: {
      color: "#6E6E76",
      weight: 1.25,
      opacity: 0.6,
      lineJoin: "round",
    },
  }).addTo(map)
}
