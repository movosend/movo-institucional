import type { Metadata } from "next"

import { ProyectoHero } from "@/components/el-proyecto/hero"
import {
  Career,
  Closing,
  Disciplines,
  Management,
  Motivation,
  Paper,
  Practices,
  Team,
} from "@/components/el-proyecto/sections"

export const metadata: Metadata = {
  title: "El Proyecto",
  description:
    "Movo es el Proyecto Final Integrador de Ingeniería en Sistemas de Información de la UTN Facultad Regional Córdoba. Un sistema real, para un problema real.",
  openGraph: {
    title: "El Proyecto | Movo",
    description:
      "Movo es el Proyecto Final Integrador de Ingeniería en Sistemas de Información de la UTN Facultad Regional Córdoba. Un sistema real, para un problema real.",
  },
}

export default function ElProyectoPage() {
  return (
    <main>
      <ProyectoHero />
      <Motivation />
      <Disciplines />
      <Career />
      <Team />
      <Practices />
      <Management />
      <Paper />
      <Closing />
    </main>
  )
}
