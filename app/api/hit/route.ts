import { analyticsReady, cleanPath, cleanReferrer, device, isBot, istDay, record, visitorId } from "@/lib/analytics"

export const dynamic = "force-dynamic"

const done = () => new Response(null, { status: 204 })

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent")
  if (!analyticsReady() || isBot(ua) || req.headers.get("sec-fetch-site") === "cross-site") return done()

  let body: { p?: unknown; r?: unknown } | null
  try {
    body = JSON.parse((await req.text()).slice(0, 2000))
  } catch {
    return done()
  }
  const path = cleanPath(body?.p)
  if (!path) return done()

  const country = req.headers.get("x-vercel-ip-country") ?? ""
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim()
  try {
    await record({
      path,
      referrer: cleanReferrer(body?.r, new URL(req.url).hostname),
      country: /^[A-Z]{2}$/.test(country) ? country : "Unknown",
      device: device(ua!),
      visitor: visitorId(istDay(), ip, ua!),
    })
  } catch {
    // Counting must never surface an error to a visitor.
  }
  return done()
}
