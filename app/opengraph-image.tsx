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
          backgroundColor: "#f3efe4",
          color: "#242119",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <span style={{ color: "#244b80", fontSize: 28, letterSpacing: 2 }}>WHITEYE.IN</span>
        </div>
        <div style={{ display: "flex", fontSize: 126, fontWeight: 500, color: "#242119", letterSpacing: -5 }}>
          aaryan.
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#242119", marginTop: 20, maxWidth: 900 }}>
          software, systems, and notes.
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#716a5d", marginTop: 24, maxWidth: 900 }}>
          a personal site from bangalore
        </div>
      </div>
    ),
    size
  )
}
