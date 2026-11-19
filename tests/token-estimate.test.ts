import { describe, expect, test } from "bun:test"
import { BASELINE, DAILY_MEAN, dayTotal, estimate, istDay, spentShare } from "../lib/token-estimate"

describe("token estimate", () => {
  test("days stay inside the observed band and average near the mean", () => {
    const totals = Array.from({ length: 2000 }, (_, i) => dayTotal(20000 + i))
    for (const t of totals) {
      expect(t).toBeGreaterThanOrEqual(DAILY_MEAN * (1 - BASELINE.variation) - 1)
      expect(t).toBeLessThanOrEqual(BASELINE.peak)
    }
    const mean = totals.reduce((s, t) => s + t, 0) / totals.length
    expect(Math.abs(mean - DAILY_MEAN) / DAILY_MEAN).toBeLessThan(0.05)
    expect(dayTotal(20500)).toBe(dayTotal(20500))
  })

  test("the day fills from zero to its total and never runs backwards", () => {
    expect(spentShare(0)).toBe(0)
    expect(spentShare(1)).toBeCloseTo(1, 10)
    let last = -1
    for (let p = 0; p <= 1; p += 0.001) {
      const s = spentShare(p)
      expect(s).toBeGreaterThanOrEqual(last)
      last = s
    }
  })

  test("the day rolls over at midnight IST", () => {
    const midnightIst = Date.UTC(2026, 10, 19, 18, 30)
    expect(istDay(midnightIst).progress).toBe(0)
    expect(istDay(midnightIst - 1000).index).toBe(istDay(midnightIst).index - 1)
    expect(estimate(midnightIst).today).toBe(0)
    const noon = estimate(midnightIst + 12 * 3600 * 1000)
    expect(noon.today).toBeGreaterThan(0)
    expect(noon.today).toBeLessThan(noon.total)
    expect(noon.week).toHaveLength(7)
  })
})
