export const GITHUB_USER = "maskjelly"

export type ContributionDay = { date: string; count: number; level: number }

export type LiveStats = {
  fetchedAt: string
  followers: number | null
  publicRepos: number | null
  stars: number | null
  languages: { name: string; count: number }[]
  /** External repositories with recent public activity, newest first. */
  recentUpstream: { repo: string; at: string }[]
  contributions: { total: number; days: ContributionDay[]; streak: number; best: ContributionDay | null } | null
}

const REVALIDATE = 1800

/** Repositories that should never appear on the site. */
const HIDDEN = /mausbot/i

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "whiteye.in",
  }
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  return h
}

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: headers(),
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

type Repo = { name: string; fork: boolean; stargazers_count: number; language: string | null }
type Event = {
  type: string
  repo: { name: string }
  created_at: string
}

export function parseContributions(html: string): ContributionDay[] {
  const days = new Map<string, ContributionDay>()
  const ids = new Map<string, string>()
  for (const m of html.matchAll(/<td[^>]*?data-date="(\d{4}-\d{2}-\d{2})"[^>]*?>/g)) {
    const tag = m[0]
    const id = /id="([^"]+)"/.exec(tag)?.[1]
    const level = Number(/data-level="(\d)"/.exec(tag)?.[1] ?? 0)
    days.set(m[1], { date: m[1], count: 0, level })
    if (id) ids.set(id, m[1])
  }
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const date = ids.get(m[1])
    const n = /^(\d[\d,]*) contribution/.exec(m[2].trim())
    if (date && n) days.get(date)!.count = Number(n[1].replace(/,/g, ""))
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function summarize(days: ContributionDay[]) {
  const total = days.reduce((s, d) => s + d.count, 0)
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) streak++
    else if (i === days.length - 1) continue
    else break
  }
  const best = days.reduce<ContributionDay | null>((b, d) => (!b || d.count > b.count ? d : b), null)
  return { total, days, streak, best }
}

async function profileFallback() {
  try {
    const res = await fetch(`https://github.com/${GITHUB_USER}`, {
      headers: { "User-Agent": "whiteye.in" },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const followers = /tab=followers"[\s\S]*?<span class="text-bold[^"]*">([\d,]+)<\/span>/.exec(html)?.[1]
    const repos = /tab=repositories"[\s\S]{0,400}?<span title="([\d,]+)"/.exec(html)?.[1]
    const num = (v?: string) => (v ? Number(v.replace(/,/g, "")) : null)
    return { followers: num(followers), public_repos: num(repos) }
  } catch {
    return null
  }
}

async function contributions() {
  try {
    const res = await fetch(`https://github.com/users/${GITHUB_USER}/contributions`, {
      headers: { "User-Agent": "whiteye.in" },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const days = parseContributions(await res.text())
    return days.length ? summarize(days) : null
  } catch {
    return null
  }
}

export async function getLiveStats(): Promise<LiveStats> {
  const [user, repos, events, contrib] = await Promise.all([
    gh<{ followers: number; public_repos: number }>(`/users/${GITHUB_USER}`),
    gh<Repo[]>(`/users/${GITHUB_USER}/repos?per_page=100&type=owner`),
    gh<Event[]>(`/users/${GITHUB_USER}/events/public?per_page=50`),
    contributions(),
  ])

  const profile = user ?? (await profileFallback())
  const own = repos?.filter((r) => !r.fork && !HIDDEN.test(r.name)) ?? null
  const langs = new Map<string, number>()
  for (const r of own ?? []) if (r.language) langs.set(r.language, (langs.get(r.language) ?? 0) + 1)

  const upstream = new Map<string, string>()
  for (const e of events ?? []) {
    const name = e.repo.name
    if (name.toLowerCase().startsWith(`${GITHUB_USER}/`) || HIDDEN.test(name) || upstream.has(name)) continue
    if (e.type === "WatchEvent" || e.type === "ForkEvent") continue
    upstream.set(name, e.created_at)
  }

  return {
    fetchedAt: new Date().toISOString(),
    followers: profile?.followers ?? null,
    publicRepos: profile?.public_repos ?? null,
    stars: own ? own.reduce((s, r) => s + r.stargazers_count, 0) : null,
    languages: [...langs.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    recentUpstream: [...upstream.entries()].map(([repo, at]) => ({ repo, at })).slice(0, 5),
    contributions: contrib,
  }
}
