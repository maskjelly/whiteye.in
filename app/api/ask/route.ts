import { NextRequest } from "next/server"

export const maxDuration = 60

const HARNESS_URL = process.env.HARNESS_URL ?? "https://45.196.196.251/ask"

const recent = new Map<string, number[]>()

function allowed(ip: string) {
  const now = Date.now()
  const list = (recent.get(ip) ?? []).filter((t) => now - t < 3600_000)
  if (list.length >= 30) return false
  list.push(now)
  recent.set(ip, list)
  return true
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!allowed(ip)) {
    return Response.json(
      { error: "Too many questions from here. Try again in a little while." },
      { status: 429 }
    )
  }

  let question = ""
  try {
    const body = await req.json()
    question = String(body?.question ?? "").trim()
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 })
  }
  if (question.length < 4 || question.length > 600) {
    return Response.json(
      { error: "Please ask a question between 4 and 600 characters." },
      { status: 400 }
    )
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 55_000)
  try {
    const res = await fetch(HARNESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    })
    const data = await res.json()
    if (!res.ok) {
      return Response.json(
        { error: data?.error ?? "The answer service is unavailable." },
        { status: 502 }
      )
    }
    return Response.json(data)
  } catch {
    return Response.json(
      { error: "The answer took too long. Try again." },
      { status: 504 }
    )
  } finally {
    clearTimeout(timer)
  }
}
