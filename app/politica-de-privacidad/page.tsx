import type { Metadata } from "next"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"
import { renderLegalDocument } from "@/content/legal/render"

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y tratamiento de datos personales de Movo.",
  openGraph: {
    title: "Política de Privacidad | Movo",
    description: "Política de privacidad y tratamiento de datos personales de Movo.",
  },
}

export default function PoliticaDePrivacidadPage() {
  const html = renderLegalDocument("politica-privacidad.md")

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto w-full max-w-[720px] px-5 pt-28 pb-24 md:px-8 md:pt-36">
          <div
            className="legal-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </main>
        <Footer />
      </div>
    </div>
  )
}
