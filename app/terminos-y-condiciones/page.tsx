import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de la aplicación Movo.",
  openGraph: {
    title: "Términos y Condiciones | Movo",
    description: "Términos y condiciones de uso de la aplicación Movo.",
  },
}

export default function TerminosYCondicionesPage() {
  return <LegalPage doc="terminos" />
}
