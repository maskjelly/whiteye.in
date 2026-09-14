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
  const titleSize = title.length > 60 ? 54 : title.length > 40 ? 64 : 78
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f3efe4",
          color: "#242119",
          padding: "70px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#244b80",
            fontSize: 17,
            letterSpacing: 5,
          }}
        >
          <span>AARYAN · WHITEYE.IN</span>
          <span>{meta ?? "WRITING"}</span>
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 1,
            background: "#d2c8b5",
            marginTop: 22,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            letterSpacing: -2.5,
            lineHeight: 1.12,
            marginTop: 54,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            color: "#625d52",
            fontSize: 26,
            lineHeight: 1.5,
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
            color: "#817968",
            fontSize: 18,
          }}
        >
          <span>{path}</span>
          <span>software, systems, and notes.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
