import { allowed, board, cleanPlan, refresh, saveDrafts, savePlan, saveReport, xReady } from "@/lib/x"

export const dynamic = "force-dynamic"
export const maxDuration = 60

function key(req: Request): string | null {
  const auth = req.headers.get("authorization")
  if (auth?.startsWith("Bearer ")) return auth.slice(7)
  return new URL(req.url).searchParams.get("key")
}

const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null)

export async function GET(req: Request) {
  if (!allowed(key(req))) return new Response("Not found", { status: 404 })
  if (!xReady()) return Response.json({ error: "store not connected" }, { status: 503 })
  return Response.json(await board())
}

/** Body: any of { drafts: string[], report: string, plan: Plan, refresh: true }. */
export async function POST(req: Request) {
  if (!allowed(key(req))) return new Response("Not found", { status: 404 })
  if (!xReady()) return Response.json({ error: "store not connected" }, { status: 503 })

  let body: Record<string, unknown>
  try {
    body = JSON.parse((await req.text()).slice(0, 20000))
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 })
  }

  const saved: string[] = []
  if (Array.isArray(body.drafts)) {
    const items = body.drafts.map((d) => text(d, 600)).filter((d): d is string => Boolean(d)).slice(0, 10)
    if (items.length) {
      await saveDrafts(items)
      saved.push("drafts")
    }
  }
  const report = text(body.report, 4000)
  if (report) {
    await saveReport(report)
    saved.push("report")
  }
  if (body.plan !== undefined) {
    const plan = cleanPlan(body.plan)
    if (!plan) return Response.json({ error: "invalid plan" }, { status: 400 })
    await savePlan(plan)
    saved.push("plan")
  }
  const refreshed = body.refresh === true ? await refresh(true) : undefined
  return Response.json({ saved, refreshed })
}
