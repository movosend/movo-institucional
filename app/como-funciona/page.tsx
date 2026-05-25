import { Navbar } from "@/components/home/navbar"
import { PageHero } from "@/components/como-funciona/page-hero"
import { StackedCards } from "@/components/como-funciona/stacked-cards"

export const metadata = {
  title: "Cómo funciona — Movo",
  description:
    "El proceso punta a punta de un envío en Movo. Desde que el emisor abre la app hasta que el receptor firma la entrega.",
}

export default function ComoFuncionaPage() {
  return (
    <div style={{ background: "#0A0A0B", minHeight: "100vh" }}>
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
