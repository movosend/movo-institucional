import type { Metadata } from "next"
import { Navbar } from "@/components/home/navbar"
import { ProjectPageHero } from "@/components/el-proyecto/page-hero"
import { ProjectPageBody } from "@/components/el-proyecto/page-body"

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
    <div className="min-h-screen bg-background">
      <div className="relative z-10">
        <Navbar />
        <main>
          <ProjectPageHero />
          <ProjectPageBody />
        </main>
      </div>
    </div>
  )
}
