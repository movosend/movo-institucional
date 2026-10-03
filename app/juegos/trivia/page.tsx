import type { Metadata } from "next"

import { TriviaTV } from "@/components/trivia/screen/tv"

export const metadata: Metadata = {
  title: "Trivia · pantalla",
}

/** Pantalla 16:9 de la feria (detrás del PIN de /juegos). Los celulares entran por /trivia. */
export default function TriviaScreenPage() {
  return <TriviaTV />
}
