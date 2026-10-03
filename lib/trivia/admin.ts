import "server-only"

/** Día de hoy en Argentina, `YYYY-MM-DD` (el ranking y el CSV van por día). */
export function todayAR(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Cordoba",
  }).format(new Date())
}

export const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

export interface ExportRow {
  game: number
  started_at: string
  player_id: string
  name: string
  city: string
  province: string | null
  email: string | null
  hidden: boolean
  score: number
}
