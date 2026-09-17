"use client"

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react"

type Verdict = "YES" | "NO" | "DEPENDS"

type OracleData = {
  verdictConfidence: number | null
  moodConfidence: number | null
  topicConfidence: number | null
  harm: number | null
  unkind: number | null
  adult: number | null
  targetsPerson: number | null
}

type Result = {
  verdict: Verdict
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

type Stamp = { q: string; verdict: Verdict; at: number }
type Theme = "dark" | "light"

const THINKING = [
  "counting bananas",
  "consulting the cloud",
  "asking nicely",
  "flipping a very large coin",
  "cross-checking the vibes",
  "polling the committee of dots",
]

const HISTORY_KEY = "whiteye-oracle-history"
const THEME_KEY = "whiteye-oracle-theme"
const GLYPHS = 28
const METER_DOTS = 14

function Meter({
  label,
  value,
  accent = false,
}: {
  label: string
  value: number | null
  accent?: boolean
}) {
  if (value === null) return null
  const pct = Math.round(value * 100)
  const filled = Math.round(Math.min(1, Math.max(0, value)) * METER_DOTS)
  return (
    <div className={`oracle-meter${accent ? " is-accent" : ""}`}>
      <span className="oracle-meter-label">{label}</span>
      <span className="oracle-meter-dots" aria-hidden>
        {Array.from({ length: METER_DOTS }, (_, i) => (
          <i key={i} className={i < filled ? "on" : ""} />
        ))}
      </span>
      <span className="oracle-meter-pct">{pct}%</span>
    </div>
  )
}

export function OracleClient() {
  const [question, setQuestion] = useState("")
  const [lastQuestion, setLastQuestion] = useState("")
  const [phase, setPhase] = useState<"idle" | "asking" | "answer">("idle")
  const [result, setResult] = useState<Result | null>(null)
  const [flicker, setFlicker] = useState<"YES" | "NO">("YES")
  const [tick, setTick] = useState(0)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<Stamp[]>([])
  const [asked, setAsked] = useState(0)
  const [theme, setTheme] = useState<Theme>("dark")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, 12))
      }
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === "light" || saved === "dark") setTheme(saved)
    } catch {}
    const params = new URLSearchParams(window.location.search)
    const param = params.get("theme")
    if (param === "light" || param === "dark") setTheme(param)
    const initial = params.get("q")?.trim().slice(0, 280)
    if (initial && initial.length >= 4) {
      setQuestion(initial)
      void ask(initial)
    }
    inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== "asking") return
    const spin = setInterval(
      () => setFlicker(Math.random() < 0.5 ? "YES" : "NO"),
      90
    )
    const cycle = setInterval(() => setTick((n) => n + 1), 1400)
    return () => {
      clearInterval(spin)
      clearInterval(cycle)
    }
  }, [phase])

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark"
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {}
      return next
    })
  }

  async function ask(text: string) {
    const value = text.trim()
    if (value.length < 4) {
      setError("give me a real question — at least 4 characters.")
      setResult(depends("short", "the question was too short to read"))
      setPhase("answer")
      return
    }
    setLastQuestion(value)
    setPhase("asking")
    setError("")
    setResult(null)
    setAsked((n) => n + 1)
    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: value }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "the oracle did not answer.")
        setResult(depends("unavailable", data?.error ?? "no reading came back"))
        setPhase("answer")
        return
      }
      const reply = data as Result
      setResult(reply)
      setPhase("answer")
      setHistory((prev) => {
        const next = [
          { q: value, verdict: reply.verdict, at: Date.now() },
          ...prev.filter((s) => s.q !== value),
        ].slice(0, 12)
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
        } catch {}
        return next
      })
    } catch {
      setError("the connection dropped.")
      setResult(depends("unavailable", "the connection dropped — no definite reading"))
      setPhase("answer")
    }
  }

  function depends(raw: string, note: string): Result {
    return {
      verdict: "DEPENDS",
      raw,
      note,
      topic: null,
      mood: null,
      latencyMs: null,
      costUsd: null,
      inputTokens: null,
      session: "",
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

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void ask(question)
  }

  const verdict: Verdict =
    phase === "asking" ? flicker : (result?.verdict ?? "YES")
  const tone =
    phase === "answer" && verdict === "DEPENDS"
      ? " is-dim"
      : phase === "answer" && verdict === "NO"
        ? " is-red"
        : ""

  return (
    <div className={`oracle-stage${theme === "light" ? " is-light" : ""}`}>
      <header className="oracle-top">
        <span className="oracle-wordmark">whiteye</span>
        <span className="oracle-top-right">
          <button
            type="button"
            className="oracle-theme"
            onClick={toggleTheme}
            aria-label="toggle light mode"
            title={theme === "dark" ? "light mode" : "dark mode"}
          >
            <i aria-hidden />
            <i aria-hidden />
          </button>
          <span className="oracle-badge">
            <i aria-hidden />
            oracle
          </span>
        </span>
      </header>

      <main className="oracle-main">
        <div
          className={`oracle-glyph${phase === "asking" ? " is-asking" : ""}`}
          aria-hidden
        >
          {Array.from({ length: GLYPHS }, (_, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties} />
          ))}
        </div>

        <p className="oracle-status" aria-live="polite">
          {phase === "asking"
            ? THINKING[tick % THINKING.length]
            : phase === "idle"
              ? "yes or no. that's the whole product."
              : result?.verdict === "DEPENDS"
                ? "the output is not definite"
                : result?.cached
                  ? "from the memory of the oracle"
                  : "verdict delivered"}
        </p>

        <p className={`oracle-echo${lastQuestion ? "" : " is-empty"}`}>
          {lastQuestion ? `“${lastQuestion}”` : "\u00a0"}
        </p>

        <div
          className={`oracle-verdict${phase === "idle" ? " is-idle" : tone}`}
          aria-live="polite"
        >
          {phase === "idle" ? "YES / NO" : `${verdict}.`}
        </div>

        {phase === "answer" && result && (
          <>
            <p className="oracle-note">
              {result.note ?? error ?? `raw reading: ${result.raw}`}
            </p>

            <div className="oracle-meta">
              {result.verdict !== "DEPENDS" && <span>reply: {result.raw}</span>}
              {result.topic && <span>topic: {result.topic}</span>}
              {result.mood !== null && <span>mood: {result.mood}</span>}
              {result.latencyMs !== null && <span>{result.latencyMs} ms</span>}
              {result.costUsd !== null && (
                <span>cost: ${result.costUsd.toFixed(7)}</span>
              )}
              {result.inputTokens !== null && (
                <span>{result.inputTokens} tokens</span>
              )}
              {result.session && (
                <span className="oracle-meta-session">
                  new session {result.session.slice(0, 8)}
                </span>
              )}
            </div>

            <div className="oracle-panel">
              <p className="oracle-panel-title">what came back</p>
              <div className="oracle-meters">
                <Meter
                  label="yes/no confidence"
                  value={result.data.verdictConfidence}
                  accent
                />
                <Meter label="mood confidence" value={result.data.moodConfidence} />
                <Meter label="topic confidence" value={result.data.topicConfidence} />
                <Meter label="harm" value={result.data.harm} />
                <Meter label="unkind" value={result.data.unkind} />
                <Meter label="adult" value={result.data.adult} />
                <Meter label="targets a person" value={result.data.targetsPerson} />
                {result.data.verdictConfidence === null &&
                  result.data.harm === null && (
                    <p className="oracle-panel-empty">
                      nothing readable came back — only the absence of a verdict.
                    </p>
                  )}
              </div>
            </div>
          </>
        )}

        <form className="oracle-form" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="is it going to rain tomorrow?"
            maxLength={280}
            disabled={phase === "asking"}
            aria-label="your question"
          />
          <button
            type="submit"
            disabled={phase === "asking"}
            aria-label="ask the oracle"
          >
            {phase === "asking" ? "·" : "→"}
          </button>
        </form>

        {history.length > 0 && (
          <div className="oracle-history">
            <p className="oracle-history-title">recent verdicts</p>
            <div className="oracle-stamps">
              {history.map((stamp) => (
                <button
                  key={stamp.q}
                  type="button"
                  className={`oracle-stamp${
                    stamp.verdict === "NO"
                      ? " is-red"
                      : stamp.verdict === "DEPENDS"
                        ? " is-dim"
                        : ""
                  }`}
                  onClick={() => {
                    setQuestion(stamp.q)
                    void ask(stamp.q)
                  }}
                >
                  <span className="oracle-stamp-q">{stamp.q}</span>
                  <span className="oracle-stamp-v">{stamp.verdict}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="oracle-foot">
        <span>sessions rotate every question</span>
        <span>answers are final unless they aren&apos;t</span>
        <span>{asked > 0 ? `question #${asked}` : "whiteye.in"}</span>
      </footer>
    </div>
  )
}
