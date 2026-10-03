import type { Metadata } from "next"

import { PinGate } from "@/components/juegos/pin-gate"
import { safeNext } from "@/lib/juegos/access"

export const metadata: Metadata = {
  title: "Acceso",
}

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { next } = await searchParams
  return <PinGate next={safeNext(Array.isArray(next) ? next[0] : next)} />
}
