import { ImageResponse } from "next/og"

export function socialImage({
  title,
  subtitle,
  path = "whiteye.in",
  meta,
}: {
  title: string
  subtitle: string
  path?: string
  meta?: string
}) {
  const titleSize = title.length > 60 ? 56 : title.length > 40 ? 66 : 80
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          color: "#111111",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#8a8a8a",
            fontSize: 22,
            letterSpacing: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: 999, background: "#111111" }} />
            <span style={{ color: "#111111", fontWeight: 600 }}>aaryan</span>
          </div>
          <span>{meta ?? "WRITING"}</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.1,
            marginTop: 72,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            color: "#4b4b4b",
            fontSize: 28,
            lineHeight: 1.45,
            marginTop: 28,
            maxWidth: 940,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "auto",
            color: "#8a8a8a",
            fontSize: 22,
          }}
        >
          <span>{path}</span>
          <span>Aaryan Singh</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
