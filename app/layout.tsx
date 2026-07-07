import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/home/footer"
import { ClarityScript } from "@/components/clarity-script"
import { CookieBanner } from "@/components/cookie-banner"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  metadataBase: new URL("https://movosend.app"),
  title: {
    default: "Movo | Envíos P2P entre personas en toda Argentina",
    template: "%s | Movo",
  },
  description:
    "Movo conecta a quien necesita enviar un paquete con personas que ya viajan hacia ese destino. Pago protegido, verificación de identidad y seguimiento en tiempo real.",
  keywords: [
    "envio de paquetes Argentina",
    "logistica colaborativa",
    "envios P2P",
    "enviar paquete con viajero",
    "app de envios Argentina",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://movosend.app",
    siteName: "Movo",
    title: "Movo | Envíos P2P entre personas en toda Argentina",
    description:
      "Conectamos a quien necesita enviar un paquete con personas que ya viajan hacia ese destino.",
    images: ["/movo-hero.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Movo | Envíos P2P entre personas en toda Argentina",
    description:
      "Conectamos a quien necesita enviar un paquete con personas que ya viajan hacia ese destino.",
    images: ["/movo-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  axes: ["opsz"],
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Movo",
              url: "https://movosend.app",
              logo: "https://movosend.app/logo.png",
              description:
                "Plataforma P2P de logística colaborativa en Argentina que conecta emisores de paquetes con transportistas que ya viajan hacia el destino.",
              sameAs: [
                "https://github.com/movosend",
                "https://instagram.com/movosend",
              ],
            }),
          }}
        />
        <ThemeProvider defaultTheme="dark" enableSystem={false}>
          {children}
          <Footer />
          <CookieBanner />
          <ClarityScript />
        </ThemeProvider>
      </body>
    </html>
  )
}
