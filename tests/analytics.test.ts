import { describe, expect, test } from "bun:test"
import { cleanPath, cleanReferrer, device, isBot, istDay, lastDays, rank, visitorId } from "../lib/analytics"

describe("analytics", () => {
  test("days follow IST", () => {
    expect(istDay(new Date("2026-11-22T18:29:00Z"))).toBe("2026-11-22")
    expect(istDay(new Date("2026-11-22T18:30:00Z"))).toBe("2026-11-23")
    const days = lastDays(30, new Date("2026-11-22T06:00:00Z"))
    expect(days).toHaveLength(30)
    expect(days[0]).toBe("2026-10-24")
    expect(days[29]).toBe("2026-11-22")
  })

  test("bots and missing user agents are not counted", () => {
    expect(isBot(null)).toBe(true)
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true)
    expect(isBot("Mozilla/5.0 AppleWebKit/537.36; ClaudeBot/1.0")).toBe(true)
    expect(isBot("curl/8.5.0")).toBe(true)
    expect(isBot("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36")).toBe(false)
  })

  test("device classes", () => {
    expect(device("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile/15E148")).toBe("Mobile")
    expect(device("Mozilla/5.0 (iPad; CPU OS 18_0)")).toBe("Tablet")
    expect(device("Mozilla/5.0 (X11; Linux x86_64)")).toBe("Desktop")
  })

  test("paths are normalised and private ones rejected", () => {
    expect(cleanPath("/blog/fsync/?utm=x#top")).toBe("/blog/fsync")
    expect(cleanPath("/")).toBe("/")
    expect(cleanPath("//evil.example")).toBeNull()
    expect(cleanPath("/api/hit")).toBeNull()
    expect(cleanPath("/stats")).toBeNull()
    expect(cleanPath(42)).toBeNull()
  })

  test("referrers reduce to a host, own site is direct", () => {
    expect(cleanReferrer("https://www.google.com/search?q=x", "whiteye.in")).toBe("google.com")
    expect(cleanReferrer("https://whiteye.in/now", "whiteye.in")).toBe("Direct")
    expect(cleanReferrer("", "whiteye.in")).toBe("Direct")
    expect(cleanReferrer("not a url", "whiteye.in")).toBe("Direct")
  })

  test("visitor ids rotate daily and never contain the address", () => {
    const a = visitorId("2026-11-22", "203.0.113.7", "ua")
    expect(a).toBe(visitorId("2026-11-22", "203.0.113.7", "ua"))
    expect(a).not.toBe(visitorId("2026-11-23", "203.0.113.7", "ua"))
    expect(a).not.toContain("203")
    expect(a).toHaveLength(24)
  })

  test("rank sums days and orders by count", () => {
    expect(rank([["/", "3", "/now", "1"], null, ["/now", "5"]])).toEqual([
      { name: "/now", count: 6 },
      { name: "/", count: 3 },
    ])
  })
})
