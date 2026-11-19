#!/usr/bin/env node
// Publishes aggregate token spend (Claude Code, Codex and any other agent ccusage can read)
// to a GitHub gist that the home page reads through USAGE_URL.
//
//   USAGE_GIST_ID=<id> node scripts/publish-usage.mjs            publish once
//   USAGE_GIST_ID=<id> node scripts/publish-usage.mjs --watch    publish every 5 minutes
//   node scripts/publish-usage.mjs --dry-run                     print the payload only
//
// Only totals leave the machine: no prompts, paths or project names.

import { execFileSync } from "node:child_process"

const args = new Set(process.argv.slice(2))
const INTERVAL_MS = 5 * 60 * 1000

/** Reduces `ccusage daily --by-agent --json` to the payload the site reads. */
export function summarize(report, now = new Date()) {
  const rows = (report?.daily ?? []).filter((r) => typeof r?.period === "string")
  rows.sort((a, b) => a.period.localeCompare(b.period))
  const n = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0)
  const day = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  const byDate = new Map(rows.map((r) => [r.period, r]))

  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const r = byDate.get(day(d))
    days.push({ date: day(d), tokens: n(r?.totalTokens), cost: round(n(r?.totalCost)) })
  }

  const agents = new Map()
  const models = new Map()
  const since = days[0].date
  for (const r of rows) {
    if (r.period < since) continue
    for (const a of r.agents ?? []) {
      const cur = agents.get(a.agent) ?? { name: a.agent, tokens: 0, cost: 0 }
      cur.tokens += n(a.totalTokens)
      cur.cost += n(a.totalCost)
      agents.set(a.agent, cur)
    }
    for (const m of r.modelBreakdowns ?? []) {
      const t = n(m.inputTokens) + n(m.outputTokens) + n(m.cacheCreationTokens) + n(m.cacheReadTokens)
      models.set(m.modelName, (models.get(m.modelName) ?? 0) + t)
    }
  }

  const sum = (list) => ({
    tokens: list.reduce((s, d) => s + d.tokens, 0),
    cost: round(list.reduce((s, d) => s + d.cost, 0)),
  })
  const all = rows.map((r) => ({ tokens: n(r.totalTokens), cost: n(r.totalCost) }))

  return {
    updatedAt: now.toISOString(),
    today: { tokens: days[29].tokens, cost: days[29].cost },
    last30: sum(days),
    allTime: sum(all),
    days,
    agents: [...agents.values()].map((a) => ({ ...a, cost: round(a.cost) })).sort((a, b) => b.tokens - a.tokens),
    topModel: [...models.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
  }
}

function round(v) {
  return Math.round(v * 100) / 100
}

function read() {
  const out = execFileSync("npx", ["-y", "ccusage@latest", "daily", "--by-agent", "--json"], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "inherit"],
  })
  return JSON.parse(out)
}

function token() {
  if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) return process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  return execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim()
}

async function publish() {
  const payload = summarize(read())
  if (args.has("--dry-run")) {
    console.log(JSON.stringify(payload, null, 2))
    return
  }
  const id = process.env.USAGE_GIST_ID
  if (!id) throw new Error("Set USAGE_GIST_ID to the gist that holds usage.json")
  const res = await fetch(`https://api.github.com/gists/${id}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${token()}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ files: { "usage.json": { content: JSON.stringify(payload) } } }),
  })
  if (!res.ok) throw new Error(`GitHub answered ${res.status}: ${(await res.text()).slice(0, 200)}`)
  console.log(`${payload.updatedAt}  today ${payload.today.tokens.toLocaleString()} tokens, $${payload.today.cost}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (args.has("--watch")) {
    for (;;) {
      await publish().catch((e) => console.error(e.message))
      await new Promise((r) => setTimeout(r, INTERVAL_MS))
    }
  } else {
    await publish().catch((e) => {
      console.error(e.message)
      process.exit(1)
    })
  }
}
