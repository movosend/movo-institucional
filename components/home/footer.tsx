import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-10 md:py-10">
        {/* Logo */}
        <a href="/" aria-label="Movo" className="shrink-0 text-foreground">
          <svg viewBox="0 0 220 56" fill="none" height="28" width="110">
            <rect x="0" y="4" width="48" height="48" rx="12" fill="#0A0A0B" />
            <circle cx="24" cy="28" r="24" fill="#FFFFFF" fillOpacity="0.15" />
            <circle
              cx="24"
              cy="28"
              r="22.5"
              fill="#FFFFFF"
              fillOpacity="0.30"
            />
            <circle
              cx="24"
              cy="28"
              r="20.7"
              fill="#FFFFFF"
              fillOpacity="0.58"
            />
            <circle
              cx="24"
              cy="28"
              r="18.6"
              fill="#FFFFFF"
              fillOpacity="0.90"
            />
            <circle cx="24" cy="28" r="16.3" fill="#0A0A0B" />
            <text
              x="62"
              y="40"
              fontFamily="Inter, ui-sans-serif, system-ui"
              fontWeight="600"
              fontSize="36"
              letterSpacing="-0.04em"
              fill="currentColor"
            >
              movo
            </text>
          </svg>
        </a>

        {/* Links legales */}
        <nav className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-6 md:gap-y-3">
          <Link
            href="/politica-de-privacidad"
            className="text-sm text-muted-foreground transition-colors duration-[var(--motion-hover)] hover:text-foreground"
          >
            Política de privacidad
          </Link>
          <Link
            href="/terminos-y-condiciones"
            className="text-sm text-muted-foreground transition-colors duration-[var(--motion-hover)] hover:text-foreground"
          >
            Términos y condiciones
          </Link>
          <a
            href="https://github.com/movosend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-[var(--motion-hover)] hover:text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        </nav>

        {/* Ícono Instagram */}
        <a
          href="https://www.instagram.com/movosend?igsh=MTdxb2J3aTUycnZi"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de Movo"
          className="flex h-9 w-9 items-center justify-center self-center rounded-lg text-muted-foreground transition-colors duration-[var(--motion-hover)] hover:bg-foreground/[0.08] hover:text-foreground md:self-auto"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4.5" />
            <circle
              cx="17.5"
              cy="6.5"
              r="0.5"
              fill="currentColor"
              stroke="none"
            />
          </svg>
        </a>
      </div>

      {/* Copyright */}
      <div className="border-t border-border px-5 py-4 text-center text-xs text-muted-foreground/70 md:px-10">
        © {new Date().getFullYear()} Movo. Todos los derechos reservados.
      </div>
    </footer>
  )
}
