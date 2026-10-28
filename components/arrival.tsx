import Script from "next/script"
import { arrivalUrl, arrivalSiteId } from "@/lib/arrival/config"

export function Arrival() {
  if (!arrivalUrl) return null
  return (
    <Script
      id="arrival-observability"
      src={`${arrivalUrl}/tracker.js`}
      data-site={arrivalSiteId}
      data-check-in="agents"
      strategy="afterInteractive"
    />
  )
}
