import { cn } from "@/lib/utils"

const TONES = {
  lime: {
    row: "border-ink-950",
    num: "",
    button: "text-ink-950",
    chipOpen: "bg-ink-950 text-lime-500",
    answer: "text-ink-950",
  },
  dark: {
    row: "border-white/12",
    num: "text-ink-500",
    button: "text-white",
    chipOpen: "bg-white text-ink-950",
    answer: "text-ink-300",
  },
}

/** Fila de acordeón numerada, compartida por el FAQ de la landing y /faq. */
export function FaqItem({
  id,
  index,
  question,
  open,
  onToggle,
  tone = "lime",
  children,
}: {
  id?: string
  index: number
  question: React.ReactNode
  open: boolean
  onToggle: () => void
  tone?: keyof typeof TONES
  children: React.ReactNode
}) {
  const t = TONES[tone]
  const panelId = id ? `${id}-respuesta` : undefined

  return (
    <div
      id={id}
      className={cn(
        "scroll-mt-[var(--faq-offset,8rem)] border-b-[1.5px]",
        t.row
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          "grid min-h-[76px] w-full cursor-pointer grid-cols-[48px_1fr_36px] items-center gap-3 border-0 bg-transparent py-3 text-left",
          t.button
        )}
      >
        <span className={cn("font-mono text-[13px] font-medium", t.num)}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[clamp(18px,1.8vw,24px)] font-semibold tracking-[-0.025em] text-balance">
          {question}
        </span>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded transition-colors duration-200",
            open ? t.chipOpen : "bg-transparent"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={cn(
              "size-3.5 transition-transform duration-200 motion-reduce:transition-none",
              open && "rotate-180"
            )}
            aria-hidden
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {open && (
        <div
          id={panelId}
          className={cn("pb-7 sm:pr-12 sm:pl-[60px]", t.answer)}
        >
          {children}
        </div>
      )}
    </div>
  )
}
