"use client"

import { audioCtx, initAudio } from "@/lib/juegos/audio"
import "leaflet/dist/leaflet.css"
import "../juegos.css"

import Link from "next/link"
import { Component, type PointerEvent as ReactPointerEvent } from "react"
import type * as Leaflet from "leaflet"

import { CITIES, fmt, haversineKm, norm, type City } from "@/lib/juegos/cities"
import { css } from "@/lib/juegos/css"
import { withStand } from "@/lib/juegos/event-tag"
import {
  flushNewsletterQueue,
  isEmail,
  newsletterPendingCount,
  RAFFLE_COPY,
  subscribeFromGame,
} from "../raffle"
import {
  MAP_BG,
  setupTileCache,
  TILE_OPTIONS,
  tileUrl,
} from "@/lib/juegos/map-tiles"
import { addProvinceLines } from "@/lib/juegos/provinces"
import { randomUUID } from "@/lib/uuid"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Meh,
  Pin,
  Restart,
  Search,
  SoundOff,
  SoundOn,
  ThumbDown,
  ThumbUp,
} from "./icons"

/**
 * Juego de precios de la feria: port del prototipo de Claude Design "Movo Feria"
 * (`Movo Feria.dc.html`), mismo flujo, estilos y textos. Diferencias con el prototipo:
 * - El precio sale del motor real de Movo (`demand_fuel_routes_v1`, vía
 *   `/api/juegos/precios/quote`), no de una réplica de la fórmula vieja en JS.
 * - Mapa claro fijo (pedido para la demo).
 * - Cada partida se guarda en la base de Movo (`/api/juegos/precios/sessions/[id]`), con
 *   cola offline en localStorage si no hay red.
 */

type PackagePreset = "letter" | "small" | "medium" | "fragile"
type Answer = "yes" | "maybe" | "no"
type AltChoice = number | "custom" | "none" | null
type Screen =
  | "attract"
  | "origin"
  | "dest"
  | "package"
  | "quote"
  | "senderAlt"
  | "courier"
  | "courierAlt"
  | "uber"
  | "email"
  | "thanks"

interface Pkg {
  id: PackagePreset
  type: "letter_document" | "standard_package" | "fragile_item"
  name: string
  desc: string
  w: string
  h: string
}

const PKGS: Pkg[] = [
  {
    id: "letter",
    type: "letter_document",
    name: "Sobre",
    desc: "Papeles, llaves, una carta",
    w: "44px",
    h: "30px",
  },
  {
    id: "small",
    type: "standard_package",
    name: "Caja chica",
    desc: "Ropa, un libro, un regalo",
    w: "40px",
    h: "40px",
  },
  {
    id: "medium",
    type: "standard_package",
    name: "Caja mediana",
    desc: "Un pedido grande, cosas de casa",
    w: "64px",
    h: "60px",
  },
  {
    id: "fragile",
    type: "fragile_item",
    name: "Algo frágil",
    desc: "Vajilla, una planta, un cuadro",
    w: "40px",
    h: "52px",
  },
]

interface QuoteBreakdown {
  distanceKm: number
  distanceSource: string
  base: number
  distance: number
  weight: number
  packageFactor: number
  demandMultiplier: number
}

interface ServerQuote {
  quoteId: string
  suggestedPriceArs: number
  highDemand: boolean | null
  breakdown: QuoteBreakdown | null
  commissionRate: number
  courierEarnArs: number
}

interface Quote {
  km: number
  base: number
  dist: number
  w: number
  fx: number
  demand: number
  price: number
  earn: number
  uber: number
}

interface PendingSession {
  id: string
  payload: Record<string, unknown>
}

interface Props {
  /** `?stand=` del kiosco (ej. `feria-utn-2026`); sin él las partidas quedan como `web`. */
  eventTag?: string
}

interface State {
  screen: Screen
  q: string
  origin: City | null
  dest: City | null
  pkg: Pkg | null
  phase: "routing" | "reveal"
  shown: number
  ask: boolean
  serverQuote: ServerQuote | null
  quoteStatus: "idle" | "loading" | "ok" | "error"
  sender: Answer | null
  senderAltPct: AltChoice
  senderWTP: number | null
  courier: Answer | null
  courierAltPct: AltChoice
  courierWTA: number | null
  slider: number
  email: string
  emailErr: boolean
  toast: string | null
  toastDot: string
  admin: boolean
  soundOn: boolean
  thanksLeft: number
  bars: boolean
  attractLabel: string
  leaving: boolean
  remote: City[]
  remoteQ: string
  searching: boolean
}

const IDLE_SECONDS = 60
const UBER_BASE = 1500
const UBER_PER_KM = 850
// Factor ruta / línea recta: solo para mostrar km antes de que llegue la cotización real.
const ROAD_FACTOR = 1.3
const LS_ALL = "movo-feria-responses"
const LS_PENDING = "movo-feria-pending"
const LS_DEVICE = "movo-feria-device"
const LS_ATTRACT = "movo-feria-attract-prices"
const ATTRACT_TTL_MS = 6 * 60 * 60 * 1000
const LIME = "#C6F24A"
const BLUE = "#2B6BFF"

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
/**
 * Tamaño de los números grandes (precio, estimado de Uber): el del prototipo como tope,
 * pero nunca más ancho que su columna. El prototipo asumía precios de 5 cifras; una ruta
 * larga da 6 (`$414.337`) y se salía de la pantalla. ~0,64em por carácter con el
 * tracking negativo del diseño; el contenedor declara `container-type: inline-size`.
 */
const fitFont = (designSize: string, text: string) =>
  text
    ? `min(${designSize}, calc(100cqw / ${(text.length * 0.64).toFixed(2)}))`
    : designSize

const altChoiceWire = (v: AltChoice) =>
  v === null
    ? null
    : typeof v === "number"
      ? (v > 0 ? "+" : "-") + Math.abs(Math.round(v * 100))
      : v

export class PricingGame extends Component<Props, State> {
  state: State = {
    screen: "attract",
    q: "",
    origin: null,
    dest: null,
    pkg: null,
    phase: "routing",
    shown: 0,
    ask: false,
    serverQuote: null,
    quoteStatus: "idle",
    sender: null,
    senderAltPct: null,
    senderWTP: null,
    courier: null,
    courierAltPct: null,
    courierWTA: null,
    slider: 0.6,
    email: "",
    emailErr: false,
    toast: null,
    toastDot: LIME,
    admin: false,
    soundOn: true,
    thanksLeft: 10,
    bars: false,
    attractLabel: "",
    leaving: false,
    remote: [],
    remoteQ: "",
    searching: false,
  }

  private L: typeof Leaflet | null = null
  private map: Leaflet.Map | null = null
  private tiles: Leaflet.LayerGroup | null = null
  private cityLayer: Leaflet.LayerGroup | null = null
  private routeLayer: Leaflet.LayerGroup | null = null
  private mapEl: HTMLDivElement | null = null
  private panelEl: HTMLDivElement | null = null
  private inputEl: HTMLInputElement | null = null
  private trackEl: HTMLDivElement | null = null
  private routes: Record<string, [number, number][]> = {}
  private attractPrices: Record<string, number> = {}
  private mounted = false
  private lastAct = 0
  private sid = ""
  private sessionStart: number | null = null
  private saved = false
  private routeDone = false
  private quoteTok = 0
  private drawTok = 0
  private geoId = 0
  private taps = 0
  private tapT = 0
  private drag = false
  private raf = 0
  private numRaf = 0
  private goT?: ReturnType<typeof setTimeout>
  private toastT?: ReturnType<typeof setTimeout>
  private geoT?: ReturnType<typeof setTimeout>
  private idleTimer?: ReturnType<typeof setInterval>
  private attractTimer?: ReturnType<typeof setInterval>
  private thanksTimer?: ReturnType<typeof setInterval>
  private retryTimer?: ReturnType<typeof setInterval>
  private onResize = () => {
    // Rotar el iPad o cambiar el tamaño de la ventana: Leaflet no se entera solo.
    this.map?.invalidateSize()
    this.forceUpdate()
  }

  // --- Cotización ---------------------------------------------------------------------

  quote(): Quote | null {
    const { serverQuote: sq, origin, dest } = this.state
    if (!sq || !origin || !dest) return null
    // El desglose puede venir null o incompleto (pricing desplegado sin `includeBreakdown`,
    // versiones desfasadas): cada campo se valida y cae a un valor neutro, nunca NaN.
    const b = sq.breakdown
    const num = (v: unknown, fallback: number) =>
      typeof v === "number" && Number.isFinite(v) ? v : fallback
    const km = num(b?.distanceKm, haversineKm(origin, dest) * ROAD_FACTOR)
    const base = num(b?.base, 0)
    const dist = num(b?.distance, 0)
    const w = num(b?.weight, 0)
    const sub = base + dist + w
    const packageFactor = num(b?.packageFactor, 1)
    const demandMultiplier = num(b?.demandMultiplier, 1)
    const fx = sub * (packageFactor - 1)
    const demand = sub * packageFactor * (demandMultiplier - 1)
    return {
      km,
      base,
      dist,
      w,
      fx,
      demand,
      price: sq.suggestedPriceArs,
      earn: sq.courierEarnArs,
      uber: UBER_BASE + km * UBER_PER_KM,
    }
  }

  /** Km a mostrar antes de tener la cotización: línea recta x 1,3. */
  estimatedKm() {
    const { origin, dest } = this.state
    return origin && dest ? haversineKm(origin, dest) * ROAD_FACTOR : 0
  }

  async requestQuote(
    o: City,
    d: City,
    preset: PackagePreset
  ): Promise<ServerQuote> {
    // Rate limit (varios iPads detrás del mismo wifi) o un hipo del backend: reintenta
    // solo un par de veces antes de mostrar el error.
    for (let attempt = 0; ; attempt++) {
      const res = await fetch("/api/juegos/precios/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          origin: { lat: o[2], lng: o[3] },
          destination: { lat: d[2], lng: d[3] },
          packagePreset: preset,
        }),
      })
      if (res.ok) return (await res.json()) as ServerQuote
      const retriable = res.status === 429 || res.status >= 500
      if (!retriable || attempt >= 2 || !this.mounted)
        throw new Error(`quote ${res.status}`)
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
    }
  }

  fetchQuote() {
    const { origin, dest, pkg } = this.state
    if (!origin || !dest || !pkg) return
    const tok = ++this.quoteTok
    this.setState({ quoteStatus: "loading", serverQuote: null })
    this.requestQuote(origin, dest, pkg.id)
      .then((serverQuote) => {
        if (tok !== this.quoteTok || !this.mounted) return
        this.setState({ serverQuote, quoteStatus: "ok" }, () =>
          this.maybeReveal()
        )
      })
      .catch(() => {
        if (tok !== this.quoteTok || !this.mounted) return
        this.setState({ quoteStatus: "error" })
        this.sfx("no")
      })
  }

  retryQuote = () => {
    this.sfx("tap")
    this.fetchQuote()
  }

  maybeReveal() {
    const s = this.state
    if (
      s.screen === "quote" &&
      s.phase === "routing" &&
      this.routeDone &&
      s.quoteStatus === "ok"
    )
      this.reveal()
  }

  // --- Ciclo de vida ------------------------------------------------------------------

  componentDidMount() {
    initAudio()
    this.lastAct = Date.now()
    this.mounted = true
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
        s !== "attract" &&
        s !== "thanks" &&
        Date.now() - this.lastAct > IDLE_SECONDS * 1000
      )
        this.resetToAttract()
    }, 1000)
    // Cola offline: reintenta sola cada minuto, además del botón del modo stand.
    this.retryTimer = setInterval(() => {
      if (lsGet(LS_PENDING).length) void this.flushPending(false)
      if (newsletterPendingCount()) void flushNewsletterQueue()
    }, 60_000)
    this.prefetchAttractPrices()
  }

  componentWillUnmount() {
    this.mounted = false
    window.removeEventListener("resize", this.onResize)
    clearTimeout(this.goT)
    clearInterval(this.idleTimer)
    clearInterval(this.attractTimer)
    clearInterval(this.thanksTimer)
    clearInterval(this.retryTimer)
    cancelAnimationFrame(this.raf)
    cancelAnimationFrame(this.numRaf)
    clearTimeout(this.toastT)
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
    const map = L.map(this.mapEl!, {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.25,
      inertia: true,
    })
    this.map = map
    map.setView([-38, -64], 4)
    this.cityLayer = L.layerGroup()
    this.setTiles()
    addProvinceLines(L, map)
    this.routeLayer = L.layerGroup().addTo(map)
    map.on("click", (e: Leaflet.LeafletMouseEvent) => this.onMapClick(e.latlng))
    if (this.state.screen === "attract") this.startAttract()
    else this.onEnter(this.state.screen)
  }

  setTiles() {
    const L = this.L
    if (!L || !this.map) return
    if (this.tiles) this.map.removeLayer(this.tiles)
    this.tiles = L.layerGroup([
      L.tileLayer(tileUrl("Base"), TILE_OPTIONS),
      L.tileLayer(tileUrl("Reference"), { ...TILE_OPTIONS, opacity: 1 }),
    ]).addTo(this.map)
    if (this.cityLayer) {
      this.cityLayer.clearLayers()
      CITIES.forEach((c) =>
        L.circleMarker([c[2], c[3]], {
          radius: 6,
          color: "#0A0A0B",
          weight: 2,
          opacity: 0.7,
          fillColor: "#C6F24A",
          fillOpacity: 0.9,
          interactive: false,
        }).addTo(this.cityLayer!)
      )
    }
  }

  panelW() {
    return (this.panelEl && this.panelEl.offsetWidth) || 560
  }

  fit(latlngs: [number, number][], maxZoom?: number, attract?: boolean) {
    if (
      !this.mounted ||
      !this.map ||
      !this.mapEl ||
      !this.mapEl.offsetWidth ||
      !this.L
    )
      return
    const w = window.innerWidth
    const h = window.innerHeight
    const b = this.L.latLngBounds(latlngs)
    if (!b.isValid()) return
    const tl: [number, number] = attract
      ? [Math.round(w * 0.6), 90]
      : [Math.min(this.panelW() + 96, w - 200), Math.min(150, h / 4)]
    try {
      this.map.fitBounds(b, {
        paddingTopLeft: tl,
        paddingBottomRight: [70, 70],
        maxZoom: maxZoom || 9,
        animate: true,
        duration: 1.1,
      })
    } catch (e) {
      console.warn("fit", e)
    }
  }

  fitArgentina() {
    this.fit(
      [
        [-55, -73.5],
        [-21.8, -53.6],
      ],
      5
    )
  }

  markerHtml(c: City, kind: "a" | "b") {
    const col = kind === "a" ? LIME : BLUE
    const border = kind === "a" ? "#0A0A0B" : "#FFFFFF"
    const glow = kind === "a" ? "rgba(198,242,74,.3)" : "rgba(43,107,255,.35)"
    const name = c[0].replace(
      /[&<>"]/g,
      (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!
    )
    return `<div style="position:relative;width:30px;height:30px"><div style="width:30px;height:30px;box-sizing:border-box;border-radius:999px;background:${col};border:4px solid ${border};box-shadow:0 0 0 8px ${glow},0 0 28px ${glow}"></div><div style="position:absolute;left:42px;top:50%;transform:translateY(-50%);white-space:nowrap;padding:6px 14px;border-radius:999px;background:#FFFFFF;color:#0A0A0B;font:600 18px Inter,system-ui,sans-serif;box-shadow:0 6px 16px rgba(10,10,11,.3)">${name}</div></div>`
  }

  addMarker(c: City, kind: "a" | "b") {
    const L = this.L!
    L.marker([c[2], c[3]], {
      icon: L.divIcon({
        className: "",
        html: this.markerHtml(c, kind),
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
      interactive: false,
    }).addTo(this.routeLayer!)
  }

  arc(o: City, d: City, n = 90): [number, number][] {
    const a = [o[2], o[3]]
    const b = [d[2], d[3]]
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    const dy = b[0] - a[0]
    const dx = b[1] - a[1]
    const ctrl = [m[0] + dx * 0.18, m[1] - dy * 0.18]
    const pts: [number, number][] = []
    for (let i = 0; i <= n; i++) {
      const t = i / n
      const u = 1 - t
      pts.push([
        u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0],
        u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1],
      ])
    }
    return pts
  }

  async getRoute(o: City, d: City): Promise<[number, number][]> {
    const k = o[0] + "|" + d[0]
    const kr = d[0] + "|" + o[0]
    if (this.routes[k]) return this.routes[k]
    if (this.routes[kr])
      return (this.routes[k] = this.routes[kr].slice().reverse())
    try {
      const r = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${o[3]},${o[2]};${d[3]},${d[2]}?overview=full&geometries=geojson`,
        { signal: AbortSignal.timeout(6000) }
      )
      const j = (await r.json()) as {
        routes?: { geometry: { coordinates: [number, number][] } }[]
      }
      const c = j.routes && j.routes[0] && j.routes[0].geometry.coordinates
      if (!c || c.length < 2) throw new Error("no route")
      let pts = c.map((p) => [p[1], p[0]] as [number, number])
      if (pts.length > 900) {
        const st = pts.length / 900
        const out: [number, number][] = []
        for (let i = 0; i < 900; i++) out.push(pts[Math.floor(i * st)])
        out.push(pts[pts.length - 1])
        pts = out
      }
      return (this.routes[k] = pts)
    } catch {
      return this.arc(o, d)
    }
  }

  async drawRoute(o: City, d: City, dur: number, done?: () => void) {
    const L = this.L
    if (!L || !this.routeLayer || !this.mounted || !this.map) {
      done?.()
      return
    }
    const tok = (this.drawTok = this.drawTok + 1)
    cancelAnimationFrame(this.raf)
    const pts = await this.getRoute(o, d)
    if (tok !== this.drawTok || !this.mounted || !this.map) return
    this.routeLayer.clearLayers()
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
    const total = cum[cum.length - 1] || 1
    const rc = "#0A0A0B"
    L.polyline(pts, {
      color: rc,
      weight: 2,
      opacity: 0.4,
      dashArray: "2 10",
      interactive: false,
    }).addTo(this.routeLayer)
    const glow = L.polyline([pts[0]], {
      color: LIME,
      weight: 16,
      opacity: 0.55,
      interactive: false,
    }).addTo(this.routeLayer)
    const line = L.polyline([pts[0]], {
      color: rc,
      weight: 5,
      opacity: 1,
      lineJoin: "round",
      interactive: false,
    }).addTo(this.routeLayer)
    this.addMarker(o, "a")
    this.addMarker(d, "b")
    const pk = L.marker(pts[0], {
      icon: L.divIcon({
        className: "",
        html: '<div style="width:26px;height:26px;box-sizing:border-box;border-radius:5px;background:#FFFFFF;border:4px solid #C6F24A;box-shadow:0 0 18px rgba(198,242,74,.8)"></div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(this.routeLayer)
    const t0 = performance.now()
    const step = (now: number) => {
      if (tok !== this.drawTok) return
      const t = Math.min(1, (now - t0) / dur)
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const target = e * total
      let i = 1
      while (i < pts.length - 1 && cum[i] < target) i++
      const a = pts[i - 1]
      const b = pts[i]
      const f = Math.max(
        0,
        Math.min(1, (target - cum[i - 1]) / (cum[i] - cum[i - 1] || 1))
      )
      const p: [number, number] = [
        a[0] + (b[0] - a[0]) * f,
        a[1] + (b[1] - a[1]) * f,
      ]
      const sl = pts.slice(0, i).concat([p])
      line.setLatLngs(sl)
      glow.setLatLngs(sl)
      pk.setLatLng(p)
      if (t < 1) this.raf = requestAnimationFrame(step)
      else done?.()
    }
    this.raf = requestAnimationFrame(step)
  }

  showPoints() {
    if (!this.routeLayer || !this.mounted || !this.map || !this.L) return
    cancelAnimationFrame(this.raf)
    this.drawTok = this.drawTok + 1
    this.routeLayer.clearLayers()
    const { origin: o, dest: d } = this.state
    if (o && d) {
      const cached = this.routes[o[0] + "|" + d[0]]
      this.L.polyline(cached || this.arc(o, d), {
        color: "#0A0A0B",
        weight: 3,
        opacity: 0.6,
        dashArray: "2 10",
        interactive: false,
      }).addTo(this.routeLayer)
      if (!cached)
        this.getRoute(o, d).then(() => {
          const s = this.state
          if (
            (s.screen === "origin" || s.screen === "dest") &&
            s.origin === o &&
            s.dest === d &&
            this.routes[o[0] + "|" + d[0]]
          )
            this.showPoints()
        })
    }
    if (o) this.addMarker(o, "a")
    if (d) this.addMarker(d, "b")
    const pts = [o, d]
      .filter((c): c is City => !!c)
      .map((c) => [c[2], c[3]] as [number, number])
    if (pts.length === 2) this.fit(pts, 8)
    else if (pts.length === 1) this.fit(pts, 6)
    else this.fitArgentina()
  }

  // --- Atracción ----------------------------------------------------------------------

  randomPair(): [City, City] {
    let a: City
    let b: City
    let tries = 0
    do {
      a = CITIES[Math.floor(Math.random() * CITIES.length)]
      b = CITIES[Math.floor(Math.random() * CITIES.length)]
      tries++
    } while (
      (a === b || haversineKm(a, b) < 200 || haversineKm(a, b) > 1400) &&
      tries < 40
    )
    return [a, b]
  }

  /**
   * El loop de atracción muestra precios reales: se cotizan unos pocos pares al montar
   * (no uno cada 5,6 s) y el loop rota entre ellos. Si el backend no responde, muestra km.
   */
  async prefetchAttractPrices() {
    // Guardados unas horas: recargar la página del kiosco no vuelve a cotizar.
    try {
      const saved = JSON.parse(localStorage.getItem(LS_ATTRACT) || "null") as {
        at: number
        prices: Record<string, number>
      } | null
      if (
        saved &&
        Date.now() - saved.at < ATTRACT_TTL_MS &&
        Object.keys(saved.prices).length
      ) {
        this.attractPrices = saved.prices
        return
      }
    } catch {}
    for (let i = 0; i < 6 && this.mounted; i++) {
      const [a, b] = this.randomPair()
      try {
        const q = await this.requestQuote(a, b, "small")
        this.attractPrices[a[0] + "|" + b[0]] = q.suggestedPriceArs
      } catch {
        break
      }
    }
    if (Object.keys(this.attractPrices).length)
      lsSet(LS_ATTRACT, { at: Date.now(), prices: this.attractPrices })
  }

  attractPair(): [City, City] {
    const keys = Object.keys(this.attractPrices)
    if (keys.length) {
      const [an, bn] = keys[Math.floor(Math.random() * keys.length)].split("|")
      const a = CITIES.find((c) => c[0] === an)
      const b = CITIES.find((c) => c[0] === bn)
      if (a && b) return [a, b]
    }
    return this.randomPair()
  }

  startAttract() {
    clearInterval(this.attractTimer)
    const loop = () => {
      if (!this.mounted || !this.map) {
        clearInterval(this.attractTimer)
        return
      }
      const [a, b] = this.attractPair()
      this.getRoute(a, b).then((pts) => {
        if (this.state.screen !== "attract") return
        this.fit(pts, 7, true)
        setTimeout(
          () => this.state.screen === "attract" && this.drawRoute(a, b, 2400),
          700
        )
      })
      const price = this.attractPrices[a[0] + "|" + b[0]]
      this.setState({
        attractLabel: `${a[0]} → ${b[0]} · ${
          price != null
            ? fmt(price)
            : Math.round(haversineKm(a, b) * ROAD_FACTOR).toLocaleString(
                "es-AR"
              ) + " km"
        }`,
      })
    }
    loop()
    this.attractTimer = setInterval(loop, 5600)
  }

  // --- Sonido -------------------------------------------------------------------------

  tone(seq: [number, number, OscillatorType?, number?][]) {
    if (!this.state.soundOn) return
    try {
      const ctx = audioCtx()
      if (!ctx) return
      let t = ctx.currentTime
      seq.forEach(([f, d, type = "sine", v = 0.12]) => {
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
      pick: [
        [660, 0.09, "triangle"],
        [990, 0.14, "triangle"],
      ],
      start: [
        [523, 0.09, "triangle"],
        [784, 0.09, "triangle"],
        [1047, 0.18, "triangle"],
      ],
      reveal: [
        [523, 0.09],
        [659, 0.09],
        [784, 0.09],
        [1047, 0.3],
      ],
      yes: [
        [784, 0.1, "triangle"],
        [1175, 0.22, "triangle"],
      ],
      maybe: [[587, 0.18, "triangle"]],
      no: [
        [392, 0.12, "triangle"],
        [311, 0.22, "triangle"],
      ],
      whoosh: [
        [220, 0.06, "sawtooth", 0.025],
        [330, 0.06, "sawtooth", 0.025],
        [494, 0.06, "sawtooth", 0.025],
        [740, 0.1, "sawtooth", 0.025],
      ],
      done: [
        [659, 0.1],
        [784, 0.1],
        [988, 0.1],
        [1319, 0.35],
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

  go(screen: Screen) {
    clearTimeout(this.goT)
    const from = this.state.screen
    this.setState({ leaving: true })
    this.goT = setTimeout(
      () =>
        this.setState({ screen, leaving: false }, () =>
          setTimeout(() => {
            try {
              this.onEnter(screen)
            } catch (e) {
              console.warn("onEnter", e)
            }
          }, 0)
        ),
      from === "attract" ? 420 : 200
    )
  }

  onEnter(screen: Screen) {
    if (!this.mounted || !this.map) return
    const pick = screen === "origin" || screen === "dest"
    if (pick) {
      this.cityLayer!.addTo(this.map)
      this.showPoints()
    } else this.cityLayer!.remove()
    if (screen !== "attract") clearInterval(this.attractTimer)
    if (screen === "quote") {
      const { origin: o, dest: d } = this.state
      if (!o || !d) return
      this.sfx("whoosh")
      this.routeDone = false
      this.getRoute(o, d).then((pts) => {
        if (this.state.screen !== "quote") return
        this.fit(pts, 8)
        setTimeout(
          () =>
            this.drawRoute(o, d, 2600, () => {
              this.routeDone = true
              this.maybeReveal()
            }),
          600
        )
      })
    }
    if (screen === "courier") {
      const { origin: o, dest: d } = this.state
      if (o && d) this.drawRoute(o, d, 1800)
    }
    if (screen === "uber") {
      this.setState({ bars: false })
      setTimeout(() => this.setState({ bars: true }), 100)
    }
    if (screen === "thanks") {
      this.record(true)
      this.sfx("done")
      clearInterval(this.thanksTimer)
      this.thanksTimer = setInterval(() => {
        const l = this.state.thanksLeft - 1
        if (l <= 0) this.resetToAttract()
        else this.setState({ thanksLeft: l })
      }, 1000)
    }
  }

  reveal() {
    const q = this.quote()
    if (!q || this.state.screen !== "quote") return
    this.setState({ phase: "reveal" })
    this.sfx("reveal")
    const t0 = performance.now()
    const dur = 1300
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      const e = 1 - Math.pow(1 - t, 4)
      this.setState({ shown: q.price * e })
      if (t < 1) this.numRaf = requestAnimationFrame(step)
      else setTimeout(() => this.setState({ ask: true }), 350)
    }
    this.numRaf = requestAnimationFrame(step)
  }

  startGame = () => {
    this.sid = randomUUID()
    this.sessionStart = Date.now()
    this.saved = false
    this.lastAct = Date.now()
    this.quoteTok++
    clearInterval(this.attractTimer)
    clearInterval(this.thanksTimer)
    this.sfx("start")
    this.setState(
      {
        q: "",
        origin: null,
        dest: null,
        pkg: null,
        phase: "routing",
        shown: 0,
        ask: false,
        serverQuote: null,
        quoteStatus: "idle",
        sender: null,
        senderAltPct: null,
        senderWTP: null,
        courier: null,
        courierAltPct: null,
        courierWTA: null,
        email: "",
        emailErr: false,
        thanksLeft: 10,
        toast: null,
      },
      () => this.go("origin")
    )
  }

  resetToAttract = () => {
    if (this.sessionStart && !this.saved && this.state.origin)
      this.record(false)
    this.sessionStart = null
    this.quoteTok++
    clearInterval(this.thanksTimer)
    cancelAnimationFrame(this.numRaf)
    if (this.cityLayer) this.cityLayer.remove()
    clearTimeout(this.goT)
    this.setState(
      { screen: "attract", q: "", toast: null, leaving: false },
      () =>
        setTimeout(() => {
          try {
            this.startAttract()
          } catch {}
        }, 0)
    )
  }

  onMapClick(ll: Leaflet.LatLng) {
    const s = this.state.screen
    if (s !== "origin" && s !== "dest") return
    const k = Math.cos((ll.lat * Math.PI) / 180)
    let best: City | null = null
    let bd = Infinity
    CITIES.forEach((c) => {
      const d = (c[2] - ll.lat) ** 2 + ((c[3] - ll.lng) * k) ** 2
      if (d < bd) {
        bd = d
        best = c
      }
    })
    if (best) this.pickCity(best)
  }

  onQ = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    this.setState({ q })
    clearTimeout(this.geoT)
    const nq = q.trim()
    if (nq.length < 3) {
      this.setState({ remote: [], remoteQ: "", searching: false })
      return
    }
    this.setState({ searching: true })
    this.geoT = setTimeout(async () => {
      const id = (this.geoId = this.geoId + 1)
      try {
        const r = await fetch(
          "https://photon.komoot.io/api/?limit=12&osm_tag=place&bbox=-73.6,-55.2,-53.5,-21.7&q=" +
            encodeURIComponent(nq)
        )
        const j = (await r.json()) as {
          features?: {
            properties?: Record<string, string>
            geometry?: { coordinates: [number, number] }
          }[]
        }
        if (id !== this.geoId) return
        const seen = new Set<string>()
        const remote: City[] = []
        ;(j.features || []).forEach((f) => {
          const p = f.properties || {}
          const c = f.geometry && f.geometry.coordinates
          if (!c || (p.countrycode || "").toUpperCase() !== "AR" || !p.name)
            return
          if (
            ["country", "state", "county", "region", "province"].includes(
              p.osm_value
            )
          )
            return
          const prov = [p.county, p.state]
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(", ")
          const key = norm(p.name + "|" + prov)
          if (seen.has(key)) return
          seen.add(key)
          remote.push([p.name, prov || "Argentina", c[1], c[0]])
        })
        this.setState({ remote, remoteQ: nq, searching: false })
      } catch {
        if (id === this.geoId)
          this.setState({ remote: [], remoteQ: nq, searching: false })
      }
    }, 280)
  }

  sameCity(a: City | null, b: City | null) {
    return (
      !!a && !!b && Math.abs(a[2] - b[2]) < 1e-4 && Math.abs(a[3] - b[3]) < 1e-4
    )
  }

  pickCity(c: City) {
    const s = this.state.screen
    clearTimeout(this.geoT)
    this.geoId = this.geoId + 1
    if (s === "dest" && this.sameCity(this.state.origin, c)) {
      this.sfx("no")
      this.toastMsg("Elegí una ciudad distinta al retiro", "#E5484D")
      return
    }
    if (this.inputEl) this.inputEl.blur()
    this.sfx("pick")
    const patch: Partial<State> = s === "origin" ? { origin: c } : { dest: c }
    if (s === "origin" && this.sameCity(this.state.dest, c)) patch.dest = null
    this.setState(
      { ...(patch as State), q: "", remote: [], remoteQ: "", searching: false },
      () =>
        setTimeout(() => {
          try {
            this.showPoints()
          } catch {}
        }, 0)
    )
    this.toastMsg(
      `${s === "origin" ? "Retiro" : "Entrega"}: ${c[0]}`,
      s === "origin" ? LIME : BLUE
    )
  }

  next = () => {
    this.sfx("tap")
    const order: Partial<Record<Screen, Screen>> = {
      origin: "dest",
      dest: "package",
      uber: "email",
    }
    const n = order[this.state.screen]
    if (n) this.go(n)
  }

  goBack = () => {
    this.sfx("tap")
    const back: Partial<Record<Screen, Screen>> = {
      dest: "origin",
      package: "dest",
    }
    const b = back[this.state.screen]
    if (b) this.go(b)
  }

  pickPkg(p: Pkg) {
    this.sfx("pick")
    this.routeDone = false
    // La cotización sale junto con la animación de la ruta: el precio se revela cuando
    // terminan las dos.
    this.setState({ pkg: p, phase: "routing", shown: 0, ask: false }, () =>
      this.fetchQuote()
    )
    setTimeout(() => this.go("quote"), 280)
  }

  answer(role: "sender" | "courier", v: Answer) {
    this.sfx(v)
    const q = this.quote()
    if (!q) return
    if (role === "sender") {
      this.setState({
        sender: v,
        senderAltPct: null,
        senderWTP: v === "yes" ? Math.round(q.price) : null,
        slider: 0.6,
      })
      setTimeout(() => this.go(v === "yes" ? "courier" : "senderAlt"), 120)
    } else {
      this.setState({
        courier: v,
        courierAltPct: null,
        courierWTA: v === "yes" ? Math.round(q.earn) : null,
        slider: 0.25,
      })
      setTimeout(() => this.go(v === "yes" ? "uber" : "courierAlt"), 120)
    }
  }

  altRange(): [number, number] {
    return this.state.screen === "senderAlt" ? [0.2, 1.0] : [1.0, 2.5]
  }

  altBase() {
    const q = this.quote()
    if (!q) return 0
    return this.state.screen === "senderAlt" ? q.price : q.earn
  }

  altPick(pct: number) {
    this.sfx("pick")
    const v = Math.round(this.altBase() * (1 + pct))
    if (this.state.screen === "senderAlt") {
      this.setState({ senderAltPct: pct, senderWTP: v })
      this.go("courier")
    } else {
      this.setState({ courierAltPct: pct, courierWTA: v })
      this.go("uber")
    }
  }

  altConfirm = () => {
    const [mn, mx] = this.altRange()
    const r = mn + this.state.slider * (mx - mn)
    const v = Math.round(this.altBase() * r)
    this.sfx("pick")
    if (this.state.screen === "senderAlt") {
      this.setState({ senderAltPct: "custom", senderWTP: v })
      this.go("courier")
    } else {
      this.setState({ courierAltPct: "custom", courierWTA: v })
      this.go("uber")
    }
  }

  altNone = () => {
    this.sfx("no")
    if (this.state.screen === "senderAlt") {
      this.setState({ senderAltPct: "none", senderWTP: null })
      this.go("courier")
    } else {
      this.setState({ courierAltPct: "none", courierWTA: null })
      this.go("uber")
    }
  }

  sliderFrom(e: ReactPointerEvent) {
    if (!this.trackEl) return
    const r = this.trackEl.getBoundingClientRect()
    const s = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    this.setState({ slider: s })
  }

  submitEmail = () => {
    const e = this.state.email.trim()
    if (!isEmail(e)) {
      this.sfx("no")
      this.setState({ emailErr: true })
      return
    }
    subscribeFromGame(e)
    this.setState({ email: e }, () => this.go("thanks"))
  }

  skipEmail = () => {
    this.setState({ email: "" }, () => this.go("thanks"))
  }

  // --- Registro de la partida ---------------------------------------------------------

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

  record(completed: boolean) {
    if (this.saved || !this.sessionStart) return
    this.saved = true
    const s = this.state
    const q = this.quote()
    const sq = s.serverQuote
    const place = (c: City | null) =>
      c
        ? {
            name: c[0].slice(0, 120),
            province: c[1].slice(0, 120),
            lat: c[2],
            lng: c[3],
          }
        : null
    const payload: Record<string, unknown> = {
      ...(this.props.eventTag ? { eventTag: this.props.eventTag } : {}),
      ...(this.deviceId() ? { deviceId: this.deviceId() } : {}),
      startedAt: new Date(this.sessionStart).toISOString(),
      endedAt: new Date().toISOString(),
      durationSec: Math.round((Date.now() - this.sessionStart) / 1000),
      completed,
      lastScreen: s.screen,
      origin: place(s.origin),
      destination: place(s.dest),
      packagePreset: s.pkg ? s.pkg.id : null,
      quoteId: sq ? sq.quoteId : null,
      suggestedPriceArs: sq ? sq.suggestedPriceArs : null,
      courierEarnArs: sq ? sq.courierEarnArs : null,
      senderAnswer: s.sender,
      senderAltChoice: altChoiceWire(s.senderAltPct),
      senderWtpArs: s.senderWTP,
      courierAnswer: s.courier,
      courierAltChoice: altChoiceWire(s.courierAltPct),
      courierWtaArs: s.courierWTA,
      uberEstimateArs: q ? Math.round(q.uber) : null,
      // El texto de la pantalla explica para qué se usa el mail: dejarlo es el consentimiento.
      email: s.email || null,
      emailConsent: !!s.email,
      userAgent: navigator.userAgent.slice(0, 512),
    }
    // Copia plana para el CSV del modo stand (mismas columnas que el prototipo).
    const csvRow = {
      id: this.sid,
      ...payload,
      origin: s.origin && s.origin[0],
      destination: s.dest && s.dest[0],
      distanceKm: q ? Math.round(q.km * 10) / 10 : null,
    }
    lsSet(LS_ALL, [...lsGet(LS_ALL), csvRow])
    void this.send({ id: this.sid, payload })
  }

  /** `true` si quedó guardada o si el backend la rechazó por inválida (no tiene sentido reintentarla). */
  async put(item: PendingSession) {
    try {
      const r = await fetch(`/api/juegos/precios/sessions/${item.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item.payload),
      })
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
        return true
      }
      return r.ok
    } catch {
      return false
    }
  }

  async send(item: PendingSession) {
    if (!(await this.put(item)))
      lsSet(LS_PENDING, [...lsGet<PendingSession>(LS_PENDING), item])
  }

  async flushPending(toast: boolean) {
    const pend = lsGet<PendingSession>(LS_PENDING)
    if (!pend.length) {
      if (toast) this.toastMsg("No hay respuestas pendientes")
      return
    }
    const fail: PendingSession[] = []
    for (const item of pend) if (!(await this.put(item))) fail.push(item)
    // Releer: mientras se reintentaba pudo encolarse otra partida.
    const added = lsGet<PendingSession>(LS_PENDING).filter(
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

  downloadCsv = () => {
    const all = lsGet<Record<string, unknown>>(LS_ALL)
    if (!all.length) {
      this.toastMsg("Todavía no hay respuestas", "#F5B93A")
      return
    }
    const keys = Object.keys(all[0])
    const esc = (v: unknown) =>
      v == null
        ? ""
        : `"${String(typeof v === "object" ? JSON.stringify(v) : v).replace(/"/g, '""')}"`
    const csv = [
      keys.join(","),
      ...all.map((r) => keys.map((k) => esc(r[k])).join(",")),
    ].join("\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    a.download = `movo-feria-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

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
  }

  // --- Render -------------------------------------------------------------------------

  render() {
    const s = this.state
    const q = this.quote()
    const sc = s.screen
    const isPick = sc === "origin" || sc === "dest"
    const picked = sc === "origin" ? s.origin : s.dest
    let results: {
      name: string
      prov: string
      opacity: number
      pick: () => void
    }[] = []
    const nq = norm(s.q.trim())
    if (isPick && nq) {
      const local = CITIES.filter((c) => norm(c[0]).includes(nq))
        .sort(
          (a, b) =>
            (norm(b[0]).startsWith(nq) ? 1 : 0) -
            (norm(a[0]).startsWith(nq) ? 1 : 0)
        )
        .slice(0, 3)
      const remote = s.remote.filter(
        (r) =>
          !local.some(
            (c) => norm(c[0]) === norm(r[0]) && Math.abs(c[2] - r[2]) < 0.3
          )
      )
      results = local
        .concat(remote)
        .slice(0, 6)
        .map((c) => ({
          name: c[0],
          prov: c[1],
          opacity: sc === "dest" && this.sameCity(s.origin, c) ? 0.35 : 1,
          pick: () => this.pickCity(c),
        }))
    }
    const isAlt = sc === "senderAlt" || sc === "courierAlt"
    let altChips: { pct: string; price: string; pick: () => void }[] = []
    let sliderValStr = ""
    let sliderMinStr = ""
    let sliderMaxStr = ""
    let altBaseStr = ""
    if (isAlt && q) {
      const base = this.altBase()
      const [mn, mx] = this.altRange()
      const pcts = sc === "senderAlt" ? [-0.1, -0.2, -0.3] : [0.1, 0.2, 0.3]
      altChips = pcts.map((p) => ({
        pct: (p > 0 ? "+" : "−") + Math.abs(Math.round(p * 100)) + "%",
        price: fmt(base * (1 + p)),
        pick: () => this.altPick(p),
      }))
      sliderValStr = fmt(base * (mn + s.slider * (mx - mn)))
      sliderMinStr = fmt(base * mn)
      sliderMaxStr = fmt(base * mx)
      altBaseStr = fmt(base)
    }
    const pending = s.admin
      ? lsGet(LS_PENDING).length + newsletterPendingCount()
      : 0
    const total = s.admin ? lsGet(LS_ALL).length : 0
    const breakdownStr = q
      ? [`base ${fmt(q.base)}`, `distancia ${fmt(q.dist)}`, `peso ${fmt(q.w)}`]
          .concat(q.fx > 0 ? [`frágil ${fmt(q.fx)}`] : [])
          .concat(q.demand > 0 ? [`alta demanda ${fmt(q.demand)}`] : [])
          .join(" · ")
      : ""
    const wideScr = sc === "uber" || sc === "email" || sc === "thanks"
    const vw = typeof window === "undefined" ? 1280 : window.innerWidth
    const wtp =
      s.senderWTP != null
        ? fmt(s.senderWTP)
        : s.sender
          ? "No lo mandarías"
          : "—"
    const wta =
      s.courierWTA != null
        ? fmt(s.courierWTA)
        : s.courier
          ? "No lo llevarías"
          : "—"
    const summaryRows =
      q && s.origin && s.dest && s.pkg
        ? [
            {
              k: "Recorrido",
              v: `${s.origin[0]} → ${s.dest[0]}`,
              color: "#FFFFFF",
            },
            {
              k: "Paquete",
              v: `${s.pkg.name} · ${Math.round(q.km).toLocaleString("es-AR")} km`,
              color: "#FFFFFF",
            },
            { k: "Precio Movo", v: fmt(q.price), color: LIME },
            {
              k: "Vos pagarías",
              v: wtp,
              color: s.senderWTP != null ? "#FFFFFF" : "#E5484D",
            },
            {
              k: "Lo llevarías por",
              v: wta,
              color: s.courierWTA != null ? "#FFFFFF" : "#E5484D",
            },
            { k: "Uber aprox.", v: fmt(q.uber), color: "#B4B4BC" },
          ].map((r, i) => ({ ...r, delay: (0.3 + i * 0.08).toFixed(2) + "s" }))
        : []
    const panelTop = wideScr ? "112px" : "32px"
    const panelWpx = (wideScr ? vw - 64 : Math.min(580, vw * 0.5)) + "px"
    const attractX =
      s.leaving && sc === "attract" ? "translateX(-105%)" : "none"
    const stepOpacity = s.leaving && sc !== "attract" ? 0 : 1
    const stepTransform =
      s.leaving && sc !== "attract" ? "translateX(-24px)" : "none"
    const showChrome = sc !== "attract"
    const pickColor = sc === "dest" ? "#5A8CFF" : LIME
    const kmStr =
      (q ? Math.round(q.km) : Math.round(this.estimatedKm())).toLocaleString(
        "es-AR"
      ) + " km"
    const isRouting = s.phase === "routing"
    const movoBarW =
      s.bars && q
        ? Math.max(3, (q.price / q.uber) * 100).toFixed(1) + "%"
        : "0%"
    const uberBarW = s.bars ? "100%" : "0%"
    const ratioStr = q
      ? (q.uber / q.price).toFixed(1).replace(".", ",") + " veces"
      : ""
    const originName = s.origin ? s.origin[0] : ""
    const destName = s.dest ? s.dest[0] : ""

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
            "position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,rgba(10,10,11,.7) 0%,rgba(10,10,11,.25) 45%,rgba(10,10,11,0) 70%);opacity:0;transition:opacity .3s"
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
                  <div
                    style={css(
                      "display:flex;align-items:center;gap:12px;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) .25s both"
                    )}
                  />
                  <h1
                    style={css(
                      "margin:0;font-size:clamp(38px,min(6vw,9.5vh),88px);line-height:1.04;letter-spacing:-.045em;font-weight:900;text-wrap:balance;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) .35s both"
                    )}
                  >
                    ¿Cuánto cuesta mandar algo{" "}
                    <span style={css("white-space:nowrap")}>con Movo?</span>
                  </h1>
                  <p
                    style={css(
                      "margin:0;font-size:clamp(18px,3.2vh,26px);line-height:1.35;color:#2A2A2E;max-width:520px;text-wrap:pretty;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) .45s both"
                    )}
                  >
                    Elegí dos ciudades, mirá el precio real y decinos qué te
                    parece. Toma un minuto.
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
              `position:absolute;left:32px;top:${panelTop};bottom:32px;width:${panelWpx};transition:width .6s cubic-bezier(.22,1,.36,1),top .6s cubic-bezier(.22,1,.36,1);animation:mvPanelIn .5s cubic-bezier(.22,1,.36,1) both;z-index:6;box-sizing:border-box;padding:36px;border-radius:14px;background:rgba(10,10,11,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);box-shadow:0 0 0 1px rgba(10,10,11,.06);display:flex;flex-direction:column;overflow-y:auto`
            )}
          >
            <div
              style={css(
                `display:flex;flex-direction:column;flex:1;opacity:${stepOpacity};transform:${stepTransform};transition:opacity .2s ease,transform .2s ease`
              )}
            >
              {isPick && (
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
                        `font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${pickColor}`
                      )}
                    >
                      {sc === "dest" ? "Paso 2 · Entrega" : "Paso 1 · Retiro"}
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(40px,4.2vw,56px);line-height:1.04;letter-spacing:-.035em;font-weight:600"
                      )}
                    >
                      {sc === "dest"
                        ? "¿A dónde lo mandás?"
                        : "¿Desde dónde mandás?"}
                    </h1>
                  </div>
                  {sc === "dest" && (
                    <div
                      style={css(
                        "display:flex;align-items:center;gap:12px;font-size:20px;color:#B4B4BC"
                      )}
                    >
                      <span
                        style={css(
                          "width:14px;height:14px;border-radius:999px;background:#C6F24A"
                        )}
                      />
                      Retiro en{" "}
                      <strong style={css("color:#FFFFFF;font-weight:600")}>
                        {originName}
                      </strong>
                    </div>
                  )}
                  <div style={css("position:relative")}>
                    <Search
                      style={css(
                        "position:absolute;left:24px;top:50%;transform:translateY(-50%)"
                      )}
                    />
                    <input
                      ref={(el) => void (this.inputEl = el)}
                      className="mv-input"
                      value={s.q}
                      onChange={this.onQ}
                      placeholder="Escribí una localidad"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      style={css(
                        "width:100%;box-sizing:border-box;height:80px;padding:0 24px 0 68px;border-radius:10px;border:2px solid rgba(255,255,255,.16);background:#111113;color:#FFFFFF;font-family:inherit;font-size:28px;font-weight:500;outline:none;user-select:text;-webkit-user-select:text"
                      )}
                    />
                  </div>
                  {results.length > 0 && (
                    <div
                      style={css("display:flex;flex-direction:column;gap:8px")}
                    >
                      {results.map((r, i) => (
                        <button
                          key={r.name + r.prov + i}
                          className="mv-press"
                          onClick={r.pick}
                          style={css(
                            `display:flex;align-items:baseline;justify-content:space-between;gap:16px;min-height:72px;padding:0 24px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:#1A1A1D;color:#FFFFFF;font-family:inherit;text-align:left;cursor:pointer;opacity:${r.opacity}`
                          )}
                        >
                          <span
                            style={css(
                              "font-size:26px;font-weight:600;letter-spacing:-.02em;align-self:center"
                            )}
                          >
                            {r.name}
                          </span>
                          <span
                            style={css(
                              "font-size:18px;color:#8A8A93;align-self:center"
                            )}
                          >
                            {r.prov}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {isPick && !!nq && !results.length && !s.searching && (
                    <p style={css("margin:0;font-size:20px;color:#8A8A93")}>
                      No encontramos esa localidad. Probá con otra o tocá el
                      mapa.
                    </p>
                  )}
                  {isPick && s.searching && !results.length && (
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
                      Buscando localidades…
                    </div>
                  )}
                  {isPick && !nq && !picked && (
                    <div
                      style={css(
                        "display:flex;align-items:center;gap:16px;padding:20px 24px;border-radius:10px;border:1px dashed rgba(255,255,255,.2);font-size:22px;color:#D5D5DB"
                      )}
                    >
                      <Pin />O tocá cualquier punto del mapa
                    </div>
                  )}
                  {isPick && !!picked && !nq && (
                    <div
                      style={css(
                        `display:flex;flex-direction:column;gap:6px;padding:22px 24px;border-radius:10px;border:2px solid ${pickColor};background:#111113;animation:mvFadeUp .35s cubic-bezier(.22,1,.36,1) both`
                      )}
                    >
                      <span
                        style={css(
                          `font-size:14px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${pickColor}`
                        )}
                      >
                        {sc === "dest" ? "Entrega en" : "Retiro en"}
                      </span>
                      <span
                        style={css(
                          "font-size:40px;font-weight:600;letter-spacing:-.03em;line-height:1.1"
                        )}
                      >
                        {picked[0]}
                      </span>
                      <span style={css("font-size:20px;color:#8A8A93")}>
                        {picked[1]}
                      </span>
                    </div>
                  )}
                  <div style={css("margin-top:auto;display:flex;gap:12px")}>
                    {sc === "dest" && (
                      <BackButton onClick={this.goBack} flexNone />
                    )}
                    {isPick && !!picked && !nq && (
                      <button
                        className="mv-press"
                        onClick={this.next}
                        style={css(
                          "flex:1;height:88px;border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:28px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:14px;cursor:pointer"
                        )}
                      >
                        Siguiente
                        <ArrowRight size={30} strokeWidth={2.25} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {sc === "package" && (
                <div
                  style={css(
                    "display:flex;flex-direction:column;gap:24px;flex:1;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
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
                      Paso 3 · Paquete
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(40px,4.2vw,56px);line-height:1.04;letter-spacing:-.035em;font-weight:600"
                      )}
                    >
                      ¿Qué mandás?
                    </h1>
                    <p style={css("margin:0;font-size:22px;color:#B4B4BC")}>
                      De {originName} a {destName}
                    </p>
                  </div>
                  <div
                    style={css(
                      "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px"
                    )}
                  >
                    {PKGS.map((p) => {
                      const on = !!s.pkg && s.pkg.id === p.id
                      return (
                        <button
                          key={p.id}
                          className="mv-press"
                          onClick={() => this.pickPkg(p)}
                          style={css(
                            `display:flex;flex-direction:column;align-items:flex-start;gap:10px;min-height:178px;padding:22px;border-radius:10px;border:2px solid ${
                              on ? LIME : "rgba(255,255,255,.12)"
                            };background:${on ? "#1A1A1D" : "#111113"};color:#FFFFFF;font-family:inherit;text-align:left;cursor:pointer`
                          )}
                        >
                          <div
                            style={css(
                              "height:64px;display:flex;align-items:flex-end"
                            )}
                          >
                            <div
                              style={css(
                                `width:${p.w};height:${p.h};border:3px solid ${on ? LIME : "#FFFFFF"};border-radius:4px;box-sizing:border-box`
                              )}
                            />
                          </div>
                          <span
                            style={css(
                              "font-size:26px;font-weight:600;letter-spacing:-.02em"
                            )}
                          >
                            {p.name}
                          </span>
                          <span
                            style={css(
                              "font-size:17px;line-height:1.35;color:#B4B4BC"
                            )}
                          >
                            {p.desc}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <div style={css("margin-top:auto;display:flex")}>
                    <BackButton onClick={this.goBack} />
                  </div>
                </div>
              )}

              {sc === "quote" && (
                <div
                  style={css(
                    "display:flex;flex-direction:column;gap:20px;flex:1;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                  )}
                >
                  <div
                    style={css("display:flex;flex-direction:column;gap:10px")}
                  >
                    <span
                      style={css(
                        "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
                      )}
                    >
                      Tu envío
                    </span>
                    <div
                      style={css(
                        "display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-size:28px;font-weight:600;letter-spacing:-.02em"
                      )}
                    >
                      {originName}
                      <ArrowRight
                        size={28}
                        strokeWidth={2.25}
                        stroke="#C6F24A"
                      />
                      {destName}
                    </div>
                    <span
                      style={css(
                        "font-family:var(--font-mono);font-size:18px;color:#8A8A93"
                      )}
                    >
                      {kmStr} · {s.pkg ? s.pkg.name : ""}
                    </span>
                  </div>
                  {isRouting && s.quoteStatus !== "error" && (
                    <div
                      style={css(
                        "display:flex;flex-direction:column;gap:22px;padding:8px 0;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                      )}
                    >
                      <div
                        style={css("display:flex;align-items:center;gap:20px")}
                      >
                        <span
                          style={css(
                            "position:relative;width:64px;height:64px;flex:none"
                          )}
                        >
                          <span
                            style={css(
                              "position:absolute;inset:0;border-radius:999px;background:conic-gradient(from 0deg,rgba(198,242,74,0) 0deg,#C6F24A 300deg,rgba(198,242,74,0) 360deg);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 7px),#000 calc(100% - 6px));mask:radial-gradient(farthest-side,transparent calc(100% - 7px),#000 calc(100% - 6px));animation:mvSpin .9s linear infinite"
                            )}
                          />
                          <span
                            style={css(
                              "position:absolute;inset:22px;border-radius:999px;background:#C6F24A;box-shadow:0 0 20px rgba(198,242,74,.8);animation:mvDot 1s ease-in-out infinite"
                            )}
                          />
                        </span>
                        <span
                          style={css(
                            "font-size:28px;line-height:1.25;font-weight:600;letter-spacing:-.02em;color:#FFFFFF;text-wrap:balance"
                          )}
                        >
                          Calculando el precio de un envío como el tuyo…
                        </span>
                      </div>
                      <div
                        style={css(
                          "display:flex;flex-direction:column;gap:10px"
                        )}
                      >
                        <span
                          style={css(
                            "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#B4B4BC"
                          )}
                        >
                          Precio sugerido por Movo
                        </span>
                        <div
                          style={css(
                            "position:relative;height:clamp(72px,8vw,108px);width:78%;border-radius:10px;background:#1A1A1D;overflow:hidden"
                          )}
                        >
                          <span
                            style={css(
                              "position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(198,242,74,.35) 50%,transparent 100%);background-size:50% 100%;background-repeat:no-repeat;animation:mvShimmer 1.1s cubic-bezier(.45,0,.55,1) infinite"
                            )}
                          />
                        </div>
                      </div>
                      <div
                        style={css(
                          "height:8px;border-radius:999px;background:#1A1A1D;overflow:hidden"
                        )}
                      >
                        <div
                          style={css(
                            "height:100%;border-radius:999px;background:#C6F24A;box-shadow:0 0 14px rgba(198,242,74,.7);animation:mvFill 3.4s cubic-bezier(.22,1,.36,1) both"
                          )}
                        />
                      </div>
                    </div>
                  )}
                  {isRouting && s.quoteStatus === "error" && (
                    <div
                      style={css(
                        "display:flex;flex-direction:column;gap:18px;padding:8px 0;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                      )}
                    >
                      <span
                        style={css(
                          "font-size:28px;line-height:1.25;font-weight:600;letter-spacing:-.02em;color:#FFFFFF;text-wrap:balance"
                        )}
                      >
                        No pudimos calcular el precio ahora.
                      </span>
                      <span
                        style={css(
                          "font-size:20px;line-height:1.4;color:#B4B4BC"
                        )}
                      >
                        El motor de precios de Movo no respondió. Probá de nuevo
                        en un momento.
                      </span>
                      <button
                        className="mv-press"
                        onClick={this.retryQuote}
                        style={css(
                          "height:80px;border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:26px;font-weight:600;cursor:pointer"
                        )}
                      >
                        Reintentar
                      </button>
                    </div>
                  )}
                  {s.phase === "reveal" && (
                    <div
                      style={css(
                        "display:flex;flex-direction:column;gap:8px;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both;container-type:inline-size"
                      )}
                    >
                      <span
                        style={css(
                          "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#B4B4BC"
                        )}
                      >
                        Precio sugerido por Movo
                      </span>
                      <span
                        style={css(
                          `font-size:${fitFont("clamp(72px,8vw,108px)", q ? fmt(q.price) : "")};line-height:1;letter-spacing:-.045em;font-weight:600;font-variant-numeric:tabular-nums;color:#C6F24A;white-space:nowrap`
                        )}
                      >
                        {fmt(s.shown)}
                      </span>
                      <span
                        style={css(
                          "font-family:var(--font-mono);font-size:16px;color:#8A8A93"
                        )}
                      >
                        {breakdownStr}
                      </span>
                    </div>
                  )}
                  {s.ask && (
                    <div
                      style={css(
                        "display:flex;flex-direction:column;gap:14px;margin-top:auto;animation:mvFadeUp .45s cubic-bezier(.22,1,.36,1) both"
                      )}
                    >
                      <h2
                        style={css(
                          "margin:0 0 4px;font-size:34px;line-height:1.15;letter-spacing:-.025em;font-weight:600"
                        )}
                      >
                        ¿Pagarías esto por enviarlo?
                      </h2>
                      <AnswerButton
                        color="#2BB673"
                        delay=".08s"
                        icon={<ThumbUp />}
                        onClick={() => this.answer("sender", "yes")}
                      >
                        Sí, lo pago
                      </AnswerButton>
                      <AnswerButton
                        color="#F5B93A"
                        delay=".16s"
                        icon={<Meh />}
                        onClick={() => this.answer("sender", "maybe")}
                      >
                        Lo pensaría
                      </AnswerButton>
                      <AnswerButton
                        color="#E5484D"
                        delay=".24s"
                        icon={<ThumbDown />}
                        onClick={() => this.answer("sender", "no")}
                      >
                        No, es mucho
                      </AnswerButton>
                    </div>
                  )}
                </div>
              )}

              {isAlt && (
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
                        "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#F5B93A"
                      )}
                    >
                      Ok, ajustemos
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(38px,4vw,52px);line-height:1.05;letter-spacing:-.035em;font-weight:600"
                      )}
                    >
                      {sc === "senderAlt"
                        ? "¿A cuánto sí lo pagarías?"
                        : "¿Cuánto tendrías que ganar para llevarlo?"}
                    </h1>
                    <p style={css("margin:0;font-size:20px;color:#B4B4BC")}>
                      Precio original:{" "}
                      <span
                        style={css(
                          "font-family:var(--font-mono);color:#FFFFFF"
                        )}
                      >
                        {altBaseStr}
                      </span>
                    </p>
                  </div>
                  <div
                    style={css(
                      "display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px"
                    )}
                  >
                    {altChips.map((c) => (
                      <button
                        key={c.pct}
                        className="mv-press"
                        onClick={c.pick}
                        style={css(
                          "display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-height:104px;padding:18px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#1A1A1D;color:#FFFFFF;font-family:inherit;text-align:left;cursor:pointer"
                        )}
                      >
                        <span
                          style={css(
                            "font-size:17px;font-weight:600;color:#C6F24A"
                          )}
                        >
                          {c.pct}
                        </span>
                        <span
                          style={css(
                            "font-size:26px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums"
                          )}
                        >
                          {c.price}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div
                    style={css(
                      "display:flex;flex-direction:column;gap:18px;padding:24px;border-radius:10px;background:#111113;border:1px solid rgba(255,255,255,.08)"
                    )}
                  >
                    <div
                      style={css(
                        "display:flex;justify-content:space-between;align-items:baseline;gap:12px"
                      )}
                    >
                      <span style={css("font-size:20px;color:#B4B4BC")}>
                        O decinos tu número
                      </span>
                      <span
                        style={css(
                          "font-size:40px;font-weight:600;letter-spacing:-.03em;font-variant-numeric:tabular-nums"
                        )}
                      >
                        {sliderValStr}
                      </span>
                    </div>
                    <div
                      ref={(el) => void (this.trackEl = el)}
                      onPointerDown={(e) => {
                        this.drag = true
                        try {
                          e.currentTarget.setPointerCapture(e.pointerId)
                        } catch {}
                        this.sliderFrom(e)
                      }}
                      onPointerMove={(e) => {
                        if (this.drag) this.sliderFrom(e)
                      }}
                      onPointerUp={() => (this.drag = false)}
                      onPointerCancel={() => (this.drag = false)}
                      style={css(
                        "position:relative;height:64px;touch-action:none;cursor:pointer"
                      )}
                    >
                      <div
                        style={css(
                          "position:absolute;left:0;right:0;top:28px;height:8px;border-radius:999px;background:#3A3A40"
                        )}
                      />
                      <div
                        style={css(
                          `position:absolute;left:0;top:28px;height:8px;border-radius:999px;background:#C6F24A;width:${(s.slider * 100).toFixed(1)}%`
                        )}
                      />
                      <div
                        style={css(
                          `position:absolute;top:4px;left:${(s.slider * 100).toFixed(1)}%;width:56px;height:56px;margin-left:-28px;border-radius:999px;background:#FFFFFF;box-shadow:0 0 0 6px rgba(198,242,74,.3),0 6px 16px rgba(10,10,11,.4)`
                        )}
                      />
                    </div>
                    <div
                      style={css(
                        "display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:15px;color:#8A8A93"
                      )}
                    >
                      <span>{sliderMinStr}</span>
                      <span>{sliderMaxStr}</span>
                    </div>
                  </div>
                  <div
                    style={css(
                      "margin-top:auto;display:flex;flex-direction:column;gap:12px"
                    )}
                  >
                    <button
                      className="mv-press"
                      onClick={this.altConfirm}
                      style={css(
                        "height:84px;border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:26px;font-weight:600;cursor:pointer"
                      )}
                    >
                      {sc === "senderAlt"
                        ? "Este es mi precio"
                        : "Con esto lo llevo"}
                    </button>
                    <button
                      className="mv-press"
                      onClick={this.altNone}
                      style={css(
                        "height:72px;border-radius:8px;border:1px solid rgba(255,255,255,.16);background:transparent;color:#FFFFFF;font-family:inherit;font-size:22px;font-weight:600;cursor:pointer"
                      )}
                    >
                      {sc === "senderAlt"
                        ? "Ni así lo mandaría"
                        : "Ni así lo llevaría"}
                    </button>
                  </div>
                </div>
              )}

              {sc === "courier" && (
                <div
                  style={css(
                    "display:flex;flex-direction:column;gap:20px;flex:1;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                  )}
                >
                  <div
                    style={css("display:flex;flex-direction:column;gap:14px")}
                  >
                    <span
                      style={css(
                        "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
                      )}
                    >
                      Ahora, del otro lado
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(40px,4.2vw,56px);line-height:1.06;letter-spacing:-.035em;font-weight:600;text-wrap:balance"
                      )}
                    >
                      Si ganaras{" "}
                      <span
                        style={css(
                          "color:#C6F24A;font-variant-numeric:tabular-nums"
                        )}
                      >
                        {q ? fmt(q.earn) : ""}
                      </span>{" "}
                      por llevarlo, ¿lo harías?
                    </h1>
                    <p
                      style={css(
                        "margin:0;font-size:22px;line-height:1.4;color:#B4B4BC;text-wrap:pretty"
                      )}
                    >
                      Imaginá que ya vas de {originName} a {destName}. Solo
                      sumás el paquete a tu camino.
                    </p>
                  </div>
                  <div
                    style={css(
                      "display:flex;flex-direction:column;gap:14px;margin-top:auto"
                    )}
                  >
                    <AnswerButton
                      color="#2BB673"
                      delay=".08s"
                      icon={<ThumbUp />}
                      onClick={() => this.answer("courier", "yes")}
                    >
                      Sí, lo llevo
                    </AnswerButton>
                    <AnswerButton
                      color="#F5B93A"
                      delay=".16s"
                      icon={<Meh />}
                      onClick={() => this.answer("courier", "maybe")}
                    >
                      Depende
                    </AnswerButton>
                    <AnswerButton
                      color="#E5484D"
                      delay=".24s"
                      icon={<ThumbDown />}
                      onClick={() => this.answer("courier", "no")}
                    >
                      No, es poco
                    </AnswerButton>
                  </div>
                </div>
              )}

              {sc === "uber" && (
                <div
                  style={css(
                    "display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:64px;flex:1;padding:8px 20px;animation:mvStepIn .55s cubic-bezier(.22,1,.36,1) .12s both"
                  )}
                >
                  <div
                    style={css(
                      "display:flex;flex-direction:column;justify-content:center;gap:20px;min-width:0;container-type:inline-size"
                    )}
                  >
                    <span
                      style={css(
                        "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
                      )}
                    >
                      ¿Sabías que?
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(36px,3.8vw,52px);line-height:1.08;letter-spacing:-.03em;font-weight:600;text-wrap:balance"
                      )}
                    >
                      Un Uber por una ruta parecida costaría cerca de
                    </h1>
                    <span
                      className="chrome-text"
                      style={css(
                        `font-size:${fitFont("clamp(96px,11vw,156px)", q ? fmt(q.uber) : "")};line-height:.95;letter-spacing:-.05em;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap`
                      )}
                    >
                      {q ? fmt(q.uber) : ""}
                    </span>
                    <div
                      style={css(
                        "display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:22px;font-weight:600;color:#D5D5DB"
                      )}
                    >
                      {originName}{" "}
                      <ArrowRight
                        size={24}
                        strokeWidth={2.25}
                        stroke="#C6F24A"
                      />{" "}
                      {destName}
                      <span
                        style={css(
                          "font-family:var(--font-mono);font-size:18px;font-weight:400;color:#8A8A93"
                        )}
                      >
                        {kmStr}
                      </span>
                    </div>
                  </div>
                  <div
                    style={css(
                      "display:flex;flex-direction:column;justify-content:center;gap:32px"
                    )}
                  >
                    <div
                      style={css("display:flex;flex-direction:column;gap:24px")}
                    >
                      <div
                        style={css(
                          "display:flex;flex-direction:column;gap:10px"
                        )}
                      >
                        <div
                          style={css(
                            "display:flex;justify-content:space-between;font-size:24px"
                          )}
                        >
                          <span style={css("font-weight:600")}>Movo</span>
                          <span
                            style={css(
                              "font-family:var(--font-mono);color:#C6F24A"
                            )}
                          >
                            {q ? fmt(q.price) : ""}
                          </span>
                        </div>
                        <div
                          style={css(
                            "height:48px;border-radius:6px;background:#1A1A1D;overflow:hidden"
                          )}
                        >
                          <div
                            style={css(
                              `height:100%;border-radius:6px;background:#C6F24A;box-shadow:0 0 24px rgba(198,242,74,.45);transition:width 1.2s cubic-bezier(.22,1,.36,1) .5s;width:${movoBarW}`
                            )}
                          />
                        </div>
                      </div>
                      <div
                        style={css(
                          "display:flex;flex-direction:column;gap:10px"
                        )}
                      >
                        <div
                          style={css(
                            "display:flex;justify-content:space-between;font-size:24px"
                          )}
                        >
                          <span style={css("font-weight:600")}>
                            Uber (aprox.)
                          </span>
                          <span
                            style={css(
                              "font-family:var(--font-mono);color:#D5D5DB"
                            )}
                          >
                            {q ? fmt(q.uber) : ""}
                          </span>
                        </div>
                        <div
                          style={css(
                            "height:48px;border-radius:6px;background:#1A1A1D;overflow:hidden"
                          )}
                        >
                          <div
                            style={css(
                              `height:100%;border-radius:6px;background:#8A8A93;transition:width 1.2s cubic-bezier(.22,1,.36,1) .65s;width:${uberBarW}`
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <p
                      style={css(
                        "margin:0;font-size:30px;line-height:1.3;color:#FFFFFF;font-weight:500;text-wrap:pretty"
                      )}
                    >
                      Con Movo pagás{" "}
                      <span style={css("color:#C6F24A;font-weight:600")}>
                        {ratioStr}
                      </span>{" "}
                      menos, porque alguien ya iba para allá.
                    </p>
                    <div
                      style={css("display:flex;flex-direction:column;gap:14px")}
                    >
                      <span style={css("font-size:15px;color:#8A8A93")}>
                        Estimación propia con tarifa base + por km. No es una
                        cotización de Uber.
                      </span>
                      <button
                        className="mv-press"
                        onClick={this.next}
                        style={css(
                          "height:88px;border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:28px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:14px;cursor:pointer"
                        )}
                      >
                        Seguir
                        <ArrowRight size={30} strokeWidth={2.25} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {sc === "email" && (
                <div
                  style={css(
                    "display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:64px;flex:1;padding:8px 20px;align-items:start;padding-top:40px;animation:mvStepIn .5s cubic-bezier(.22,1,.36,1) both"
                  )}
                >
                  <div
                    style={css("display:flex;flex-direction:column;gap:16px")}
                  >
                    <span
                      style={css(
                        "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A"
                      )}
                    >
                      {RAFFLE_COPY.eyebrow}
                    </span>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(48px,5.2vw,76px);line-height:1;letter-spacing:-.04em;font-weight:600"
                      )}
                    >
                      {RAFFLE_COPY.title}
                    </h1>
                    <p
                      style={css(
                        "margin:0;font-size:24px;line-height:1.4;color:#B4B4BC;text-wrap:pretty"
                      )}
                    >
                      {RAFFLE_COPY.body}
                    </p>
                  </div>
                  <div
                    style={css("display:flex;flex-direction:column;gap:14px")}
                  >
                    <input
                      type="email"
                      inputMode="email"
                      className="mv-input"
                      value={s.email}
                      onChange={(e) =>
                        this.setState({
                          email: e.target.value,
                          emailErr: false,
                        })
                      }
                      placeholder={RAFFLE_COPY.emailPlaceholder}
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      style={css(
                        `width:100%;box-sizing:border-box;height:88px;padding:0 24px;border-radius:10px;border:2px solid ${
                          s.emailErr ? "#E5484D" : "rgba(255,255,255,.16)"
                        };background:#111113;color:#FFFFFF;font-family:inherit;font-size:30px;font-weight:500;outline:none;user-select:text;-webkit-user-select:text`
                      )}
                    />
                    {s.emailErr && (
                      <span style={css("font-size:19px;color:#E5484D")}>
                        {RAFFLE_COPY.invalid}
                      </span>
                    )}
                    <button
                      className="mv-press"
                      onClick={this.submitEmail}
                      style={css(
                        "height:88px;border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:28px;font-weight:600;cursor:pointer"
                      )}
                    >
                      {RAFFLE_COPY.submit}
                    </button>
                    <button
                      onClick={this.skipEmail}
                      style={css(
                        "height:72px;border-radius:8px;border:1px solid rgba(255,255,255,.16);background:transparent;color:#FFFFFF;font-family:inherit;font-size:22px;font-weight:600;cursor:pointer"
                      )}
                    >
                      {RAFFLE_COPY.skip}
                    </button>
                  </div>
                </div>
              )}

              {sc === "thanks" && (
                <div
                  style={css(
                    "display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:64px;flex:1;padding:8px 20px;align-items:center"
                  )}
                >
                  <div
                    style={css(
                      "display:flex;flex-direction:column;gap:22px;animation:mvFadeUp .6s cubic-bezier(.34,1.56,.64,1) both"
                    )}
                  >
                    <div
                      style={css(
                        "width:104px;height:104px;border-radius:999px;background:#C6F24A;color:#0A0A0B;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 12px rgba(198,242,74,.2),0 0 56px rgba(198,242,74,.45)"
                      )}
                    >
                      <Check />
                    </div>
                    <h1
                      style={css(
                        "margin:0;font-size:clamp(64px,7vw,104px);line-height:1;letter-spacing:-.045em;font-weight:600"
                      )}
                    >
                      Gracias.
                    </h1>
                    <p
                      style={css(
                        "margin:0;font-size:26px;line-height:1.4;color:#D5D5DB;text-wrap:pretty"
                      )}
                    >
                      Tu respuesta ya está ajustando nuestro motor de precios.
                    </p>
                    {!!s.email && (
                      <p style={css("margin:0;font-size:20px;color:#8A8A93")}>
                        {RAFFLE_COPY.joined(s.email)}
                      </p>
                    )}
                    <div
                      style={css(
                        "margin-top:12px;display:flex;flex-direction:column;gap:12px"
                      )}
                    >
                      <button
                        className="mv-press"
                        onClick={this.resetToAttract}
                        style={css(
                          "height:88px;border-radius:8px;border:0;background:#C6F24A;color:#0A0A0B;font-family:inherit;font-size:28px;font-weight:600;cursor:pointer"
                        )}
                      >
                        Jugar de nuevo
                      </button>
                      <span
                        style={css(
                          "font-size:18px;color:#8A8A93;text-align:center"
                        )}
                      >
                        Volvemos al inicio en {s.thanksLeft} s
                      </span>
                    </div>
                  </div>
                  <div
                    style={css(
                      "display:flex;flex-direction:column;padding:32px 36px;border-radius:10px;background:#111113;border:1px solid rgba(255,255,255,.08);animation:mvStepIn .55s cubic-bezier(.22,1,.36,1) .2s both"
                    )}
                  >
                    <span
                      style={css(
                        "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#C6F24A;margin-bottom:12px"
                      )}
                    >
                      Tu recorrido
                    </span>
                    {summaryRows.map((r) => (
                      <div
                        key={r.k}
                        style={css(
                          `display:flex;justify-content:space-between;align-items:baseline;gap:20px;padding:18px 0;border-top:1px solid rgba(255,255,255,.08);animation:mvStepIn .45s cubic-bezier(.22,1,.36,1) both;animation-delay:${r.delay}`
                        )}
                      >
                        <span style={css("font-size:20px;color:#8A8A93")}>
                          {r.k}
                        </span>
                        <span
                          style={css(
                            `font-size:26px;font-weight:600;letter-spacing:-.02em;text-align:right;font-variant-numeric:tabular-nums;color:${r.color}`
                          )}
                        >
                          {r.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!!s.toast && (
          <div
            style={css(
              "position:absolute;right:40px;bottom:40px;z-index:12;display:flex;align-items:center;gap:12px;padding:18px 26px;border-radius:999px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#0A0A0B;font-size:22px;font-weight:600;box-shadow:0 24px 60px rgba(10,10,11,.3);animation:mvFadeUp .3s cubic-bezier(.22,1,.36,1) both"
            )}
          >
            <span
              style={css(
                `width:12px;height:12px;border-radius:999px;background:${s.toastDot}`
              )}
            />
            {s.toast}
          </div>
        )}

        {s.admin && (
          <div
            style={css(
              "position:absolute;inset:0;z-index:20;background:rgba(10,10,11,.7);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center"
            )}
          >
            <div
              style={css(
                "width:min(560px,90vw);box-sizing:border-box;padding:36px;border-radius:14px;background:#FFFFFF;color:#0A0A0B;display:flex;flex-direction:column;gap:20px;box-shadow:0 24px 60px rgba(10,10,11,.3)"
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
                <div
                  style={css(
                    "padding:18px;border-radius:6px;background:#F1F1F3;display:flex;flex-direction:column;gap:4px"
                  )}
                >
                  <span style={css("font-size:15px;color:#5A5A62")}>
                    Respuestas en el iPad
                  </span>
                  <span
                    style={css(
                      "font-size:40px;font-weight:600;letter-spacing:-.03em"
                    )}
                  >
                    {total}
                  </span>
                </div>
                <div
                  style={css(
                    "padding:18px;border-radius:6px;background:#F1F1F3;display:flex;flex-direction:column;gap:4px"
                  )}
                >
                  <span style={css("font-size:15px;color:#5A5A62")}>
                    Sin enviar al backend
                  </span>
                  <span
                    style={css(
                      "font-size:40px;font-weight:600;letter-spacing:-.03em"
                    )}
                  >
                    {pending}
                  </span>
                </div>
              </div>
              <span
                style={css(
                  "font-family:var(--font-mono);font-size:14px;color:#5A5A62;word-break:break-all"
                )}
              >
                Endpoint: /api/juegos/precios · evento{" "}
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

function BackButton({
  onClick,
  flexNone,
}: {
  onClick: () => void
  flexNone?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Volver"
      style={css(
        `width:88px;height:88px;${flexNone ? "flex:none;" : ""}border-radius:8px;border:1px solid rgba(255,255,255,.16);background:transparent;color:#FFFFFF;display:flex;align-items:center;justify-content:center;cursor:pointer`
      )}
    >
      <ArrowLeft />
    </button>
  )
}

function AnswerButton({
  color,
  delay,
  icon,
  onClick,
  children,
}: {
  color: string
  delay: string
  icon: React.ReactNode
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      className="mv-press"
      onClick={onClick}
      style={css(
        `animation:mvStepIn .45s cubic-bezier(.22,1,.36,1) ${delay} both;height:80px;border-radius:10px;border:0;background:${color};color:#0A0A0B;font-family:inherit;font-size:28px;font-weight:600;display:flex;align-items:center;gap:18px;padding:0 24px;cursor:pointer`
      )}
    >
      <span
        style={css(
          "width:44px;height:44px;border-radius:999px;background:rgba(10,10,11,.14);display:flex;align-items:center;justify-content:center;flex:none"
        )}
      >
        {icon}
      </span>
      {children}
    </button>
  )
}
