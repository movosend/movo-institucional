import type { Metadata } from "next"

import { TriviaControl } from "@/components/trivia/control/standalone"

export const metadata: Metadata = {
  title: "Trivia · control",
}

/** Control del stand en ventana propia (detrás del PIN de /juegos). */
export default function TriviaControlPage() {
  return <TriviaControl />
}
