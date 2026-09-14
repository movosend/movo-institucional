import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/home/navbar"
import { posts, getPostBySlug, formatDate } from "@/content/blog/posts"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} | Movo`,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto w-full max-w-[720px] px-5 md:px-8">
          {/* Back link */}
          <div className="pt-28 md:pt-36 pb-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-foreground/40 transition-colors duration-150 hover:text-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 14, height: 14 }}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Blog
            </Link>
          </div>

          {/* Article header */}
          <header className="pb-10 border-b border-border">
            <div className="flex items-center gap-3 mb-6">
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
              <span className="text-foreground/20">·</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(post.publishedAt)}
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl leading-tight text-foreground/90">
              {post.title}
            </h1>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              {post.description}
            </p>
          </header>

          {/* Article body */}
          <article className="pt-10 pb-24 space-y-8">
            {post.sections.map((section, i) => (
              <section key={i}>
                {section.heading && (
                  <h2
                    className="text-xl font-semibold mb-4 text-foreground/85"
                    style={{ letterSpacing: "-0.025em" }}
                  >
                    {section.heading}
                  </h2>
                )}
                <div className="space-y-4">
                  {section.paragraphs.map((p, j) => (
                    <p key={j} className="text-base leading-[1.75] text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            {/* CTA */}
            <div
              className="mt-12 rounded-2xl p-6 md:p-8"
              style={{
                background: "rgba(198,242,74,0.06)",
                border: "1px solid rgba(198,242,74,0.15)",
              }}
            >
              <p className="text-sm font-semibold mb-1 text-[#9FC72E] dark:text-[#C6F24A]">
                Movo llega pronto
              </p>
              <p className="text-sm leading-relaxed mb-4 text-muted-foreground">
                La app está en desarrollo. Seguinos en Instagram para enterarte
                cuando esté disponible.
              </p>
              <a
                href="https://www.instagram.com/movosend"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity duration-150 hover:opacity-80"
                style={{ background: "#C6F24A", color: "#0A0A0B" }}
              >
                Seguir en Instagram
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 14, height: 14 }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </article>
        </main>
      </div>
    </div>
  )
}
