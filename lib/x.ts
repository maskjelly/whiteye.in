import { timingSafeEqual } from "node:crypto"
import { analyticsReady, istDay, pipeline } from "@/lib/analytics"

// X growth tracker. Public data only, read through the FxTwitter API
// (api.fxtwitter.com), and kept in the same Redis store as the visitor counter.

export const HANDLE = "aaryantwt"
const API = "https://api.fxtwitter.com/2/profile"
const KEEP_DAYS = 45
const PEERS_PER_RUN = 6
const REFRESH_EVERY = 45 * 60

export const xReady = analyticsReady

export type Post = {
  id: string
  url: string
  text: string
  at: number
  views: number
  likes: number
  replies: number
  reposts: number
  quotes: number
  bookmarks: number
  reply: boolean
  media: boolean
}

export type PeerPost = Post & { author: string; authorFollowers: number }
export type Account = { handle: string; name: string; followers: number; following: number; statuses: number }
export type Plan = { start: string; startFollowers: number; goal: number; days: number }
export type Note = { at: number; text: string }
export type Drafts = { at: number; items: string[] }

export const DEFAULT_PLAN: Plan = { start: "2026-11-25", startFollowers: 696, goal: 1000, days: 7 }

type Raw = Record<string, unknown> & {
  id?: string
  url?: string
  text?: string
  created_timestamp?: number
  author?: { screen_name?: string; followers?: number }
  reposted_by?: unknown
  replying_to?: { screen_name?: string } | null
  media?: unknown
}

async function getJson(url: string): Promise<{ results?: unknown[]; cursor?: { bottom?: string }; user?: Raw } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "whiteye.in growth tracker (+https://whiteye.in)" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0)

/** Normalise one status. Reposts of other people's posts are dropped. */
export function toPost(raw: Raw, handle: string): Post | null {
  if (!raw?.id || raw.reposted_by) return null
  if (raw.author?.screen_name?.toLowerCase() !== handle.toLowerCase()) return null
  return {
    id: String(raw.id),
    url: String(raw.url ?? `https://x.com/${handle}/status/${raw.id}`),
    text: String(raw.text ?? ""),
    at: num(raw.created_timestamp) * 1000,
    views: num(raw.views),
    likes: num(raw.likes),
    replies: num(raw.replies),
    reposts: num(raw.reposts ?? raw.retweets),
    quotes: num(raw.quotes),
    bookmarks: num(raw.bookmarks),
    reply: Boolean(raw.replying_to && raw.replying_to.screen_name?.toLowerCase() !== handle.toLowerCase()),
    media: Boolean(raw.media),
  }
}

export function toAccount(raw: Raw): Account {
  return {
    handle: String(raw.screen_name ?? ""),
    name: String(raw.name ?? ""),
    followers: num(raw.followers),
    following: num(raw.following),
    statuses: num(raw.statuses ?? raw.tweets),
  }
}

async function statuses(handle: string, pages: number): Promise<Post[]> {
  const out: Post[] = []
  let cursor = ""
  for (let i = 0; i < pages; i++) {
    const d = await getJson(`${API}/${handle}/statuses${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`)
    const rows = (d?.results ?? []) as Raw[]
    if (!rows.length) break
    for (const r of rows) {
      const p = toPost(r, handle)
      if (p) out.push(p)
    }
    cursor = d?.cursor?.bottom ?? ""
    if (!cursor) break
  }
  return out
}

async function graph(handle: string, kind: "followers" | "following", maxPages: number): Promise<Account[] | null> {
  const out: Account[] = []
  let cursor = ""
  for (let i = 0; i < maxPages; i++) {
    const d = await getJson(`${API}/${handle}/${kind}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`)
    if (!d) return i === 0 ? null : out
    const rows = (d.results ?? []) as Raw[]
    out.push(...rows.map(toAccount).filter((a) => a.handle))
    const next = d.cursor?.bottom ?? ""
    if (!rows.length || !next || next.startsWith("0|")) break
    cursor = next
  }
  return out
}

/** Accounts your size who post a lot: the people whose high-reply posts are worth studying. */
export type Peer = { handle: string; followers: number }

export function pickPeers(followers: Account[], selfFollowers: number): Peer[] {
  const lo = Math.max(150, selfFollowers * 0.4)
  const hi = Math.max(3000, selfFollowers * 6)
  return followers
    .filter((a) => a.followers >= lo && a.followers <= hi && a.statuses >= 300)
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 60)
    .map((a) => ({ handle: a.handle, followers: a.followers }))
}

/** People you follow who don't follow back. Large accounts are kept out: you follow those to read them. */
export function notFollowingBack(following: Account[], followers: Account[]): Account[] {
  const back = new Set(followers.map((a) => a.handle.toLowerCase()))
  return following
    .filter((a) => !back.has(a.handle.toLowerCase()) && a.followers < 20000)
    .sort((a, b) => a.statuses - b.statuses || a.followers - b.followers)
}

const j = (v: unknown) => JSON.stringify(v)
function parse<T>(v: unknown, fallback: T): T {
  if (typeof v !== "string") return fallback
  try {
    return JSON.parse(v) as T
  } catch {
    return fallback
  }
}

/**
 * Pull fresh numbers. At most once every 45 minutes however often it is called;
 * the follower graph (slow, ~20 requests) is walked once a day.
 */
export async function refresh(force = false, at: Date = new Date()): Promise<{ refreshed: boolean; error?: string }> {
  if (!xReady()) return { refreshed: false, error: "store not connected" }
  const [lock] = await pipeline([["SET", "x:lock", at.getTime(), "NX", "EX", force ? 60 : REFRESH_EVERY]])
  if (lock !== "OK") return { refreshed: false }

  const profile = await getJson(`${API}/${HANDLE}`)
  if (!profile?.user) {
    await pipeline([["DEL", "x:lock"]])
    return { refreshed: false, error: "profile unavailable" }
  }
  const me = toAccount(profile.user)
  const day = istDay(at)
  const cutoff = at.getTime() - KEEP_DAYS * 86400_000

  const [stored, poolRaw, idxRaw, graphDone] = await pipeline([
    ["HKEYS", "x:posts"],
    ["GET", "x:peerpool"],
    ["INCR", "x:peeridx"],
    ["SET", `x:graph:${day}`, 1, "NX", "EX", 86400 * 2],
  ])
  const posts = (await statuses(HANDLE, Array.isArray(stored) && stored.length ? 2 : 6)).filter((p) => p.at >= cutoff)

  const commands: (string | number)[][] = [
    ["SET", "x:profile", j({ ...me, at: at.getTime() })],
    ["HSET", "x:daily", day, me.followers],
    ["ZADD", "x:series", at.getTime(), `${at.getTime()}:${me.followers}`],
    ["ZREMRANGEBYSCORE", "x:series", 0, cutoff],
    ...posts.map((p) => ["HSET", "x:posts", p.id, j(p)]),
  ]

  let pool = parse<Peer[]>(poolRaw, [])
  if (graphDone === "OK") {
    const [followers, following] = await Promise.all([graph(HANDLE, "followers", 40), graph(HANDLE, "following", 20)])
    if (followers && following) {
      pool = pickPeers(followers, me.followers)
      commands.push(
        ["SET", "x:peerpool", j(pool)],
        ["SET", "x:unfollow", j({ at: at.getTime(), accounts: notFollowingBack(following, followers) })],
      )
    } else {
      commands.push(["DEL", `x:graph:${day}`])
    }
  }

  if (pool.length) {
    const start = (Number(idxRaw) * PEERS_PER_RUN) % pool.length
    const batch = Array.from({ length: Math.min(PEERS_PER_RUN, pool.length) }, (_, i) => pool[(start + i) % pool.length])
    const week = at.getTime() - 7 * 86400_000
    const results = await Promise.all(batch.map((peer) => statuses(peer.handle, 1).then((ps) => ({ peer, ps }))))
    for (const { peer, ps } of results) {
      const recent = ps.filter((p) => !p.reply && p.at >= week)
      commands.push(["HSET", "x:peerposts", peer.handle, j({ followers: peer.followers, posts: recent })])
    }
  }

  await pipeline(commands)
  await prune(cutoff)
  return { refreshed: true }
}

async function prune(cutoff: number) {
  const [all] = await pipeline([["HGETALL", "x:posts"]])
  if (!Array.isArray(all)) return
  const stale: string[] = []
  for (let i = 0; i + 1 < all.length; i += 2) {
    if ((parse<Post | null>(all[i + 1], null)?.at ?? 0) < cutoff) stale.push(String(all[i]))
  }
  if (stale.length) await pipeline([["HDEL", "x:posts", ...stale]])
}

/** Straight line from the start count to the goal, then flat at the goal. */
export function target(plan: Plan, day: string): number {
  const elapsed = Math.round((Date.parse(day) - Date.parse(plan.start)) / 86400_000)
  if (elapsed <= 0) return plan.startFollowers
  const f = Math.min(1, elapsed / plan.days)
  return Math.round(plan.startFollowers + (plan.goal - plan.startFollowers) * f)
}

const shift = (day: string, n: number) => new Date(Date.parse(day) + n * 86400_000).toISOString().slice(0, 10)

/** From the plan's start to whichever is later, today or the deadline; at most 45 days. */
export function chartDays(plan: Plan, today: string): string[] {
  const end = [today, shift(plan.start, plan.days)].sort()[1]
  const start = [plan.start, shift(end, -(KEEP_DAYS - 1))].sort()[1]
  const out: string[] = []
  for (let d = start; d <= end; d = shift(d, 1)) out.push(d)
  return out
}

export type Board = {
  profile: (Account & { at: number }) | null
  plan: Plan
  days: { date: string; followers: number | null; target: number }[]
  posts: Post[]
  peers: PeerPost[]
  unfollow: { at: number; accounts: Account[] } | null
  drafts: Drafts | null
  report: Note | null
}

function pairs(reply: unknown): [string, string][] {
  if (!Array.isArray(reply)) return []
  const out: [string, string][] = []
  for (let i = 0; i + 1 < reply.length; i += 2) out.push([String(reply[i]), String(reply[i + 1])])
  return out
}

export async function board(at: Date = new Date()): Promise<Board> {
  const [profile, daily, posts, peerposts, peerpool, unfollow, drafts, report, plan] = await pipeline([
    ["GET", "x:profile"],
    ["HGETALL", "x:daily"],
    ["HGETALL", "x:posts"],
    ["HGETALL", "x:peerposts"],
    ["GET", "x:peerpool"],
    ["GET", "x:unfollow"],
    ["GET", "x:drafts"],
    ["GET", "x:report"],
    ["GET", "x:plan"],
  ])
  const p = parse<Plan>(plan, DEFAULT_PLAN)
  const counts = new Map(pairs(daily).map(([d, n]) => [d, Number(n)]))
  const today = istDay(at)
  const days = chartDays(p, today).map((date) => ({ date, followers: counts.get(date) ?? null, target: target(p, date) }))

  const pool = new Set(parse<Peer[]>(peerpool, []).map((x) => x.handle))
  const week = at.getTime() - 7 * 86400_000
  const peers: PeerPost[] = pairs(peerposts)
    .filter(([h]) => pool.has(h))
    .flatMap(([h, v]) => {
      const { followers = 0, posts = [] } = parse<{ followers?: number; posts?: Post[] }>(v, {})
      return posts.filter((post) => post.at >= week).map((post) => ({ ...post, author: h, authorFollowers: followers }))
    })
    .sort((a, b) => b.replies - a.replies || b.views - a.views)
    .slice(0, 20)

  return {
    profile: parse(profile, null),
    plan: p,
    days,
    posts: pairs(posts)
      .map(([, v]) => parse<Post | null>(v, null))
      .filter((x): x is Post => Boolean(x))
      .sort((a, b) => b.at - a.at),
    peers,
    unfollow: parse(unfollow, null),
    drafts: parse(drafts, null),
    report: parse(report, null),
  }
}

export async function saveDrafts(items: string[], at = new Date()) {
  await pipeline([["SET", "x:drafts", j({ at: at.getTime(), items })]])
}

export async function saveReport(text: string, at = new Date()) {
  await pipeline([["SET", "x:report", j({ at: at.getTime(), text })]])
}

export async function savePlan(plan: Plan) {
  await pipeline([["SET", "x:plan", j(plan)]])
}

export function allowed(key: unknown): boolean {
  const expected = process.env.ANALYTICS_KEY
  if (!expected || typeof key !== "string") return false
  const a = Buffer.from(key)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function cleanPlan(raw: unknown): Plan | null {
  const p = raw as Partial<Plan> | null
  if (!p || typeof p !== "object") return null
  const ok =
    typeof p.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.start) &&
    Number.isInteger(p.startFollowers) && Number.isInteger(p.goal) && Number.isInteger(p.days) &&
    p.days! > 0 && p.days! <= 365 && p.goal! > p.startFollowers!
  return ok ? { start: p.start!, startFollowers: p.startFollowers!, goal: p.goal!, days: p.days! } : null
}
