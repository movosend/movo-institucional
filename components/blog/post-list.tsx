"use client"

import Link from "next/link"
import { useState } from "react"

import { cn } from "@/lib/utils"
import type { PostTag } from "@/content/blog/posts"

export type PostListItem = {
  slug: string
  tag: PostTag
  date: string
  min: number
  title: string
  desc: string
}

const FILTERS = ["Todo", "Sprint", "Guía", "Producto"] as const
type Filter = (typeof FILTERS)[number]

export function PostList({ posts }: { posts: PostListItem[] }) {
  const [filter, setFilter] = useState<Filter>("Todo")
  const visible = posts.filter((p) => filter === "Todo" || p.tag === filter)

  return (
    <>
      <div className="bg-lime-500 px-[clamp(20px,4vw,64px)] pb-10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
              className={cn(
                "h-11 cursor-pointer rounded-full border-[1.5px] border-ink-950 px-[18px] text-[15px] font-medium",
                f === filter
                  ? "bg-ink-950 text-lime-500"
                  : "bg-transparent text-ink-950"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-[clamp(20px,4vw,64px)] pb-[120px]">
        {visible.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="grid grid-cols-2 items-baseline gap-x-[clamp(16px,3vw,48px)] gap-y-4 border-b border-white/12 py-9 transition-[padding] duration-200 ease-[cubic-bezier(.22,1,.36,1)] hover:pl-4 hover:text-lime-500 md:grid-cols-[minmax(0,140px)_minmax(0,1fr)_minmax(0,120px)]"
          >
            <span className="font-mono text-[13px] text-ink-400">{p.date}</span>
            <div className="order-last col-span-2 flex min-w-0 flex-col gap-3 md:order-none md:col-span-1">
              <span className="text-[clamp(24px,3.2vw,44px)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance">
                {p.title}
              </span>
              <span className="max-w-[60ch] text-[17px] leading-normal text-pretty text-ink-300">
                {p.desc}
              </span>
            </div>
            <span className="text-right font-mono text-[13px] text-ink-400">
              {p.tag} · {p.min} min
            </span>
          </Link>
        ))}
      </main>
    </>
  )
}
