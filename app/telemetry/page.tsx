"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

const BASE = process.env.NEXT_PUBLIC_RUSHORT_BASE ?? "https://45.196.196.251/rushort"
const METRICS_URL = `${BASE}/api/metrics`
const HOST_URL = `${BASE}/api/host`

const EASE = "cubic-bezier(0.2, 0, 0, 1)"

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

type Host = {
  hostname: string
  os: string
  cpu: string
  cpus: number
  mem_total_kb: number
  mem_available_kb: number
  load1: number
  load5: number
  load15: number
}

type Point = { t: number; rps: number; qps: number; fails: number }
type MetricKey = "rps" | "qps" | "fails"

const BG = "#05080c"
const PANEL = "#0a0f16"
const LINE = "#1a2430"
const TXT = "#e8eef4"
const DIM = "#7d8b9a"
const GREEN = "#3fb950"
const BLUE = "#58a6ff"
const RED = "#f85149"
const AMBER = "#d29922"

const METRIC_META: Record<MetricKey, { label: string; color: string; unit: string }> = {
  rps: { label: "throughput", color: BLUE, unit: "/s" },
  qps: { label: "redirects", color: GREEN, unit: "/s" },
  fails: { label: "failures", color: RED, unit: "/s" },
}

function fmt(n: number) {
  return n.toLocaleString("en-US")
}

function compact(n: number) {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`
  return `${n}`
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

function fmtGB(kb: number) {
  return `${(kb / 1024 / 1024).toFixed(1)}G`
}

function Chart({ data, stroke, fill, unit }: { data: number[]; stroke: string; fill: string; unit: string }) {
  const W = 880
  const H = 190
  const PAD = 8
  const max = Math.max(1, ...data)
  const X = (i: number) => (i / Math.max(1, data.length - 1)) * W
  const Y = (v: number) => H - PAD - (v / max) * (H - PAD * 2 - 16)
  const line = data.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")
  const area = `0,${H} ${line} ${W},${H}`
  const gid = `g-${stroke.replace(/\W/g, "")}`
  const ticks = [max, max * 0.66, max * 0.33]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ aspectRatio: `${W} / ${H}`, display: "block" }} role="img" aria-label="rate chart">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.28" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1="0" y1={Y(t)} x2={W} y2={Y(t)} stroke={LINE} strokeWidth="1" strokeDasharray="2 5" />
          <text x={W - 4} y={Y(t) - 5} fill={DIM} fontSize="11" textAnchor="end" fontFamily="ui-monospace, monospace">
            {big(t)}{unit}
          </text>
        </g>
      ))}
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={X(data.length - 1)} cy={Y(data[data.length - 1] ?? 0)} r="3.5" fill={stroke} />
    </svg>
  )
}

export default function Telemetry() {
  const [m, setM] = useState<Metrics | null>(null)
  const [host, setHost] = useState<Host | null>(null)
  const [live, setLive] = useState(false)
  const [series, setSeries] = useState<Point[]>([])
  const [tab, setTab] = useState<MetricKey>("rps")
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
        setSeries((s) => [...s.slice(-119), {
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

  const tickHost = useCallback(async () => {
    try {
      const res = await fetch(HOST_URL, { cache: "no-store" })
      if (!res.ok) return
      setHost(await res.json())
    } catch {
      /* keep last */
    }
  }, [])

  useEffect(() => {
    tick()
    tickHost()
    const id = setInterval(tick, 1000)
    const id2 = setInterval(tickHost, 5000)
    return () => {
      clearInterval(id)
      clearInterval(id2)
    }
  }, [tick, tickHost])

  const last = series[series.length - 1]
  const rps = last?.rps ?? 0
  const qps = last?.qps ?? 0
  const fails = last?.fails ?? 0
  const peak = series.reduce((a, p) => Math.max(a, p.rps), 0)
  const storagePct = m ? Math.min(1, m.urls / Math.max(1, m.capacity)) : 0
  const memUsedPct = host && host.mem_total_kb > 0
    ? Math.min(1, 1 - host.mem_available_kb / host.mem_total_kb)
    : 0
  const cores = host?.cpus && host.cpus > 0 ? host.cpus : 4
  const meta = METRIC_META[tab]
  const tabData = series.map((p) => p[tab])

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

  const panel = { background: PANEL, border: `1px solid ${LINE}`, borderRadius: 14 }
  const pressable = {
    transitionProperty: "scale, opacity",
    transitionDuration: "150ms",
    transitionTimingFunction: EASE,
  } as const
  const bar = {
    transformOrigin: "left",
    transitionProperty: "transform",
    transitionDuration: "200ms",
    transitionTimingFunction: EASE,
  } as const
  const totals: [string, number | null][] = [
    ["requests", m?.requests ?? null],
    ["redirects", m?.redirects ?? null],
    ["writes", m?.writes ?? null],
    ["client errors", m?.errors_4xx ?? null],
    ["server errors", m?.errors_5xx ?? null],
  ]

  return (
    <div className="min-h-screen font-mono overflow-x-hidden" style={{ background: BG, color: TXT }}>
      <style>{`
        @keyframes tlm-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .tlm-enter { animation: tlm-rise 320ms ${EASE} both; }
        @keyframes tlm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        .tlm-pulse { animation: tlm-pulse 2.4s ease-in-out infinite; }
        .tlm-press:active { scale: 0.96; }
        .tlm-input { transition-property: border-color; transition-duration: 150ms; transition-timing-function: ${EASE}; }
        .tlm-input:focus-visible { border-color: ${BLUE}; outline: none; }
        .tlm-tab { transition-property: color, opacity; transition-duration: 150ms; transition-timing-function: ${EASE}; }
        @media (prefers-reduced-motion: reduce) { .tlm-enter, .tlm-pulse { animation: none; } }
      `}</style>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="tlm-enter flex flex-wrap items-center justify-between gap-2 pb-5 mb-7" style={{ borderBottom: `1px solid ${LINE}` }}>
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={live ? "tlm-pulse" : undefined}
              style={{
                width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                background: live ? GREEN : RED,
                boxShadow: live ? `0 0 10px ${GREEN}` : `0 0 10px ${RED}`,
              }}
            />
            <span className="truncate" style={{ fontSize: 12, letterSpacing: "0.22em", color: TXT, fontWeight: 700 }}>RUSHORT</span>
            <span className="hidden sm:inline" style={{ fontSize: 12, letterSpacing: "0.22em", color: DIM }}>· LIVE TELEMETRY</span>
          </div>
          <span className="tabular-nums whitespace-nowrap" style={{ fontSize: 12, color: DIM }}>
            {live ? "streaming" : "reconnecting"} · up {m ? fmtUptime(m.uptime_s) : "—"}
          </span>
        </div>

        <div className="tlm-enter mb-2" style={{ animationDelay: "60ms", color: DIM, fontSize: 12, letterSpacing: "0.14em" }}>REQUESTS / SECOND</div>
        <div className="tlm-enter tabular-nums leading-none mb-2 break-words" style={{ animationDelay: "60ms", fontSize: "clamp(60px, 14vw, 128px)", fontWeight: 800, letterSpacing: "-0.045em", color: live ? TXT : DIM }}>
          {big(rps)}
        </div>
        <div className="tlm-enter flex flex-wrap gap-x-7 gap-y-1 mb-8 tabular-nums" style={{ animationDelay: "120ms", fontSize: 13, color: DIM }}>
          <span><span style={{ color: GREEN }}>{big(qps)}</span> redirects/s</span>
          <span><span style={{ color: fails > 0 ? RED : DIM }}>{rate(fails)}</span> fails/s</span>
          <span><span style={{ color: AMBER }}>{big(peak)}</span> session peak</span>
        </div>

        <div className="tlm-enter p-4 sm:p-5 mb-3" style={{ animationDelay: "180ms", ...panel }}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex gap-5" role="tablist" aria-label="chart metric">
              {(Object.keys(METRIC_META) as MetricKey[]).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className="tlm-tab tlm-press pb-1"
                  style={{
                    ...pressable,
                    color: tab === k ? METRIC_META[k].color : DIM,
                    fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase",
                    borderBottom: tab === k ? `2px solid ${METRIC_META[k].color}` : "2px solid transparent",
                  }}
                >
                  {METRIC_META[k].label}
                </button>
              ))}
            </div>
            <span style={{ color: DIM, fontSize: 11 }}>trailing 120s</span>
          </div>
          <Chart data={tabData} stroke={meta.color} fill={meta.color} unit={meta.unit} />
        </div>

        <div className="tlm-enter grid grid-cols-1 lg:grid-cols-5 gap-3 mb-3" style={{ animationDelay: "240ms" }}>
          <div className="p-4 sm:p-5 lg:col-span-2 min-w-0" style={panel}>
            <div className="mb-3" style={{ color: DIM, fontSize: 11, letterSpacing: "0.14em" }}>DEVICE · {host ? host.hostname : "rove"}</div>
            <div className="flex flex-col gap-3" style={{ fontSize: 13 }}>
              <div className="flex justify-between gap-3">
                <span style={{ color: DIM }}>os</span>
                <span className="truncate text-right">{host?.os ?? "…"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span style={{ color: DIM }}>cpu</span>
                <span className="truncate text-right">{host ? `${host.cpu} × ${host.cpus}` : "…"}</span>
              </div>
              <div>
                <div className="flex justify-between gap-3 mb-1.5">
                  <span style={{ color: DIM }}>memory</span>
                  <span className="tabular-nums">{host ? `${fmtGB(host.mem_total_kb - host.mem_available_kb)} / ${fmtGB(host.mem_total_kb)}` : "…"}</span>
                </div>
                <div style={{ background: LINE, borderRadius: 999, height: 5 }}>
                  <div style={{ ...bar, transform: `scaleX(${memUsedPct})`, background: BLUE, borderRadius: 999, height: 5 }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between gap-3 mb-1.5">
                  <span style={{ color: DIM }}>load 1/5/15m</span>
                  <span className="tabular-nums">{host ? `${host.load1.toFixed(2)} · ${host.load5.toFixed(2)} · ${host.load15.toFixed(2)}` : "…"}</span>
                </div>
                <div style={{ background: LINE, borderRadius: 999, height: 5 }}>
                  <div style={{ ...bar, transform: `scaleX(${host ? Math.min(1, host.load1 / cores) : 0})`, background: host && host.load1 > cores ? RED : GREEN, borderRadius: 999, height: 5 }} />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5 lg:col-span-3 min-w-0" style={panel}>
            <div className="mb-1" style={{ color: DIM, fontSize: 11, letterSpacing: "0.14em" }}>LIFETIME COUNTERS</div>
            {totals.map(([k, v], i) => (
              <div
                key={k as string}
                className="flex items-baseline justify-between gap-3 tabular-nums"
                style={{ padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${LINE}`, fontSize: 14 }}
              >
                <span style={{ color: DIM }}>{k}</span>
                <span title={typeof v === "number" ? fmt(v) : ""} style={{ fontWeight: 700 }}>{typeof v === "number" ? compact(v) : "—"}</span>
              </div>
            ))}
            <div className="mt-2">
              <div className="flex justify-between gap-2 mb-1.5" style={{ fontSize: 12 }}>
                <span style={{ color: DIM }}>link storage</span>
                <span className="tabular-nums whitespace-nowrap">{m ? `${fmt(m.urls)} / ${fmt(m.capacity)}` : "—"}</span>
              </div>
              <div style={{ background: LINE, borderRadius: 999, height: 5 }}>
                <div style={{ ...bar, transform: `scaleX(${storagePct})`, background: AMBER, borderRadius: 999, height: 5 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="tlm-enter p-4 sm:p-5" style={{ animationDelay: "300ms", ...panel }}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <div style={{ fontWeight: 700, fontSize: 15 }}>shorten a url</div>
            <div style={{ color: DIM, fontSize: 11 }}>10 links/hour per IP</div>
          </div>
          <form onSubmit={shorten} className="flex flex-col sm:flex-row gap-2 mt-3">
            <span style={{ color: DIM, fontSize: 16, alignSelf: "center" }} className="hidden sm:inline">›</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/long-thing"
              inputMode="url"
              spellCheck={false}
              className="tlm-input flex-1 min-w-0 px-3 py-3 sm:py-2"
              style={{ background: "transparent", border: "none", borderBottom: `1px solid ${LINE}`, borderRadius: 0, color: TXT, fontSize: 16 }}
            />
            <button
              type="submit"
              disabled={shortBusy || !url.trim()}
              className="tlm-press px-4 py-3 sm:py-2"
              style={{ ...pressable, background: GREEN, color: "#04120a", borderRadius: 8, fontWeight: 800, fontSize: 14, opacity: shortBusy || !url.trim() ? 0.45 : 1, cursor: shortBusy || !url.trim() ? "default" : "pointer", minHeight: 44 }}
            >
              {shortBusy ? "…" : "shorten →"}
            </button>
          </form>
          {short && (
            <div className="mt-3 flex items-center gap-2 flex-wrap px-3 py-2" style={{ background: BG, border: `1px solid ${LINE}`, borderRadius: 8 }}>
              <Link href={`/s/${short.code}`} style={{ color: BLUE, fontSize: 14 }} className="break-all min-w-0 flex-1">{short.short_url}</Link>
              <button
                onClick={copy}
                className="tlm-press"
                style={{ ...pressable, color: DIM, fontSize: 12, border: `1px solid ${LINE}`, borderRadius: 6, padding: "8px 14px" }}
              >
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
