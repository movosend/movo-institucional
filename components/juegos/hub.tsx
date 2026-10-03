"use client"

import "leaflet/dist/leaflet.css"
import "./juegos.css"

import Link from "next/link"
import { useEffect, useRef } from "react"
import type * as Leaflet from "leaflet"

import { CITIES } from "@/lib/juegos/cities"
import { css } from "@/lib/juegos/css"
import { withStand } from "@/lib/juegos/event-tag"
import {
  MAP_BG,
  setupTileCache,
  TILE_OPTIONS,
  tileUrl,
} from "@/lib/juegos/map-tiles"
import { ArrowRight } from "./precios/icons"

interface Game {
  href: string | null
  module: string
  title: string
  desc: string
}

/**
 * Cada juego muestra un módulo real de Movo. El segundo (prototipo "Movo Optimizador"
 * en Claude Design) todavía no está conectado al backend.
 */
const GAMES: Game[] = [
  {
    href: "/juegos/precios",
    module: "Juego 1 · Motor de precios",
    title: "¿Cuánto cuesta mandar algo con Movo?",
    desc: "Elegí dos ciudades, mirá el precio real que calcula Movo y decinos si lo pagarías.",
  },
  {
    href: null,
    module: "Juego 2 · Optimizador de rutas",
    title: "¿Armás una ruta mejor que la de Movo?",
    desc: "Ordená las paradas de un recorrido contra reloj y compará tus kilómetros con los del optimizador.",
  },
]

/** Mapa claro de fondo, mismo estilo que los juegos, sin interacción. */
function HubMap() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: Leaflet.Map | null = null
    let cancelled = false
    setupTileCache()
    import("leaflet").then((mod) => {
      const L =
        (mod as unknown as { default?: typeof Leaflet }).default ??
        (mod as unknown as typeof Leaflet)
      if (cancelled || !ref.current) return
      map = L.map(ref.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomSnap: 0.25,
      })
      L.tileLayer(tileUrl("Base"), TILE_OPTIONS).addTo(map)
      L.tileLayer(tileUrl("Reference"), TILE_OPTIONS).addTo(map)
      CITIES.forEach((c) =>
        L.circleMarker([c[2], c[3]], {
          radius: 6,
          color: "#0A0A0B",
          weight: 2,
          opacity: 0.7,
          fillColor: "#C6F24A",
          fillOpacity: 0.9,
          interactive: false,
        }).addTo(map!)
      )
      map.fitBounds(
        [
          [-55, -73.5],
          [-21.8, -53.6],
        ],
        {
          paddingTopLeft: [Math.round(window.innerWidth * 0.5), 40],
          paddingBottomRight: [40, 40],
        }
      )
    })
    return () => {
      cancelled = true
      map?.remove()
    }
  }, [])

  return (
    <div
      ref={ref}
      style={css(`position:absolute;inset:0;z-index:0;background:${MAP_BG}`)}
    />
  )
}

export function GamesHub({ eventTag }: { eventTag?: string }) {
  return (
    <div
      className="mv-game"
      style={css(
        "position:fixed;inset:0;z-index:200;background:#0A0A0B;color:#FFFFFF;font-family:var(--font-sans);overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent"
      )}
    >
      <HubMap />

      <div
        style={css(
          "position:absolute;top:0;bottom:0;left:0;width:52%;z-index:5"
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
              "position:relative;height:100%;box-sizing:border-box;padding:clamp(48px,10vh,96px) 16% clamp(24px,5vh,48px) clamp(36px,5vw,64px);display:flex;flex-direction:column;justify-content:safe center;gap:clamp(14px,3.4vh,32px);overflow:hidden;color:#0A0A0B"
            )}
          >
            <span
              style={css(
                "font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#2A2A2E;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) .25s both"
              )}
            >
              Movo · Juegos
            </span>
            <h1
              style={css(
                "margin:0;font-size:clamp(38px,min(5.4vw,9vh),80px);line-height:1.04;letter-spacing:-.045em;font-weight:900;text-wrap:balance;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) .35s both"
              )}
            >
              Jugá y mirá cómo funciona Movo por dentro
            </h1>
            <p
              style={css(
                "margin:0;font-size:clamp(18px,3vh,24px);line-height:1.35;color:#2A2A2E;max-width:480px;text-wrap:pretty;animation:mvFadeUp .6s cubic-bezier(.22,1,.36,1) .45s both"
              )}
            >
              Cada juego usa un módulo real de Movo: los precios y las rutas
              salen del mismo motor que la app.
            </p>
          </div>
        </div>
      </div>

      <div
        style={css(
          "position:absolute;top:0;bottom:0;right:32px;width:min(560px,44%);z-index:6;display:flex;flex-direction:column;justify-content:center;gap:20px"
        )}
      >
        {GAMES.map((g, i) => {
          const card = (
            <div
              style={css(
                `display:flex;flex-direction:column;gap:14px;padding:32px;border-radius:14px;background:rgba(10,10,11,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);animation:mvStepIn .55s cubic-bezier(.22,1,.36,1) ${0.3 + i * 0.12}s both;opacity:${g.href ? 1 : 0.72}`
              )}
            >
              <span
                style={css(
                  `font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${g.href ? "#C6F24A" : "#8A8A93"}`
                )}
              >
                {g.module}
              </span>
              <span
                style={css(
                  "font-size:clamp(28px,2.8vw,40px);line-height:1.08;letter-spacing:-.03em;font-weight:600;text-wrap:balance"
                )}
              >
                {g.title}
              </span>
              <span
                style={css(
                  "font-size:19px;line-height:1.4;color:#B4B4BC;text-wrap:pretty"
                )}
              >
                {g.desc}
              </span>
              {g.href ? (
                <span
                  style={css(
                    "margin-top:6px;height:72px;border-radius:8px;background:#C6F24A;color:#0A0A0B;font-size:24px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:14px"
                  )}
                >
                  Jugar
                  <ArrowRight size={28} />
                </span>
              ) : (
                <span
                  style={css(
                    "margin-top:6px;height:72px;border-radius:8px;border:1px dashed rgba(255,255,255,.2);color:#8A8A93;font-size:22px;font-weight:600;display:flex;align-items:center;justify-content:center"
                  )}
                >
                  Próximamente
                </span>
              )}
            </div>
          )
          return g.href ? (
            <Link
              key={g.module}
              href={withStand(g.href, eventTag)}
              className="mv-press"
              style={css("color:inherit;text-decoration:none")}
            >
              {card}
            </Link>
          ) : (
            <div key={g.module} aria-disabled="true">
              {card}
            </div>
          )
        })}
      </div>
    </div>
  )
}
