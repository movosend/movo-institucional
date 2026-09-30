import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad y tratamiento de datos personales de Movo.",
  openGraph: {
    title: "Política de Privacidad | Movo",
    description:
      "Política de privacidad y tratamiento de datos personales de Movo.",
  },
}

export default function PoliticaDePrivacidadPage() {
  return <LegalPage doc="privacidad" />
}
