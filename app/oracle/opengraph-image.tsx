import { ImageResponse } from "next/og"

export const alt = "whiteye oracle — ask a yes/no question, get a verdict"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const METER_DOTS = 14

function Meter({
  label,
  filled,
  pct,
  accent = false,
}: {
  label: string
  filled: number
  pct: string
  accent?: boolean
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
      <span
        style={{
          display: "flex",
          width: 186,
          fontSize: 17,
          color: accent ? "#f2f0ea" : "#7d7d77",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: METER_DOTS }, (_, i) => (
          <span
            key={i}
            style={{
              display: "flex",
              width: 8,
              height: 8,
              borderRadius: 999,
              background: i < filled ? (accent ? "#d71921" : "#f2f0ea") : "#262624",
            }}
          />
        ))}
      </div>
      <span
        style={{
          display: "flex",
          width: 56,
          justifyContent: "flex-end",
          fontSize: 17,
          color: accent ? "#d71921" : "#f2f0ea",
        }}
      >
        {pct}
      </span>
    </div>
  )
}

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(242,240,234,0.07) 1px, transparent 1.4px)",
          backgroundSize: "24px 24px",
          color: "#f2f0ea",
          padding: "54px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ display: "flex", fontSize: 20, letterSpacing: 11 }}>
            WHITEYE
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 24px",
              fontSize: 15,
              letterSpacing: 7,
              color: "#7d7d77",
              border: "1px solid #262624",
              borderRadius: 999,
            }}
          >
            <span
              style={{
                display: "flex",
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#d71921",
              }}
            />
            ORACLE
          </span>
        </div>

        <div
          style={{
            display: "flex",
            height: 1,
            background: "#262624",
            marginTop: 26,
          }}
        />

        <div style={{ display: "flex", gap: 7, marginTop: 34 }}>
          {Array.from({ length: 28 }, (_, i) => (
            <span
              key={i}
              style={{
                display: "flex",
                width: 7,
                height: 7,
                borderRadius: 999,
                background: i < 11 ? "#d71921" : i < 16 ? "#f2f0ea" : "#262624",
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 48,
            marginTop: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                display: "flex",
                fontSize: 176,
                fontWeight: 800,
                letterSpacing: 3,
                lineHeight: 0.92,
              }}
            >
              YES.
            </span>
            <span
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 30,
                color: "#7d7d77",
              }}
            >
              ask any yes/no question.
            </span>
            <span
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: 22,
                letterSpacing: 6,
                color: "#4a4a45",
              }}
            >
              GET A VERDICT. NOTHING ELSE.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 512,
              padding: "30px 34px",
              background: "#131312",
              border: "1px solid #262624",
              borderRadius: 26,
            }}
          >
            <span
              style={{
                display: "flex",
                fontSize: 13,
                letterSpacing: 8,
                color: "#4a4a45",
              }}
            >
              WHAT CAME BACK
            </span>
            <Meter label="yes/no confidence" filled={9} pct="65%" accent />
            <Meter label="mood confidence" filled={14} pct="99%" />
            <Meter label="topic confidence" filled={5} pct="39%" />
            <Meter label="harm" filled={1} pct="1%" />
            <span
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 16,
                color: "#7d7d77",
              }}
            >
              reply: yes · topic: humor · mood: 1.01 · 153 ms
            </span>
            <span
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 16,
                color: "#4a4a45",
              }}
            >
              new session 5411c701 — rotated every question
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "auto",
            fontSize: 16,
            letterSpacing: 5,
            color: "#4a4a45",
          }}
        >
          <span style={{ display: "flex" }}>SESSIONS ROTATE EVERY QUESTION</span>
          <span style={{ display: "flex" }}>WHITEYE.IN/ORACLE</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
