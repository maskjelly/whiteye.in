import { ImageResponse } from "next/og"

export const alt = "aaryan — engineer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#111",
          color: "#d1d5db",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <span style={{ color: "#ff6b35", fontSize: 40, marginRight: 16 }}>*</span>
          <span style={{ color: "#6b7280", fontSize: 28, letterSpacing: 2 }}>whiteye.in</span>
        </div>
        <div style={{ display: "flex", fontSize: 110, fontWeight: 700, color: "#ffffff", letterSpacing: -2 }}>
          aaryan
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#9ca3af", marginTop: 20, maxWidth: 900 }}>
          20 y/o · 2x yc · founding engineer at referrush
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#6b7280", marginTop: 16, maxWidth: 900 }}>
          security, infrastructure, and systems that are hard to corrupt.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 60,
            fontSize: 22,
            color: "#ff6b35",
          }}
        >
          ↳ notes on systems that are hard to corrupt
        </div>
      </div>
    ),
    size
  )
}
