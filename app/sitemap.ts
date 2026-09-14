import type { MetadataRoute } from "next"
import { posts } from "@/content/blog/posts"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://movosend.app"
  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: new Date(post.publishedAt),
  }))
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/como-funciona`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/el-proyecto`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/el-equipo`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terminos-y-condiciones`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politica-de-privacidad`, changeFrequency: "yearly", priority: 0.3 },
    ...blogPosts,
  ]
}
