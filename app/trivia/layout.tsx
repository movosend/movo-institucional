import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Trivia",
  description: "Jugá la trivia de Movo desde tu celular.",
  robots: { index: false, follow: false },
}

// Celular de cada jugador: sin zoom por pellizco ni doble toque (los botones son grandes).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
}

export default function TriviaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
