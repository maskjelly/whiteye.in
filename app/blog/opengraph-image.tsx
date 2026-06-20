import { ImageResponse } from "next/og"
import { posts } from "@/lib/posts"

export const alt = "aaryan — writing"
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
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          <span style={{ color: "#ff6b35", fontSize: 36, marginRight: 14 }}>*</span>
          <span style={{ color: "#6b7280", fontSize: 26, letterSpacing: 1 }}>aaryan / writing</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -1.5,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          notes on systems that are hard to corrupt
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#6b7280", marginTop: 32 }}>
          {posts.length} long-form posts · security · infra · distributed systems
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 22, color: "#ff6b35" }}>
          whiteye.in/blog
        </div>
      </div>
    ),
    size
  )
}
