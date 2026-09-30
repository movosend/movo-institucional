import type { Metadata } from "next"

import { ComoClosing } from "@/components/como-funciona/closing"
import { ComoHero } from "@/components/como-funciona/hero"
import { Stages } from "@/components/como-funciona/stages"

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
    <main>
      <ComoHero />
      <Stages />
      <ComoClosing />
    </main>
  )
}
