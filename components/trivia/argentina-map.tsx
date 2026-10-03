"use client"

import { geoMercator, geoPath } from "d3-geo"
import type { Feature, MultiPolygon } from "geojson"
import { useId, useMemo } from "react"

import { FAIR_CITY } from "@/lib/trivia/config"
import argentina from "@/lib/trivia/argentina.json"
import { findLocalidad } from "@/lib/trivia/localidades"

/**
 * Mapa de Argentina del prototipo (d3-geo, sin tiles ni red: la geometría está en
 * lib/trivia/argentina.json). Tres modos:
 * - `lobby`: "La red de hoy", arcos desde la ciudad de cada jugador hasta la feria.
 * - `mine`: el celular en la sala, con la ciudad del jugador marcada.
 * - `route`: el precio justo, origen lime y destino Route Blue.
 */
const LAND = argentina as unknown as Feature<MultiPolygon>

type Props = { w: number; h: number; pad: number } & (
  | { mode: "lobby"; cities: { name: string; count: number }[] }
  | { mode: "mine"; cities: { name: string; count: number }[]; mine: string }
  | { mode: "route"; from: string; to: string; cities?: string[] }
)

const INK = "#0A0A0B"
const LIME = "#C6F24A"

function Label({
  x,
  y,
  text,
  size,
  weight = 600,
  anchor = "start",
}: {
  x: number
  y: number
  text: string
  size: number
  weight?: number
  anchor?: "start" | "end" | "middle"
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fill={INK}
      paintOrder="stroke"
      stroke="#FFFFFF"
      strokeWidth={6}
      strokeLinejoin="round"
    >
      {text}
    </text>
  )
}

export function ArgentinaMap(props: Props) {
  const { w, h, pad } = props
  const pid = "mvdots" + useId().replace(/:/g, "")
  const routeFrom = props.mode === "route" ? props.from : undefined
  const routeTo = props.mode === "route" ? props.to : undefined
  const { project, land } = useMemo(() => {
    // La ruta del precio justo hace zoom a su región: en el mapa del país, un envío de
    // 36 km deja los dos puntos encimados.
    const a = routeFrom ? findLocalidad(routeFrom) : undefined
    const b = routeTo ? findLocalidad(routeTo) : undefined
    let target: Parameters<ReturnType<typeof geoMercator>["fitExtent"]>[1] =
      LAND
    if (a && b) {
      const span = Math.max(
        4,
        Math.abs(a[2] - b[2]) * 1.8,
        Math.abs(a[3] - b[3]) * 1.8
      )
      const lat = (a[2] + b[2]) / 2
      const lng = (a[3] + b[3]) / 2
      target = {
        type: "MultiPoint",
        coordinates: [
          [lng - span / 2, lat - span / 2],
          [lng + span / 2, lat + span / 2],
        ],
      }
    }
    const proj = geoMercator().fitExtent(
      [
        [pad, pad],
        [w - pad, h - pad],
      ],
      target
    )
    return { project: proj, land: geoPath(proj)(LAND) ?? "" }
  }, [w, h, pad, routeFrom, routeTo])

  const at = (name: string) => {
    const c = findLocalidad(name)
    if (!c) return undefined
    const p = project([c[3], c[2]])
    return p ? { x: p[0], y: p[1], name: c[0] } : undefined
  }
  const hub = at(FAIR_CITY)!

  let body: React.ReactNode
  if (props.mode === "route") {
    const o = at(props.from)
    const d = at(props.to)
    body = (
      <>
        {(props.cities ?? []).map((name) => {
          const p = at(name)
          return p ? (
            <circle
              key={name}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={INK}
              fillOpacity={0.18}
            />
          ) : null
        })}
        {o && d && (
          <>
            <line
              x1={o.x}
              y1={o.y}
              x2={d.x}
              y2={d.y}
              stroke={INK}
              strokeWidth={9}
              strokeLinecap="round"
            />
            <line
              x1={o.x}
              y1={o.y}
              x2={d.x}
              y2={d.y}
              stroke={LIME}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle
              cx={o.x}
              cy={o.y}
              r={12}
              fill={LIME}
              stroke={INK}
              strokeWidth={3}
            />
            <circle
              cx={d.x}
              cy={d.y}
              r={12}
              fill="#2B6BFF"
              stroke="#FFFFFF"
              strokeWidth={3}
            />
            <Label
              x={o.x + (o.x > d.x ? 20 : -20)}
              y={o.y - 14}
              text={o.name}
              size={30}
              anchor={o.x > d.x ? "start" : "end"}
            />
            <Label
              x={d.x + (d.x >= o.x ? 20 : -20)}
              y={d.y + 34}
              text={d.name}
              size={30}
              anchor={d.x >= o.x ? "start" : "end"}
            />
          </>
        )}
      </>
    )
  } else {
    const mine = props.mode === "mine" ? at(props.mine) : undefined
    const k = props.mode === "mine" ? 0.6 : 1
    const points = props.cities
      .map((c) => ({ ...c, p: at(c.name) }))
      .filter((c): c is typeof c & { p: NonNullable<typeof c.p> } => !!c.p)
    // Más grandes atrás, así no tapan a las chicas.
    points.sort((a, b) => b.count - a.count)
    // Hasta 5 etiquetas, salteando las que quedarían encima de otra (ciudades muy cerca).
    const placed = [hub]
    const labeled = points
      .filter((c) => c.p.name !== hub.name && c.p.name !== mine?.name)
      .filter((c) => {
        if (placed.length > 5) return false
        const near = placed.some(
          (o) => Math.abs(o.x - c.p.x) < 120 && Math.abs(o.y - c.p.y) < 28
        )
        if (!near) placed.push(c.p)
        return !near
      })
    body = (
      <>
        {points
          .filter((c) => c.p.name !== hub.name)
          .map(({ p }) => {
            const mx = (p.x + hub.x) / 2
            const my = (p.y + hub.y) / 2
            const dx = hub.x - p.x
            const dy = hub.y - p.y
            return (
              <path
                key={p.name}
                d={`M${p.x} ${p.y} Q${mx - dy * 0.18} ${my + dx * 0.18} ${hub.x} ${hub.y}`}
                fill="none"
                stroke={INK}
                strokeOpacity={props.mode === "mine" ? 0.12 : 0.22}
                strokeWidth={1.25 * k}
              />
            )
          })}
        {points.map(({ p, count }) => {
          const isMine = p.name === mine?.name
          const r = (3 + Math.sqrt(count) * 1.7) * k
          return (
            <circle
              key={p.name}
              cx={p.x}
              cy={p.y}
              r={isMine ? r * 1.8 : r}
              fill={LIME}
              stroke={INK}
              strokeWidth={isMine ? 2.5 : 1.25}
            />
          )
        })}
        {!points.some((c) => c.p.name === hub.name) && (
          <circle
            cx={hub.x}
            cy={hub.y}
            r={(3 + 1.7) * k}
            fill={LIME}
            stroke={INK}
            strokeWidth={1.25}
          />
        )}
        {mine && (
          <>
            <circle
              cx={mine.x}
              cy={mine.y}
              r={6}
              fill="none"
              stroke={INK}
              strokeWidth={2}
            >
              <animate
                attributeName="r"
                from={6}
                to={20}
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                from={0.6}
                to={0}
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            {!points.some((c) => c.p.name === mine.name) && (
              <circle
                cx={mine.x}
                cy={mine.y}
                r={7}
                fill={LIME}
                stroke={INK}
                strokeWidth={2.5}
              />
            )}
            <Label x={mine.x + 14} y={mine.y + 6} text={mine.name} size={17} />
          </>
        )}
        {props.mode === "lobby" && (
          <>
            <Label
              x={hub.x - 18}
              y={hub.y - 14}
              text={`${hub.name} · la feria`}
              size={21}
              weight={700}
              anchor="end"
            />
            {labeled.map(({ p }) => {
              const right = p.x >= hub.x
              return (
                <Label
                  key={p.name}
                  x={p.x + (right ? 16 : -16)}
                  y={p.y + 7}
                  text={p.name}
                  size={21}
                  anchor={right ? "start" : "end"}
                />
              )
            })}
          </>
        )}
      </>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", fontFamily: "var(--font-sans)" }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={pid} width={9} height={9} patternUnits="userSpaceOnUse">
          <circle cx={4.5} cy={4.5} r={1.3} fill={INK} fillOpacity={0.14} />
        </pattern>
      </defs>
      <path
        d={land}
        fill="#F1F1F3"
        stroke="#8A8A93"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path d={land} fill={`url(#${pid})`} />
      {body}
    </svg>
  )
}
