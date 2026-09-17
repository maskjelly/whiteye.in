import { NextRequest } from "next/server"
import { randomUUID } from "node:crypto"

export const runtime = "nodejs"
export const maxDuration = 30

const CONVEX_SYNC_URL =
  process.env.CONVEX_SYNC_URL ??
  "wss://fastidious-oyster-877.convex.cloud/api/1.46.0/sync"
const QUERY_PATH = process.env.ORACLE_QUERY ?? "messages:mine"
const MUTATION_PATH = process.env.ORACLE_MUTATION ?? "messages:send"

const QUESTION_TIMEOUT_MS = 25_000
const MAX_CONCURRENT = 2
const MIN_GAP_MS = 700
const JITTER_MS = 500
const CACHE_TTL_MS = 15 * 60_000
const CACHE_MAX = 300

export type OracleData = {
  verdictConfidence: number | null
  moodConfidence: number | null
  topicConfidence: number | null
  harm: number | null
  unkind: number | null
  adult: number | null
  targetsPerson: number | null
}

export type OracleReply = {
  verdict: "YES" | "NO" | "DEPENDS"
  raw: string
  note: string | null
  topic: string | null
  mood: number | null
  latencyMs: number | null
  costUsd: number | null
  inputTokens: number | null
  session: string
  cached?: boolean
  data: OracleData
}

type Pending = {
  question: string
  resolve: (reply: OracleReply) => void
}

type SyncServerMessage = {
  type?: string
  success?: boolean
  result?: unknown
  modifications?: Array<{
    type?: string
    errorMessage?: string
    value?: unknown
  }>
}

type MessageDoc = {
  text?: string
  status?: string
  judged?: boolean
  topic?: string
  mood?: number
  latencyMs?: number
  costUsd?: number
  inputTokens?: number
  harm?: number
  answers?: {
    reply?: string
    replyConfidence?: number
    mood?: number
    moodConfidence?: number
    topicConfidence?: number
    harm?: number
    unkind?: number
    adult?: number
    targetsPerson?: number
  }
}

const queue: Pending[] = []
const cache = new Map<string, { reply: OracleReply; at: number }>()
const recent = new Map<string, number[]>()

let active = 0
let lastStart = 0
let pumpTimer: ReturnType<typeof setTimeout> | null = null

function pump() {
  if (pumpTimer) return
  if (active >= MAX_CONCURRENT || queue.length === 0) return
  const wait = Math.max(
    0,
    lastStart + MIN_GAP_MS + Math.random() * JITTER_MS - Date.now()
  )
  if (wait > 0) {
    pumpTimer = setTimeout(() => {
      pumpTimer = null
      pump()
    }, wait)
    return
  }
  const job = queue.shift()
  if (!job) return
  lastStart = Date.now()
  active += 1
  askOracle(job.question)
    .then(job.resolve)
    .finally(() => {
      active -= 1
      pump()
    })
  pump()
}

function depends(
  sessionId: string,
  raw: string,
  note: string,
  started: number,
  doc?: MessageDoc
): OracleReply {
  return {
    verdict: "DEPENDS",
    raw,
    note,
    topic: null,
    mood: null,
    latencyMs: Date.now() - started,
    costUsd: typeof doc?.costUsd === "number" ? doc.costUsd : null,
    inputTokens: typeof doc?.inputTokens === "number" ? doc.inputTokens : null,
    session: sessionId,
    data: {
      verdictConfidence: null,
      moodConfidence: null,
      topicConfidence: null,
      harm: null,
      unkind: null,
      adult: null,
      targetsPerson: null,
    },
  }
}

function askOracle(question: string): Promise<OracleReply> {
  const sessionId = randomUUID()
  const started = Date.now()
  const strip = (text: string) => text.replace(/[?!.\s]+$/u, "")

  return new Promise((resolve) => {
    const ws = new WebSocket(CONVEX_SYNC_URL)
    let settled = false
    const timer = setTimeout(
      () =>
        finish(
          depends(
            sessionId,
            "quiet",
            "the oracle went quiet — no definite reading",
            started
          )
        ),
      QUESTION_TIMEOUT_MS
    )

    function finish(reply: OracleReply) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try {
        ws.close()
      } catch {}
      resolve(reply)
    }

    function send(message: unknown) {
      try {
        ws.send(JSON.stringify(message))
      } catch {}
    }

    ws.addEventListener("open", () => {
      send({
        type: "Connect",
        sessionId,
        connectionCount: 1,
        lastCloseReason: "InitialConnect",
        clientTs: Date.now(),
      })
      send({
        type: "ModifyQuerySet",
        baseVersion: 0,
        newVersion: 1,
        modifications: [
          { type: "Add", queryId: 1, udfPath: QUERY_PATH, args: [{ sessionId }] },
        ],
      })
      send({
        type: "Mutation",
        requestId: 1,
        udfPath: MUTATION_PATH,
        args: [{ sessionId, text: question }],
      })
    })

    ws.addEventListener("message", (ev) => {
      if (typeof ev.data !== "string") return
      let message: SyncServerMessage
      try {
        message = JSON.parse(ev.data) as SyncServerMessage
      } catch {
        return
      }

      if (message.type === "MutationResponse") {
        if (!message.success) {
          finish(
            depends(
              sessionId,
              "refused",
              "the oracle refused the question — no definite reading",
              started
            )
          )
        }
        return
      }
      if (message.type !== "Transition") return

      for (const mod of message.modifications ?? []) {
        if (mod.type === "QueryFailed") {
          finish(
            depends(
              sessionId,
              "unavailable",
              "the reading service is unavailable — no definite answer",
              started
            )
          )
          return
        }
        if (mod.type !== "QueryUpdated" || !Array.isArray(mod.value)) continue
        const messages = mod.value as MessageDoc[]
        const mine =
          messages.find((m) => strip(m.text ?? "") === strip(question)) ??
          (messages.length === 1 ? messages[0] : undefined)
        if (!mine) continue

        if (mine.status === "blocked") {
          finish(
            depends(
              sessionId,
              "blocked",
              "the message was blocked — no definite reading",
              started,
              mine
            )
          )
          return
        }
        if (mine.judged && mine.answers?.reply) {
          const raw = String(mine.answers.reply)
          if (raw !== "yes" && raw !== "no") {
            finish(
              depends(
                sessionId,
                raw,
                `the reply was “${raw}” — not a definite yes or no`,
                started,
                mine
              )
            )
            return
          }
          finish({
            verdict: raw === "yes" ? "YES" : "NO",
            raw,
            note: null,
            topic: typeof mine.topic === "string" ? mine.topic : null,
            mood:
              typeof mine.mood === "number"
                ? mine.mood
                : typeof mine.answers.mood === "number"
                  ? mine.answers.mood
                  : null,
            latencyMs:
              typeof mine.latencyMs === "number"
                ? mine.latencyMs
                : Date.now() - started,
            costUsd: typeof mine.costUsd === "number" ? mine.costUsd : null,
            inputTokens:
              typeof mine.inputTokens === "number" ? mine.inputTokens : null,
            session: sessionId,
            data: {
              verdictConfidence:
                typeof mine.answers.replyConfidence === "number"
                  ? mine.answers.replyConfidence
                  : null,
              moodConfidence:
                typeof mine.answers.moodConfidence === "number"
                  ? mine.answers.moodConfidence
                  : null,
              topicConfidence:
                typeof mine.answers.topicConfidence === "number"
                  ? mine.answers.topicConfidence
                  : null,
              harm:
                typeof mine.answers.harm === "number"
                  ? mine.answers.harm
                  : typeof mine.harm === "number"
                    ? mine.harm
                    : null,
              unkind:
                typeof mine.answers.unkind === "number"
                  ? mine.answers.unkind
                  : null,
              adult:
                typeof mine.answers.adult === "number"
                  ? mine.answers.adult
                  : null,
              targetsPerson:
                typeof mine.answers.targetsPerson === "number"
                  ? mine.answers.targetsPerson
                  : null,
            },
          })
          return
        }
      }
    })

    ws.addEventListener("error", () =>
      finish(
        depends(
          sessionId,
          "unavailable",
          "the connection dropped — no definite reading",
          started
        )
      )
    )
    ws.addEventListener("close", () =>
      finish(
        depends(
          sessionId,
          "unavailable",
          "the connection dropped — no definite reading",
          started
        )
      )
    )
  })
}

function allowed(ip: string) {
  const now = Date.now()
  const list = (recent.get(ip) ?? []).filter((t) => now - t < 3600_000)
  if (list.length >= 20) return false
  list.push(now)
  recent.set(ip, list)
  return true
}

function normalize(question: string) {
  return question.toLowerCase().replace(/[?!.\s]+$/, "").trim()
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!allowed(ip)) {
    return Response.json(
      { error: "That's a lot of questions. The oracle needs a nap — try later." },
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
  if (question.length < 4 || question.length > 280) {
    return Response.json(
      { error: "Ask something between 4 and 280 characters." },
      { status: 400 }
    )
  }

  const outgoing = question.replace(/\s+([?!.])/g, "$1").replace(/\s+/g, " ")
  const key = normalize(outgoing)
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return Response.json({ ...hit.reply, cached: true })
  }

  const reply = await new Promise<OracleReply>((resolve) => {
    queue.push({ question: outgoing, resolve })
    pump()
  })

  if (reply.verdict !== "DEPENDS") {
    cache.set(key, { reply, at: Date.now() })
    if (cache.size > CACHE_MAX) {
      const oldest = cache.keys().next().value
      if (oldest !== undefined) cache.delete(oldest)
    }
  }

  return Response.json(reply)
}
