"use client"

import { useEffect } from "react"
import clarity from "@microsoft/clarity"
import { getConsent } from "@/lib/consent"

export function ClarityScript() {
  useEffect(() => {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID
    if (!clarityId) return

    if (getConsent() !== "denied") {
      clarity.init(clarityId)
    }

    const handler = (e: Event) => {
      const decision = (e as CustomEvent<"accepted" | "denied">).detail
      if (decision === "accepted") {
        clarity.init(clarityId)
      } else {
        // Clarity has no stop API — reload so the next page load skips init
        window.location.reload()
      }
    }

    window.addEventListener("consent-decision", handler)
    return () => window.removeEventListener("consent-decision", handler)
  }, [])

  return null
}
