# Movo - Sitio Institucional

Sitio web institucional de Movo. Construido con Next.js 15 App Router, React 19 y TypeScript.

![image](https://raw.githubusercontent.com/movosend/movo-institucional/refs/heads/main/public/readme.png)

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI:** React 19 + shadcn/ui (`radix-vega` style)
- **Estilos:** Tailwind CSS v4 + tokens de diseño custom en `globals.css`
- **Animaciones:** GSAP
- **Analytics:** Microsoft Clarity

## Estructura

```
app/                    # Rutas y layouts (Next.js App Router)
  layout.tsx            # Layout raíz: ThemeProvider + Footer global
  page.tsx              # Home (/)
  como-funciona/        # Ruta /como-funciona
  el-equipo/            # Ruta /el-equipo
  el-proyecto/          # Ruta /el-proyecto

components/
  home/                 # Componentes del home
  como-funciona/        # Componentes de /como-funciona
  el-equipo/            # Componentes de /el-equipo
  el-proyecto/          # Componentes de /el-proyecto
  ui/                   # Primitivas shadcn
  cookie-banner.tsx     # Banner de cookies global
  theme-provider.tsx    # Proveedor de tema (forced dark)

.movo/
  movo-design-system.md # Referencia completa del design system
```

> La `Navbar` se renderiza dentro de cada página, no en el layout raíz.

## Desarrollo

```bash
npm install
npm run dev        # Servidor de desarrollo (Turbopack) → http://localhost:3000
```

## Comandos

```bash
npm run build      # Build de producción
npm run lint       # ESLint
npm run format     # Prettier (reescribe archivos)
npm run typecheck  # Chequeo de tipos TypeScript
```

## Design System

El sitio sigue el Movo Design System definido en `.movo/movo-design-system.md`. Puntos clave:

- **Color:** escala Ink (`--ink-50` → `--ink-950`) + `--paper`. Signal Lime (`#C6F24A`) es el único acento — máximo uno por pantalla.
- **Tipografía:** Inter (con eje `opsz`) para todo el copy. JetBrains Mono solo para códigos de tracking. Pesos permitidos: 400 / 500 / 600.
- **Botones:** `border-radius: 8px` siempre. Cuatro variantes: Primary, Secondary, Accent (lime), Ghost.
- **Animaciones:** tokens `--motion-hover: 120ms`, `--motion-state: 200ms`, `--motion-screen: 360ms`. Nunca superar 360ms. Siempre respetar `prefers-reduced-motion`.

## Agregar componentes shadcn

```bash
npx shadcn add <component>
```
