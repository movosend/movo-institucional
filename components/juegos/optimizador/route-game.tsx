"use client"

import "leaflet/dist/leaflet.css"
import "../juegos.css"

import Link from "next/link"
import { Component, type PointerEvent as ReactPointerEvent } from "react"
import type * as Leaflet from "leaflet"

import { css } from "@/lib/juegos/css"
import { withStand } from "@/lib/juegos/event-tag"
import {
  MAP_BG,
  setupTileCache,
  TILE_OPTIONS,
  tileUrl,
} from "@/lib/juegos/map-tiles"
import {
  ROUTE_SCENARIOS,
  type RoutePlace,
  type RouteScenario,
} from "@/lib/juegos/route-scenarios"
import { randomUUID } from "@/lib/uuid"
import {
  ArrowRight,
  CheckSmall,
  Clock,
  Grip,
  Restart,
  SoundOff,
  SoundOn,
} from "../precios/icons"
import {
  flushNewsletterQueue,
  isEmail,
  newsletterPendingCount,
  RAFFLE_COPY,
  subscribeFromGame,
} from "../raffle"

/**
 * Juego del optimizador de la feria: port del prototipo de Claude Design "Movo
 * Optimizador" (`Movo Optimizador.dc.html`), mismo flujo, estilos y textos. Diferencias
 * con el prototipo:
 * - El rival es el optimizador real: la partida la crea el backend (`/api/juegos/
 *   optimizador/games`), que resuelve el orden óptimo con OR-Tools sobre la matriz de la
 *   ciudad (cacheada en Redis) y mide la ruta del jugador con esa misma matriz. OSRM
 *   público queda solo para dibujar las líneas de la carrera.
 * - Ranking del día compartido entre iPads (backend), con el del iPad como respaldo.
 * - Tiempo, paradas, km en vivo e indicador de costo se configuran en el modo stand.
 * - Paso de sorteo + newsletter con el copy compartido de `../raffle`.
 * - Sin red: se juega con el cálculo local del prototipo (línea recta × 1,35) y la
 *   partida queda en cola con `offline`.
 * - Mapa claro fijo, igual que el juego de precios.
 */

type Screen =
  | "attract"
  | "ready"
  | "play"
  | "race"
  | "result"
  | "join"
  | "ranking"

interface Pt {
  name: string
  zone: string
  lat: number
  lng: number
}

interface Matrix {
  km: number[][]
  min: number[][]
}

interface MatrixInfo {
  cache: "hit" | "miss"
  provider: string
  elementsBilled: number
}

interface Geo {
  pts: [number, number][]
  km: number
}

interface LocalSolution {
  M: Matrix
  best: { order: number[]; km: number; min: number }
  method: string
}

interface Game {
  /** `gameId` del servidor, o un UUID propio si se juega sin red. */
  id: string
  server: boolean
  scenarioId: string
  city: string
  zone: string
  start: Pt
  end: Pt
  stops: Pt[]
  startedAt: number
  matrixInfo: MatrixInfo | null
  /** Cálculo local: partida sin red, o resultado sin respuesta del servidor. */
  local: LocalSolution | null
  optGeo?: Geo
}

interface Result {
  userKm: number
  optKm: number
  userMin: number
  optMin: number
  dKm: number
  dMin: number
  eff: number
  tie: boolean
  used: number
  timedOut: boolean
  userOrder: number[]
  optOrder: number[]
  computedBy: "server" | "client"
  method: string | null
}

interface BoardRow {
  pos: number
  name: string
  time: number
  eff: number
  mine: boolean
}

interface Board {
  rows: BoardRow[]
  pos: number | null
  total: number
}

interface Config {
  time: number
  stops: number
  liveKm: boolean
  costBadge: boolean
}

interface CostCounters {
  games: number
  hits: number
  misses: number
  elements: number
}

interface PendingGame {
  id: string
  payload: Record<string, unknown>
}

interface Props {
  /** `?stand=` del kiosco (ej. `feria-utn-2026`); sin él las partidas quedan como `web`. */
  eventTag?: string
}

interface State {
  screen: Screen
  toast: string | null
  toastDot: string
  soundOn: boolean
  admin: boolean
  attractLabel: string
  leaving: boolean
  order: number[]
  drag: { i: number; dy: number } | null
  left: number
  count: number
  raceT: number
  raceLoading: boolean
  name: string
  contact: string
  contactErr: boolean
  nameErr: boolean
  endLeft: number
  joined: boolean
  result: Result | null
  gameReady: boolean
  board: Board | null
  cfg: Config
}

const LIME = "#C6F24A"
const BLUE = "#2B6BFF"
const AMBER = "#F5B93A"
const IDLE_SECONDS = 60
const RANKING_SECONDS = 15
const TIME_OPTIONS = [30, 45, 60, 90, 120]
const STOP_OPTIONS = [4, 5, 6, 7]
const DEFAULT_CONFIG: Config = {
  time: 60,
  stops: 5,
  liveKm: false,
  costBadge: true,
}
// Métricas del resultado (props `fuelPerKm`/`co2PerKm` del prototipo).
const FUEL_PER_KM = 120
const CO2_PER_KM = 0.17
// Sin red: línea recta × 1,35 y 25 km/h, mismo fallback que el prototipo.
const LOCAL_ROAD_FACTOR = 1.35
const LOCAL_METHOD = "haversine_x1.35"
const LS_ALL = "movo-opt-games"
const LS_PENDING = "movo-opt-pending"
const LS_CONFIG = "movo-opt-config"
const LS_COST = "movo-opt-cost"
const LS_DEVICE = "movo-feria-device"

const lsGet = <T,>(k: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(k) || "[]") as T[]
  } catch {
    return []
  }
}
const lsSet = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {}
}
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-AR")
const km1 = (n: number) =>
  (Math.round(n * 10) / 10).toLocaleString("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
const today = () => {
  const d = new Date()
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  )
}
const hav = (a: Pt, b: Pt) => {
  const R = 6371
  const r = Math.PI / 180
  const dl = (b.lat - a.lat) * r
  const dn = (b.lng - a.lng) * r
  const h =
    Math.sin(dl / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
const shuffle = <T,>(a: readonly T[]): T[] => {
  const out = a.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
const perms = (a: number[]): number[][] =>
  a.length <= 1
    ? [a]
    : a.flatMap((x, i) =>
        perms(a.slice(0, i).concat(a.slice(i + 1))).map((p) => [x].concat(p))
      )
const toPt = ([name, zone, lat, lng]: RoutePlace): Pt => ({
  name,
  zone,
  lat,
  lng,
})
const timerStr = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

function loadConfig(): Config {
  try {
    const raw = JSON.parse(
      localStorage.getItem(LS_CONFIG) || "{}"
    ) as Partial<Config>
    return {
      time: TIME_OPTIONS.includes(raw.time ?? 0)
        ? raw.time!
        : DEFAULT_CONFIG.time,
      stops: STOP_OPTIONS.includes(raw.stops ?? 0)
        ? raw.stops!
        : DEFAULT_CONFIG.stops,
      liveKm:
        typeof raw.liveKm === "boolean" ? raw.liveKm : DEFAULT_CONFIG.liveKm,
      costBadge:
        typeof raw.costBadge === "boolean"
          ? raw.costBadge
          : DEFAULT_CONFIG.costBadge,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

function loadCost(): CostCounters {
  try {
    return {
      games: 0,
      hits: 0,
      misses: 0,
      elements: 0,
      ...(JSON.parse(localStorage.getItem(LS_COST) || "{}") as object),
    }
  } catch {
    return { games: 0, hits: 0, misses: 0, elements: 0 }
  }
}

/** Matriz local (sin red): `[salida, paradas..., llegada]`. */
function localMatrix(points: Pt[]): Matrix {
  const km = points.map((a) => points.map((b) => hav(a, b) * LOCAL_ROAD_FACTOR))
  return { km, min: km.map((r) => r.map((v) => (v / 25) * 60)) }
}

/** Km y minutos de un orden de paradas sobre una matriz `[salida, paradas, llegada]`. */
function cost(order: number[], M: Matrix) {
  const idx = [0].concat(
    order.map((i) => i + 1),
    [order.length + 1]
  )
  let km = 0
  let min = 0
  for (let i = 1; i < idx.length; i++) {
    km += M.km[idx[i - 1]][idx[i]]
    min += M.min[idx[i - 1]][idx[i]]
  }
  return { km, min }
}

function solveLocal(M: Matrix, n: number) {
  let best: { order: number[]; km: number; min: number } | null = null
  for (const p of perms([...Array(n).keys()])) {
    const c = cost(p, M)
    if (!best || c.km < best.km - 1e-9) best = { order: p, ...c }
  }
  return best!
}

export class RouteGame extends Component<Props, State> {
  state: State = {
    screen: "attract",
    toast: null,
    toastDot: LIME,
    soundOn: true,
    admin: false,
    attractLabel: "",
    leaving: false,
    order: [],
    drag: null,
    left: DEFAULT_CONFIG.time,
    count: 0,
    raceT: 0,
    raceLoading: false,
    name: "",
    contact: "",
    contactErr: false,
    nameErr: false,
    endLeft: RANKING_SECONDS,
    joined: false,
    result: null,
    gameReady: false,
    board: null,
    cfg: DEFAULT_CONFIG,
  }

  private L: typeof Leaflet | null = null
  private map: Leaflet.Map | null = null
  private tiles: Leaflet.LayerGroup | null = null
  private layer: Leaflet.LayerGroup | null = null
  private mapEl: HTMLDivElement | null = null
  private panelEl: HTMLDivElement | null = null
  private cardEls: (HTMLDivElement | null)[] = []
  private ac: AudioContext | null = null
  private game: Game | null = null
  private geoCache: Record<string, Geo> = {}
  private mounted = false
  private lastAct = 0
  private lastSc: string | undefined
  private gameTok = 0
  private animTok = 0
  private raf = 0
  private taps = 0
  private tapT = 0
  private rowH = 84
  private dragY0 = 0
  private playStart = 0
  private goT?: ReturnType<typeof setTimeout>
  private toastT?: ReturnType<typeof setTimeout>
  private idleTimer?: ReturnType<typeof setInterval>
  private attractTimer?: ReturnType<typeof setInterval>
  private playTimer?: ReturnType<typeof setInterval>
  private endTimer?: ReturnType<typeof setInterval>
  private countTimer?: ReturnType<typeof setInterval>
  private retryTimer?: ReturnType<typeof setInterval>
  private onResize = () => {
    this.map?.invalidateSize()
    this.forceUpdate()
  }

  cfg() {
    return this.state.cfg
  }

  // --- Ciclo de vida ------------------------------------------------------------------

  componentDidMount() {
    this.mounted = true
    this.lastAct = Date.now()
    this.setState({ cfg: loadConfig() })
    window.addEventListener("resize", this.onResize)
    setupTileCache()
    import("leaflet").then((mod) => {
      this.L =
        (mod as unknown as { default?: typeof Leaflet }).default ??
        (mod as unknown as typeof Leaflet)
      const tryInit = () => {
        if (!this.mounted || this.map) return
        if (this.L && this.mapEl && this.mapEl.offsetWidth) {
          try {
            this.initMap()
          } catch (e) {
            console.warn("map init", e)
          }
        } else setTimeout(tryInit, 120)
      }
      tryInit()
    })
    this.idleTimer = setInterval(() => {
      const s = this.state.screen
      if (
        (s === "ready" || s === "result" || s === "join") &&
        Date.now() - this.lastAct > IDLE_SECONDS * 1000
      )
        this.resetToAttract()
    }, 1000)
    // Colas offline: reintentan solas cada minuto, además del botón del modo stand.
    this.retryTimer = setInterval(() => {
      if (lsGet(LS_PENDING).length) void this.flushPending(false)
      if (newsletterPendingCount()) void flushNewsletterQueue()
    }, 60_000)
  }

  componentWillUnmount() {
    this.mounted = false
    window.removeEventListener("resize", this.onResize)
    ;[
      this.idleTimer,
      this.attractTimer,
      this.playTimer,
      this.endTimer,
      this.countTimer,
      this.retryTimer,
    ].forEach(clearInterval)
    clearTimeout(this.goT)
    clearTimeout(this.toastT)
    cancelAnimationFrame(this.raf)
    if (this.map) {
      try {
        this.map.remove()
      } catch {}
      this.map = null
    }
  }

  // --- Mapa ---------------------------------------------------------------------------

  initMap() {
    const L = this.L!
    this.map = L.map(this.mapEl!, {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.25,
    })
    this.map.setView([-34.6, -58.4], 12)
    this.tiles = L.layerGroup([
      L.tileLayer(tileUrl("Base"), TILE_OPTIONS),
      L.tileLayer(tileUrl("Reference"), { ...TILE_OPTIONS, opacity: 0.9 }),
    ]).addTo(this.map)
    this.layer = L.layerGroup().addTo(this.map)
    if (this.state.screen === "attract") this.startAttract()
  }

  /** Paleta `light` del prototipo (el mapa del stand es siempre claro). */
  pal() {
    return {
      user: "#0A0A0B",
      userDot: "#FFFFFF",
      opt: LIME,
      optCase: "#0A0A0B",
      plan: "#0A0A0B",
      planOp: 0.6,
      glowOp: 0.5,
    }
  }

  panelW() {
    return (this.panelEl && this.panelEl.offsetWidth) || 560
  }

  fit(pts: [number, number][], attract?: boolean) {
    if (!this.mounted || !this.map || !this.mapEl?.offsetWidth || !this.L)
      return
    const w = window.innerWidth
    const b = this.L.latLngBounds(pts)
    if (!b.isValid()) return
    const tl: [number, number] = attract
      ? [Math.round(w * 0.58), 110]
      : [Math.min(this.panelW() + 80, w - 240), 120]
    try {
      this.map.fitBounds(b, {
        paddingTopLeft: tl,
        paddingBottomRight: [180, 60],
        maxZoom: 15,
        animate: true,
        duration: 1,
      })
    } catch {}
  }

  pinHtml(
    kind: "start" | "end" | "stop",
    label?: string | null,
    num?: number | null,
    hot?: boolean
  ) {
    const lab = label
      ? `<div style="position:absolute;left:${kind === "stop" ? 46 : 38}px;top:50%;transform:translateY(-50%);white-space:nowrap;padding:5px 12px;border-radius:999px;background:${hot ? LIME : "#FFFFFF"};color:#0A0A0B;font:600 16px Inter,system-ui,sans-serif;box-shadow:0 6px 16px rgba(10,10,11,.35)">${label}</div>`
      : ""
    if (kind === "start")
      return `<div style="position:relative;width:28px;height:28px"><div style="width:28px;height:28px;box-sizing:border-box;border-radius:6px;background:${LIME};border:4px solid #0A0A0B;box-shadow:0 0 0 7px rgba(198,242,74,.3)"></div>${lab}</div>`
    if (kind === "end")
      return `<div style="position:relative;width:28px;height:28px"><div style="width:28px;height:28px;box-sizing:border-box;border-radius:999px;background:${BLUE};border:4px solid #FFFFFF;box-shadow:0 0 0 7px rgba(43,107,255,.35)"></div>${lab}</div>`
    return `<div style="position:relative;width:36px;height:36px"><div style="width:36px;height:36px;box-sizing:border-box;border-radius:999px;background:${hot ? LIME : "#FFFFFF"};color:#0A0A0B;display:flex;align-items:center;justify-content:center;font:600 18px Inter,system-ui,sans-serif;border:3px solid #0A0A0B;box-shadow:0 0 0 ${hot ? 10 : 5}px ${hot ? "rgba(198,242,74,.4)" : "rgba(255,255,255,.18)"}">${num ?? ""}</div>${lab}</div>`
  }

  pin(
    c: Pt,
    kind: "start" | "end" | "stop",
    label?: string | null,
    num?: number | null,
    hot?: boolean
  ) {
    const L = this.L
    if (!L || !this.layer) return
    const sz = kind === "stop" ? 36 : 28
    L.marker([c.lat, c.lng], {
      icon: L.divIcon({
        className: "",
        html: this.pinHtml(kind, label, num, hot),
        iconSize: [sz, sz],
        iconAnchor: [sz / 2, sz / 2],
      }),
      interactive: false,
      zIndexOffset: hot ? 900 : 0,
    }).addTo(this.layer)
  }

  pts(g: Game) {
    return [g.start, ...g.stops, g.end]
  }

  drawPlan(hot?: number) {
    const L = this.L
    const g = this.game
    if (!L || !this.layer || !g) return
    const o = this.state.order
    this.layer.clearLayers()
    const seq = [g.start, ...o.map((i) => g.stops[i]), g.end]
    L.polyline(
      seq.map((c) => [c.lat, c.lng] as [number, number]),
      {
        color: this.pal().plan,
        weight: 3,
        opacity: this.pal().planOp,
        dashArray: "2 10",
        interactive: false,
      }
    ).addTo(this.layer)
    this.pin(g.start, "start", "Salida")
    this.pin(g.end, "end", "Llegada")
    o.forEach((si, pos) =>
      this.pin(g.stops[si], "stop", g.stops[si].name, pos + 1, hot === si)
    )
  }

  /** Geometría por calle para dibujar la carrera (solo visual; los km salen del backend). */
  async getGeo(seq: Pt[]): Promise<Geo> {
    const key = seq.map((c) => c.name).join("|")
    if (this.geoCache[key]) return this.geoCache[key]
    try {
      const r = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${seq.map((p) => p.lng + "," + p.lat).join(";")}?overview=full&geometries=geojson`,
        { signal: AbortSignal.timeout(7000) }
      )
      const j = (await r.json()) as {
        routes?: {
          geometry: { coordinates: [number, number][] }
          distance: number
        }[]
      }
      const rt = j.routes && j.routes[0]
      if (!rt) throw new Error("no route")
      return (this.geoCache[key] = {
        pts: rt.geometry.coordinates.map((p) => [p[1], p[0]]),
        km: rt.distance / 1000,
      })
    } catch {
      return {
        pts: seq.map((c) => [c.lat, c.lng]),
        km: seq
          .slice(1)
          .reduce((s, c, i) => s + hav(seq[i], c) * LOCAL_ROAD_FACTOR, 0),
      }
    }
  }

  cumOf(pts: [number, number][]) {
    const cum = [0]
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]
      const b = pts[i]
      cum.push(
        cum[i - 1] +
          Math.hypot(
            b[0] - a[0],
            (b[1] - a[1]) * Math.cos((a[0] * Math.PI) / 180)
          )
      )
    }
    return cum
  }

  sliceAt(pts: [number, number][], cum: number[], f: number) {
    const target = f * cum[cum.length - 1]
    let i = 1
    while (i < pts.length - 1 && cum[i] < target) i++
    const a = pts[i - 1]
    const b = pts[i] ?? a
    const k = Math.max(
      0,
      Math.min(1, (target - cum[i - 1]) / (cum[i] - cum[i - 1] || 1))
    )
    const p: [number, number] = [
      a[0] + (b[0] - a[0]) * k,
      a[1] + (b[1] - a[1]) * k,
    ]
    return { line: pts.slice(0, i).concat([p]), p }
  }

  animLines(
    defs: {
      pts: [number, number][]
      frac: number
      color: string
      casing?: string | null
      dotBg?: string
      weight?: number
      glow?: boolean
    }[],
    dur: number,
    onFrame?: (t: number) => void,
    done?: () => void
  ) {
    const L = this.L
    if (!L || !this.layer) return
    const tok = ++this.animTok
    cancelAnimationFrame(this.raf)
    const P = this.pal()
    const layer = this.layer
    const lines = defs.map((d) => {
      const w = d.weight || 5
      return {
        ...d,
        cum: this.cumOf(d.pts),
        glowL:
          d.glow === false
            ? null
            : L.polyline([d.pts[0]], {
                color: d.color,
                weight: w + 12,
                opacity: P.glowOp,
                interactive: false,
              }).addTo(layer),
        casingL: d.casing
          ? L.polyline([d.pts[0]], {
              color: d.casing,
              weight: w + 4,
              opacity: 1,
              lineJoin: "round",
              interactive: false,
            }).addTo(layer)
          : null,
        line: L.polyline([d.pts[0]], {
          color: d.color,
          weight: w,
          opacity: 1,
          lineJoin: "round",
          interactive: false,
        }).addTo(layer),
        dot: L.marker(d.pts[0], {
          icon: L.divIcon({
            className: "",
            html: `<div style="width:24px;height:24px;box-sizing:border-box;border-radius:5px;background:${d.dotBg || "#0A0A0B"};border:4px solid ${d.casing || d.color};box-shadow:0 0 0 3px ${d.casing ? d.color : "transparent"},0 0 18px ${d.color}"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
          interactive: false,
          zIndexOffset: 1000,
        }).addTo(layer),
      }
    })
    const t0 = performance.now()
    const step = (now: number) => {
      if (tok !== this.animTok || !this.mounted) return
      const t = Math.min(1, (now - t0) / dur)
      lines.forEach((l) => {
        const f = Math.min(1, t / l.frac)
        const s = this.sliceAt(l.pts, l.cum, f)
        l.line.setLatLngs(s.line)
        l.glowL?.setLatLngs(s.line)
        l.casingL?.setLatLngs(s.line)
        l.dot.setLatLng(s.p)
      })
      onFrame?.(t)
      if (t < 1) this.raf = requestAnimationFrame(step)
      else done?.()
    }
    this.raf = requestAnimationFrame(step)
  }

  /** Loop de atracción: cálculo local (sin backend, no gasta). */
  startAttract() {
    clearInterval(this.attractTimer)
    const loop = async () => {
      if (!this.mounted || !this.map || this.state.screen !== "attract") return
      const g = this.localGame(this.cfg().stops)
      const pts = this.pts(g)
      const M = {
        km: pts.map((a) => pts.map((b) => hav(a, b))),
        min: pts.map((a) => pts.map((b) => hav(a, b))),
      }
      const best = solveLocal(M, g.stops.length)
      const seq = [g.start, ...best.order.map((i) => g.stops[i]), g.end]
      const geo = await this.getGeo(seq)
      if (this.state.screen !== "attract" || !this.layer) return
      this.layer.clearLayers()
      this.fit(
        seq.map((c) => [c.lat, c.lng]),
        true
      )
      this.setState({
        attractLabel: `${g.city} · ${g.stops.length} paradas · ${km1(geo.km)} km optimizados`,
      })
      setTimeout(() => {
        if (this.state.screen !== "attract") return
        this.pin(g.start, "start")
        this.pin(g.end, "end")
        best.order.forEach((si, k) =>
          this.pin(g.stops[si], "stop", null, k + 1)
        )
        this.animLines(
          [
            {
              pts: geo.pts,
              frac: 1,
              color: LIME,
              casing: this.pal().optCase,
            },
          ],
          2600
        )
      }, 900)
    }
    void loop()
    this.attractTimer = setInterval(() => void loop(), 6200)
  }

  // --- Sonido -------------------------------------------------------------------------

  tone(seq: [number, number, OscillatorType?, number?][]) {
    if (!this.state.soundOn) return
    try {
      const W = window as unknown as {
        AudioContext?: typeof AudioContext
        webkitAudioContext?: typeof AudioContext
      }
      const Ctx = W.AudioContext || W.webkitAudioContext
      if (!Ctx) return
      const ctx = this.ac || (this.ac = new Ctx())
      if (ctx.state === "suspended") void ctx.resume()
      let t = ctx.currentTime
      seq.forEach(([f, d, type = "triangle", v = 0.12]) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = type
        o.frequency.setValueAtTime(f, t)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(v, t + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d)
        o.connect(g)
        g.connect(ctx.destination)
        o.start(t)
        o.stop(t + d + 0.03)
        t += d * 0.75
      })
    } catch {}
  }

  sfx(n: string) {
    const m: Record<string, [number, number, OscillatorType?, number?][]> = {
      tap: [[880, 0.07, "triangle", 0.07]],
      grab: [[660, 0.06, "triangle", 0.08]],
      drop: [[990, 0.08, "triangle", 0.08]],
      start: [
        [523, 0.09],
        [784, 0.09],
        [1047, 0.18],
      ],
      count: [[660, 0.12, "sine", 0.12]],
      go: [[1047, 0.3, "sine", 0.14]],
      tick: [[1200, 0.04, "square", 0.03]],
      urgent: [[1400, 0.05, "square", 0.05]],
      whoosh: [
        [220, 0.06, "sawtooth", 0.025],
        [330, 0.06, "sawtooth", 0.025],
        [494, 0.06, "sawtooth", 0.025],
        [740, 0.1, "sawtooth", 0.025],
      ],
      win: [
        [659, 0.1],
        [784, 0.1],
        [988, 0.1],
        [1319, 0.4],
      ],
      ok: [
        [523, 0.1],
        [659, 0.1],
        [784, 0.25],
      ],
      meh: [
        [440, 0.14],
        [392, 0.25],
      ],
    }
    this.tone(m[n] || m.tap)
  }

  toastMsg(msg: string, dot?: string) {
    clearTimeout(this.toastT)
    this.setState({ toast: msg, toastDot: dot || LIME })
    this.toastT = setTimeout(() => this.setState({ toast: null }), 2200)
  }

  // --- Navegación ---------------------------------------------------------------------

  go(screen: Screen, cb?: () => void) {
    clearTimeout(this.goT)
    const from = this.state.screen
    this.setState({ leaving: true })
    this.goT = setTimeout(
      () =>
        this.setState({ screen, leaving: false }, () =>
          setTimeout(() => cb?.(), 0)
        ),
      from === "attract" ? 420 : 200
    )
  }

  // --- Partida ------------------------------------------------------------------------

  deviceId() {
    try {
      let id = localStorage.getItem(LS_DEVICE)
      if (!id) {
        id = randomUUID().slice(0, 8)
        localStorage.setItem(LS_DEVICE, id)
      }
      return id
    } catch {
      return undefined
    }
  }

  /** Partida armada en el iPad (loop de atracción y modo sin red). */
  localGame(n: number): Game {
    const all: readonly RouteScenario[] = ROUTE_SCENARIOS
    const options = all.filter((s) => s.id !== this.lastSc)
    const sc = (options.length ? options : all)[
      Math.floor(Math.random() * (options.length || all.length))
    ]
    const pick = shuffle(sc.pool)
      .slice(0, n + 2)
      .map(toPt)
    return {
      id: randomUUID(),
      server: false,
      scenarioId: sc.id,
      city: sc.city,
      zone: sc.zone,
      start: pick[0],
      end: pick[n + 1],
      stops: pick.slice(1, n + 1),
      startedAt: Date.now(),
      matrixInfo: null,
      local: null,
    }
  }

  withLocal(g: Game): LocalSolution {
    if (!g.local) {
      const M = localMatrix(this.pts(g))
      g.local = { M, best: solveLocal(M, g.stops.length), method: LOCAL_METHOD }
    }
    return g.local
  }

  /** Crea la partida en el backend; sin red (o con el backend caído) la arma el iPad. */
  async createGame(): Promise<{ game: Game; initialOrder: number[] }> {
    const n = this.cfg().stops
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch("/api/juegos/optimizador/games", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ stopCount: n, lastScenarioId: this.lastSc }),
        })
        if (res.ok) {
          const j = (await res.json()) as {
            gameId: string
            scenarioId: string
            city: string
            zone: string
            start: Pt
            end: Pt
            stops: Pt[]
            initialOrder: number[]
            matrix: MatrixInfo
          }
          this.countCost(j.matrix)
          return {
            game: {
              id: j.gameId,
              server: true,
              scenarioId: j.scenarioId,
              city: j.city,
              zone: j.zone,
              start: j.start,
              end: j.end,
              stops: j.stops,
              startedAt: Date.now(),
              matrixInfo: j.matrix,
              local: null,
            },
            initialOrder: j.initialOrder,
          }
        }
        if (res.status !== 429 && res.status < 500) break
      } catch {}
      await new Promise((r) => setTimeout(r, 1200))
    }
    const game = this.localGame(n)
    const { best } = this.withLocal(game)
    let order = shuffle([...Array(n).keys()])
    if (order.join() === best.order.join()) order = order.reverse()
    return { game, initialOrder: order }
  }

  countCost(info: MatrixInfo) {
    const c = loadCost()
    c.games += 1
    if (info.cache === "hit") c.hits += 1
    else c.misses += 1
    c.elements += info.elementsBilled
    lsSet(LS_COST, c)
  }

  startGame = () => {
    ;[
      this.attractTimer,
      this.playTimer,
      this.endTimer,
      this.countTimer,
    ].forEach(clearInterval)
    cancelAnimationFrame(this.raf)
    this.animTok++
    this.sfx("start")
    this.game = null
    this.layer?.clearLayers()
    const tok = ++this.gameTok
    this.setState(
      {
        order: [],
        drag: null,
        left: this.cfg().time,
        count: 0,
        raceT: 0,
        name: "",
        contact: "",
        contactErr: false,
        nameErr: false,
        joined: false,
        result: null,
        gameReady: false,
        board: null,
      },
      () => this.go("ready")
    )
    void this.createGame().then(({ game, initialOrder }) => {
      if (tok !== this.gameTok || !this.mounted) return
      this.game = game
      this.lastSc = game.scenarioId
      this.setState({ order: initialOrder, gameReady: true }, () => {
        this.drawPlan()
        this.fit(this.pts(game).map((c) => [c.lat, c.lng]))
      })
      // Precarga la línea del óptimo para la carrera (solo si ya se conoce: local).
      if (game.local) {
        const best = game.local.best
        void this.getGeo([
          game.start,
          ...best.order.map((i) => game.stops[i]),
          game.end,
        ]).then((geo) => (game.optGeo = geo))
      }
    })
  }

  beginCountdown = () => {
    if (!this.state.gameReady) return
    this.sfx("count")
    this.setState({ count: 3 })
    clearInterval(this.countTimer)
    this.countTimer = setInterval(() => {
      const c = this.state.count - 1
      if (c <= 0) {
        clearInterval(this.countTimer)
        this.setState({ count: 0 })
        this.sfx("go")
        this.go("play", () => this.startPlay())
      } else {
        this.sfx("count")
        this.setState({ count: c })
      }
    }, 1000)
  }

  startPlay() {
    this.playStart = Date.now()
    this.lastAct = Date.now()
    if (this.game) this.game.startedAt = Date.now()
    clearInterval(this.playTimer)
    this.playTimer = setInterval(() => {
      const l =
        this.cfg().time - Math.floor((Date.now() - this.playStart) / 1000)
      if (l !== this.state.left) {
        this.setState({ left: Math.max(0, l) })
        if (l <= 10 && l > 0) this.sfx(l <= 5 ? "urgent" : "tick")
      }
      if (l <= 0) {
        clearInterval(this.playTimer)
        void this.submitRoute(true)
      }
    }, 200)
  }

  dragDown(i: number, e: ReactPointerEvent<HTMLDivElement>) {
    if (this.state.screen !== "play") return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
    const el = this.cardEls[0]
    const el2 = this.cardEls[1]
    this.rowH =
      el && el2
        ? el2.getBoundingClientRect().top - el.getBoundingClientRect().top
        : 84
    this.dragY0 = e.clientY
    this.sfx("grab")
    this.setState({ drag: { i, dy: 0 } })
    this.drawPlan(this.state.order[i])
  }

  dragMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = this.state.drag
    if (!d) return
    this.lastAct = Date.now()
    this.setState({ drag: { i: d.i, dy: e.clientY - this.dragY0 } })
  }

  dragTarget() {
    const d = this.state.drag
    const n = this.state.order.length
    if (!d) return -1
    return Math.max(0, Math.min(n - 1, d.i + Math.round(d.dy / this.rowH)))
  }

  dragUp() {
    const d = this.state.drag
    if (!d) return
    const t = this.dragTarget()
    const o = this.state.order.slice()
    const [m] = o.splice(d.i, 1)
    o.splice(t, 0, m)
    if (t !== d.i) this.sfx("drop")
    this.setState({ order: o, drag: null }, () => this.drawPlan())
  }

  // --- Registro de la partida ---------------------------------------------------------

  payload(g: Game, r: Result, extra: Record<string, unknown> = {}) {
    const deviceId = this.deviceId()
    return {
      ...(this.props.eventTag ? { eventTag: this.props.eventTag } : {}),
      ...(deviceId ? { deviceId } : {}),
      startedAt: new Date(g.startedAt).toISOString(),
      endedAt: new Date(g.startedAt + r.used * 1000).toISOString(),
      userOrder: r.userOrder,
      timeUsedSec: Math.round(r.used),
      timeLimitSec: this.cfg().time,
      timedOut: r.timedOut,
      userAgent: navigator.userAgent.slice(0, 512),
      // Con los números del iPad: el servidor los usa solo si ya no tiene la partida.
      ...(r.computedBy === "client"
        ? {
            offline: {
              scenarioId: g.scenarioId,
              city: g.city,
              points: { start: g.start, stops: g.stops, end: g.end },
              optimalOrder: r.optOrder,
              userKm: Math.round(r.userKm * 1000) / 1000,
              optimalKm: Math.round(r.optKm * 1000) / 1000,
              userMin: Math.round(r.userMin * 10) / 10,
              optimalMin: Math.round(r.optMin * 10) / 10,
              distanceMethod: r.method ?? LOCAL_METHOD,
            },
          }
        : {}),
      ...extra,
    }
  }

  /** PUT de la partida. `data` con el resultado del servidor, o `null` si hay que reintentar. */
  async put(
    item: PendingGame
  ): Promise<{ done: boolean; data: Record<string, unknown> | null }> {
    try {
      const r = await fetch(`/api/juegos/optimizador/games/${item.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item.payload),
      })
      if (r.ok)
        return { done: true, data: (await r.json()) as Record<string, unknown> }
      // Rechazada por inválida: no tiene sentido reintentarla.
      if (
        r.status >= 400 &&
        r.status < 500 &&
        r.status !== 401 &&
        r.status !== 429
      ) {
        console.warn(
          "[juegos] partida rechazada",
          r.status,
          await r.text().catch(() => "")
        )
        return { done: true, data: null }
      }
    } catch {}
    return { done: false, data: null }
  }

  enqueue(item: PendingGame) {
    lsSet(LS_PENDING, [
      ...lsGet<PendingGame>(LS_PENDING).filter((p) => p.id !== item.id),
      item,
    ])
  }

  async send(item: PendingGame) {
    const { done } = await this.put(item)
    if (!done) this.enqueue(item)
  }

  async flushPending(toast: boolean) {
    const pend = lsGet<PendingGame>(LS_PENDING)
    if (!pend.length) {
      if (toast) this.toastMsg("No hay partidas pendientes")
      return
    }
    const fail: PendingGame[] = []
    for (const item of pend) if (!(await this.put(item)).done) fail.push(item)
    const added = lsGet<PendingGame>(LS_PENDING).filter(
      (p) => !pend.some((x) => x.id === p.id)
    )
    lsSet(LS_PENDING, [...fail, ...added])
    if (this.mounted) this.forceUpdate()
    if (toast)
      this.toastMsg(`Enviadas ${pend.length - fail.length} de ${pend.length}`)
  }

  retryPending = () => {
    void this.flushPending(true)
    void flushNewsletterQueue()
  }

  /** Copia plana de la partida para el CSV y el ranking de respaldo del iPad. */
  recordLocal(g: Game, r: Result) {
    const s = this.state
    const rec = {
      id: g.id,
      day: today(),
      startedAt: new Date(g.startedAt).toISOString(),
      endedAt: new Date().toISOString(),
      scenario: g.city,
      stops: g.stops.map((c) => c.name).join(" | "),
      userOrder: r.userOrder.map((i) => g.stops[i].name).join(" > "),
      optimalOrder: r.optOrder.map((i) => g.stops[i].name).join(" > "),
      userKm: Math.round(r.userKm * 100) / 100,
      optimalKm: Math.round(r.optKm * 100) / 100,
      extraKm: Math.round(r.dKm * 100) / 100,
      extraMin: Math.round(r.dMin * 10) / 10,
      efficiencyPct: Math.round(r.eff * 10) / 10,
      tie: r.tie,
      timeUsedSec: Math.round(r.used),
      timeLimitSec: this.cfg().time,
      timedOut: r.timedOut,
      distanceMethod: r.method,
      computedBy: r.computedBy,
      name: s.joined ? s.name : null,
      email: s.joined && s.contact ? s.contact : null,
      inRanking: s.joined,
    }
    lsSet(LS_ALL, [
      ...lsGet<{ id: string }>(LS_ALL).filter((x) => x.id !== rec.id),
      rec,
    ])
  }

  localResult(
    g: Game,
    userOrder: number[],
    used: number,
    timedOut: boolean
  ): Result {
    const { M, best, method } = this.withLocal(g)
    const mine = cost(userOrder, M)
    const tie = mine.km - best.km < 0.05
    return {
      userKm: mine.km,
      optKm: best.km,
      userMin: mine.min,
      optMin: best.min,
      dKm: Math.max(0, mine.km - best.km),
      dMin: Math.max(0, mine.min - best.min),
      eff: tie ? 100 : Math.min(100, (best.km / mine.km) * 100),
      tie,
      used,
      timedOut,
      userOrder,
      optOrder: best.order,
      computedBy: "client",
      method,
    }
  }

  /** Mide la ruta: el servidor con la matriz de la partida; sin respuesta, el iPad. */
  async scoreGame(
    g: Game,
    userOrder: number[],
    used: number,
    timedOut: boolean
  ): Promise<Result> {
    const base: Result = {
      userKm: 0,
      optKm: 0,
      userMin: 0,
      optMin: 0,
      dKm: 0,
      dMin: 0,
      eff: 0,
      tie: false,
      used,
      timedOut,
      userOrder,
      optOrder: [],
      computedBy: "server",
      method: null,
    }
    if (g.server) {
      const { data } = await this.put({
        id: g.id,
        payload: this.payload(g, base),
      })
      if (data) {
        const d = data as {
          userKm: number
          optimalKm: number
          userMin: number
          optimalMin: number
          extraKm: number
          extraMin: number
          efficiencyPct: number
          tie: boolean
          optimalOrder: number[]
          computedBy: "server" | "client"
          distanceMethod: string | null
        }
        return {
          ...base,
          userKm: d.userKm,
          optKm: d.optimalKm,
          userMin: d.userMin,
          optMin: d.optimalMin,
          dKm: d.extraKm,
          dMin: d.extraMin,
          eff: d.efficiencyPct,
          tie: d.tie,
          optOrder: d.optimalOrder,
          computedBy: d.computedBy,
          method: d.distanceMethod,
        }
      }
    }
    const r = this.localResult(g, userOrder, used, timedOut)
    void this.send({ id: g.id, payload: this.payload(g, r) })
    return r
  }

  submitRoute = async (timedOut: boolean) => {
    if (this.state.screen !== "play" || !this.game) return
    clearInterval(this.playTimer)
    const g = this.game
    const used = Math.min(this.cfg().time, (Date.now() - this.playStart) / 1000)
    this.sfx(timedOut ? "meh" : "tap")
    if (timedOut) this.toastMsg("Se terminó el tiempo", AMBER)
    const userOrder = this.state.order.slice()
    this.setState({ drag: null, raceLoading: true, raceT: 0 })
    this.go("race")
    const res = await this.scoreGame(g, userOrder, used, timedOut)
    if (this.game !== g || !this.mounted) return
    this.recordLocal(g, res)
    const userSeq = [g.start, ...userOrder.map((i) => g.stops[i]), g.end]
    const optSeq = [g.start, ...res.optOrder.map((i) => g.stops[i]), g.end]
    const [ug, og] = await Promise.all([
      this.getGeo(userSeq),
      g.optGeo && res.computedBy === "client"
        ? Promise.resolve(g.optGeo)
        : this.getGeo(optSeq),
    ])
    if (this.game !== g || !this.mounted || !this.layer) return
    this.setState({ result: res, raceLoading: false })
    this.layer.clearLayers()
    this.pin(g.start, "start", "Salida")
    this.pin(g.end, "end", "Llegada")
    g.stops.forEach((c, i) =>
      this.pin(c, "stop", null, res.optOrder.indexOf(i) + 1)
    )
    this.fit([...ug.pts, ...og.pts])
    this.sfx("whoosh")
    const fo = Math.min(1, res.optKm / res.userKm)
    const P = this.pal()
    setTimeout(
      () =>
        this.animLines(
          [
            {
              pts: ug.pts,
              frac: 1,
              color: P.user,
              dotBg: P.userDot,
              weight: res.tie ? 13 : 4,
              glow: false,
            },
            { pts: og.pts, frac: fo, color: P.opt, casing: P.optCase },
          ],
          7000,
          (t) => this.setState({ raceT: t }),
          () => {
            this.sfx(res.eff >= 99.5 ? "win" : res.eff >= 85 ? "ok" : "meh")
            setTimeout(() => this.go("result"), 700)
          }
        ),
      900
    )
  }

  goJoin = () => {
    this.sfx("tap")
    this.go("join")
  }

  submitJoin = () => {
    const name = this.state.name.trim()
    const contact = this.state.contact.trim()
    if (!name) {
      this.sfx("meh")
      this.setState({ nameErr: true })
      return
    }
    if (contact && !isEmail(contact)) {
      this.sfx("meh")
      this.setState({ contactErr: true })
      return
    }
    if (contact) subscribeFromGame(contact, name)
    this.setState({ name, contact, joined: true }, () => {
      const g = this.game
      const r = this.state.result
      if (!g || !r) return void this.showRanking(Promise.resolve())
      this.recordLocal(g, r)
      const item = {
        id: g.id,
        payload: this.payload(g, r, {
          name,
          ...(contact ? { email: contact, emailConsent: true } : {}),
        }),
      }
      void this.showRanking(this.send(item))
    })
  }

  skipJoin = () => {
    void this.showRanking(Promise.resolve())
  }

  async fetchBoard(): Promise<Board | null> {
    const params = new URLSearchParams({
      ...(this.props.eventTag ? { eventTag: this.props.eventTag } : {}),
      ...(this.game ? { gameId: this.game.id } : {}),
    })
    try {
      const r = await fetch(`/api/juegos/optimizador/ranking?${params}`)
      if (!r.ok) return null
      const j = (await r.json()) as {
        total: number
        position: number | null
        entries: {
          position: number
          name: string
          efficiencyPct: number
          timeUsedSec: number
          mine: boolean
        }[]
      }
      return {
        total: j.total,
        pos: j.position,
        rows: j.entries.map((e) => ({
          pos: e.position,
          name: e.name,
          time: e.timeUsedSec,
          eff: e.efficiencyPct,
          mine: e.mine,
        })),
      }
    } catch {
      return null
    }
  }

  /** Ranking de respaldo con las partidas de este iPad (el `board()` del prototipo). */
  localBoard(): Board {
    const d = today()
    const me = this.game?.id
    const rows = lsGet<{
      id: string
      day: string
      inRanking: boolean
      name: string
      efficiencyPct: number
      timeUsedSec: number
    }>(LS_ALL)
      .filter((r) => r.day === d && r.inRanking)
      .sort(
        (a, b) =>
          b.efficiencyPct - a.efficiencyPct || a.timeUsedSec - b.timeUsedSec
      )
    const pos = rows.findIndex((r) => r.id === me)
    let show = rows.slice(0, 7).map((r, i) => ({ r, i }))
    if (pos >= 7)
      show = rows
        .slice(0, 6)
        .map((r, i) => ({ r, i }))
        .concat([{ r: rows[pos], i: pos }])
    return {
      total: rows.length,
      pos: pos >= 0 ? pos + 1 : null,
      rows: show.map(({ r, i }) => ({
        pos: i + 1,
        name: r.name,
        time: r.timeUsedSec,
        eff: r.efficiencyPct,
        mine: r.id === me,
      })),
    }
  }

  async showRanking(saved: Promise<unknown>) {
    this.sfx("ok")
    this.setState({ endLeft: RANKING_SECONDS, board: null })
    this.go("ranking")
    // Espera el PUT con el nombre para que la partida ya aparezca en el ranking.
    await Promise.race([saved, new Promise((r) => setTimeout(r, 4000))])
    const board = (await this.fetchBoard()) ?? this.localBoard()
    if (!this.mounted || this.state.screen !== "ranking") return
    this.setState({ board })
    clearInterval(this.endTimer)
    this.endTimer = setInterval(() => {
      const l = this.state.endLeft - 1
      if (l <= 0) this.resetToAttract()
      else this.setState({ endLeft: l })
    }, 1000)
  }

  resetToAttract = () => {
    ;[this.playTimer, this.endTimer, this.countTimer].forEach(clearInterval)
    cancelAnimationFrame(this.raf)
    this.animTok++
    this.gameTok++
    clearTimeout(this.goT)
    this.game = null
    this.layer?.clearLayers()
    this.setState(
      {
        screen: "attract",
        count: 0,
        drag: null,
        toast: null,
        leaving: false,
        gameReady: false,
        board: null,
      },
      () => setTimeout(() => this.startAttract(), 0)
    )
  }

  // --- Modo stand ---------------------------------------------------------------------

  onLogoTap = () => {
    const now = Date.now()
    this.taps = this.tapT && now - this.tapT < 1500 ? (this.taps || 0) + 1 : 1
    this.tapT = now
    if (this.taps >= 5) {
      this.taps = 0
      this.setState({ admin: true })
    }
  }

  onAnyTouch = () => {
    this.lastAct = Date.now()
    if (this.ac && this.ac.state === "suspended") void this.ac.resume()
  }

  setConfig(patch: Partial<Config>) {
    const cfg = { ...this.state.cfg, ...patch }
    lsSet(LS_CONFIG, cfg)
    this.setState({ cfg })
    if (this.state.screen === "attract") this.setState({ left: cfg.time })
  }

  downloadCsv = () => {
    const all = lsGet<Record<string, unknown>>(LS_ALL)
    if (!all.length) {
      this.toastMsg("Todavía no hay partidas", AMBER)
      return
    }
    const keys = Object.keys(all[0])
    const esc = (v: unknown) =>
      v == null ? "" : `"${String(v).replace(/"/g, '""')}"`
    const csv = [
      keys.join(","),
      ...all.map((r) => keys.map((k) => esc(r[k])).join(",")),
    ].join("\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    a.download = `movo-optimizador-${today()}.csv`
    a.click()
  }

  clearRanking = async () => {
    const d = today()
    lsSet(
      LS_ALL,
      lsGet<{ day: string }>(LS_ALL).map((r) =>
        r.day === d ? { ...r, inRanking: false } : r
      )
    )
    try {
      const r = await fetch("/api/juegos/optimizador/ranking/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          this.props.eventTag ? { eventTag: this.props.eventTag } : {}
        ),
      })
      if (!r.ok) throw new Error(String(r.status))
      this.toastMsg("Ranking de hoy reiniciado")
    } catch {
      this.toastMsg("Solo se reinició en este iPad: sin conexión", AMBER)
    }
    this.forceUpdate()
  }

  resetCost = () => {
    lsSet(LS_COST, { games: 0, hits: 0, misses: 0, elements: 0 })
    this.forceUpdate()
  }

  // --- Render -------------------------------------------------------------------------

  costBadge(): { text: string; dot: string } | null {
    const g = this.game
    if (!g) return null
    if (!g.server) return { text: "local · sin backend", dot: "#8A8A93" }
    const info = g.matrixInfo
    if (!info) return null
    if (info.provider === "haversine_mock")
      return { text: "mock · sin costo", dot: "#8A8A93" }
    if (info.cache === "hit")
      return { text: "matriz en cache · $0", dot: "#8A8A93" }
    return {
      text: `matriz nueva · Google · ${info.elementsBilled} elem.`,
      dot: AMBER,
    }
  }

  render() {
    const s = this.state
    const sc = s.screen
    const g = this.game
    const c = s.cfg
    const r = s.result
    const vw = typeof window === "undefined" ? 1280 : window.innerWidth
    const d = s.drag
    const tgt = d ? this.dragTarget() : -1
    const rh = this.rowH || 84
    const cards = g
      ? s.order.map((si, i) => {
          const st = g.stops[si]
          const me = !!d && d.i === i
          let y = 0
          if (d && !me) {
            if (i > d.i && i <= tgt) y = -rh
            else if (i < d.i && i >= tgt) y = rh
          }
          return {
            key: st.name,
            i,
            name: st.name,
            zone: st.zone,
            num: String(me ? tgt + 1 : i + 1 + (y ? (y > 0 ? 1 : -1) : 0)),
            transform: me
              ? `translateY(${d!.dy}px) scale(1.03)`
              : `translateY(${y}px)`,
            transition: me
              ? "box-shadow .15s"
              : "transform .2s cubic-bezier(.22,1,.36,1)",
            z: me ? 5 : 1,
            border: me ? LIME : "rgba(255,255,255,.1)",
            bg: me ? "#202024" : "#1A1A1D",
            shadow: me ? "0 18px 40px rgba(0,0,0,.5)" : "none",
          }
        })
      : []
    // Km en vivo: estimación en línea recta × 1,35 (la medición real la hace el
    // servidor al terminar, con la matriz de la partida).
    const live =
      c.liveKm && g
        ? (g.server ? "≈ " : "") +
          km1(cost(s.order, this.withLocal(g).M).km) +
          " km"
        : ""
    const fo = r ? Math.min(1, r.optKm / r.userKm) : 1
    const t = s.raceT
    const eff = r ? r.eff : 0
    const tie = !!r && (r.tie || eff >= 99.5)
    const tier = !r
      ? ["", ""]
      : tie
        ? ["Igualaste al optimizador", "Empate con Movo. Ganaste."]
        : eff >= 95
          ? ["Muy cerca", "Casi un algoritmo."]
          : eff >= 85
            ? ["Bien ahí", "Buen ojo para las rutas."]
            : eff >= 70
              ? ["Se puede mejorar", "Le diste unas vueltas de más."]
              : ["Ruta larga", "Tomaste el camino largo."]
    const metrics = (
      !r
        ? []
        : tie
          ? [
              { v: km1(r.userKm) + " km", k: "tu recorrido, igual al de Movo" },
              { v: Math.round(r.userMin) + " min", k: "de manejo estimado" },
              { v: Math.round(r.used) + " s", k: "tardaste en resolverlo" },
              { v: "0 km", k: "de más" },
            ]
          : [
              { v: "+" + km1(r.dKm) + " km", k: "recorriste de más" },
              {
                v: "+" + Math.max(1, Math.round(r.dMin)) + " min",
                k: "de manejo extra",
              },
              { v: fmt(r.dKm * FUEL_PER_KM), k: "de nafta de más" },
              { v: km1(r.dKm * CO2_PER_KM) + " kg", k: "de CO₂ evitable" },
            ]
    ).map((m, i) => ({ ...m, delay: (0.3 + i * 0.08).toFixed(2) + "s" }))
    const note = !r
      ? ""
      : tie
        ? "El optimizador hace lo mismo en milisegundos, aunque sean 50 paradas y 20 personas repartiendo."
        : `Si repartís así todos los días, en un mes son ${Math.round(r.dKm * 22).toLocaleString("es-AR")} km y ${fmt(r.dKm * FUEL_PER_KM * 22)} que el optimizador te ahorra.`
    const b = s.board
    const urgent = s.left <= 10
    const timerColor = urgent ? "#E5484D" : LIME
    const timerFill = urgent ? "rgba(229,72,77,.22)" : "rgba(198,242,74,.16)"
    const pending = s.admin
      ? lsGet(LS_PENDING).length + newsletterPendingCount()
      : 0
    const total = s.admin ? lsGet(LS_ALL).length : 0
    const costCounters = s.admin ? loadCost() : null
    const showChrome = sc !== "attract"
    const attractX =
      s.leaving && sc === "attract" ? "translateX(-105%)" : "none"
    const stepOpacity = s.leaving && sc !== "attract" ? 0 : 1
    const panelWpx = Math.min(580, Math.max(440, vw * 0.46)) + "px"
    const badge = showChrome && c.costBadge ? this.costBadge() : null
    const startName = g ? g.start.name : ""
    const endName = g ? g.end.name : ""
    const nStops = g ? g.stops.length : c.stops
    const tierColor = tie ? LIME : eff >= 85 ? "#FFFFFF" : AMBER
    const effStr = Math.floor(eff) + "%"
    const rankTitle =
      s.joined && b && b.pos
        ? b.pos === 1
          ? "Vas primero en el día."
          : `Quedaste en el puesto ${b.pos} de ${b.total}.`
        : "Así va el día."

    return (
      <div
        className="mv-game"
        onPointerDown={this.onAnyTouch}
        style={css(
          "position:fixed;inset:0;background:#0A0A0B;color:#FFFFFF;font-family:var(--font-sans);overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent;z-index:200"
        )}
      >
        <div
          ref={(el) => void (this.mapEl = el)}
          style={css(
            `position:absolute;inset:0;z-index:0;background:${MAP_BG}`
          )}
        />
        <div
          style={css(
            "position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,rgba(10,10,11,.7) 0%,rgba(10,10,11,.25) 45%,rgba(10,10,11,0) 70%);opacity:0"
          )}
        />

        {sc === "attract" && (
          <div
            onClick={this.startGame}
            style={css(
              "position:absolute;inset:0;z-index:5;cursor:pointer;overflow:hidden"
            )}
          >
            <div
              style={css(
                `position:absolute;top:0;bottom:0;left:0;width:58%;transform:${attractX};transition:transform .45s cubic-bezier(.55,0,.1,1)`
              )}
            >
              <div
                style={css(
                  "position:absolute;inset:0;animation:mvLimeIn .7s cubic-bezier(.22,1,.36,1) both"
                )}
              >
                <div
                  style={css(
                    "position:absolute;inset:0;background:#C6F24A;clip-path:polygon(0 0,100% 0,86% 100%,0 100%)"
                  )}
                />
                <div
                  style={css(
                    "position:absolute;inset:0;clip-path:polygon(0 0,100% 0,86% 100%,0 100%);background-image:linear-gradient(rgba(10,10,11,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(10,10,11,.09) 1px,transparent 1px);background-size:32px 32px;-webkit-mask-image:radial-gradient(ellipse at 25% 65%,#000 0%,transparent 72%);mask-image:radial-gradient(ellipse at 25% 65%,#000 0%,transparent 72%)"
                  )}
                />
                <div
                  style={css(
                    "position:relative;height:100%;box-sizing:border-box;padding:clamp(108px,17vh,132px) 14% clamp(24px,5vh,48px) clamp(36px,5vw,64px);display:flex;flex-direction:column;justify-content:safe center;gap:clamp(14px,3.4vh,32px);overflow:hidden;color:#0A0A0B"
                  )}
                >
                  <span
                    style={css(
                      "font-size:clamp(14px,2.2vh,17px);font-weight:600;letter-spacing:.08em;text-transform:uppercase;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) .25s both"
                    )}
                  >
                    Vos contra el optimizador
                  </span>
                  <h1
                    style={css(
                      "margin:0;font-size:clamp(38px,min(6vw,9.5vh),88px);line-height:1.04;letter-spacing:-.045em;font-weight:900;text-wrap:balance;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) .35s both"
                    )}
                  >
                    ¿Armás una ruta mejor que{" "}
                    <span style={css("white-space:nowrap")}>la de Movo?</span>
                  </h1>
                  <p
                    style={css(
                      "margin:0;font-size:clamp(18px,3.2vh,26px);line-height:1.35;color:#2A2A2E;max-width:520px;text-wrap:pretty;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) .45s both"
                    )}
                  >
                    Ordená {c.stops} paradas en {c.time} segundos. Después mirá
                    cómo las acomoda el optimizador.
                  </p>
                  <div
                    style={css(
                      "display:flex;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) .55s both"
                    )}
                  >
                    <div
                      style={css(
                        "height:clamp(68px,12vh,104px);padding:0 clamp(28px,3.6vw,48px);white-space:nowrap;border-radius:999px;background:#0A0A0B;color:#C6F24A;display:flex;align-items:center;gap:16px;font-size:clamp(24px,4.2vh,34px);font-weight:600;letter-spacing:-.02em;animation:mvPulseInk 1.8s cubic-bezier(.22,1,.36,1) infinite"
                      )}
                    >
                      Tocá para jugar
                      <ArrowRight size={36} strokeWidth={2.25} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {!!s.attractLabel && (
              <div
                style={css(
                  "position:absolute;left:calc(50% + 24px);right:32px;bottom:32px;display:flex;justify-content:flex-end"
                )}
              >
                <div
                  style={css(
                    "display:flex;align-items:center;gap:14px;padding:14px 22px;border-radius:999px;background:rgba(10,10,11,.8);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(198,242,74,.35)"
                  )}
                >
                  <span
                    style={css(
                      "width:10px;height:10px;border-radius:999px;background:#C6F24A;animation:mvDot 2s ease-in-out infinite"
                    )}
                  />
                  <span
                    style={css(
                      "font-family:var(--font-mono);font-size:clamp(15px,2.6vh,20px);color:#FFFFFF"
                    )}
                  >
                    {s.attractLabel}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div
          style={css(
            "position:absolute;top:28px;left:32px;right:32px;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:24px;pointer-events:none"
          )}
        >
          <div
            onClick={this.onLogoTap}
            aria-hidden="true"
            style={css("width:140px;height:64px;pointer-events:auto")}
          />
          <div style={css("display:flex;gap:12px;pointer-events:auto")}>
            {sc === "play" && (
              <div
                style={css(
                  `position:relative;height:64px;min-width:200px;box-sizing:border-box;padding:0 24px;border-radius:999px;overflow:hidden;border:2px solid ${timerColor};background:rgba(10,10,11,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;gap:12px`
                )}
              >
                <div
                  style={css(
                    `position:absolute;left:0;top:0;bottom:0;width:${((s.left / c.time) * 100).toFixed(1)}%;background:${timerFill};transition:width 1s linear`
                  )}
                />
                <Clock stroke={timerColor} />
                <span
                  style={css(
                    `position:relative;font-family:var(--font-mono);font-size:32px;font-weight:600;color:${timerColor}`
                  )}
                >
                  {timerStr(s.left)}
                </span>
              </div>
            )}
            <button
              onClick={() => this.setState({ soundOn: !s.soundOn })}
              aria-label="Sonido"
              style={css(
                "width:64px;height:64px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(10,10,11,.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#FFFFFF;display:flex;align-items:center;justify-content:center;cursor:pointer"
              )}
            >
              {s.soundOn ? <SoundOn /> : <SoundOff />}
            </button>
            {showChrome && (
              <button
                onClick={this.resetToAttract}
                style={css(
                  "height:64px;padding:0 24px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(10,10,11,.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#FFFFFF;display:flex;align-items:center;gap:10px;font-size:18px;font-weight:600;font-family:inherit;cursor:pointer"
                )}
              >
                <Restart />
                Empezar de nuevo
              </button>
            )}
          </div>
        </div>

        {showChrome && (
          <div
            ref={(el) => void (this.panelEl = el)}
            style={css(
              `position:absolute;left:32px;top:32px;bottom:32px;width:${panelWpx};animation:mvPanelIn .5s cubic-bezier(.22,1,.36,1) both;z-index:6;box-sizing:border-box;padding:clamp(24px,4vh,36px);border-radius:14px;background:rgba(10,10,11,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);display:flex;flex-direction:column;overflow-y:auto`
            )}
          >
            <div
              style={css(
                `display:flex;flex-direction:column;flex:1;opacity:${stepOpacity};transition:opacity .2s ease`
              )}
            >
              {sc === "ready" && (
                <div
                  style={css(
                    "display:flex;flex-direction:column;gap:28px;flex:1;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                  )}
                >
                  {!s.gameReady || !g ? (
                    <div
                      style={css(
                        "display:flex;flex-direction:column;gap:18px;flex:1;justify-content:center"
                      )}
                    >
                      <span
                        style={css(
                          "width:36px;height:36px;border-radius:999px;border:4px solid rgba(198,242,74,.25);border-top-color:#C6F24A;box-sizing:border-box;animation:mvSpin .8s linear infinite"
                        )}
                      />
                      <h1
                        style={css(
                          "margin:0;font-size:clamp(34px,3.6vw,48px);line-height:1.05;letter-spacing:-.035em;font-weight:600"
                        )}
                      >
                        Armando el recorrido…
                      </h1>
                      <p
                        style={css(
                          "margin:0;font-size:22px;line-height:1.4;color:#B4B4BC"
                        )}
                      >
                        El optimizador ya está resolviendo su ruta.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        style={css(
                          "display:flex;flex-direction:column;gap:12px"
                        )}
                      >
                        <span
                          style={css(
                            "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
                          )}
                        >
                          Hoy viajás por {g.city}
                        </span>
                        <h1
                          style={css(
                            "margin:0;font-size:clamp(40px,4.2vw,56px);line-height:1.04;letter-spacing:-.035em;font-weight:600;text-wrap:balance"
                          )}
                        >
                          Vas de {startName} a {endName}.
                        </h1>
                        <p
                          style={css(
                            "margin:0;font-size:22px;line-height:1.4;color:#B4B4BC;text-wrap:pretty"
                          )}
                        >
                          En el camino llevás {nStops} paquetes. Arrastrá las
                          paradas para armar el recorrido más corto. Tenés{" "}
                          {c.time} segundos.
                        </p>
                      </div>
                      <div
                        style={css(
                          "display:flex;flex-direction:column;gap:14px"
                        )}
                      >
                        <div
                          style={css(
                            "display:flex;align-items:center;gap:16px;font-size:20px;color:#D5D5DB"
                          )}
                        >
                          <span
                            style={css(
                              "width:18px;height:18px;border-radius:4px;background:#C6F24A;flex:none"
                            )}
                          />
                          Salís de {startName}
                        </div>
                        <div
                          style={css(
                            "display:flex;align-items:center;gap:16px;font-size:20px;color:#D5D5DB"
                          )}
                        >
                          <span
                            style={css(
                              "width:18px;height:18px;border-radius:999px;background:#FFFFFF;flex:none"
                            )}
                          />
                          {nStops} paradas de entrega
                        </div>
                        <div
                          style={css(
                            "display:flex;align-items:center;gap:16px;font-size:20px;color:#D5D5DB"
                          )}
                        >
                          <span
                            style={css(
                              "width:18px;height:18px;border-radius:999px;background:#2B6BFF;border:3px solid #FFFFFF;box-sizing:border-box;flex:none"
                            )}
                          />
                          Llegás a {endName}
                        </div>
                      </div>
                    </>
                  )}
                  <div style={css("margin-top:auto;display:flex")}>
                    <button
                      className="mv-press"
                      onClick={this.beginCountdown}
                      disabled={!s.gameReady}
                      style={css(
                        `flex:1;height:88px;border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:28px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:14px;cursor:pointer;opacity:${s.gameReady ? 1 : 0.4}`
                      )}
                    >
                      Estoy listo
                      <ArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {sc === "play" && g && (
                <div
                  style={css(
                    "display:flex;flex-direction:column;gap:clamp(10px,1.6vh,16px);flex:1;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                  )}
                >
                  <div
                    style={css("display:flex;flex-direction:column;gap:6px")}
                  >
                    <span
                      style={css(
                        "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
                      )}
                    >
                      {g.city} · {g.zone}
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(30px,3.2vw,42px);line-height:1.05;letter-spacing:-.035em;font-weight:600"
                      )}
                    >
                      Ordená tu recorrido
                    </h1>
                  </div>
                  <div
                    style={css(
                      "display:flex;align-items:center;gap:14px;height:clamp(44px,6vh,52px);padding:0 18px;border-radius:10px;background:rgba(198,242,74,.1);font-size:19px;color:#D5D5DB"
                    )}
                  >
                    <span
                      style={css(
                        "width:16px;height:16px;border-radius:4px;background:#C6F24A;flex:none"
                      )}
                    />
                    <span style={css("font-weight:600;color:#FFFFFF")}>
                      Salida
                    </span>
                    {startName}
                  </div>
                  <div
                    style={css("display:flex;flex-direction:column;gap:8px")}
                  >
                    {cards.map((card) => (
                      <div
                        key={card.key}
                        ref={(el) => void (this.cardEls[card.i] = el)}
                        onPointerDown={(e) => this.dragDown(card.i, e)}
                        onPointerMove={(e) => this.dragMove(e)}
                        onPointerUp={() => this.dragUp()}
                        onPointerCancel={() => this.dragUp()}
                        style={css(
                          `position:relative;z-index:${card.z};display:flex;align-items:center;gap:16px;height:clamp(58px,8.6vh,76px);padding:0 14px 0 12px;border-radius:10px;border:2px solid ${card.border};background:${card.bg};box-shadow:${card.shadow};transform:${card.transform};transition:${card.transition};touch-action:none;cursor:grab`
                        )}
                      >
                        <span
                          style={css(
                            "width:44px;height:44px;flex:none;border-radius:999px;background:#FFFFFF;color:#0A0A0B;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:600"
                          )}
                        >
                          {card.num}
                        </span>
                        <span
                          style={css(
                            "display:flex;flex-direction:column;gap:2px;min-width:0;flex:1"
                          )}
                        >
                          <span
                            style={css(
                              "font-size:clamp(19px,2.6vh,23px);font-weight:600;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
                            )}
                          >
                            {card.name}
                          </span>
                          <span style={css("font-size:15px;color:#8A8A93")}>
                            {card.zone}
                          </span>
                        </span>
                        <Grip />
                      </div>
                    ))}
                  </div>
                  <div
                    style={css(
                      "display:flex;align-items:center;gap:14px;height:clamp(44px,6vh,52px);padding:0 18px;border-radius:10px;background:rgba(43,107,255,.14);font-size:19px;color:#D5D5DB"
                    )}
                  >
                    <span
                      style={css(
                        "width:16px;height:16px;border-radius:999px;background:#2B6BFF;border:3px solid #FFFFFF;box-sizing:border-box;flex:none"
                      )}
                    />
                    <span style={css("font-weight:600;color:#FFFFFF")}>
                      Llegada
                    </span>
                    {endName}
                  </div>
                  {c.liveKm && (
                    <span
                      style={css(
                        "font-family:var(--font-mono);font-size:18px;color:#B4B4BC"
                      )}
                    >
                      Tu recorrido: {live}
                    </span>
                  )}
                  <div style={css("margin-top:auto;display:flex")}>
                    <button
                      className="mv-press"
                      onClick={() => void this.submitRoute(false)}
                      style={css(
                        "flex:1;height:clamp(68px,10vh,88px);border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:26px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:14px;cursor:pointer"
                      )}
                    >
                      Listo, esta es mi ruta
                      <CheckSmall />
                    </button>
                  </div>
                </div>
              )}

              {sc === "race" && (
                <div
                  style={css(
                    "display:flex;flex-direction:column;gap:28px;flex:1;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                  )}
                >
                  <div
                    style={css("display:flex;flex-direction:column;gap:12px")}
                  >
                    <span
                      style={css(
                        "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
                      )}
                    >
                      {r?.timedOut
                        ? "Se terminó el tiempo"
                        : "Tu ruta vs. Movo"}
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(40px,4.2vw,56px);line-height:1.04;letter-spacing:-.035em;font-weight:600"
                      )}
                    >
                      Arranca la carrera
                    </h1>
                    <p
                      style={css(
                        "margin:0;font-size:22px;line-height:1.4;color:#B4B4BC"
                      )}
                    >
                      Los dos salen al mismo tiempo y a la misma velocidad.
                    </p>
                  </div>
                  <div
                    style={css("display:flex;flex-direction:column;gap:22px")}
                  >
                    <div
                      style={css("display:flex;flex-direction:column;gap:12px")}
                    >
                      <div
                        style={css(
                          "display:flex;align-items:baseline;justify-content:space-between;gap:16px"
                        )}
                      >
                        <span
                          style={css(
                            "display:flex;align-items:center;gap:12px;font-size:24px;font-weight:600"
                          )}
                        >
                          <span
                            style={css(
                              `width:18px;height:18px;border-radius:999px;background:${this.pal().user};border:3px solid #FFFFFF;box-sizing:border-box`
                            )}
                          />
                          Tu ruta
                        </span>
                        <span
                          style={css(
                            "font-family:var(--font-mono);font-size:30px;font-weight:600"
                          )}
                        >
                          {r ? km1(Math.min(1, t) * r.userKm) + " km" : "—"}
                        </span>
                      </div>
                      <div
                        style={css(
                          "height:12px;border-radius:999px;background:#1A1A1D;overflow:hidden"
                        )}
                      >
                        <div
                          style={css(
                            `height:100%;width:${(Math.min(1, t) * 100).toFixed(1)}%;border-radius:999px;background:#FFFFFF`
                          )}
                        />
                      </div>
                    </div>
                    <div
                      style={css("display:flex;flex-direction:column;gap:12px")}
                    >
                      <div
                        style={css(
                          "display:flex;align-items:baseline;justify-content:space-between;gap:16px"
                        )}
                      >
                        <span
                          style={css(
                            "display:flex;align-items:center;gap:12px;font-size:24px;font-weight:600;color:#C6F24A"
                          )}
                        >
                          <span
                            style={css(
                              "width:16px;height:16px;border-radius:999px;background:#C6F24A;box-shadow:0 0 12px rgba(198,242,74,.8)"
                            )}
                          />
                          Optimizador Movo
                        </span>
                        <span
                          style={css(
                            "font-family:var(--font-mono);font-size:30px;font-weight:600;color:#C6F24A"
                          )}
                        >
                          {r ? km1(Math.min(1, t / fo) * r.optKm) + " km" : "—"}
                        </span>
                      </div>
                      <div
                        style={css(
                          "height:12px;border-radius:999px;background:#1A1A1D;overflow:hidden"
                        )}
                      >
                        <div
                          style={css(
                            `height:100%;width:${(Math.min(1, t / fo) * 100).toFixed(1)}%;border-radius:999px;background:#C6F24A;box-shadow:0 0 14px rgba(198,242,74,.7)`
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  {s.raceLoading && (
                    <div
                      style={css(
                        "display:flex;align-items:center;gap:14px;font-size:20px;color:#B4B4BC"
                      )}
                    >
                      <span
                        style={css(
                          "width:22px;height:22px;border-radius:999px;border:3px solid rgba(198,242,74,.25);border-top-color:#C6F24A;box-sizing:border-box;animation:mvSpin .8s linear infinite"
                        )}
                      />
                      Trazando las rutas por las calles…
                    </div>
                  )}
                </div>
              )}

              {sc === "result" && r && (
                <div
                  style={css(
                    "display:flex;flex-direction:column;gap:clamp(16px,2.6vh,24px);flex:1;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                  )}
                >
                  <div
                    style={css("display:flex;flex-direction:column;gap:10px")}
                  >
                    <span
                      style={css(
                        `font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${tierColor}`
                      )}
                    >
                      {r.timedOut && !tie
                        ? "Se terminó el tiempo · " + tier[0]
                        : tier[0]}
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(36px,4vw,52px);line-height:1.04;letter-spacing:-.035em;font-weight:600;text-wrap:balance"
                      )}
                    >
                      {tier[1]}
                    </h1>
                  </div>
                  <div
                    style={css(
                      "display:flex;align-items:flex-end;gap:18px;animation:mvPop .6s cubic-bezier(.34,1.56,.64,1) .15s both"
                    )}
                  >
                    <span
                      style={css(
                        `font-size:clamp(80px,13vh,128px);line-height:.9;font-weight:600;letter-spacing:-.05em;color:${tierColor}`
                      )}
                    >
                      {effStr}
                    </span>
                    <span
                      style={css(
                        "font-size:20px;line-height:1.3;color:#B4B4BC;padding-bottom:8px"
                      )}
                    >
                      de eficiencia
                      <br />
                      vs. el optimizador
                    </span>
                  </div>
                  <div
                    style={css(
                      "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"
                    )}
                  >
                    {metrics.map((m) => (
                      <div
                        key={m.k}
                        style={css(
                          `display:flex;flex-direction:column;gap:4px;padding:16px 18px;border-radius:10px;background:#111113;border:1px solid rgba(255,255,255,.08);animation:mvFadeUp .5s cubic-bezier(.22,1,.36,1) both;animation-delay:${m.delay}`
                        )}
                      >
                        <span
                          style={css(
                            "font-family:var(--font-mono);font-size:clamp(24px,3.6vh,32px);font-weight:600;color:#FFFFFF"
                          )}
                        >
                          {m.v}
                        </span>
                        <span
                          style={css(
                            "font-size:16px;line-height:1.3;color:#8A8A93"
                          )}
                        >
                          {m.k}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p
                    style={css(
                      "margin:0;font-size:19px;line-height:1.4;color:#B4B4BC;text-wrap:pretty"
                    )}
                  >
                    {note}
                  </p>
                  <div style={css("margin-top:auto;display:flex")}>
                    <button
                      className="mv-press"
                      onClick={this.goJoin}
                      style={css(
                        "flex:1;height:88px;border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:28px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:14px;cursor:pointer"
                      )}
                    >
                      Entrar al ranking del día
                      <ArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {sc === "join" && (
                <div
                  style={css(
                    "display:flex;flex-direction:column;gap:22px;flex:1;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                  )}
                >
                  <div
                    style={css("display:flex;flex-direction:column;gap:12px")}
                  >
                    <span
                      style={css(
                        "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
                      )}
                    >
                      Ranking del día · {effStr}
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(40px,4.2vw,56px);line-height:1.04;letter-spacing:-.035em;font-weight:600"
                      )}
                    >
                      ¿Con qué nombre te anotamos?
                    </h1>
                  </div>
                  <div
                    style={css("display:flex;flex-direction:column;gap:8px")}
                  >
                    <span style={css("font-size:17px;color:#B4B4BC")}>
                      Nombre o apodo
                    </span>
                    <input
                      className="mv-input"
                      value={s.name}
                      onChange={(e) =>
                        this.setState({ name: e.target.value, nameErr: false })
                      }
                      maxLength={18}
                      placeholder="Ej: Juli"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      style={css(
                        `width:100%;box-sizing:border-box;height:80px;padding:0 24px;border-radius:10px;border:2px solid ${s.nameErr ? "#E5484D" : "rgba(255,255,255,.16)"};background:#111113;color:#FFFFFF;font-family:inherit;font-size:28px;font-weight:500;outline:none;user-select:text;-webkit-user-select:text`
                      )}
                    />
                  </div>
                  <div
                    style={css("display:flex;flex-direction:column;gap:8px")}
                  >
                    <span style={css("font-size:17px;color:#B4B4BC")}>
                      {RAFFLE_COPY.emailLabel}
                    </span>
                    <input
                      type="email"
                      inputMode="email"
                      className="mv-input"
                      value={s.contact}
                      onChange={(e) =>
                        this.setState({
                          contact: e.target.value,
                          contactErr: false,
                        })
                      }
                      placeholder={RAFFLE_COPY.emailPlaceholder}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      style={css(
                        `width:100%;box-sizing:border-box;height:80px;padding:0 24px;border-radius:10px;border:2px solid ${s.contactErr ? "#E5484D" : "rgba(255,255,255,.16)"};background:#111113;color:#FFFFFF;font-family:inherit;font-size:26px;font-weight:500;outline:none;user-select:text;-webkit-user-select:text`
                      )}
                    />
                    {s.contactErr ? (
                      <span style={css("font-size:17px;color:#E5484D")}>
                        {RAFFLE_COPY.invalid}
                      </span>
                    ) : (
                      <span
                        style={css(
                          "font-size:16px;line-height:1.4;color:#8A8A93;text-wrap:pretty"
                        )}
                      >
                        {RAFFLE_COPY.body}
                      </span>
                    )}
                  </div>
                  <div
                    style={css(
                      "margin-top:auto;display:flex;flex-direction:column;gap:12px"
                    )}
                  >
                    <button
                      className="mv-press"
                      onClick={this.submitJoin}
                      style={css(
                        "height:88px;border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:28px;font-weight:600;cursor:pointer"
                      )}
                    >
                      {RAFFLE_COPY.submit}
                    </button>
                    <button
                      onClick={this.skipJoin}
                      style={css(
                        "height:64px;border-radius:8px;border:1px solid rgba(255,255,255,.16);background:transparent;color:#FFFFFF;font-family:inherit;font-size:20px;font-weight:600;cursor:pointer"
                      )}
                    >
                      Ver el ranking sin anotarme
                    </button>
                  </div>
                </div>
              )}

              {sc === "ranking" && (
                <div
                  style={css(
                    "display:flex;flex-direction:column;gap:20px;flex:1;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                  )}
                >
                  <div
                    style={css("display:flex;flex-direction:column;gap:12px")}
                  >
                    <span
                      style={css(
                        "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
                      )}
                    >
                      Ranking del día
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(36px,4vw,52px);line-height:1.04;letter-spacing:-.035em;font-weight:600;text-wrap:balance"
                      )}
                    >
                      {rankTitle}
                    </h1>
                    {s.joined && !!s.contact && (
                      <span style={css("font-size:17px;color:#8A8A93")}>
                        {RAFFLE_COPY.joined(s.contact)}
                      </span>
                    )}
                  </div>
                  <div
                    style={css("display:flex;flex-direction:column;gap:6px")}
                  >
                    {!b ? (
                      <div
                        style={css(
                          "display:flex;align-items:center;gap:14px;font-size:20px;color:#B4B4BC"
                        )}
                      >
                        <span
                          style={css(
                            "width:22px;height:22px;border-radius:999px;border:3px solid rgba(198,242,74,.25);border-top-color:#C6F24A;box-sizing:border-box;animation:mvSpin .8s linear infinite"
                          )}
                        />
                        Cargando el ranking…
                      </div>
                    ) : b.rows.length ? (
                      b.rows.map((row, k) => (
                        <div
                          key={`${row.pos}-${row.name}`}
                          style={css(
                            `display:grid;grid-template-columns:44px minmax(0,1fr) auto auto;align-items:center;gap:16px;height:clamp(50px,7vh,62px);padding:0 18px;border-radius:10px;background:${row.mine ? "rgba(198,242,74,.12)" : "#111113"};border:2px solid ${row.mine ? LIME : "transparent"};animation:mvFadeUp .4s cubic-bezier(.22,1,.36,1) both;animation-delay:${(k * 0.05).toFixed(2)}s`
                          )}
                        >
                          <span
                            style={css(
                              `font-family:var(--font-mono);font-size:20px;font-weight:600;color:${row.pos <= 3 ? LIME : "#8A8A93"}`
                            )}
                          >
                            {row.pos}
                          </span>
                          <span
                            style={css(
                              "font-size:21px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
                            )}
                          >
                            {row.name}
                          </span>
                          <span
                            style={css(
                              "font-family:var(--font-mono);font-size:16px;color:#8A8A93"
                            )}
                          >
                            {row.time} s
                          </span>
                          <span
                            style={css(
                              `font-family:var(--font-mono);font-size:22px;font-weight:600;color:${row.eff >= 99.5 ? LIME : "#FFFFFF"}`
                            )}
                          >
                            {Math.round(row.eff)}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <p style={css("margin:0;font-size:20px;color:#8A8A93")}>
                        Todavía nadie se anotó hoy.
                      </p>
                    )}
                  </div>
                  <div
                    style={css(
                      "margin-top:auto;display:flex;flex-direction:column;gap:12px"
                    )}
                  >
                    <button
                      className="mv-press"
                      onClick={this.startGame}
                      style={css(
                        "height:88px;border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:28px;font-weight:600;cursor:pointer"
                      )}
                    >
                      Jugar otra vez
                    </button>
                    <span
                      style={css(
                        "font-size:17px;color:#8A8A93;text-align:center"
                      )}
                    >
                      Volvemos al inicio en {s.endLeft} s
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {s.count > 0 && (
          <div
            style={css(
              "position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(10,10,11,.55);pointer-events:none"
            )}
          >
            <span
              key={s.count}
              style={css(
                "font-size:min(40vh,320px);font-weight:600;letter-spacing:-.06em;color:#C6F24A;text-shadow:0 0 60px rgba(198,242,74,.5);animation:mvCount 1s cubic-bezier(.22,1,.36,1) both"
              )}
            >
              {s.count}
            </span>
          </div>
        )}

        {badge && (
          <div
            title="Costo de la matriz de distancias de esta partida"
            style={css(
              "position:absolute;right:24px;bottom:24px;z-index:14;display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;background:rgba(10,10,11,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.12);font-family:var(--font-mono);font-size:13px;color:#D5D5DB;pointer-events:none"
            )}
          >
            <span
              style={css(
                `width:8px;height:8px;border-radius:999px;background:${badge.dot}`
              )}
            />
            {badge.text}
          </div>
        )}

        {!!s.toast && (
          <div
            style={css(
              `position:absolute;right:32px;bottom:${badge ? 72 : 32}px;z-index:15;display:flex;align-items:center;gap:14px;padding:16px 24px;border-radius:999px;background:rgba(10,10,11,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.14);font-size:20px;font-weight:600;animation:mvFadeUp .3s cubic-bezier(.22,1,.36,1) both`
            )}
          >
            <span
              style={css(
                `width:10px;height:10px;border-radius:999px;background:${s.toastDot}`
              )}
            />
            {s.toast}
          </div>
        )}

        {s.admin && (
          <div
            style={css(
              "position:absolute;inset:0;z-index:30;background:rgba(10,10,11,.7);display:flex;align-items:center;justify-content:center"
            )}
          >
            <div
              style={css(
                "width:min(620px,92vw);max-height:92vh;overflow-y:auto;box-sizing:border-box;padding:36px;border-radius:14px;background:#FFFFFF;color:#0A0A0B;display:flex;flex-direction:column;gap:20px;box-shadow:0 24px 60px rgba(10,10,11,.3)"
              )}
            >
              <span
                style={css(
                  "font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5A5A62"
                )}
              >
                Modo stand
              </span>
              <div
                style={css(
                  "display:grid;grid-template-columns:1fr 1fr;gap:12px"
                )}
              >
                <AdminStat label="Partidas en el iPad" value={total} />
                <AdminStat label="Sin enviar al backend" value={pending} />
              </div>

              <AdminChoice
                label="Tiempo del reloj"
                options={TIME_OPTIONS.map((v) => ({ v, label: `${v} s` }))}
                value={c.time}
                onPick={(v) => this.setConfig({ time: v })}
              />
              <AdminChoice
                label="Paradas por partida"
                options={STOP_OPTIONS.map((v) => ({ v, label: String(v) }))}
                value={c.stops}
                onPick={(v) => this.setConfig({ stops: v })}
              />
              <div style={css("display:flex;gap:10px;flex-wrap:wrap")}>
                <AdminToggle
                  label="Km en vivo"
                  on={c.liveKm}
                  onToggle={() => this.setConfig({ liveKm: !c.liveKm })}
                />
                <AdminToggle
                  label="Indicador de costo"
                  on={c.costBadge}
                  onToggle={() => this.setConfig({ costBadge: !c.costBadge })}
                />
              </div>
              <span style={css("font-size:13px;color:#5A5A62")}>
                Los cambios aplican desde la próxima partida.
              </span>

              {costCounters && (
                <div
                  style={css(
                    "padding:16px 18px;border-radius:6px;background:#F1F1F3;display:flex;align-items:center;justify-content:space-between;gap:12px"
                  )}
                >
                  <span
                    style={css(
                      "font-family:var(--font-mono);font-size:14px;color:#2A2A2E;line-height:1.5"
                    )}
                  >
                    Matriz: {costCounters.hits} en cache · {costCounters.misses}{" "}
                    nuevas
                    <br />
                    Google: {costCounters.elements} elementos (≈ US$
                    {((costCounters.elements / 1000) * 5).toFixed(2)})
                  </span>
                  <button
                    onClick={this.resetCost}
                    style={css(
                      "height:40px;padding:0 14px;border-radius:8px;border:1px solid rgba(10,10,11,.18);background:#FFFFFF;color:#0A0A0B;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;flex:none"
                    )}
                  >
                    Poner en cero
                  </button>
                </div>
              )}

              <span
                style={css(
                  "font-family:var(--font-mono);font-size:14px;color:#5A5A62;word-break:break-all"
                )}
              >
                Endpoint: /api/juegos/optimizador · evento{" "}
                {this.props.eventTag ?? "web"}
              </span>
              <div style={css("display:flex;gap:10px;flex-wrap:wrap")}>
                <button
                  onClick={this.downloadCsv}
                  style={css(
                    "height:56px;padding:0 20px;border-radius:8px;border:0;background:#0A0A0B;color:#FFFFFF;font-family:inherit;font-size:17px;font-weight:600;cursor:pointer"
                  )}
                >
                  Descargar CSV
                </button>
                <button
                  onClick={this.retryPending}
                  style={css(
                    "height:56px;padding:0 20px;border-radius:8px;border:1px solid rgba(10,10,11,.18);background:#FFFFFF;color:#0A0A0B;font-family:inherit;font-size:17px;font-weight:600;cursor:pointer"
                  )}
                >
                  Reintentar envío
                </button>
                <button
                  onClick={() => void this.clearRanking()}
                  style={css(
                    "height:56px;padding:0 20px;border-radius:8px;border:1px solid rgba(229,72,77,.4);background:#FFFFFF;color:#E5484D;font-family:inherit;font-size:17px;font-weight:600;cursor:pointer"
                  )}
                >
                  Reiniciar ranking de hoy
                </button>
                <Link
                  href={withStand("/juegos", this.props.eventTag)}
                  style={css(
                    "height:56px;padding:0 20px;border-radius:8px;border:1px solid rgba(10,10,11,.18);background:#FFFFFF;color:#0A0A0B;font-family:inherit;font-size:17px;font-weight:600;cursor:pointer;display:flex;align-items:center;text-decoration:none"
                  )}
                >
                  Ir a juegos
                </Link>
                <button
                  onClick={() => this.setState({ admin: false })}
                  style={css(
                    "height:56px;padding:0 20px;border-radius:8px;border:1px solid rgba(10,10,11,.18);background:#FFFFFF;color:#0A0A0B;font-family:inherit;font-size:17px;font-weight:600;cursor:pointer;margin-left:auto"
                  )}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

function AdminStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={css(
        "padding:18px;border-radius:6px;background:#F1F1F3;display:flex;flex-direction:column;gap:4px"
      )}
    >
      <span style={css("font-size:15px;color:#5A5A62")}>{label}</span>
      <span style={css("font-size:40px;font-weight:600;letter-spacing:-.03em")}>
        {value}
      </span>
    </div>
  )
}

function AdminChoice({
  label,
  options,
  value,
  onPick,
}: {
  label: string
  options: { v: number; label: string }[]
  value: number
  onPick: (v: number) => void
}) {
  return (
    <div style={css("display:flex;flex-direction:column;gap:8px")}>
      <span style={css("font-size:15px;color:#5A5A62")}>{label}</span>
      <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onPick(o.v)}
            style={css(
              `height:52px;min-width:72px;padding:0 16px;border-radius:8px;border:1px solid ${o.v === value ? "#0A0A0B" : "rgba(10,10,11,.18)"};background:${o.v === value ? "#0A0A0B" : "#FFFFFF"};color:${o.v === value ? "#FFFFFF" : "#0A0A0B"};font-family:inherit;font-size:17px;font-weight:600;cursor:pointer`
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function AdminToggle({
  label,
  on,
  onToggle,
}: {
  label: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={css(
        `height:52px;padding:0 16px;border-radius:8px;border:1px solid ${on ? "#0A0A0B" : "rgba(10,10,11,.18)"};background:${on ? "#0A0A0B" : "#FFFFFF"};color:${on ? "#FFFFFF" : "#0A0A0B"};font-family:inherit;font-size:17px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:10px`
      )}
    >
      <span
        style={css(
          `width:10px;height:10px;border-radius:999px;background:${on ? LIME : "#B4B4BC"}`
        )}
      />
      {label}
    </button>
  )
}
