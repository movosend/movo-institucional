# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier (writes in place)
npm run typecheck  # TypeScript type check (no emit)
```

No test suite is configured.

## Architecture

**Next.js 15 App Router** with React 19 and TypeScript. Pages live in `app/`, page-specific components in `components/<route-name>/`, shared layout components in `components/home/`, and shadcn primitives in `components/ui/`.

### Route → component mapping

| Route | Page file | Components |
|---|---|---|
| `/` | `app/page.tsx` | `components/home/` |
| `/como-funciona` | `app/como-funciona/page.tsx` | `components/como-funciona/` |
| `/el-equipo` | `app/el-equipo/page.tsx` | `components/el-equipo/` |
| `/el-proyecto` | `app/el-proyecto/page.tsx` | `components/el-proyecto/` |

`app/layout.tsx` wraps all pages with `ThemeProvider` (forced dark) and the global `Footer`. The `Navbar` is rendered per-page, not in the root layout.

### Styling

Tailwind CSS v4 with shadcn (`radix-vega` style). All design tokens are CSS custom properties defined in `app/globals.css`. Use token names directly in Tailwind utilities (e.g. `bg-ink-950`, `text-lime-500`).

Custom utility classes defined in `globals.css`:
- `.font-display` — large optical-size heading (Inter `opsz 32`, `font-weight: 600`, `letter-spacing: -0.04em`)
- `.section-label` — uppercase eyebrow with lime color and wide tracking
- `.rule` / `.rule-ink` — 60×3px accent divider (lime or ink-200)
- `.bg-grid` / `.bg-grid-dark` — 32px squared grid texture
- `.bg-halftone` / `.bg-halftone-dark` — dot halftone texture
- `.chrome-text` — metallic gradient clipped to text
- `.live-dot` / `.dot-live` — animated lime pulse indicator

## Movo Design System

The full design system reference is in `.movo/movo-design-system.md`. Key rules that affect every component:

**Color:** Ink scale (`--ink-50` through `--ink-950`) plus `--paper` for surfaces. Signal Lime (`#C6F24A`, `--lime-500`) is the single accent — **maximum one lime element per screen**. Route Blue (`#2B6BFF`) is exclusively for maps.

**Typography:** Inter (loaded with `opsz` axis) for all copy, JetBrains Mono only for tracking codes and technical data. Only three weights: 400 / 500 / 600 — never 700 or 800. Headings always use negative tracking. No emoji in product UI.

**Buttons:** `border-radius: 8px` always. Four variants: Primary (ink-950 bg), Secondary (white bg + border), Accent (lime bg — one per screen), Ghost (underline link). Primary and Accent carry an animated arrow icon on hover.

**Animations:** Motion tokens are `--motion-hover: 120ms`, `--motion-state: 200ms`, `--motion-screen: 360ms`. Never exceed 360ms. Always respect `prefers-reduced-motion`.

**Metallic surfaces (Chrome/Titanium/Obsidian):** Maximum one per screen, never as section backgrounds or buttons.

## shadcn

Add components via `npx shadcn add <component>`. The registry style is `radix-vega` with `cssVariables: true` and icon library `lucide`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
