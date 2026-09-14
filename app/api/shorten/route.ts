import { NextRequest } from "next/server"

const BASE = process.env.RUSHORT_BASE ?? "https://45.196.196.251/rushort"
const KEY = process.env.RUSHORT_API_KEY ?? ""

// 10 shortens per IP per hour. The backend key never leaves the server.
const recent = new Map<string, number[]>()

function allowed(ip: string) {
  const now = Date.now()
  const list = (recent.get(ip) ?? []).filter((t) => now - t < 3600_000)
  if (list.length >= 10) return false
  list.push(now)
  recent.set(ip, list)
  return true
}

export async function POST(req: NextRequest) {
  if (!KEY) {
    return Response.json({ error: "Shortener not configured." }, { status: 503 })
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!allowed(ip)) {
    return Response.json(
      { error: "Too many links from here. Try again in a little while." },
      { status: 429 }
    )
  }
  let url = ""
  try {
    const body = await req.json()
    url = String(body?.url ?? "").trim()
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 })
  }
  if (!(url.startsWith("http://") || url.startsWith("https://")) || url.length > 2048) {
    return Response.json({ error: "Give me an http(s) URL under 2048 chars." }, { status: 400 })
  }
  const upstream = await fetch(`${BASE}/api/shorten`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({ url }),
  })
  if (!upstream.ok) {
    return Response.json(
      { error: "Backend refused it. Try a plain https URL." },
      { status: upstream.status === 400 ? 400 : 502 }
    )
  }
  const data = await upstream.json()
  const code = String(data?.code ?? "")
  if (!/^[0-9A-Za-z]{1,11}$/.test(code)) {
    return Response.json({ error: "Backend misbehaved." }, { status: 502 })
  }
  return Response.json({
    code,
    short_url: `https://whiteye.in/s/${code}`,
    long_url: String(data?.long_url ?? url),
  })
}
