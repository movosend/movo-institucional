import type { Metadata } from "next"

import { PostList } from "@/components/blog/post-list"
import { posts } from "@/content/blog/posts"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos sobre logística colaborativa, envíos P2P y cómo Movo está cambiando la forma en que los argentinos envían paquetes.",
  openGraph: {
    title: "Blog | Movo",
    description:
      "Artículos sobre logística colaborativa, envíos P2P y cómo Movo está cambiando la forma en que los argentinos envían paquetes.",
  },
}

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
]
const shortDate = (iso: string) => {
  const [y, m, d] = iso.split("-")
  return `${+d} ${MONTHS[+m - 1]} ${y}`
}

export default function BlogPage() {
  const items = [...posts]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((p) => ({
      slug: p.slug,
      tag: p.tag,
      date: shortDate(p.publishedAt),
      min: p.readMinutes,
      title: p.listTitle ?? p.title,
      desc: p.excerpt,
    }))

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="bg-lime-500 px-[clamp(20px,4vw,64px)] pt-[clamp(120px,20vh,200px)] pb-10 text-ink-950">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6">
          <h1 className="m-0 text-[clamp(5rem,17vw,18rem)] leading-[.78] font-semibold tracking-[-0.075em]">
            Bitácora
          </h1>
          <p className="mt-0 mb-3 max-w-[360px] text-[19px] leading-[1.45] font-medium text-pretty">
            Logística entre personas, decisiones de producto y lo que va pasando
            mientras construimos Movo.
          </p>
        </div>
      </header>
      <PostList posts={items} />
    </div>
  )
}
