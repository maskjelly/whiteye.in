import { ImageResponse } from "next/og";

export const alt =
  "rushort service analytics — live traffic, reliability, and infrastructure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#f7f8fb",
        color: "#20283c",
        padding: "64px 72px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            display: "flex",
            background: "#526cf5",
            color: "white",
            width: 42,
            height: 42,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
          }}
        >
          r
        </div>
        rushort
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 62,
          color: "#788398",
          fontSize: 15,
          letterSpacing: 4,
        }}
      >
        SERVICE ANALYTICS
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: -3,
          marginTop: 12,
        }}
      >
        Every request. In view.
      </div>
      <div
        style={{
          display: "flex",
          color: "#768196",
          fontSize: 24,
          marginTop: 12,
        }}
      >
        Live traffic, response counters, and the machine behind it.
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 44 }}>
        {["Traffic & throughput", "Reliability & errors", "Host resources"].map(
          (label) => (
            <div
              key={label}
              style={{
                display: "flex",
                background: "white",
                border: "1px solid #e5e9f0",
                padding: "20px 26px",
                borderRadius: 12,
                fontSize: 18,
              }}
            >
              {label}
            </div>
          ),
        )}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          justifyContent: "space-between",
          fontSize: 16,
          color: "#7d889c",
        }}
      >
        <span>whiteye.in/telemetry</span>
        <span>Rust · raw HTTP/1.1 · live demo</span>
      </div>
    </div>,
    size,
  );
}
