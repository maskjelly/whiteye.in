"use client"

import { useEffect, useRef, useState } from "react"

const RUSHORT = process.env.NEXT_PUBLIC_RUSHORT_BASE ?? "https://45.196.196.251/rushort"

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

export function HotTakes({ takes }: { takes: string[] }) {
  const [i, setI] = useState(0)
  return (
    <figure className="maxim">
      <blockquote className="maxim-text" key={i}>
        {takes[i]}
      </blockquote>
      <button type="button" className="text-link" onClick={() => setI((v) => (v + 1) % takes.length)}>
        Another maxim
      </button>
    </figure>
  )
}
