import { timingSafeEqual } from "node:crypto"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { analyticsReady, report, type Row } from "@/lib/analytics"
import "./stats.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Visitors",
  robots: { index: false, follow: false },
}

const fmt = (n: number) => n.toLocaleString("en-US")

function allowed(key: unknown): boolean {
  const expected = process.env.ANALYTICS_KEY
  if (!expected || typeof key !== "string") return false
  const a = Buffer.from(key)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const regions = new Intl.DisplayNames(["en"], { type: "region" })
const country = (code: string) => {
  try {
    return (code.length === 2 && regions.of(code)) || code
  } catch {
    return code
  }
}

function Board({ title, unit, rows, label = (s: string) => s }: { title: string; unit: string; rows: Row[]; label?: (s: string) => string }) {
  const max = rows[0]?.count ?? 0
  return (
    <section className="st-card">
      <div className="st-card-head">
        <span>{title}</span>
        <span>{unit}</span>
      </div>
      {rows.length === 0 ? (
        <p className="st-empty">Nothing recorded yet.</p>
      ) : (
        <ol className="st-board">
          {rows.map((r) => (
            <li key={r.name}>
              <span className="st-name" title={label(r.name)}>{label(r.name)}</span>
              <span className="st-bar" aria-hidden="true">
                <i style={{ width: `${(r.count / max) * 100}%` }} />
              </span>
              <span className="st-count">{fmt(r.count)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  if (!allowed((await searchParams).key)) notFound()

  const header = (
    <header className="page-header">
      <p className="page-kicker">Private</p>
      <h1 className="page-title">Visitors</h1>
    </header>
  )

  if (!analyticsReady()) {
    return (
      <>
        {header}
        <p className="page-intro">The store is not connected: set KV_REST_API_URL and KV_REST_API_TOKEN, then redeploy.</p>
      </>
    )
  }

  let data
  try {
    data = await report()
  } catch {
    return (
      <>
        {header}
        <p className="page-intro">The store could not be reached. Try again shortly.</p>
      </>
    )
  }

  const peak = Math.max(1, ...data.days.map((d) => d.views))
  const tiles = [
    { value: data.today.visitors, label: "visitors today" },
    { value: data.today.views, label: "page views today" },
    { value: data.visitors, label: "visitors, 30 days" },
    { value: data.views, label: "page views, 30 days" },
    { value: data.allTime, label: "page views, all time" },
  ]

  return (
    <>
      {header}
      <p className="page-intro">
        Counted on this site itself, without cookies. Days run on Indian Standard Time; a visitor is counted once per
        day, and known bots are left out.
      </p>

      <dl className="st-tiles">
        {tiles.map((t) => (
          <div key={t.label}>
            <dd>{fmt(t.value)}</dd>
            <dt>{t.label}</dt>
          </div>
        ))}
      </dl>

      <section className="st-card">
        <div className="st-card-head">
          <span>Last 30 days</span>
          <span>
            <i className="st-key st-key-views" /> views <i className="st-key st-key-visitors" /> visitors
          </span>
        </div>
        <div className="st-chart" role="img" aria-label="Page views and visitors per day over the last 30 days">
          {data.days.map((d) => (
            <div key={d.date} className="st-col" title={`${d.date}: ${fmt(d.views)} views, ${fmt(d.visitors)} visitors`}>
              <i className="st-views" style={{ height: `${(d.views / peak) * 100}%` }} />
              <i className="st-visitors" style={{ height: `${(d.visitors / peak) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="st-axis">
          <span>{data.days[0].date}</span>
          <span>{data.days[data.days.length - 1].date}</span>
        </div>
      </section>

      <div className="st-grid">
        <Board title="Pages" unit="views" rows={data.pages} />
        <Board title="Referrers" unit="views" rows={data.refs} />
        <Board title="Countries" unit="views" rows={data.countries} label={country} />
        <Board title="Devices" unit="views" rows={data.devices} />
      </div>
    </>
  )
}
