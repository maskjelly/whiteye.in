import { arrivalUrl, arrivalSiteId } from "@/lib/arrival/config"

/** Discovery only: questions are optional and never change website access. */
export function GET() {
  if (!arrivalUrl) return Response.json({ enabled: false, optional: true }, { status: 200 })
  return Response.redirect(`${arrivalUrl}/api/agent/manifest/${arrivalSiteId}`, 307)
}
