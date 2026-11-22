// Renders the animated home-page social card to public/og.gif.
// Frame 0 is a complete card, so platforms that only show the first frame still get the full design.
// Requires ffmpeg and gifsicle. Run: node scripts/build-og-animation.mjs
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import React from "react"
import { ImageResponse } from "next/og.js"

const root = new URL("..", import.meta.url).pathname
const out = join(root, "public/og.gif")
const h = React.createElement

const W = 1200
const H = 630
const FPS = 10
const STAT_SECONDS = 1.5

const C = {
  bg: "#f7f6f5",
  fg: "#191919",
  fg2: "rgba(25,25,25,0.72)",
  fg3: "rgba(25,25,25,0.5)",
  line: "rgba(25,25,25,0.12)",
  surface: "#efeeec",
  accent: "#2a14e6",
}

const essays = readdirSync(join(root, "content/posts")).filter((f) => f.endsWith(".tsx")).length
const stats = [
  { value: "1.34M", unit: "redirects/s", label: "rushort, 4-vCPU VPS" },
  { value: "95.13%", unit: "Recall@10", label: "instantKV, LongMemEval-S" },
  { value: "3", unit: "projects maintained", label: "Atuin, Podman Desktop, WebTUI" },
  { value: String(essays), unit: "essays", label: "storage, consensus, hardware" },
]

async function font(family, weight) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`)).text()
  const url = css.match(/src: url\((.+?)\)/)?.[1]
  if (!url) throw new Error(`no font url for ${family} ${weight}`)
  return (await fetch(url)).arrayBuffer()
}

const fonts = [
  { name: "Geist", data: await font("Geist", 400), weight: 400, style: "normal" },
  { name: "Geist", data: await font("Geist", 600), weight: 600, style: "normal" },
  { name: "Geist Mono", data: await font("Geist+Mono", 500), weight: 500, style: "normal" },
]
const logo = `data:image/png;base64,${readFileSync(join(root, "public/logo.png")).toString("base64")}`

const framesPerStat = Math.round(STAT_SECONDS * FPS)
const total = framesPerStat * stats.length

function card(frame) {
  const active = Math.floor(frame / framesPerStat)
  const progress = ((frame % framesPerStat) + 1) / framesPerStat
  const cursorOn = Math.floor(frame / (FPS / 2)) % 2 === 0
  const mono = { fontFamily: "Geist Mono", fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase" }

  const header = h(
    "div",
    { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 18 } },
      h("img", { src: logo, width: 60, height: 60, style: { borderRadius: 14 } }),
      h("span", { style: { fontSize: 26, fontWeight: 600 } }, "whiteye.in")
    ),
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 12, fontSize: 18, color: C.fg3, ...mono } },
      h("div", {
        style: {
          width: 10,
          height: 10,
          borderRadius: 999,
          background: C.accent,
          opacity: cursorOn ? 1 : 0.35,
        },
      }),
      "Software engineer · Assam, India"
    )
  )

  const title = h(
    "div",
    { style: { display: "flex", alignItems: "flex-end", marginTop: 54 } },
    h("span", { style: { fontSize: 92, fontWeight: 600, letterSpacing: -4, lineHeight: 1 } }, "Aaryan Singh"),
    h("div", {
      style: { width: 18, height: 74, marginLeft: 14, marginBottom: 4, background: C.accent, opacity: cursorOn ? 1 : 0 },
    })
  )

  const subtitle = h(
    "div",
    { style: { display: "flex", marginTop: 26, fontSize: 28, lineHeight: 1.4, color: C.fg2, maxWidth: 960 } },
    "Consumer products at scale and systems in Rust. Part-time maintainer of Atuin, Podman Desktop and WebTUI."
  )

  const cells = stats.map((s, i) => {
    const on = i === active
    return h(
      "div",
      {
        key: s.unit,
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "24px 26px 22px",
          borderLeft: i === 0 ? "none" : `1px solid ${C.line}`,
          background: on ? "#ffffff" : "transparent",
          position: "relative",
        },
      },
      h("span", { style: { fontSize: 46, fontWeight: 400, letterSpacing: -1.5, lineHeight: 1, color: on ? C.accent : C.fg } }, s.value),
      h("span", { style: { fontSize: 19, fontWeight: 600, marginTop: 12 } }, s.unit),
      h("span", { style: { fontSize: 16, color: C.fg3, marginTop: 6 } }, s.label),
      h("div", {
        style: {
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 4,
          width: on ? `${progress * 100}%` : "0%",
          background: C.accent,
        },
      })
    )
  })

  const panel = h(
    "div",
    { style: { display: "flex", marginTop: "auto", background: C.surface, border: `1px solid ${C.line}` } },
    ...cells
  )

  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        color: C.fg,
        padding: "56px 72px 60px",
        fontFamily: "Geist",
      },
    },
    header,
    title,
    subtitle,
    panel
  )
}

const dir = mkdtempSync(join(tmpdir(), "og-frames-"))
try {
  for (let f = 0; f < total; f++) {
    const png = await new ImageResponse(card(f), { width: W, height: H, fonts }).arrayBuffer()
    writeFileSync(join(dir, `f${String(f).padStart(3, "0")}.png`), Buffer.from(png))
  }
  const raw = join(dir, "raw.gif")
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-framerate", String(FPS), "-i", join(dir, "f%03d.png"),
    "-filter_complex", "[0:v]split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle",
    "-loop", "0", raw,
  ])
  execFileSync("gifsicle", ["-O3", "--lossy=20", raw, "-o", out])
  console.log(`${out}: ${total} frames, ${(statSync(out).size / 1024).toFixed(0)} KB`)
} finally {
  rmSync(dir, { recursive: true, force: true })
}
