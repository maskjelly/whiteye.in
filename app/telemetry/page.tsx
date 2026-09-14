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

function Spark({ data, stroke }: { data: number[]; stroke: string }) {
  const max = Math.max(1, ...data)
  const pts = data
    .map((v, i) => `${(i / Math.max(1, data.length - 1)) * 300},${44 - (v / max) * 40}`)
    .join(" ")
  return (
    <svg viewBox="0 0 300 48" className="w-full h-12" role="img" aria-label="rate history">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
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
  const rate = (v: number) => (v >= 100 ? v.toFixed(0) : v.toFixed(1))

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

  return (
    <>
      <header className="page-header">
        <p className="page-kicker animate-fade-in">telemetry</p>
        <h1 className="page-title animate-fade-in">rushort, live.</h1>
        <p className="page-intro animate-fade-in-up">
          every redirect the demo server handles, as it happens.{" "}
          <span className={live ? "text-green-600" : "text-red-600"}>
            {live ? "● live" : "● reconnecting"}
          </span>
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ["RPS", rate(rps)],
          ["redirects/s", rate(qps)],
          ["fails/s", rate(fails)],
          ["uptime", m ? fmtUptime(m.uptime_s) : "—"],
        ].map(([label, value]) => (
          <div key={label} className="entry-card">
            <p className="entry-meta">{label}</p>
            <p className="entry-title tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="entry-card">
          <p className="entry-meta mb-2">requests/s · last 60s</p>
          <Spark data={series.map((p) => p.rps)} stroke="#244b80" />
        </div>
        <div className="entry-card">
          <p className="entry-meta mb-2">fails/s · last 60s</p>
          <Spark data={series.map((p) => p.fails)} stroke="#b3402e" />
        </div>
      </div>

      <div className="entry-card mb-6">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <p className="entry-meta">total requests <span className="entry-name tabular-nums">{m ? fmt(m.requests) : "—"}</span></p>
          <p className="entry-meta">redirects <span className="entry-name tabular-nums">{m ? fmt(m.redirects) : "—"}</span></p>
          <p className="entry-meta">writes <span className="entry-name tabular-nums">{m ? fmt(m.writes) : "—"}</span></p>
          <p className="entry-meta">4xx <span className="entry-name tabular-nums">{m ? fmt(m.errors_4xx) : "—"}</span></p>
          <p className="entry-meta">5xx <span className="entry-name tabular-nums">{m ? fmt(m.errors_5xx) : "—"}</span></p>
          <p className="entry-meta">stored <span className="entry-name tabular-nums">{m ? `${fmt(m.urls)} / ${fmt(m.capacity)}` : "—"}</span></p>
        </div>
      </div>

      <div className="entry-card">
        <h2 className="entry-title mb-2">shorten a url</h2>
        <p className="entry-description mb-4">
          public demo, 10 links/hour per IP. links look like whiteye.in/s/abc.
        </p>
        <form onSubmit={shorten} className="flex flex-col sm:flex-row gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/long-thing"
            className="flex-1 border rounded px-3 py-2 bg-white text-black"
            inputMode="url"
          />
          <button type="submit" disabled={shortBusy || !url.trim()} className="border rounded px-4 py-2">
            {shortBusy ? "shortening…" : "shorten"}
          </button>
        </form>
        {short && (
          <p className="mt-3">
            <a href={short.short_url} className="underline break-all">{short.short_url}</a>
          </p>
        )}
        {shortErr && <p className="mt-3 text-red-600">{shortErr}</p>}
      </div>

      <div className="back-row">
        <Link href="/blog/16m-rps-rust-url-shortener" className="back-link">← how the numbers were earned</Link>
      </div>
    </>
  )
}
