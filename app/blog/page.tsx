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
    <div style={{ background: "#0A0A0B", minHeight: "100vh" }}>
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto w-full max-w-[1200px] px-5 md:px-10">
          {/* Hero */}
          <div className="pt-32 pb-16 md:pt-40 md:pb-20">
            <p className="section-label mb-4">Blog</p>
            <h1
              className="font-display text-4xl md:text-5xl"
              style={{ color: "rgba(255,255,255,0.92)" }}
            >
              Logística colaborativa
              <br />
              <span style={{ color: "#C6F24A" }}>para Argentina</span>
            </h1>
            <p
              className="mt-5 max-w-[560px] text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Artículos sobre envíos P2P, el modelo colaborativo y cómo Movo
              está cambiando la logística de última milla.
            </p>
          </div>

          {/* Divider */}
          <div
            className="mb-12"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          />

          {/* Post grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border p-6 transition-colors duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
                onMouseEnter={undefined}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: "#C6F24A" }}
                  >
                    Blog
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                  <span
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {post.readMinutes} min de lectura
                  </span>
                </div>

                <h2
                  className="text-lg font-semibold leading-snug mb-3 transition-colors duration-200 group-hover:text-white"
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {post.title}
                </h2>

                <p
                  className="text-sm leading-relaxed flex-1"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {post.description}
                </p>

                <div className="flex items-center justify-between mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {formatDate(post.publishedAt)}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs font-medium transition-colors duration-200 group-hover:text-white"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
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
