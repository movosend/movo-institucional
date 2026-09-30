import { cn } from "@/lib/utils"

/** Padding horizontal compartido por todas las secciones. */
export const GUTTER = "px-[clamp(16px,3vw,40px)]"
/** Padding vertical de sección estándar. */
export const SECTION_Y = "py-[clamp(80px,12vh,140px)]"

export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      <circle cx="24" cy="24" r="24" fill="#FFFFFF" fillOpacity="0.15" />
      <circle cx="24" cy="24" r="22.5" fill="#FFFFFF" fillOpacity="0.30" />
      <circle cx="24" cy="24" r="20.7" fill="#FFFFFF" fillOpacity="0.58" />
      <circle cx="24" cy="24" r="18.6" fill="#FFFFFF" fillOpacity="0.90" />
      <circle cx="24" cy="24" r="16.3" fill="#0A0A0B" />
    </svg>
  )
}

export function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
      <path d="m7.5 4.27 9 5.15" />
    </svg>
  )
}

export function ArrowIcon({
  className,
  stroke = "currentColor",
}: {
  className?: string
  stroke?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
      aria-hidden
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

/** Grilla de 32px con máscara radial, usada en los heros lima. */
export function LimeGrid({ at = "50% 40%" }: { at?: string }) {
  const mask = `radial-gradient(ellipse 80% 70% at ${at},#000,transparent)`
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(to right,rgba(10,10,11,.07) 1px,transparent 1px),linear-gradient(to bottom,rgba(10,10,11,.07) 1px,transparent 1px)",
        backgroundSize: "32px 32px",
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  )
}

/** Barra mono con bordes superior/inferior (cabecera de los heros lima). */
export function TickerBar({
  items,
  dot = false,
  className,
}: {
  items: string[]
  dot?: boolean
  className?: string
}) {
  const [first, ...rest] = items
  return (
    <div
      className={cn(
        "relative flex flex-wrap justify-between gap-x-6 gap-y-2 border-y-[1.5px] border-ink-950 py-3 font-mono text-[13px] tracking-[.02em]",
        className
      )}
    >
      <span className="flex items-center gap-2">
        {dot && <span className="size-2 rounded-full bg-ink-950" />}
        {first}
      </span>
      {rest.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  )
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "font-mono text-[13px] tracking-[.08em] text-ink-400 uppercase",
        className
      )}
    >
      {children}
    </span>
  )
}

/** Línea de título enmascarada; el span interno se anima con `data-attr`. */
export function MaskLine({
  children,
  attr = "data-line",
  tight = false,
}: {
  children: React.ReactNode
  attr?: string
  tight?: boolean
}) {
  return (
    <span
      className={cn(
        "block overflow-hidden",
        tight ? "mb-[-.1em] pb-[.14em]" : "mb-[-.12em] pb-[.16em]"
      )}
    >
      <span {...{ [attr]: "" }} className="inline-block">
        {children}
      </span>
    </span>
  )
}

export function Em({
  children,
  tracking = true,
}: {
  children: React.ReactNode
  tracking?: boolean
}) {
  return (
    <em
      className={cn(
        "pr-[.04em] font-medium italic",
        tracking && "tracking-[-0.045em]"
      )}
    >
      {children}
    </em>
  )
}

/** Esquineros de 18px (FAQ y cierre de Cómo funciona). */
export function CornerBrackets() {
  const base = "absolute size-[18px] border-ink-950"
  return (
    <>
      <span
        className={cn(base, "top-0 left-0 border-t-[1.5px] border-l-[1.5px]")}
      />
      <span
        className={cn(base, "top-0 right-0 border-t-[1.5px] border-r-[1.5px]")}
      />
      <span
        className={cn(
          base,
          "bottom-0 left-0 border-b-[1.5px] border-l-[1.5px]"
        )}
      />
      <span
        className={cn(
          base,
          "right-0 bottom-0 border-r-[1.5px] border-b-[1.5px]"
        )}
      />
    </>
  )
}

/** Ícono de 44px con borde lima tenue (listas numeradas). */
export function IndexChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-11 items-center justify-center rounded-md border border-lime-500/30 bg-ink-800 font-mono text-xs font-medium text-lime-500">
      {children}
    </span>
  )
}
