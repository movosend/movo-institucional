export type ConsentValue = "accepted" | "denied" | null

const KEY = "movo_cookie_consent"

export function getConsent(): ConsentValue {
  if (typeof window === "undefined") return null
  return (localStorage.getItem(KEY) as ConsentValue) ?? null
}

export function setConsent(value: "accepted" | "denied") {
  localStorage.setItem(KEY, value)
}
