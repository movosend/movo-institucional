import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Juegos",
  description:
    "Juegos interactivos que muestran cómo funciona Movo por dentro.",
  robots: { index: false, follow: false },
  manifest: "/juegos.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Movo",
  },
  // Next solo emite `mobile-web-app-capable`; Safari de iPad todavía lee la versión con prefijo.
  other: { "apple-mobile-web-app-capable": "yes" },
  icons: { apple: "/logo.png" },
}

// Kiosco táctil (iPad del stand): sin zoom por pellizco ni doble toque.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0B",
}

export default function JuegosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
