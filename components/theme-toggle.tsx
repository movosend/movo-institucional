"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-pressed={isDark}
      className={cn(
        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md",
        "text-foreground/70 transition-colors duration-[120ms] hover:bg-foreground/[0.06] hover:text-foreground",
        "cursor-pointer",
        className
      )}
    >
      {mounted && (
        <>
          <Sun className="hidden size-[18px] dark:block" />
          <Moon className="block size-[18px] dark:hidden" />
        </>
      )}
    </button>
  )
}
