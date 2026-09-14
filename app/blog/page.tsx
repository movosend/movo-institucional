import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/home/navbar"
import { posts, formatDate } from "@/content/blog/posts"

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

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto w-full max-w-[1200px] px-5 md:px-10">
          {/* Hero */}
          <div className="pt-32 pb-16 md:pt-40 md:pb-20">
            <p className="section-label mb-4">Blog</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground/90">
              Logística colaborativa
              <br />
              <span style={{ color: "#C6F24A" }}>para Argentina</span>
            </h1>
            <p className="mt-5 max-w-[560px] text-base leading-relaxed text-muted-foreground">
              Artículos sobre envíos P2P, el modelo colaborativo y cómo Movo
              está cambiando la logística de última milla.
            </p>
          </div>

          {/* Divider */}
          <div className="mb-12 border-t border-border" />

          {/* Post grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-foreground/[0.03] p-6 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: "#C6F24A" }}
                  >
                    Blog
                  </span>
                  <span className="text-foreground/20">·</span>
                  <span className="text-xs text-muted-foreground">
                    {post.readMinutes} min de lectura
                  </span>
                </div>

                <h2
                  className="text-lg font-semibold leading-snug mb-3 text-foreground/85 transition-colors duration-200 group-hover:text-foreground"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {post.title}
                </h2>

                <p className="text-sm leading-relaxed flex-1 text-muted-foreground">
                  {post.description}
                </p>

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
                  <span className="text-xs text-foreground/30">
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-foreground/40 transition-colors duration-200 group-hover:text-foreground">
                    Leer
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                      style={{ width: 12, height: 12 }}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
