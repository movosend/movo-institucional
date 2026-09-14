import type { Metadata } from "next"
import { Navbar } from "@/components/home/navbar"
import { PageHero } from "@/components/como-funciona/page-hero"
import { StackedCards } from "@/components/como-funciona/stacked-cards"

export const metadata: Metadata = {
  title: "Cómo funciona",
  description:
    "El proceso punta a punta de un envío en Movo. Desde que el emisor abre la app hasta que el receptor firma la entrega.",
  openGraph: {
    title: "Cómo funciona | Movo",
    description:
      "El proceso punta a punta de un envío en Movo. Desde que el emisor abre la app hasta que el receptor firma la entrega.",
  },
}

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10">
        <Navbar />
        <main>
          <PageHero />
          <StackedCards />
        </main>
      </div>
    </div>
  )
}
