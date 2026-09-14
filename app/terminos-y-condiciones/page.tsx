import type { Metadata } from "next"
import { Navbar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"
import { renderLegalDocument } from "@/content/legal/render"

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de la aplicación Movo.",
  openGraph: {
    title: "Términos y Condiciones | Movo",
    description: "Términos y condiciones de uso de la aplicación Movo.",
  },
}

export default function TerminosYCondicionesPage() {
  const html = renderLegalDocument("terminos-y-condiciones.md")

  return (
    <div style={{ background: "#0A0A0B", minHeight: "100vh" }}>
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
