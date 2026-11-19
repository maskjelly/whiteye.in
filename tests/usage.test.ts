import { describe, expect, test } from "bun:test"
import { compact, parseUsage } from "../lib/usage"
// @ts-expect-error plain .mjs script
import { summarize } from "../scripts/publish-usage.mjs"

const row = (period: string, tokens: number, cost: number) => ({
  period,
  totalTokens: tokens,
  totalCost: cost,
  agents: [
    { agent: "claude", totalTokens: tokens * 0.75, totalCost: cost * 0.75 },
    { agent: "codex", totalTokens: tokens * 0.25, totalCost: cost * 0.25 },
  ],
  modelBreakdowns: [{ modelName: "big-model", inputTokens: tokens, outputTokens: 0, cacheCreationTokens: 0, cacheReadTokens: 0, cost }],
})

describe("usage", () => {
  const now = new Date(2026, 10, 20, 12)
  const report = { daily: [row("2026-01-01", 1000, 1), row("2026-11-19", 4000, 2), row("2026-11-20", 8000, 4)] }

  test("summarize reduces a ccusage report to thirty days", () => {
    const s = summarize(report, now)
    expect(s.days).toHaveLength(30)
    expect(s.days[29]).toEqual({ date: "2026-11-20", tokens: 8000, cost: 4 })
    expect(s.today.tokens).toBe(8000)
    expect(s.last30).toEqual({ tokens: 12000, cost: 6 })
    expect(s.allTime).toEqual({ tokens: 13000, cost: 7 })
    expect(s.agents.map((a: { name: string }) => a.name)).toEqual(["claude", "codex"])
    expect(s.agents[0].tokens).toBe(9000)
    expect(s.topModel).toBe("big-model")
  })

  test("the site accepts what the script publishes and rejects junk", () => {
    const u = parseUsage(JSON.parse(JSON.stringify(summarize(report, now))))
    expect(u?.last30.tokens).toBe(12000)
    expect(u?.agents).toHaveLength(2)
    expect(parseUsage({ days: [] })).toBeNull()
    expect(parseUsage("nope")).toBeNull()
  })

  test("compact", () => {
    expect(compact(950)).toBe("950")
    expect(compact(12_300)).toBe("12.3K")
    expect(compact(1_234_567)).toBe("1.23M")
    expect(compact(2_500_000_000)).toBe("2.50B")
  })
})
