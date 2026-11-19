"use client"

import { useEffect, useRef, useState } from "react"

const RUSHORT = process.env.NEXT_PUBLIC_RUSHORT_BASE ?? "https://45.196.196.251/rushort"
const PALETTES = 4

function istParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00"
  return { h: Number(get("hour")), m: get("minute"), s: get("second") }
}

function mood(h: number) {
  if (h < 2) return "late-night compiling"
  if (h < 8) return "asleep (probably)"
  if (h < 10) return "chai + inbox"
  if (h < 13) return "deep work"
  if (h < 14) return "lunch break"
  if (h < 19) return "shipping things"
  if (h < 21) return "dinner, then code"
  return "reading papers"
}

export function LocalClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const t = now ? istParts(now) : null
  return (
    <div className="clock">
      <div className="clock-time" suppressHydrationWarning>
        {t ? (
          <>
            {String(t.h).padStart(2, "0")}
            <span className="blink">:</span>
            {t.m}
            <span className="clock-sec">{t.s}</span>
          </>
        ) : (
          "--:--"
        )}
      </div>
      <div className="clock-mood">{t ? mood(t.h) : "checking…"}</div>
    </div>
  )
}

export function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState<string | null>(null)
  useEffect(() => {
    const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
    const update = () => {
      const s = (new Date(iso).getTime() - Date.now()) / 1000
      const a = Math.abs(s)
      setLabel(
        a < 60
          ? fmt.format(Math.round(s), "second")
          : a < 3600
            ? fmt.format(Math.round(s / 60), "minute")
            : a < 86400
              ? fmt.format(Math.round(s / 3600), "hour")
              : fmt.format(Math.round(s / 86400), "day"),
      )
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [iso])
  return <time dateTime={iso}>{label ?? new Date(iso).toISOString().slice(0, 10)}</time>
}

type Sample = { t: number; requests: number }

export function RushortPulse() {
  const [series, setSeries] = useState<number[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [state, setState] = useState<"connecting" | "live" | "offline">("connecting")
  const last = useRef<Sample | null>(null)

  useEffect(() => {
    let alive = true
    let fails = 0
    async function tick() {
      try {
        const res = await fetch(`${RUSHORT}/api/metrics`, { cache: "no-store", signal: AbortSignal.timeout(4000) })
        if (!res.ok) throw new Error()
        const m = (await res.json()) as { requests: number }
        if (!alive) return
        const now = performance.now()
        if (last.current) {
          const dt = (now - last.current.t) / 1000
          const rps = Math.max(0, (m.requests - last.current.requests) / dt)
          setSeries((s) => [...s.slice(-39), rps])
        }
        last.current = { t: now, requests: m.requests }
        setTotal(m.requests)
        setState("live")
        fails = 0
      } catch {
        if (alive && (++fails >= 2 || !last.current)) setState("offline")
      }
    }
    tick()
    const id = setInterval(tick, 2000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  const max = Math.max(1, ...series)
  const pts = series.map((v, i) => `${(i / 39) * 100},${30 - (v / max) * 28}`).join(" ")
  const current = series.at(-1)
  const fmt = (n: number) => Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n)

  return (
    <div className="pulse">
      <div className="pulse-head">
        <span className={`dot dot-${state}`} aria-hidden="true" />
        <span>{state === "live" ? "live" : state === "offline" ? "offline right now" : "connecting…"}</span>
      </div>
      <div className="big-num">{current !== undefined ? fmt(current) : state === "offline" ? "1.34M" : "…"}</div>
      <div className="card-label">{state === "offline" ? "peak redirects / sec (benchmark)" : "requests / sec on rushort"}</div>
      <svg className="spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
        {series.length > 1 && <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
      </svg>
      {total !== null && <div className="card-foot">{fmt(total)} requests served since boot</div>}
    </div>
  )
}

export function PaletteShuffle() {
  function burst(el: HTMLElement) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const r = el.getBoundingClientRect()
    for (let i = 0; i < 26; i++) {
      const c = document.createElement("span")
      const angle = Math.random() * Math.PI * 2
      const dist = 60 + Math.random() * 110
      c.className = "confetti"
      c.style.left = `${r.left + r.width / 2}px`
      c.style.top = `${r.top + r.height / 2}px`
      c.style.background = `var(--c${(i % 6) + 1})`
      c.style.setProperty("--dx", `${Math.cos(angle) * dist}px`)
      c.style.setProperty("--dy", `${Math.sin(angle) * dist - 40}px`)
      c.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`)
      document.body.appendChild(c)
      setTimeout(() => c.remove(), 950)
    }
  }
  function shuffle(e: React.MouseEvent<HTMLButtonElement>) {
    burst(e.currentTarget)
    const root = document.documentElement
    const next = (Number(root.dataset.palette ?? 0) + 1) % PALETTES
    root.dataset.palette = String(next)
    try {
      localStorage.setItem("palette", String(next))
    } catch {}
  }
  return (
    <button type="button" className="btn btn-ghost" onClick={shuffle} title="Shuffle the colours">
      <span aria-hidden="true">✦</span> shuffle colours
    </button>
  )
}

type StickerSpec = { label: string; color: string; x: number; y: number; r: number }

export function Stickers({ items }: { items: StickerSpec[] }) {
  const [pos, setPos] = useState(items.map((s) => ({ x: s.x, y: s.y })))
  const [top, setTop] = useState(-1)
  const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number; w: number; h: number } | null>(null)

  function down(i: number, e: React.PointerEvent<HTMLButtonElement>) {
    const box = e.currentTarget.parentElement!.getBoundingClientRect()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { i, sx: e.clientX, sy: e.clientY, ox: pos[i].x, oy: pos[i].y, w: box.width, h: box.height }
    setTop(i)
  }
  function move(e: React.PointerEvent) {
    const d = drag.current
    if (!d) return
    const x = Math.min(95, Math.max(0, d.ox + ((e.clientX - d.sx) / d.w) * 100))
    const y = Math.min(95, Math.max(0, d.oy + ((e.clientY - d.sy) / d.h) * 100))
    setPos((p) => p.map((v, j) => (j === d.i ? { x, y } : v)))
  }
  function up() {
    drag.current = null
  }

  return (
    <div className="stickers" aria-hidden="true">
      {items.map((s, i) => (
        <button
          key={s.label}
          type="button"
          tabIndex={-1}
          className="sticker"
          style={{
            left: `${pos[i].x}%`,
            top: `${pos[i].y}%`,
            background: `var(${s.color})`,
            rotate: `${s.r}deg`,
            zIndex: top === i ? 5 : 1,
          }}
          onPointerDown={(e) => down(i, e)}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

export function HotTakes({ takes }: { takes: string[] }) {
  const [i, setI] = useState(0)
  const [spin, setSpin] = useState(0)
  return (
    <div className="takes">
      <p className="take" key={i}>
        {takes[i]}
      </p>
      <button
        type="button"
        className="btn btn-ghost take-btn"
        onClick={() => {
          setI((v) => (v + 1 + Math.floor(Math.random() * (takes.length - 1))) % takes.length)
          setSpin((s) => s + 1)
        }}
      >
        <span aria-hidden="true" style={{ display: "inline-block", rotate: `${spin * 180}deg`, transition: "rotate 400ms" }}>
          ↻
        </span>{" "}
        another one
      </button>
    </div>
  )
}
