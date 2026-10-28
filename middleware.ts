import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server"
import { ipAddress } from "@vercel/functions/headers"
import { reportArrival } from "@/lib/arrival/report"
import { arrivalUrl, arrivalSiteId } from "@/lib/arrival/config"

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const response = NextResponse.next()
  if (!arrivalUrl) return response
  response.headers.set(
    "Link",
    `<${arrivalUrl}/api/agent/manifest/${arrivalSiteId}>; rel="alternate"; type="application/json"; title="Optional agent check-in"`,
  )
  const key = process.env.ARRIVAL_INGEST_KEY
  if (!key) return response
  // Prefetch requests are not page visits. Browser navigation is also tracked by the snippet.
  if (request.headers.has("next-router-prefetch") || request.headers.get("purpose") === "prefetch")
    return response
  const incoming = request.cookies.get("arrival_host_session")?.value
  const sessionId = incoming && /^[a-f0-9-]{36}$/.test(incoming) ? incoming : crypto.randomUUID()
  if (!incoming || incoming !== sessionId) {
    response.cookies.set("arrival_host_session", sessionId, {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    })
  }
  event.waitUntil(reportArrival(request, {
    endpoint: arrivalUrl,
    key,
    sessionId,
    // Vercel supplies/overwrites the request IP. Local or other hosts leave it unknown.
    clientIp: process.env.VERCEL === "1" ? ipAddress(request) : undefined,
  }))
  return response
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)", "/resume.txt"],
}
