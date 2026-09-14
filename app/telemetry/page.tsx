"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

const METRICS_URL = `${process.env.NEXT_PUBLIC_RUSHORT_BASE ?? "https://45.196.196.251/rushort"}/api/metrics`

type Metrics = {
  uptime_s: number
  started_unix: number
  requests: number
  redirects: number
  writes: number
  errors_4xx: number
  errors_5xx: number
  urls: number
  capacity: number
}

type Point = { t: number; rps: number; qps: number; fails: number }

const BG = "#060a0f"
const PANEL = "#0c1219"
const LINE = "#1c2632"
const TXT = "#e8eef4"
const DIM = "#7d8b9a"
const GREEN = "#3fb950"
const BLUE = "#58a6ff"
const RED = "#f85149"
const AMBER = "#d29922"

function fmt(n: number) {
  return n.toLocaleString("en-US")
}

function fmtUptime(s: number) {
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${Math.floor(s % 60)}s`
}

function rate(v: number) {
  return v >= 100 ? v.toFixed(0) : v.toFixed(1)
}

function big(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return rate(n)
}

function Chart({ data, stroke, fill, label, unit }: { data: number[]; stroke: string; fill: string; label: string; unit: string }) {
  const W = 640
  const H = 170
  const PAD = 8
  const max = Math.max(1, ...data)
  const X = (i: number) => (i / Math.max(1, data.length - 1)) * W
  const Y = (v: number) => H - PAD - (v / max) * (H - PAD * 2 - 14)
  const line = data.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")
  const area = `0,${H} ${line} ${W},${H}`
  const gid = `g-${label.replace(/\W/g, "")}`
  const ticks = [max, max / 2]
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
        <span className="tabular-nums" style={{ color: DIM, fontSize: 11 }}>peak {rate(max)}{unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 170 }} role="img" aria-label={label}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="0.32" />
            <stop offset="100%" stopColor={fill} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1="0" y1={Y(t)} x2={W} y2={Y(t)} stroke={LINE} strokeWidth="1" strokeDasharray="3 4" />
            <text x={W - 2} y={Y(t) - 4} fill={DIM} fontSize="10" textAnchor="end" fontFamily="monospace">
              {rate(t)}{unit}
            </text>
          </g>
        ))}
        <polygon points={area} fill={`url(#${gid})`} />
        <polyline points={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between mt-1" style={{ color: DIM, fontSize: 11 }}>
        <span>−60s</span>
        <span>now</span>
      </div>
    </div>
  )
}

export default function Telemetry() {
  const [m, setM] = useState<Metrics | null>(null)
  const [live, setLive] = useState(false)
  const [series, setSeries] = useState<Point[]>([])
  const [url, setUrl] = useState("")
  const [short, setShort] = useState<{ code: string; short_url: string } | null>(null)
  const [shortErr, setShortErr] = useState("")
  const [shortBusy, setShortBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const prev = useRef<{ t: number; m: Metrics } | null>(null)

  const tick = useCallback(async () => {
    try {
      const res = await fetch(METRICS_URL, { cache: "no-store" })
      if (!res.ok) throw new Error(String(res.status))
      const next: Metrics = await res.json()
      const now = Date.now()
      const p = prev.current
      if (p) {
        const dt = Math.max(0.2, (now - p.t) / 1000)
        const d = (a: number, b: number) => Math.max(0, (a - b) / dt)
        setSeries((s) => [...s.slice(-59), {
          t: now,
          rps: d(next.requests, p.m.requests),
          qps: d(next.redirects, p.m.redirects),
          fails: d(next.errors_4xx + next.errors_5xx, p.m.errors_4xx + p.m.errors_5xx),
        }])
      }
      prev.current = { t: now, m: next }
      setM(next)
      setLive(true)
    } catch {
      setLive(false)
    }
  }, [])

  useEffect(() => {
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  const last = series[series.length - 1]
  const rps = last?.rps ?? 0
  const qps = last?.qps ?? 0
  const fails = last?.fails ?? 0
  const peak = series.reduce((a, p) => Math.max(a, p.rps), 0)
  const storagePct = m ? Math.min(100, (m.urls / Math.max(1, m.capacity)) * 100) : 0

  async function shorten(e: React.FormEvent) {
    e.preventDefault()
    setShort(null)
    setShortErr("")
    setShortBusy(true)
    setCopied(false)
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "failed")
      setShort({ code: data.code, short_url: data.short_url })
    } catch (err) {
      setShortErr(err instanceof Error ? err.message : "failed")
    } finally {
      setShortBusy(false)
    }
  }

  async function copy() {
    if (!short) return
    try {
      await navigator.clipboard.writeText(short.short_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const panel = { background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12 }
  const label = { color: DIM, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em" }

  return (
    <div className="min-h-screen font-mono" style={{ background: BG, color: TXT }}>
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span
              style={{
                width: 10, height: 10, borderRadius: "50%",
                background: live ? GREEN : RED,
                boxShadow: live ? `0 0 12px ${GREEN}` : `0 0 12px ${RED}`,
              }}
            />
            <span style={{ fontSize: 12, letterSpacing: "0.18em", color: DIM }}>RUSHORT · LIVE TELEMETRY</span>
          </div>
          <span className="tabular-nums" style={{ fontSize: 12, color: DIM }}>
            {live ? "● streaming" : "● reconnecting"} · up {m ? fmtUptime(m.uptime_s) : "—"}
          </span>
        </div>

        <div className="mb-2" style={{ color: DIM, fontSize: 12, letterSpacing: "0.1em" }}>REQUESTS / SECOND</div>
        <div className="tabular-nums leading-none mb-1" style={{ fontSize: "clamp(64px, 12vw, 120px)", fontWeight: 800, letterSpacing: "-0.04em", color: live ? TXT : DIM }}>
          {big(rps)}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mb-8 tabular-nums" style={{ fontSize: 13, color: DIM }}>
          <span><span style={{ color: GREEN }}>{big(qps)}</span> redirects/s</span>
          <span><span style={{ color: fails > 0 ? RED : DIM }}>{rate(fails)}</span> fails/s</span>
          <span><span style={{ color: AMBER }}>{big(peak)}</span> session peak</span>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div className="p-4" style={panel}>
            <Chart data={series.map((p) => p.rps)} stroke={BLUE} fill={BLUE} label="throughput · trailing 60s" unit="/s" />
          </div>
          <div className="p-4" style={panel}>
            <Chart data={series.map((p) => p.fails)} stroke={RED} fill={RED} label="failures · trailing 60s" unit="/s" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          {[
            ["requests", m ? fmt(m.requests) : "—"],
            ["redirects", m ? fmt(m.redirects) : "—"],
            ["writes", m ? fmt(m.writes) : "—"],
            ["4xx", m ? fmt(m.errors_4xx) : "—"],
            ["5xx", m ? fmt(m.errors_5xx) : "—"],
          ].map(([k, v]) => (
            <div key={k as string} className="p-4" style={panel}>
              <div style={label}>{k}</div>
              <div className="tabular-nums mt-1" style={{ fontSize: 22, fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="p-4 mb-3" style={panel}>
          <div className="flex justify-between mb-2" style={{ fontSize: 12 }}>
            <span style={{ color: DIM, textTransform: "uppercase", letterSpacing: "0.1em" }}>storage</span>
            <span className="tabular-nums">{m ? `${fmt(m.urls)} / ${fmt(m.capacity)}` : "—"}</span>
          </div>
          <div style={{ background: LINE, borderRadius: 999, height: 6 }}>
            <div style={{ width: `${Math.max(storagePct, m && m.urls > 0 ? 0.5 : 0)}%`, background: AMBER, borderRadius: 999, height: 6, transition: "width 1s" }} />
          </div>
        </div>

        <div className="p-5" style={{ ...panel, borderColor: "#23405e" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>shorten a url</div>
          <div className="mb-4" style={{ color: DIM, fontSize: 12 }}>public demo · 10 links/hour per IP · links look like whiteye.in/s/abc</div>
          <form onSubmit={shorten} className="flex flex-col sm:flex-row gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/long-thing"
              inputMode="url"
              spellCheck={false}
              className="flex-1 px-4 py-2.5"
              style={{ background: BG, border: `1px solid ${LINE}`, borderRadius: 8, color: TXT, fontSize: 14, outline: "none" }}
            />
            <button
              type="submit"
              disabled={shortBusy || !url.trim()}
              className="px-5 py-2.5"
              style={{ background: GREEN, color: "#04120a", borderRadius: 8, fontWeight: 800, fontSize: 14, opacity: shortBusy || !url.trim() ? 0.45 : 1, cursor: shortBusy || !url.trim() ? "default" : "pointer" }}
            >
              {shortBusy ? "…" : "shorten →"}
            </button>
          </form>
          {short && (
            <div className="mt-4 flex items-center gap-3 flex-wrap px-3 py-2.5" style={{ background: BG, border: `1px solid ${LINE}`, borderRadius: 8 }}>
              <Link href={`/s/${short.code}`} style={{ color: BLUE, fontSize: 14 }} className="break-all">{short.short_url}</Link>
              <button onClick={copy} style={{ color: DIM, fontSize: 12, border: `1px solid ${LINE}`, borderRadius: 6, padding: "2px 10px" }}>
                {copied ? "copied ✓" : "copy"}
              </button>
            </div>
          )}
          {shortErr && <p className="mt-3" style={{ color: RED, fontSize: 13 }}>{shortErr}</p>}
        </div>

        <div className="flex flex-wrap justify-between gap-2 mt-6" style={{ fontSize: 12, color: DIM }}>
          <span>box ceiling: 35k round-trip · 1.18M pipelined RPS (30s saturate)</span>
          <Link href="/blog/16m-rps-rust-url-shortener" style={{ color: BLUE }}>how the numbers were earned →</Link>
        </div>
      </div>
    </div>
  )
}
