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
    <div style={{ background: "#0A0A0B", minHeight: "100vh" }}>
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto w-full max-w-[720px] px-5 md:px-8">
          {/* Back link */}
          <div className="pt-28 pb-10 md:pt-36">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm transition-colors duration-[var(--motion-hover)] hover:text-white"
              style={{ color: "rgba(255,255,255,0.4)" }}
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
          <header
            className="pb-10"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="mb-6 flex items-center gap-3">
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
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {formatDate(post.publishedAt)}
              </span>
            </div>

            <h1
              className="font-display text-3xl leading-tight md:text-4xl"
              style={{ color: "rgba(255,255,255,0.92)" }}
            >
              {post.title}
            </h1>

            <p
              className="mt-5 text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {post.description}
            </p>
          </header>

          {/* Article body */}
          <article className="space-y-8 pt-10 pb-24">
            {post.sections.map((section, i) => (
              <section key={i}>
                {section.heading && (
                  <h2
                    className="mb-4 text-xl font-semibold"
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {section.heading}
                  </h2>
                )}

                {section.paragraphs && (
                  <div className="space-y-4">
                    {section.paragraphs.map((p, j) => (
                      <p
                        key={j}
                        className="text-base leading-[1.75]"
                        style={{ color: "rgba(255,255,255,0.6)" }}
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
                        className="rounded-xl p-4 md:p-5"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <p
                          className="font-display mb-1 text-2xl md:text-3xl"
                          style={{ color: "#C6F24A" }}
                        >
                          {s.value}
                        </p>
                        <p
                          className="text-xs leading-snug"
                          style={{ color: "rgba(255,255,255,0.45)" }}
                        >
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {section.checklist && (
                  <div>
                    {section.checklist.title && (
                      <p
                        className="mb-3 text-sm font-medium"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {section.checklist.title}
                      </p>
                    )}
                    <ul className="space-y-2.5">
                      {section.checklist.items.map((item, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 text-sm leading-relaxed"
                          style={{ color: "rgba(255,255,255,0.65)" }}
                        >
                          <span
                            className="mt-1 flex-none rounded-full"
                            style={{
                              width: 6,
                              height: 6,
                              background: item.done
                                ? "#C6F24A"
                                : "rgba(255,255,255,0.25)",
                            }}
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
                      <p
                        className="mb-4 text-sm font-medium"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
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
                              <span
                                className="text-sm"
                                style={{ color: "rgba(255,255,255,0.6)" }}
                              >
                                {item.label}
                              </span>
                              <span
                                className="text-xs font-medium tabular-nums"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                              >
                                {item.value}
                                {item.suffix ?? ""}
                              </span>
                            </div>
                            <div
                              className="h-2 overflow-hidden rounded-full"
                              style={{ background: "rgba(255,255,255,0.06)" }}
                            >
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
                    <div
                      className="overflow-x-auto rounded-xl"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <table className="w-full min-w-[480px] border-collapse text-sm">
                        <thead>
                          <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                            {section.table.headers.map((h, j) => (
                              <th
                                key={j}
                                className="px-4 py-3 text-left font-medium"
                                style={{
                                  color: "rgba(255,255,255,0.7)",
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.08)",
                                }}
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
                                  className="px-4 py-3 align-top leading-relaxed"
                                  style={{
                                    color: "rgba(255,255,255,0.55)",
                                    borderBottom:
                                      j < section.table!.rows.length - 1
                                        ? "1px solid rgba(255,255,255,0.06)"
                                        : "none",
                                  }}
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
                      <p
                        className="mt-2 text-xs"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {section.table.caption}
                      </p>
                    )}
                  </div>
                )}

                {section.callout && (
                  <div
                    className="rounded-xl p-5 md:p-6"
                    style={{
                      background:
                        section.callout.tone === "warning"
                          ? "rgba(255,180,80,0.06)"
                          : section.callout.tone === "success"
                            ? "rgba(198,242,74,0.06)"
                            : "rgba(255,255,255,0.04)",
                      border:
                        section.callout.tone === "warning"
                          ? "1px solid rgba(255,180,80,0.18)"
                          : section.callout.tone === "success"
                            ? "1px solid rgba(198,242,74,0.15)"
                            : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <p
                      className="mb-2 text-sm font-semibold"
                      style={{
                        color:
                          section.callout.tone === "warning"
                            ? "#FFB450"
                            : section.callout.tone === "success"
                              ? "#C6F24A"
                              : "rgba(255,255,255,0.8)",
                      }}
                    >
                      {section.callout.title}
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
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
              <p
                className="mb-1 text-sm font-semibold"
                style={{ color: "#C6F24A" }}
              >
                Movo llega pronto
              </p>
              <p
                className="mb-4 text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
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
