import type { Metadata } from "next"

import { RouteGame } from "@/components/juegos/optimizador/route-game"
import { parseEventTag } from "@/lib/juegos/event-tag"

export const metadata: Metadata = {
  title: "¿Armás una ruta mejor que la de Movo?",
}

export default async function OptimizadorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { stand } = await searchParams
  return <RouteGame eventTag={parseEventTag(stand)} />
}
