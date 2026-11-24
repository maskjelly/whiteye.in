import { refresh } from "@/lib/x"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Public on purpose so a plain cron can call it; refresh() runs at most once every 45 minutes.
export async function GET() {
  try {
    return Response.json(await refresh())
  } catch {
    return Response.json({ refreshed: false, error: "refresh failed" }, { status: 502 })
  }
}
