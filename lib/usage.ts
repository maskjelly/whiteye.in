/** Token spend across coding agents, published by scripts/publish-usage.mjs. */

export type UsageDay = { date: string; tokens: number; cost: number }

export type Usage = {
  updatedAt: string
  today: { tokens: number; cost: number }
  last30: { tokens: number; cost: number }
  allTime: { tokens: number; cost: number }
  days: UsageDay[]
  agents: { name: string; tokens: number; cost: number }[]
  topModel: string | null
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0)
const pair = (v: unknown) => {
  const o = (v ?? {}) as Record<string, unknown>
  return { tokens: num(o.tokens), cost: num(o.cost) }
}

export function parseUsage(raw: unknown): Usage | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  if (typeof o.updatedAt !== "string" || Number.isNaN(Date.parse(o.updatedAt)) || !Array.isArray(o.days)) return null
  const days = o.days
    .filter((d): d is Record<string, unknown> => !!d && typeof d === "object" && typeof (d as { date?: unknown }).date === "string")
    .map((d) => ({ date: String(d.date).slice(0, 10), ...pair(d) }))
    .slice(-30)
  const agents = (Array.isArray(o.agents) ? o.agents : [])
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object" && typeof (a as { name?: unknown }).name === "string")
    .map((a) => ({ name: String(a.name).slice(0, 24), ...pair(a) }))
    .filter((a) => a.tokens > 0)
    .slice(0, 6)
  return {
    updatedAt: o.updatedAt,
    today: pair(o.today),
    last30: pair(o.last30),
    allTime: pair(o.allTime),
    days,
    agents,
    topModel: typeof o.topModel === "string" ? o.topModel.slice(0, 48) : null,
  }
}

export async function getUsage(): Promise<Usage | null> {
  const url = process.env.USAGE_URL
  if (!url) return null
  try {
    const res = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    return parseUsage(await res.json())
  } catch {
    return null
  }
}

/** 1234567 -> "1.23M" */
export function compact(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e8 ? 0 : n >= 1e7 ? 1 : 2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e5 ? 0 : 1)}K`
  return String(Math.round(n))
}
