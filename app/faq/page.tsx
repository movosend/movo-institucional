import type { Metadata } from "next"

import { FAQ_SECTIONS, GLOSSARY } from "@/content/faq"
import { FaqExplorer } from "@/components/faq/faq-explorer"
import { FaqHero } from "@/components/faq/hero"

const description =
  "Todo sobre Movo: qué es, cómo se verifica la identidad, cómo se envía y transporta un paquete, el Cryptographic Handshake, pagos, privacidad y glosario."

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Preguntas frecuentes | Movo",
    description,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_SECTIONS.flatMap((s) =>
    s.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    }))
  ),
}

export default function FaqPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <FaqHero />
      <FaqExplorer sections={FAQ_SECTIONS} glossary={GLOSSARY} />
    </main>
  )
}
