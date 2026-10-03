import type { Metadata } from "next"

import { PricingGame } from "@/components/juegos/precios/pricing-game"
import { parseEventTag } from "@/lib/juegos/event-tag"

export const metadata: Metadata = {
  title: "¿Cuánto cuesta mandar algo con Movo?",
}

export default async function PreciosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { stand } = await searchParams
  return <PricingGame eventTag={parseEventTag(stand)} />
}
