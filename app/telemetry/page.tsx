"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Link as RLink,
  ProgressBar,
  Reshaped,
  Skeleton,
  Table,
  Tabs,
  Text,
  TextField,
  View,
} from "reshaped"
import "reshaped/themes/slate/theme.css"

const BASE = process.env.NEXT_PUBLIC_RUSHORT_BASE ?? "https://45.196.196.251/rushort"
const METRICS_URL = `${BASE}/api/metrics`
const HOST_URL = `${BASE}/api/host`

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

function Chart({ data, stroke, unit }: { data: number[]; stroke: string; unit: string }) {
  const W = 880
  const H = 200
  const PAD = 10
  const max = Math.max(1, ...data)
  const X = (i: number) => (i / Math.max(1, data.length - 1)) * W
  const Y = (v: number) => H - PAD - (v / max) * (H - PAD * 2 - 18)
  const line = data.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")
  const area = `0,${H} ${line} ${W},${H}`
  const gid = `g-${stroke.replace(/\W/g, "")}`
  const ticks = [max, max * 0.5]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="rate chart">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1="0" y1={Y(t)} x2={W} y2={Y(t)} stroke="var(--rs-color-border-neutral)" strokeWidth="1" strokeDasharray="2 5" />
          <text x={W - 4} y={Y(t) - 5} fill="var(--rs-color-foreground-neutral-faded)" fontSize="11" textAnchor="end" fontFamily="monospace">
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

const TABS: { value: MetricKey; label: string; color: string }[] = [
  { value: "rps", label: "Throughput", color: "#58a6ff" },
  { value: "qps", label: "Redirects", color: "#3fb950" },
  { value: "fails", label: "Failures", color: "#f85149" },
]

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
  const active = TABS.find((t) => t.value === tab) ?? TABS[0]
  const memUsed = host && host.mem_total_kb > 0 ? 1 - host.mem_available_kb / host.mem_total_kb : 0
  const cores = host?.cpus && host.cpus > 0 ? host.cpus : 4

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

  const kpis: [string, string, "neutral" | "positive" | "critical"][] = [
    ["Requests/s", big(rps), "neutral"],
    ["Redirects/s", big(qps), "positive"],
    ["Fails/s", rate(fails), fails > 0 ? "critical" : "neutral"],
    ["Session peak", big(peak), "neutral"],
  ]
  const counters: [string, number | null][] = [
    ["Requests", m?.requests ?? null],
    ["Redirects", m?.redirects ?? null],
    ["Writes", m?.writes ?? null],
    ["Client errors", m?.errors_4xx ?? null],
    ["Server errors", m?.errors_5xx ?? null],
  ]

  return (
    <Reshaped theme="slate" defaultColorMode="dark" scoped>
      <style>{`
        html, body { height: auto; min-height: 100%; overflow: auto; }
        body { background: var(--rs-color-background-page); }
      `}</style>
      <Container width="1080px">
        <View gap={6} paddingBlock={10}>
          <View direction="row" align="center" justify="space-between" gap={4} wrap>
            <View direction="row" align="center" gap={3}>
              <Badge color={live ? "positive" : "critical"}>{live ? "live" : "reconnecting"}</Badge>
              <Text variant="title-3" weight="bold">rushort telemetry</Text>
            </View>
            <Text variant="caption-1" color="neutral-faded">
              {host ? `${host.hostname} · ` : ""}up {m ? fmtUptime(m.uptime_s) : "—"}
            </Text>
          </View>

          <Card padding={6}>
            <View gap={2}>
              <Text variant="caption-1" color="neutral-faded">REQUESTS / SECOND · LIVE</Text>
              {m ? (
                <Text variant="featured-1" weight="bold">{big(rps)}</Text>
              ) : (
                <Skeleton width="280px" height="76px" borderRadius="medium" />
              )}
              <View direction="row" gap={6} wrap>
                <Text variant="body-2" color="neutral-faded">{big(qps)} redirects/s</Text>
                <Text variant="body-2" color="neutral-faded">{rate(fails)} fails/s</Text>
                <Text variant="body-2" color="neutral-faded">{big(peak)} session peak</Text>
              </View>
            </View>
          </Card>

          <View gap={0} width="100%">
            {kpis.map(([k, v]) => (
              <View key={k} direction="row" align="center" justify="space-between" paddingBlock={3}>
                <Text variant="body-2" color="neutral-faded">{k}</Text>
                <Text variant="title-2" weight="bold">{v}</Text>
              </View>
            ))}
          </View>

          <Card padding={6}>
            <View gap={4}>
              <Tabs value={tab} onChange={({ value }) => setTab(value as MetricKey)} variant="borderless">
                <Tabs.List>
                  {TABS.map((t) => (
                    <Tabs.Item key={t.value} value={t.value}>{t.label}</Tabs.Item>
                  ))}
                </Tabs.List>
              </Tabs>
              <Divider blank />
              <Chart data={series.map((p) => p[tab])} stroke={active.color} unit="/s" />
              <Text variant="caption-1" color="neutral-faded">trailing 120 seconds · sampled once per second</Text>
            </View>
          </Card>

          <View direction={{ s: "column", m: "row" }} gap={4}>
            <View.Item grow>
              <Card padding={6}>
                <View gap={4}>
                  <Text variant="title-6" weight="bold">Device · {host ? host.hostname : "rove"}</Text>
                  <View gap={3}>
                    <View direction="row" justify="space-between" gap={3}>
                      <Text variant="body-2" color="neutral-faded">OS</Text>
                      <Text variant="body-2">{host?.os ?? "…"}</Text>
                    </View>
                    <View direction="row" justify="space-between" gap={3}>
                      <Text variant="body-2" color="neutral-faded">CPU</Text>
                      <Text variant="body-2">{host ? `${host.cpu} × ${host.cpus}` : "…"}</Text>
                    </View>
                    <View gap={2}>
                      <View direction="row" justify="space-between" gap={3}>
                        <Text variant="body-2" color="neutral-faded">Memory</Text>
                        <Text variant="body-2">{host ? `${fmtGB(host.mem_total_kb - host.mem_available_kb)} / ${fmtGB(host.mem_total_kb)}` : "…"}</Text>
                      </View>
                      <ProgressBar value={memUsed * 100} />
                    </View>
                    <View gap={2}>
                      <View direction="row" justify="space-between" gap={3}>
                        <Text variant="body-2" color="neutral-faded">Load 1/5/15m</Text>
                        <Text variant="body-2">{host ? `${host.load1.toFixed(2)} · ${host.load5.toFixed(2)} · ${host.load15.toFixed(2)}` : "…"}</Text>
                      </View>
                      <ProgressBar value={host ? Math.min(100, (host.load1 / cores) * 100) : 0} />
                    </View>
                  </View>
                </View>
              </Card>
            </View.Item>
            <View.Item grow>
              <Card padding={0}>
                <Table>
                  <Table.Row>
                    <Table.Heading>Counter</Table.Heading>
                    <Table.Heading align="end">Total</Table.Heading>
                  </Table.Row>
                  {counters.map(([k, v]) => (
                    <Table.Row key={k}>
                      <Table.Cell>{k}</Table.Cell>
                      <Table.Cell align="end">{typeof v === "number" ? compact(v) : "—"}</Table.Cell>
                    </Table.Row>
                  ))}
                  <Table.Row>
                    <Table.Cell>Stored links</Table.Cell>
                    <Table.Cell align="end">{m ? `${fmt(m.urls)} / ${fmt(m.capacity)}` : "—"}</Table.Cell>
                  </Table.Row>
                </Table>
              </Card>
            </View.Item>
          </View>

          <Card padding={6}>
            <View gap={4}>
              <View gap={1}>
                <Text variant="title-6" weight="bold">Shorten a URL</Text>
                <Text variant="caption-1" color="neutral-faded">Public demo · 10 links/hour per IP</Text>
              </View>
              <form onSubmit={shorten}>
                <View direction={{ s: "column", m: "row" }} gap={2}>
                  <View.Item grow>
                    <TextField
                      name="url"
                      value={url}
                      onChange={({ value }) => setUrl(value)}
                      placeholder="https://example.com/long-thing"
                      inputAttributes={{ inputMode: "url", "aria-label": "URL to shorten" }}
                    />
                  </View.Item>
                  <Button type="submit" color="primary" disabled={shortBusy || !url.trim()} loading={shortBusy}>
                    Shorten
                  </Button>
                </View>
              </form>
              {shortErr ? <Alert color="critical" title={shortErr} /> : null}
              {short ? (
                <Alert
                  color="positive"
                  title={
                    <View direction="row" align="center" gap={2}>
                      <RLink href={`/s/${short.code}`}>{short.short_url}</RLink>
                      <Button size="small" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
                    </View>
                  }
                />
              ) : null}
            </View>
          </Card>

          <Divider />
          <View direction="row" justify="space-between" gap={2} wrap>
            <Text variant="caption-1" color="neutral-faded">Box ceiling: 35k round-trip · 1.18M pipelined RPS</Text>
            <RLink href="/blog/16m-rps-rust-url-shortener">
              <Text variant="caption-1">How the numbers were earned →</Text>
            </RLink>
          </View>
        </View>
      </Container>
    </Reshaped>
  )
}
