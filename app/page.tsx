import type { Metadata } from "next"

import { Faq } from "@/components/home/faq"
import { Film } from "@/components/home/film"
import { Hero } from "@/components/home/hero"
import { RouteSteps } from "@/components/home/route-steps"
import { Trust } from "@/components/home/trust"
import { Waitlist } from "@/components/home/waitlist"

export const metadata: Metadata = {
  title: "Movo | Envíos P2P entre personas en toda Argentina",
  description:
    "Movo conecta a quien necesita enviar un paquete con personas que ya viajan hacia ese destino. Pago protegido, verificación de identidad y seguimiento en tiempo real.",
}

export default function Page() {
  return (
    <main>
      <Hero />
      <Film />
      <RouteSteps />
      <Trust />
      <Waitlist />
      <Faq />
    </main>
  )
}
