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

  const nextPost = post.nextSlug ? getPostBySlug(post.nextSlug) : undefined

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto w-full max-w-[720px] px-5 md:px-8">
          {/* Back link */}
          <div className="pt-28 pb-10 md:pt-36">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-foreground/40 transition-colors duration-[var(--motion-hover)] hover:text-foreground"
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
          <header className="border-b border-border pb-10">
            <div className="mb-6 flex items-center gap-3">
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

            <h1 className="font-display text-3xl leading-tight text-foreground/90 md:text-4xl">
              {post.title}
            </h1>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              {post.description}
            </p>
          </header>

          {/* Article body */}
          <article className="space-y-8 pt-10 pb-24">
            {post.sections.map((section, i) => (
              <section key={i}>
                {section.heading && (
                  <h2
                    className="mb-4 text-xl font-semibold text-foreground/85"
                    style={{ letterSpacing: "-0.025em" }}
                  >
                    {section.heading}
                  </h2>
                )}
                {section.paragraphs && (
                  <div className="space-y-4">
                    {section.paragraphs.map((p, j) => (
                      <p
                        key={j}
                        className="text-base leading-[1.75] text-muted-foreground"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                )}

                {section.stats && (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {section.stats.map((s, j) => (
                      <div
                        key={j}
                        className="rounded-xl border border-border bg-foreground/[0.03] p-4 md:p-5"
                      >
                        <p
                          className="font-display mb-1 text-2xl md:text-3xl"
                          style={{ color: "#C6F24A" }}
                        >
                          {s.value}
                        </p>
                        <p className="text-xs leading-snug text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {section.checklist && (
                  <div>
                    {section.checklist.title && (
                      <p className="mb-3 text-sm font-medium text-foreground/70">
                        {section.checklist.title}
                      </p>
                    )}
                    <ul className="space-y-2.5">
                      {section.checklist.items.map((item, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 text-sm leading-relaxed text-foreground/65"
                        >
                          <span
                            className={`mt-1 flex-none rounded-full ${
                              item.done ? "bg-[#C6F24A]" : "bg-foreground/25"
                            }`}
                            style={{ width: 6, height: 6 }}
                          />
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.bars && (
                  <div>
                    {section.bars.title && (
                      <p className="mb-4 text-sm font-medium text-foreground/70">
                        {section.bars.title}
                      </p>
                    )}
                    <div className="space-y-4">
                      {section.bars.items.map((item, j) => {
                        const max = Math.max(
                          ...section.bars!.items.map((b) => b.value)
                        )
                        const pct =
                          max > 0 ? Math.round((item.value / max) * 100) : 0
                        return (
                          <div key={j}>
                            <div className="mb-1.5 flex items-baseline justify-between">
                              <span className="text-sm text-foreground/60">
                                {item.label}
                              </span>
                              <span className="text-xs font-medium tabular-nums text-foreground/40">
                                {item.value}
                                {item.suffix ?? ""}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background: "#C6F24A",
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {section.table && (
                  <div>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full min-w-[480px] border-collapse text-sm">
                        <thead>
                          <tr className="bg-foreground/[0.04]">
                            {section.table.headers.map((h, j) => (
                              <th
                                key={j}
                                className="border-b border-border px-4 py-3 text-left font-medium text-foreground/70"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row, j) => (
                            <tr key={j}>
                              {row.map((cell, k) => (
                                <td
                                  key={k}
                                  className={`px-4 py-3 align-top leading-relaxed text-foreground/55 ${
                                    j < section.table!.rows.length - 1
                                      ? "border-b border-border/60"
                                      : ""
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {section.table.caption && (
                      <p className="mt-2 text-xs text-foreground/35">
                        {section.table.caption}
                      </p>
                    )}
                  </div>
                )}

                {section.callout && (
                  <div
                    className={`rounded-xl border p-5 md:p-6 ${
                      section.callout.tone === "warning"
                        ? "border-[#FFB450]/18 bg-[#FFB450]/[0.06]"
                        : section.callout.tone === "success"
                          ? "border-[#C6F24A]/15 bg-[#C6F24A]/[0.06]"
                          : "border-border bg-foreground/[0.04]"
                    }`}
                  >
                    <p
                      className={`mb-2 text-sm font-semibold ${
                        section.callout.tone === "warning"
                          ? "text-[#FFB450]"
                          : section.callout.tone === "success"
                            ? "text-[#C6F24A]"
                            : "text-foreground/80"
                      }`}
                    >
                      {section.callout.title}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/60">
                      {section.callout.body}
                    </p>
                  </div>
                )}
              </section>
            ))}

            {/* Next in series */}
            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="mt-12 flex items-center justify-between gap-4 rounded-2xl p-6 transition-colors duration-[var(--motion-hover)] hover:bg-white/[0.04] md:p-8"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div>
                  <p
                    className="mb-1.5 text-xs font-medium tracking-wide uppercase"
                    style={{ color: "#C6F24A" }}
                  >
                    Siguiente devlog
                  </p>
                  <p
                    className="text-base font-medium"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {nextPost.title}
                  </p>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            {/* CTA */}
            <div
              className="mt-12 rounded-2xl p-6 md:p-8"
              style={{
                background: "rgba(198,242,74,0.06)",
                border: "1px solid rgba(198,242,74,0.15)",
              }}
            >
              <p className="mb-1 text-sm font-semibold text-[#9FC72E] dark:text-[#C6F24A]">
                Movo llega pronto
              </p>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                La app está en desarrollo. Seguinos en Instagram para enterarte
                cuando esté disponible.
              </p>
              <a
                href="https://www.instagram.com/movosend"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity duration-[var(--motion-hover)] hover:opacity-80"
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
