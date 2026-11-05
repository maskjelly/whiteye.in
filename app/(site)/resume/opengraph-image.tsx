import { ImageResponse } from "next/og"

export const alt = "Aaryan Singh — Waterloo dropout. Founding engineer. A 1.34M req/s Rust benchmark. 47 merged PRs."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "80px", background: "#fff", color: "#202020" }}>
      <div style={{ display: "flex", fontSize: 22, color: "#656565" }}>whiteye.in/resume</div>
      <div style={{ display: "flex", fontSize: 80, marginTop: 80, letterSpacing: -3 }}>Aaryan Singh</div>
      <div style={{ display: "flex", fontSize: 30, marginTop: 18 }}>Waterloo dropout · Founding engineer · Software engineer</div>
      <div style={{ display: "flex", fontSize: 22, marginTop: "auto", color: "#656565" }}>Rice security disclosure at 17 · 1.34M req/s Rust benchmark · 47 merged PRs</div>
    </div>, size,
  )
}
