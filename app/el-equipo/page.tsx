import { Navbar } from "@/components/home/navbar"
import { TeamPageHero } from "@/components/el-equipo/page-hero"
import { TeamBody } from "@/components/el-equipo/team-body"

export const metadata = {
  title: "El Equipo — Movo",
  description:
    "Cinco estudiantes de Ingeniería en Sistemas de la UTN Córdoba. Un equipo plano, dinámico y autogestionado.",
}

export default function ElEquipoPage() {
  return (
    <div style={{ background: "#0A0A0B", minHeight: "100vh" }}>
      <div className="relative z-10">
        <Navbar />
        <main>
          <TeamPageHero />
          <TeamBody />
        </main>
      </div>
    </div>
  )
}
