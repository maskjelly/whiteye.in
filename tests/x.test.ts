import { describe, expect, test } from "bun:test"
import { chartDays, cleanPlan, notFollowingBack, pickPeers, target, toPost, type Account } from "../lib/x"

const acct = (handle: string, followers: number, statuses = 1000): Account => ({ handle, name: handle, followers, following: 100, statuses })

describe("x tracker", () => {
  test("own posts are kept, reposts and other authors dropped", () => {
    const base = { id: "1", text: "hi", created_timestamp: 1795523190, likes: 3, replies: 2, views: 90, author: { screen_name: "aaryantwt" } }
    expect(toPost(base, "aaryantwt")).toMatchObject({ id: "1", replies: 2, views: 90, reply: false, at: 1795523190000 })
    expect(toPost({ ...base, reposted_by: { screen_name: "aaryantwt" } }, "aaryantwt")).toBeNull()
    expect(toPost({ ...base, author: { screen_name: "someone" } }, "aaryantwt")).toBeNull()
    expect(toPost({ ...base, replying_to: { screen_name: "theo" } }, "aaryantwt")?.reply).toBe(true)
    expect(toPost({ ...base, replying_to: { screen_name: "aaryantwt" } }, "aaryantwt")?.reply).toBe(false)
  })

  test("target climbs in a straight line, then holds at the goal", () => {
    const plan = { start: "2026-11-25", startFollowers: 696, goal: 1000, days: 7 }
    expect(target(plan, "2026-11-24")).toBe(696)
    expect(target(plan, "2026-11-25")).toBe(696)
    expect(target(plan, "2026-11-28")).toBe(826)
    expect(target(plan, "2026-12-02")).toBe(1000)
    expect(target(plan, "2026-12-20")).toBe(1000)
  })

  test("chart runs from the plan's start to the deadline or today", () => {
    const plan = { start: "2026-11-25", startFollowers: 696, goal: 1000, days: 7 }
    const days = chartDays(plan, "2026-11-25")
    expect(days[0]).toBe("2026-11-25")
    expect(days.at(-1)).toBe("2026-12-02")
    expect(chartDays(plan, "2026-12-10").at(-1)).toBe("2026-12-10")
    expect(chartDays(plan, "2027-03-01")).toHaveLength(45)
  })

  test("peers are accounts near your size that post", () => {
    const peers = pickPeers([acct("tiny", 40), acct("near", 900), acct("big", 90000), acct("quiet", 800, 20)], 696)
    expect(peers).toEqual([{ handle: "near", followers: 900 }])
  })

  test("not following back skips large accounts and mutuals", () => {
    const out = notFollowingBack([acct("mutual", 500), acct("ghost", 300, 4), acct("celebrity", 1_000_000)], [acct("Mutual", 500)])
    expect(out.map((a) => a.handle)).toEqual(["ghost"])
  })

  test("plans are validated", () => {
    expect(cleanPlan({ start: "2026-11-25", startFollowers: 696, goal: 1000, days: 7 })).not.toBeNull()
    expect(cleanPlan({ start: "tomorrow", startFollowers: 696, goal: 1000, days: 7 })).toBeNull()
    expect(cleanPlan({ start: "2026-11-25", startFollowers: 696, goal: 500, days: 7 })).toBeNull()
  })
})
