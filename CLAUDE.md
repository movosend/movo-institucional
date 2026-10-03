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
| `/juegos` | `app/juegos/page.tsx` | `components/juegos/hub.tsx` |
| `/juegos/precios` | `app/juegos/precios/page.tsx` | `components/juegos/precios/` |
| `/juegos/optimizador` | `app/juegos/optimizador/page.tsx` | `components/juegos/optimizador/` |
| `/juegos/acceso` | `app/juegos/acceso/page.tsx` | `components/juegos/pin-gate.tsx` |
| `/juegos/trivia` | `app/juegos/trivia/page.tsx` | `components/trivia/screen/` (TV) |
| `/trivia` | `app/trivia/page.tsx` | `components/trivia/phone/` (celular, público) |

### Juegos (`/juegos`)

Pantallas completas para el stand de la feria (iPad), cada una conectada a un módulo real del
backend de Movo. `components/site/hide-in-games.tsx` saca Navbar, Footer y banner de cookies en
esas rutas; `app/juegos/layout.tsx` las marca `noindex` y sin zoom.

- **PIN de acceso**: `proxy.ts` exige la cookie de `JUEGOS_PIN` (6 dígitos) en `/juegos/*` y
  `/api/juegos/*`; sin ella las páginas redirigen a `/juegos/acceso` (teclado numérico) y la
  API responde 401. La cookie dura 30 días y se invalida al cambiar el PIN
  (`lib/juegos/access.ts`). Sin `JUEGOS_PIN`: abierto en dev, cerrado en producción.

- **Diseño copiado del prototipo de Claude Design** (proyecto "Movo Feria", archivos
  `Movo Feria.dc.html` / `Movo Optimizador.dc.html`): los estilos van inline con `css()`
  (`lib/juegos/css.ts`) usando el mismo string del prototipo, para poder compararlos línea a
  línea. No reinterpretar con Tailwind/shadcn. Mapa claro (ArcGIS Light Gray) con Leaflet.
- **Backend**: el navegador habla solo con los route handlers de `app/api/juegos/*`, que
  reenvían a `${MOVO_API_URL}/api/v1/demo/*` con `MOVO_DEMO_API_KEY` (server-side, nunca
  `NEXT_PUBLIC_`). El gateway valida la key (`DEMO_API_KEYS`) y limita por visitante con
  `x-movo-client-ip`.
- **Juego de precios**: el precio sale de `movo-svc-pricing-logistics` (con desglose); cada
  partida se guarda en `shipments.pricing_game_sessions` (cola offline en localStorage si no
  hay red). `?stand=<tag>` identifica el evento en las métricas. Modo stand: 5 toques en la
  esquina superior izquierda (CSV, reintentar envío, volver al hub).
- **Juego del optimizador**: la partida la crea el backend (`/api/juegos/optimizador/games`),
  que resuelve el orden óptimo con OR-Tools (`movo-svc-pricing-logistics`) sobre la matriz de
  la ciudad, cacheada en Redis 30 días, y mide la ruta del jugador con esa misma matriz. OSRM
  público solo dibuja las líneas de la carrera; el loop de atracción y el modo sin red usan
  la copia local de las ciudades (`lib/juegos/route-scenarios.ts`, espejo del backend). El
  ranking del día es compartido entre iPads (`shipments.route_game_sessions`). El modo stand
  configura tiempo del reloj, paradas, km en vivo y el **indicador de costo** (pastilla abajo
  a la derecha: matriz en cache o facturada a Google), guardados por iPad en localStorage.
- **Sorteo + newsletter**: los dos juegos usan el mismo copy (`components/juegos/raffle.ts`);
  dejar el mail suscribe a la audiencia de Resend vía `/api/juegos/newsletter`
  (`lib/newsletter.ts`, la misma función que `/api/newsletter` del home), con cola en
  localStorage si no hay red.

### Trivia (`/trivia` + `/juegos/trivia`)

Juego en vivo tipo Kahoot para la TV del stand. **No usa el backend de Movo**: vive en Next y en
un proyecto de Supabase propio del evento (`supabase/migrations/`, aplicar con
`npx supabase db push`). La TV (`/juegos/trivia`, con PIN) muestra un loop continuo de
partidas; la gente escanea el QR y juega desde `/trivia` (público, fuera de `proxy.ts`).

- **Preguntas**: banco en `lib/trivia/questions.ts` (mc, verdadero/falso y precio justo con
  precio fijo por ruta); cada partida sortea una por lugar de `GAME_TEMPLATE`
  (`lib/trivia/config.ts`, donde también están tiempos, puntajes y textos).
- **Tiempo real sin websockets propios**: `lib/trivia/engine.ts` calcula la fase de una partida
  a partir de su `started_at` y su timeline congelado, con el reloj sincronizado con el
  server. `trivia_tick()` (Postgres) arranca partidas y crea la siguiente. Supabase Realtime
  (broadcast `trivia`) avisa cambios y el polling cubre si se cae (`lib/trivia/client.ts`).
- **Mala señal**: las respuestas se guardan en localStorage y se reintentan; la velocidad la
  mide el celular y el server la acota (`app/api/trivia/answer`), con 4 s de gracia.
- **Lobby**: espera al primer jugador; con él arranca la cuenta (45 s) y se estira si alguien
  entra sobre el final (`trivia_join`). Cada jugador recibe un emoji fijo
  (`lib/trivia/emojis.ts`, excepción pedida a la regla de "sin emoji") que va con su nombre.
- **Acceso**: todo pasa por los route handlers con `SUPABASE_SERVICE_ROLE_KEY`; anon no tiene
  permisos sobre tablas ni funciones. Mail opcional al final → Resend (`lib/newsletter.ts`).
- **TV**: el lienzo se diseña a 1920×1080 y ocupa toda la ventana (sin franjas). Modo stand con
  5 toques arriba a la izquierda: pausar el loop, tiempos, ocultar nombres y CSV del día.

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
