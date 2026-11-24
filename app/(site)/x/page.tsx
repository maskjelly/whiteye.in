import type { Metadata } from "next"
import { after } from "next/server"
import { notFound } from "next/navigation"
import { CopyText } from "@/components/copy-text"
import { istDay } from "@/lib/analytics"
import { allowed, board, HANDLE, refresh, xReady, type Board, type Post } from "@/lib/x"
import "../stats/stats.css"
import "./x.css"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export const metadata: Metadata = {
  title: "X",
  robots: { index: false, follow: false },
}

const fmt = (n: number) => n.toLocaleString("en-US")
const compact = (n: number) => (n >= 10000 ? new Intl.NumberFormat("en-US", { notation: "compact" }).format(n) : fmt(n))

const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })
const shortDay = (d: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(d))

function ago(at: number, now: number): string {
  const m = Math.max(0, Math.round((now - at) / 60000))
  if (m < 1) return "just now"
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`
}

function Chart({ days, goal }: { days: Board["days"]; goal: number }) {
  const known = days.filter((d) => d.followers !== null).map((d) => d.followers as number)
  const lo = Math.floor(Math.min(...known, ...days.map((d) => d.target)) * 0.97)
  const hi = Math.ceil(Math.max(goal, ...known) * 1.02)
  const W = 100
  const H = 40
  const step = W / days.length
  const y = (v: number) => H - ((v - lo) / Math.max(1, hi - lo)) * H
  const line = days.map((d, i) => `${(i + 0.5) * step},${y(d.target)}`).join(" ")
  const today = istDay()

  return (
    <div className="xg-chart" role="img" aria-label="Followers per day against the target">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <line x1="0" x2={W} y1={y(goal)} y2={y(goal)} className="xg-goal" vectorEffect="non-scaling-stroke" />
        {days.map((d, i) =>
          d.followers === null ? null : (
            <rect
              key={d.date}
              x={i * step + step * 0.18}
              width={step * 0.64}
              y={y(d.followers)}
              height={H - y(d.followers)}
              className={d.date === today ? "xg-bar xg-bar-today" : d.followers >= d.target ? "xg-bar xg-bar-ahead" : "xg-bar"}
            >
              <title>{`${shortDay(d.date)}: ${fmt(d.followers)} followers, target ${fmt(d.target)}`}</title>
            </rect>
          ),
        )}
        <polyline points={line} className="xg-target" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="xg-goal-label" style={{ top: `${(y(goal) / H) * 100}%` }}>
        {fmt(goal)}
      </span>
    </div>
  )
}

function PostRow({ p, now, author }: { p: Post; now: number; author?: string }) {
  return (
    <li className="xg-post">
      <a href={p.url} target="_blank" rel="noopener noreferrer" className="xg-post-text">
        {author && <b>@{author} </b>}
        {p.text || <i>media only</i>}
      </a>
      <span className="xg-post-meta">
        <time dateTime={new Date(p.at).toISOString()} title={when.format(p.at)}>
          {ago(p.at, now)}
        </time>
        <span className={p.replies > 0 ? "xg-replies xg-hot" : "xg-replies"}>{fmt(p.replies)} {p.replies === 1 ? "reply" : "replies"}</span>
        <span>{compact(p.likes)} likes</span>
        <span>{compact(p.views)} views</span>
      </span>
    </li>
  )
}

export default async function XPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  if (!allowed((await searchParams).key)) notFound()

  const header = (
    <header className="page-header">
      <p className="page-kicker">Private</p>
      <h1 className="page-title">X</h1>
    </header>
  )
  if (!xReady()) {
    return (
      <>
        {header}
        <p className="page-intro">The store is not connected: set KV_REST_API_URL and KV_REST_API_TOKEN, then redeploy.</p>
      </>
    )
  }

  let data: Board
  try {
    data = await board()
  } catch {
    return (
      <>
        {header}
        <p className="page-intro">The store could not be reached. Try again shortly.</p>
      </>
    )
  }

  const now = Date.now()
  if (!data.profile || now - data.profile.at > 45 * 60_000) after(() => refresh().catch(() => {}))

  const today = istDay()
  const todayRow = data.days.find((d) => d.date === today)
  const before = data.days.filter((d) => d.date < today && d.followers !== null).at(-1)
  const followers = data.profile?.followers ?? 0
  const gained = before ? followers - (before.followers as number) : null
  const targetToday = todayRow?.target ?? data.plan.goal
  const ahead = followers - targetToday

  const mine = data.posts.filter((p) => !p.reply)
  const week = mine.filter((p) => p.at >= now - 7 * 86400_000)
  const perPost = week.length ? week.reduce((s, p) => s + p.replies, 0) / week.length : 0
  const best = [...mine.filter((p) => p.at >= now - 86400_000)].sort((a, b) => b.replies - a.replies || b.views - a.views)[0]

  const tiles = [
    { value: fmt(followers), label: "followers" },
    { value: gained === null ? "—" : `${gained >= 0 ? "+" : ""}${fmt(gained)}`, label: "since yesterday" },
    { value: `${ahead >= 0 ? "+" : ""}${fmt(ahead)}`, label: `vs target of ${fmt(targetToday)}`, tone: ahead >= 0 ? "up" : "down" },
    { value: fmt(Math.max(0, data.plan.goal - followers)), label: `to ${fmt(data.plan.goal)}` },
    { value: perPost.toFixed(1), label: "replies per post, 7 days" },
  ]

  return (
    <>
      {header}
      <p className="page-intro">
        <a href={`https://x.com/${HANDLE}`} target="_blank" rel="noopener noreferrer">
          @{HANDLE}
        </a>
        , public numbers only. Goal: {fmt(data.plan.goal)} followers by {shortDay(new Date(Date.parse(data.plan.start) + data.plan.days * 86400_000).toISOString())}.
        {data.profile ? ` Refreshed ${ago(data.profile.at, now)}.` : " First refresh is running; reload in a minute."}
      </p>

      <dl className="st-tiles xg-tiles">
        {tiles.map((t) => (
          <div key={t.label} data-tone={t.tone}>
            <dd>{t.value}</dd>
            <dt>{t.label}</dt>
          </div>
        ))}
      </dl>

      <section className="st-card">
        <div className="st-card-head">
          <span>Followers</span>
          <span>
            <i className="st-key xg-key-bar" /> each day <i className="xg-key-line" /> target
          </span>
        </div>
        <Chart days={data.days} goal={data.plan.goal} />
        <div className="st-axis">
          <span>{shortDay(data.days[0].date)}</span>
          <span>{shortDay(data.days[data.days.length - 1].date)}</span>
        </div>
      </section>

      <div className="xg-split">
        <section className="st-card">
          <div className="st-card-head">
            <span>Tonight</span>
            <span>{data.report ? when.format(data.report.at) : "21:00 IST"}</span>
          </div>
          {data.report ? (
            <p className="xg-report">{data.report.text}</p>
          ) : best ? (
            <p className="xg-report">
              Best post today so far: “{best.text.slice(0, 120) || "media"}” with {fmt(best.replies)} replies and {compact(best.views)} views.
            </p>
          ) : (
            <p className="st-empty">The nightly report lands here at 21:00.</p>
          )}
        </section>

        <section className="st-card">
          <div className="st-card-head">
            <span>Drafts</span>
            <span>{data.drafts ? `written ${ago(data.drafts.at, now)}` : "none yet"}</span>
          </div>
          {data.drafts?.items.length ? (
            <ol className="xg-drafts">
              {data.drafts.items.map((d, i) => (
                <li key={i}>
                  <p>{d}</p>
                  <CopyText text={d} label="copy" />
                </li>
              ))}
            </ol>
          ) : (
            <p className="st-empty">Tomorrow’s five drafts arrive with the nightly report.</p>
          )}
        </section>
      </div>

      <section className="st-card xg-gap">
        <div className="st-card-head">
          <span>Your posts</span>
          <span>{fmt(mine.length)} in the last 45 days</span>
        </div>
        {mine.length ? (
          <>
            <ol className="xg-posts">
              {mine.slice(0, 10).map((p) => (
                <PostRow key={p.id} p={p} now={now} />
              ))}
            </ol>
            {mine.length > 10 && (
              <details className="xg-more">
                <summary>Show {fmt(mine.length - 10)} more</summary>
                <ol className="xg-posts">
                  {mine.slice(10).map((p) => (
                    <PostRow key={p.id} p={p} now={now} />
                  ))}
                </ol>
              </details>
            )}
          </>
        ) : (
          <p className="st-empty">Nothing recorded yet.</p>
        )}
      </section>

      <section className="st-card xg-gap">
        <div className="st-card-head">
          <span>Working for accounts your size</span>
          <span>most replies, 7 days</span>
        </div>
        {data.peers.length ? (
          <ol className="xg-posts">
            {data.peers.map((p) => (
              <PostRow key={p.id} p={p} now={now} author={p.author} />
            ))}
          </ol>
        ) : (
          <p className="st-empty">Filled in as the daily follower scan runs.</p>
        )}
      </section>

      <section className="st-card xg-gap">
        <div className="st-card-head">
          <span>Not following back</span>
          <span>{data.unfollow ? `${fmt(data.unfollow.accounts.length)} accounts, checked ${ago(data.unfollow.at, now)}` : "checked daily"}</span>
        </div>
        {data.unfollow?.accounts.length ? (
          <ul className="xg-people">
            {data.unfollow.accounts.slice(0, 100).map((a) => (
              <li key={a.handle}>
                <a href={`https://x.com/${a.handle}`} target="_blank" rel="noopener noreferrer">
                  <span className="st-name">{a.name || a.handle}</span>
                  <span className="xg-handle">@{a.handle}</span>
                </a>
                <span className="st-count">{compact(a.followers)} followers · {compact(a.statuses)} posts</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="st-empty">{data.unfollow ? "Everyone you follow follows you back." : "Filled in by the daily follower scan."}</p>
        )}
      </section>
    </>
  )
}
