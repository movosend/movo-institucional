import type { Metadata } from "next"

import { TriviaPhone } from "@/components/trivia/phone/phone"

export const metadata: Metadata = {
  title: "Trivia de Movo",
}

/** Lo abre el QR de la TV de la feria: público, sin PIN. */
export default function TriviaPage() {
  return <TriviaPhone />
}
