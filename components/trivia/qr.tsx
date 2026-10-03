"use client"

import QRCode from "qrcode"
import { useMemo, useSyncExternalStore } from "react"

import { PUBLIC_URL } from "@/lib/trivia/config"

/**
 * URL a la que lleva el QR. Sin `NEXT_PUBLIC_TRIVIA_URL` en desarrollo, usa el origen
 * actual: así un celular en la misma red puede escanear la TV de `npm run dev`.
 */
export function useTriviaUrl() {
  return useSyncExternalStore(
    () => () => {},
    () =>
      process.env.NEXT_PUBLIC_TRIVIA_URL ||
      process.env.NODE_ENV === "production"
        ? PUBLIC_URL
        : `${window.location.origin}/trivia`,
    () => PUBLIC_URL
  )
}

export const displayUrl = (url: string) => url.replace(/^https?:\/\//, "")

/** QR real como SVG (módulos negros sobre blanco, con margen de 1 módulo como el diseño). */
export function Qr({ url, size }: { url: string; size: number }) {
  const { n, d } = useMemo(() => {
    const qr = QRCode.create(url, { errorCorrectionLevel: "M" })
    const n = qr.modules.size
    let d = ""
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        if (qr.modules.get(x, y)) d += `M${x} ${y}h1v1h-1z`
    return { n, d }
  }, [url])
  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR para jugar"
      style={{ display: "block", flex: "none" }}
    >
      <rect x={-1} y={-1} width={n + 2} height={n + 2} fill="#FFFFFF" />
      <path d={d} fill="#0A0A0B" />
    </svg>
  )
}
