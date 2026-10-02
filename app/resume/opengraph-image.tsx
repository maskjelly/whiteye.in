import { ImageResponse } from "next/og"

export const alt = "Aaryan Singh — Software engineer. Product, AI agents and systems."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "80px", background: "#fff", color: "#202020" }}>
      <div style={{ display: "flex", fontSize: 22, color: "#656565" }}>whiteye.in/resume</div>
      <div style={{ display: "flex", fontSize: 80, marginTop: 80, letterSpacing: -3 }}>Aaryan Singh</div>
      <div style={{ display: "flex", fontSize: 30, marginTop: 18 }}>Software engineer · Product, AI agents &amp; systems</div>
      <div style={{ display: "flex", fontSize: 22, marginTop: "auto", color: "#656565" }}>Founding engineer at ReferRush · Rust agent infrastructure · 47 merged PRs</div>
    </div>, size,
  )
}
