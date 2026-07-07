import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://movosend.app"
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/como-funciona`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/el-proyecto`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/el-equipo`, changeFrequency: "monthly", priority: 0.5 },
  ]
}
