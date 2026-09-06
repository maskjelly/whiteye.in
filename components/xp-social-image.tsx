import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export async function xpSocialImage({
  title,
  subtitle,
  windowTitle,
  path = "whiteye.in",
}: {
  title: string
  subtitle: string
  windowTitle: string
  path?: string
}) {
  const wallpaper = await readFile(join(process.cwd(), "public/xp/bliss.jpg"))
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage: `url(data:image/jpeg;base64,${wallpaper.toString("base64")})`,
          backgroundSize: "cover",
          fontFamily: "sans-serif",
          color: "#253a54",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 38,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 900,
            background: "#fff",
            border: "4px solid #0054e3",
            borderRadius: "12px 12px 0 0",
            boxShadow: "5px 8px 20px #001d4855",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background:
                "linear-gradient(#4197ff, #0865f5 25%, #0053df 90%, #0642ad)",
              color: "white",
              height: 44,
              padding: "0 10px 0 14px",
              fontSize: 21,
              fontWeight: 700,
            }}
          >
            <span>{windowTitle}</span>
            <div style={{ display: "flex", gap: 5 }}>
              {["−", "", "×"].map((symbol, i) => (
                <span
                  key={symbol}
                  style={{
                    display: "flex",
                    width: 29,
                    height: 29,
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid white",
                    borderRadius: 3,
                    background: i === 2 ? "#df583c" : "#3479e4",
                    fontSize: 26,
                  }}
                >
                  {i === 1 ? (
                    <span
                      style={{
                        width: 14,
                        height: 13,
                        border: "2px solid white",
                        borderTopWidth: 4,
                      }}
                    />
                  ) : (
                    symbol
                  )}
                </span>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              background: "#ece9d8",
              borderBottom: "1px solid #b9b6a6",
              padding: "8px 15px",
              fontSize: 16,
            }}
          >
            {["File", "Edit", "View", "Favorites", "Tools", "Help"].map(
              (label) => (
                <span key={label} style={{ marginRight: 20 }}>
                  {label}
                </span>
              )
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "40px 48px 43px",
            }}
          >
            <span style={{ color: "#718097", fontSize: 18, marginBottom: 20 }}>
              AARYAN’S LITTLE CORNER OF THE INTERNET
            </span>
            <div
              style={{
                display: "flex",
                color: "#1e529c",
                fontSize: title.length > 45 ? 52 : 66,
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: -2,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                color: "#637184",
                fontSize: 24,
                lineHeight: 1.5,
                marginTop: 25,
              }}
            >
              {subtitle}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              background: "#ece9d8",
              padding: "8px 14px",
              borderTop: "1px solid #d3d0bf",
              fontSize: 16,
            }}
          >
            <span>{path}</span>
            <span>My Computer</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 38,
            background: "linear-gradient(#4696ff, #2464df 20%, #215cd3)",
            color: "white",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "linear-gradient(#71bb67, #35892d)",
              height: 38,
              borderRadius: "0 12px 12px 0",
              padding: "0 24px",
              fontSize: 28,
              fontWeight: 700,
              fontStyle: "italic",
            }}
          >
            start
          </div>
          <span style={{ display: "flex", fontSize: 15, paddingRight: 20 }}>
            software, systems, and notes.
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
