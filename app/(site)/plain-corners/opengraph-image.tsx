import { socialImage } from "@/components/social-image"

export const alt = "Plain Corners — a tiny Mac app for subtler window corners"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OG() {
  return socialImage({
    title: "The corners are too round. Fix them.",
    subtitle:
      "A tiny native Mac app for subtler window corners. No daemon, no telemetry, one-click restore.",
    path: "whiteye.in/plain-corners",
    meta: "PLAIN CORNERS",
  })
}
