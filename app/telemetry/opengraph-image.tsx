import { xpSocialImage } from "@/components/xp-social-image"

export const alt = "rushort live telemetry"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OG() {
  return xpSocialImage({
    title: "rushort, live.",
    subtitle: "real-time RPS, redirects and fails from the demo server",
    windowTitle: "telemetry — Aaryan’s computer",
    path: "whiteye.in/telemetry",
  })
}
