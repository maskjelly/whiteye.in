/**
 * Token-spend estimator. Seeded from seven days of real usage across Claude Code and Codex;
 * update BASELINE when the numbers move.
 */

export const BASELINE = {
  days: 7,
  processed: 14.1e9,
  cacheRead: 13.8e9,
  cacheWrite: 194e6,
  input: 28.1e6,
  output: 51.3e6,
  /** Day-to-day variation around the mean. */
  variation: 0.44,
  /** Heaviest days seen. */
  peak: 4e9,
}

export const DAILY_MEAN = BASELINE.processed / BASELINE.days
export const CACHE_SHARE = BASELINE.cacheRead / BASELINE.processed

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/** Relative activity per IST hour: quiet before dawn, busiest in the afternoon and late evening. */
const HOURS = [5, 3, 1, 0.5, 0.5, 0.5, 0.5, 1, 2, 4, 6, 7, 7, 5, 7, 8, 8, 8, 7, 5, 6, 8, 8, 7]
const HOURS_TOTAL = HOURS.reduce((s, h) => s + h, 0)

function hash(n: number) {
  let x = (n ^ 0x9e3779b9) >>> 0
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0
  return ((x ^ (x >>> 16)) >>> 0) / 0xffffffff
}

/** Day index in IST and how far into that day we are (0..1). */
export function istDay(ms: number) {
  const local = ms + IST_OFFSET_MS
  const index = Math.floor(local / DAY_MS)
  return { index, progress: (local - index * DAY_MS) / DAY_MS }
}

/** Estimated tokens for a whole day; stable for a given day. */
export function dayTotal(index: number) {
  const factor = 1 + (hash(index) * 2 - 1) * BASELINE.variation
  return Math.min(BASELINE.peak, DAILY_MEAN * factor)
}

/** Share of the day's tokens spent by `progress` (0..1), following the hourly curve. */
export function spentShare(progress: number) {
  const h = Math.min(24, Math.max(0, progress * 24))
  const whole = Math.floor(h)
  let sum = 0
  for (let i = 0; i < whole; i++) sum += HOURS[i]
  if (whole < 24) sum += HOURS[whole] * (h - whole)
  return sum / HOURS_TOTAL
}

export function estimate(ms: number) {
  const { index, progress } = istDay(ms)
  const total = dayTotal(index)
  const hour = Math.min(23, Math.floor(progress * 24))
  return {
    today: total * spentShare(progress),
    total,
    perSecond: (total * HOURS[hour]) / HOURS_TOTAL / 3600,
    /** The six days before today, oldest first, then today so far. */
    week: [6, 5, 4, 3, 2, 1].map((back) => dayTotal(index - back)).concat(total * spentShare(progress)),
  }
}
