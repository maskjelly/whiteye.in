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

const BG = "#0a0e13"
const PANEL = "#10161d"
const LINE = "#1e2833"
const TXT = "#e6edf3"
const DIM = "#8b98a5"
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

function Chart({ data, stroke, fill, label }: { data: number[]; stroke: string; fill: string; label: string }) {
  const W = 600
  const H = 140
  const max = Math.max(1, ...data)
  const pts = data.map((v, i) => [(i / Math.max(1, data.length - 1)) * W, H - 8 - (v / max) * (H - 24)] as const)
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const area = `0,${H} ${line} ${W},${H}`
  const gid = `g-${label.replace(/\W/g, "")}`
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span style={{ color: DIM, fontSize: 12 }}>{label}</span>
        <span className="tabular-nums" style={{ color: TXT, fontSize: 12 }}>max {rate(max)}/s</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }} role="img" aria-label={label}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="0.35" />
            <stop offset="100%" stopColor={fill} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" y1={H * f} x2={W} y2={H * f} stroke={LINE} strokeWidth="1" />
        ))}
        <polygon points={area} fill={`url(#${gid})`} />
        <polyline points={line} fill="none" stroke={stroke} strokeWidth="2" />
      </svg>
      <div className="flex justify-between" style={{ color: DIM, fontSize: 11 }}>
        <span>-60s</span>
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
  const storagePct = m ? Math.min(100, (m.urls / Math.max(1, m.capacity)) * 100) : 0

  async function shorten(e: React.FormEvent) {
    e.preventDefault()
    setShort(null)
    setShortErr("")
    setShortBusy(true)
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

  const tile = { background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: "14px 16px" }

  return (
    <div className="rounded-xl p-4 md:p-6 font-mono" style={{ background: BG, color: TXT }}>
      <div className="flex items-center justify-between mb-1">
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>rushort · live</h1>
        <span style={{ fontSize: 12, color: live ? GREEN : RED }}>● {live ? "live" : "reconnecting"}</span>
      </div>
      <p className="mb-5" style={{ color: DIM, fontSize: 13 }}>
        every request the demo server handles, sampled once per second. box ceiling: 35k round-trip / 1.18M pipelined RPS.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {[
          ["requests/s", rate(rps), BLUE],
          ["redirects/s", rate(qps), GREEN],
          ["fails/s", rate(fails), fails > 0 ? RED : DIM],
          ["uptime", m ? fmtUptime(m.uptime_s) : "—", TXT],
        ].map(([label, value, color]) => (
          <div key={label as string} style={tile}>
            <div style={{ color: DIM, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            <div className="tabular-nums" style={{ color: color as string, fontSize: 28, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <div style={tile}>
          <Chart data={series.map((p) => p.rps)} stroke={BLUE} fill={BLUE} label="requests/s · last 60s" />
        </div>
        <div style={tile}>
          <Chart data={series.map((p) => p.fails)} stroke={RED} fill={RED} label="fails/s · last 60s" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
        {[
          ["total requests", m ? fmt(m.requests) : "—"],
          ["redirects", m ? fmt(m.redirects) : "—"],
          ["writes", m ? fmt(m.writes) : "—"],
          ["4xx", m ? fmt(m.errors_4xx) : "—"],
          ["5xx", m ? fmt(m.errors_5xx) : "—"],
        ].map(([label, value]) => (
          <div key={label as string} style={tile}>
            <div style={{ color: DIM, fontSize: 11 }}>{label}</div>
            <div className="tabular-nums" style={{ fontSize: 18 }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="mb-3" style={tile}>
        <div className="flex justify-between mb-2" style={{ fontSize: 12 }}>
          <span style={{ color: DIM }}>storage</span>
          <span className="tabular-nums">{m ? `${fmt(m.urls)} / ${fmt(m.capacity)} (${storagePct.toFixed(storagePct < 0.01 && (m.urls > 0) ? 3 : 1)}%)` : "—"}</span>
        </div>
        <div style={{ background: LINE, borderRadius: 4, height: 8 }}>
          <div style={{ width: `${Math.max(storagePct, m && m.urls > 0 ? 1 : 0)}%`, background: AMBER, borderRadius: 4, height: 8 }} />
        </div>
      </div>

      <div style={tile}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>shorten a url</div>
        <div className="mb-3" style={{ color: DIM, fontSize: 12 }}>public demo · 10 links/hour per IP · links look like whiteye.in/s/abc</div>
        <form onSubmit={shorten} className="flex flex-col sm:flex-row gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/long-thing"
            inputMode="url"
            className="flex-1 px-3 py-2"
            style={{ background: BG, border: `1px solid ${LINE}`, borderRadius: 6, color: TXT }}
          />
          <button
            type="submit"
            disabled={shortBusy || !url.trim()}
            className="px-4 py-2"
            style={{ background: GREEN, color: "#04120a", borderRadius: 6, fontWeight: 700, opacity: shortBusy || !url.trim() ? 0.5 : 1 }}
          >
            {shortBusy ? "…" : "shorten"}
          </button>
        </form>
        {short && (
          <p className="mt-3" style={{ fontSize: 14 }}>
            <Link href={`/s/${short.code}`} style={{ color: BLUE }} className="break-all">{short.short_url}</Link>
          </p>
        )}
        {shortErr && <p className="mt-3" style={{ color: RED, fontSize: 14 }}>{shortErr}</p>}
      </div>

      <div className="mt-4" style={{ fontSize: 12 }}>
        <Link href="/blog/16m-rps-rust-url-shortener" style={{ color: DIM }}>← how the numbers were earned</Link>
      </div>
    </div>
  )
}
