import { createHash } from "node:crypto"

// First-party visitor analytics on a Redis REST store (Upstash). No cookies:
// a visitor is a daily-rotating hash of IP and user agent, and neither is stored.

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

export const DAYS = 30
const KEEP_SECONDS = 400 * 86400
const DIMENSIONS = ["pages", "refs", "countries", "devices"] as const
type Dimension = (typeof DIMENSIONS)[number]

export const analyticsReady = () => Boolean(URL_ && TOKEN)

type Command = (string | number)[]

async function pipeline(commands: Command[]): Promise<unknown[]> {
  const res = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`analytics store: ${res.status}`)
  const rows = (await res.json()) as { result?: unknown; error?: string }[]
  const failed = rows.find((r) => r.error)
  if (failed) throw new Error(`analytics store: ${failed.error}`)
  return rows.map((r) => r.result)
}

/** Calendar day in IST, the site's home timezone. */
export function istDay(at: Date = new Date()): string {
  return new Date(at.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10)
}

export function lastDays(n: number, at: Date = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => istDay(new Date(at.getTime() - (n - 1 - i) * 86400_000)))
}

const BOT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|curl|wget|python|node-fetch|axios|go-http|scrapy|facebookexternalhit|whatsapp|-user\b|gptbot|bytespider/i

export const isBot = (ua: string | null) => !ua || BOT.test(ua)

export function device(ua: string): string {
  if (/ipad|tablet/i.test(ua)) return "Tablet"
  if (/mobi|iphone|android/i.test(ua)) return "Mobile"
  return "Desktop"
}

export function cleanPath(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return null
  const path = raw.split(/[?#]/)[0].replace(/\/+$/, "") || "/"
  return path.length > 200 || path.startsWith("/api") || path.startsWith("/stats") ? null : path
}

export function cleanReferrer(raw: unknown, ownHost: string): string {
  if (typeof raw !== "string" || !raw) return "Direct"
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "")
    return host === ownHost.replace(/^www\./, "") || !host ? "Direct" : host.slice(0, 80)
  } catch {
    return "Direct"
  }
}

export function visitorId(day: string, ip: string, ua: string): string {
  return createHash("sha256").update(`${day}|${TOKEN}|${ip}|${ua}`).digest("hex").slice(0, 24)
}

export type Hit = { path: string; referrer: string; country: string; device: string; visitor: string }

export async function record(hit: Hit, at: Date = new Date()): Promise<void> {
  const day = istDay(at)
  const keys = [`pv:${day}`, `uv:${day}`, ...DIMENSIONS.map((d) => `${d}:${day}`)]
  await pipeline([
    ["INCR", "pv:total"],
    ["INCR", `pv:${day}`],
    ["PFADD", `uv:${day}`, hit.visitor],
    ["ZINCRBY", `pages:${day}`, 1, hit.path],
    ["ZINCRBY", `refs:${day}`, 1, hit.referrer],
    ["ZINCRBY", `countries:${day}`, 1, hit.country],
    ["ZINCRBY", `devices:${day}`, 1, hit.device],
    ...keys.map((k) => ["EXPIRE", k, KEEP_SECONDS]),
  ])
}

export type Row = { name: string; count: number }
export type Report = {
  days: { date: string; views: number; visitors: number }[]
  today: { views: number; visitors: number }
  views: number
  visitors: number
  allTime: number
} & Record<Dimension, Row[]>

/** Sum flat [member, score, …] replies across days into a ranked list. */
export function rank(replies: unknown[], limit = 10): Row[] {
  const totals = new Map<string, number>()
  for (const reply of replies) {
    if (!Array.isArray(reply)) continue
    for (let i = 0; i + 1 < reply.length; i += 2) {
      const name = String(reply[i])
      totals.set(name, (totals.get(name) ?? 0) + Number(reply[i + 1]))
    }
  }
  return [...totals]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
}

export async function report(at: Date = new Date()): Promise<Report> {
  const dates = lastDays(DAYS, at)
  const out = await pipeline([
    ["GET", "pv:total"],
    ...dates.map((d) => ["GET", `pv:${d}`]),
    ...dates.map((d) => ["PFCOUNT", `uv:${d}`]),
    ...DIMENSIONS.flatMap((dim) => dates.map((d) => ["ZRANGE", `${dim}:${d}`, 0, 999, "REV", "WITHSCORES"])),
  ])
  const days = dates.map((date, i) => ({
    date,
    views: Number(out[1 + i] ?? 0),
    visitors: Number(out[1 + DAYS + i] ?? 0),
  }))
  const slice = (n: number) => out.slice(1 + DAYS * (2 + n), 1 + DAYS * (3 + n))
  return {
    days,
    today: days[DAYS - 1],
    views: days.reduce((s, d) => s + d.views, 0),
    visitors: days.reduce((s, d) => s + d.visitors, 0),
    allTime: Number(out[0] ?? 0),
    pages: rank(slice(0)),
    refs: rank(slice(1)),
    countries: rank(slice(2)),
    devices: rank(slice(3)),
  }
}
