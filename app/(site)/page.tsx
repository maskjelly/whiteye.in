import Link from "next/link"
import type { Metadata } from "next"
import profile from "@/lib/resume-data.json"
import contributions from "@/lib/contributions.json"
import { projectItems } from "@/lib/project-items"
import { workItems } from "@/lib/work-items"
import { posts } from "@/lib/posts"
import { JsonLd, person, PERSON_ID, SITE } from "@/lib/structured-data"
import { getLiveStats, GITHUB_USER, type ContributionDay } from "@/lib/live"
import { HotTakes, LocalClock, PaletteShuffle, RelativeTime, RushortPulse, Stickers } from "@/components/live-widgets"

export const revalidate = 1800

const description =
  "Aaryan Singh is a software engineer: founding engineer at ReferRush, early engineer at Extraordinary, now building Rust agent memory and runtimes. Projects, measured results, open-source contributions and essays on systems."

export const metadata: Metadata = {
  title: { absolute: "Aaryan Singh · Software engineer" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Aaryan Singh · Software engineer",
    description,
    url: SITE,
    type: "profile",
    firstName: "Aaryan",
    lastName: "Singh",
    username: "maskjelly",
  },
  twitter: { title: "Aaryan Singh · Software engineer", description, card: "summary_large_image" },
}

const stats = [
  { value: "1.34M", unit: "redirects/s", label: "rushort on a 4-vCPU VPS, loopback", href: "https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-30.md" },
  { value: "95.13%", unit: "Recall@10", label: "instantKV on LongMemEval-S", href: "https://instantkv.com/benchmarks/" },
  { value: String(contributions.totalMerged), unit: "merged PRs", label: `across ${contributions.repositoryCount} external open-source repositories`, href: "https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests" },
  { value: "$1M+", unit: "processed", label: "ReferRush, 2,300 merchants", href: "https://referrush.com" },
]

const COLORS = ["--c1", "--c2", "--c3", "--c4", "--c5", "--c6"]
const color = (i: number) => `var(${COLORS[i % COLORS.length]})`

const stickers = [
  { label: "rust ♥", color: "--c1", x: 84, y: 40, r: -8 },
  { label: "waterloo dropout", color: "--c2", x: 64, y: 52, r: 5 },
  { label: "hacked rice.edu @ 17", color: "--c3", x: 76, y: 68, r: -4 },
  { label: "assam → everywhere", color: "--c5", x: 60, y: 82, r: 7 },
]

const ticker = [
  "1.34M redirects/s",
  "95.13% Recall@10",
  `${contributions.totalMerged} merged PRs`,
  "$1M+ processed",
  "2,300 merchants",
  "30M+ customers reached",
  "8 essays on systems",
  "0 errors at p50",
]

const takes = [
  "SQLite is a perfectly good production database. Fight me.",
  "Every distributed system is a log with opinions.",
  "If it isn't benchmarked, it's a vibe.",
  "fsync() is a promise, and storage loves to break promises.",
  "The best agent memory is the one you can grep.",
  "Rewrite it in Rust, but only after you profile it.",
  "Ship the boring version first. Make it weird later.",
  "Retries without idempotency keys are just optimism.",
]

const fmt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-US"))

function Heatmap({ days }: { days: ContributionDay[] }) {
  const offset = days.length ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0
  return (
    <div className="heatmap-scroll">
      <div className="heatmap" role="img" aria-label="GitHub contributions over the last year">
        {Array.from({ length: offset }, (_, i) => (
          <span key={`pad-${i}`} className="hm-cell hm-pad" />
        ))}
        {days.map((d) => (
          <span key={d.date} className={`hm-cell hm-${d.level}`} title={`${d.count} on ${d.date}`} />
        ))}
      </div>
    </div>
  )
}

function Mega({ text }: { text: string }) {
  return (
    <span className="mega-word" aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden="true" style={{ ["--i" as string]: i }}>
          {ch}
        </span>
      ))}
    </span>
  )
}

export default async function HomePage() {
  const live = await getLiveStats()
  const langTotal = live.languages.reduce((s, l) => s + l.count, 0)

  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      person(),
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE,
        name: "Aaryan Singh",
        description,
        inLanguage: "en",
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE}/#page`,
        url: SITE,
        name: "Aaryan Singh · Software engineer",
        description,
        dateModified: profile.updated,
        isPartOf: { "@id": `${SITE}/#website` },
        mainEntity: { "@id": PERSON_ID },
        inLanguage: "en",
      },
      {
        "@type": "ItemList",
        name: "Software projects by Aaryan Singh",
        itemListElement: profile.projects.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "SoftwareSourceCode",
            name: p.name,
            codeRepository: p.url,
            description: p.description,
            programmingLanguage: p.stack.split(",")[0].trim(),
            author: { "@id": PERSON_ID },
          },
        })),
      },
    ],
  }

  return (
    <div className="home">
      <JsonLd data={structured} />

      <header className="hero">
        <div className="hero-top">
          <span className="status-pill">
            <span className="dot dot-live" aria-hidden="true" /> open to founding-engineer &amp; systems roles
          </span>
          <PaletteShuffle />
        </div>
        <h1 className="mega">
          <Mega text="Aaryan" />
          <span className="mega-accent">Singh.</span>
        </h1>
        <p className="hero-sub">
          Software engineer building <mark className="hl hl-1">agent memory</mark> and{" "}
          <mark className="hl hl-2">runtimes</mark> in Rust. Founding engineer at{" "}
          <a href="https://referrush.com" rel="noopener">ReferRush</a>, early at{" "}
          <a href="https://extraordinary.com" rel="noopener">Extraordinary</a>, Waterloo dropout, based in Assam, India.
        </p>
        <p className="hero-sub hero-now">
          Right now: <a href="https://instantkv.com" rel="noopener">instantKV</a> (memory for agents) and{" "}
          <a href="https://github.com/maskjelly/morse" rel="noopener">Morse</a> (a runtime that survives disconnects).{" "}
          <Link href="/now">More on now →</Link>
        </p>
        <div className="hero-cta">
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>Say hi ↗</a>
          <a className="btn" href="https://github.com/maskjelly" rel="noopener">GitHub</a>
          <a className="btn" href="https://x.com/aaryantwt" rel="noopener">X</a>
          <Link className="btn" href="/resume">Résumé</Link>
        </div>
        <Stickers items={stickers} />
      </header>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i}>
              {t} <b>✦</b>
            </span>
          ))}
        </div>
      </div>

      <section className="block" aria-labelledby="live-title">
        <div className="block-head">
          <h2 id="live-title" className="block-title">
            <span className="block-num">01</span> Live board
          </h2>
          <p className="block-meta">
            <span className="dot dot-live" aria-hidden="true" /> GitHub synced <RelativeTime iso={live.fetchedAt} />
          </p>
        </div>

        <div className="bento">
          <article className="card card-wide" style={{ background: color(2) }}>
            <div className="card-kicker">github / contributions</div>
            {live.contributions ? (
              <>
                <div className="card-row">
                  <div>
                    <div className="big-num">{fmt(live.contributions.total)}</div>
                    <div className="card-label">contributions in the last year</div>
                  </div>
                  <div className="mini-stats">
                    <div><b>{live.contributions.streak}</b> day streak</div>
                    {live.contributions.best && (
                      <div><b>{live.contributions.best.count}</b> best day</div>
                    )}
                  </div>
                </div>
                <Heatmap days={live.contributions.days} />
              </>
            ) : (
              <p className="card-label">Contribution graph is taking a nap. <a href="https://github.com/maskjelly">See it on GitHub</a>.</p>
            )}
          </article>

          <article className="card" style={{ background: color(0) }}>
            <div className="card-kicker">rushort / telemetry</div>
            <RushortPulse />
            <Link href="/telemetry" className="card-link">open dashboard →</Link>
          </article>

          <article className="card" style={{ background: color(1) }}>
            <div className="card-kicker">assam, india / IST</div>
            <LocalClock />
          </article>

          <article className="card" style={{ background: color(3) }}>
            <div className="card-kicker">github / profile</div>
            <dl className="trio">
              {(
                [
                  ["stars", live.stars],
                  ["repos", live.publicRepos],
                  ["followers", live.followers],
                ] as const
              )
                .filter(([, v]) => v != null)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{fmt(v)}</dd>
                  </div>
                ))}
            </dl>
            <a href={`https://github.com/${GITHUB_USER}`} className="card-link" rel="noopener">@{GITHUB_USER} →</a>
          </article>

          <article className="card" style={{ background: color(4) }}>
            <div className="card-kicker">latest push</div>
            {live.latestPush ? (
              <>
                <a className="push-repo" href={`https://github.com/${live.latestPush.repo}`} rel="noopener">
                  {live.latestPush.repo.replace(`${GITHUB_USER}/`, "")}
                </a>
                {live.latestPush.message && <p className="push-msg">“{live.latestPush.message}”</p>}
                <div className="card-foot">
                  <RelativeTime iso={live.latestPush.at} />
                </div>
              </>
            ) : (
              <p className="card-label">Probably pushing something right now.</p>
            )}
          </article>

          <article className="card" style={{ background: color(5) }}>
            <div className="card-kicker">languages / own repos</div>
            {live.languages.length ? (
              <>
                <div className="lang-bar">
                  {live.languages.map((l, i) => (
                    <span key={l.name} style={{ flexGrow: l.count, background: color(i) }} title={`${l.name}: ${l.count}`} />
                  ))}
                </div>
                <ul className="lang-list">
                  {live.languages.map((l) => (
                    <li key={l.name}>
                      <span>{l.name}</span>
                      <span>{Math.round((l.count / langTotal) * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="big-num">Rust</p>
                <p className="card-label">…mostly. Some TypeScript when nobody is looking.</p>
              </>
            )}
          </article>

          <article className="card card-wide" style={{ background: "var(--bg-elev)", color: "var(--fg)" }}>
            <div className="card-kicker">hot takes / served fresh</div>
            <HotTakes takes={takes} />
          </article>
        </div>
      </section>

      <section className="block" aria-labelledby="receipts-title">
        <div className="block-head">
          <h2 id="receipts-title" className="block-title">
            <span className="block-num">02</span> Receipts
          </h2>
        </div>
        <div className="receipts">
          {stats.map((s) => (
            <a key={s.label} href={s.href} rel="noopener" className="receipt">
              <span className="receipt-value">{s.value}</span>
              <span className="receipt-unit">{s.unit}</span>
              <span className="receipt-label">{s.label}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="block" id="projects" aria-labelledby="projects-title">
        <div className="block-head">
          <h2 id="projects-title" className="block-title">
            <span className="block-num">03</span> Things I build
          </h2>
        </div>
        <ul className="projects">
          {projectItems.map((p, i) => {
            const inner = (
              <>
                <span className="project-top">
                  <span className="project-idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="project-arrow" aria-hidden="true">↗</span>
                </span>
                <span className="project-title">{p.title}</span>
                <span className="project-desc">{p.description}</span>
              </>
            )
            return (
              <li key={p.title} style={{ ["--hover" as string]: color(i) }}>
                {p.href?.startsWith("/") ? (
                  <Link href={p.href} className="project">{inner}</Link>
                ) : (
                  <a href={p.href} className="project" rel="noopener">{inner}</a>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <div className="split">
        <section className="block" id="work" aria-labelledby="work-title">
          <div className="block-head">
            <h2 id="work-title" className="block-title">
              <span className="block-num">04</span> Work
            </h2>
          </div>
          <ol className="timeline">
            {workItems.map((w) => {
              const inner = (
                <>
                  <span className="tl-period">{w.period}</span>
                  <span className="tl-title">
                    {w.title} <span className="tl-role">/ {w.role}</span>
                  </span>
                  <span className="tl-desc">{w.description}</span>
                </>
              )
              return (
                <li key={w.title}>
                  {w.href?.startsWith("/") ? (
                    <Link href={w.href} className="tl-item">{inner}</Link>
                  ) : w.href ? (
                    <a href={w.href} className="tl-item" rel="noopener">{inner}</a>
                  ) : (
                    <div className="tl-item">{inner}</div>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <section className="block" aria-labelledby="short-version">
          <div className="block-head">
            <h2 id="short-version" className="block-title">
              <span className="block-num">05</span> Lore
            </h2>
          </div>
          <ul className="lore">
            {profile.highlights.map((h, i) => (
              <li key={h.title} style={{ ["--mark" as string]: color(i + 1) }}>
                <span className="lore-title">
                  {"url" in h && h.url ? <a href={h.url} rel="noopener">{h.title}</a> : h.title}
                </span>
                <span className="lore-desc">{h.detail}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="block" id="open-source" aria-labelledby="oss-title">
        <div className="block-head">
          <h2 id="oss-title" className="block-title">
            <span className="block-num">06</span> Open source
          </h2>
          <p className="block-meta">
            {contributions.totalMerged} merged PRs · {contributions.repositoryCount} repos ·{" "}
            <a href="https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests" rel="noopener">
              see all
            </a>
          </p>
        </div>
        <ul className="chips">
          {contributions.repositories.map((c, i) => (
            <li key={c.repository}>
              <a href={c.mergedUrl} className="chip" rel="noopener" style={{ ["--hover" as string]: color(i) }}>
                <span className="chip-name">{c.displayName}</span>
                <span className="chip-meta">
                  {c.merged} merged{c.stars ? ` · ★ ${Intl.NumberFormat("en", { notation: "compact" }).format(c.stars)}` : ""}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="block" id="writing" aria-labelledby="writing-title">
        <div className="block-head">
          <h2 id="writing-title" className="block-title">
            <span className="block-num">07</span> Writing
          </h2>
          <p className="block-meta">
            <Link href="/blog">all essays →</Link>
          </p>
        </div>
        <ul className="essays">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="essay">
                <span className="essay-title">{p.title}</span>
                <span className="essay-meta">
                  {p.readingTime} · {p.date}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="outro" aria-labelledby="elsewhere">
        <h2 id="elsewhere" className="outro-title">
          Let’s build <em>something</em> weird &amp; fast.
        </h2>
        <a className="outro-mail" href={`mailto:${profile.email}`}>{profile.email} ↗</a>
        <p className="outro-links">
          <a href="https://github.com/maskjelly" rel="noopener">GitHub</a>
          <a href="https://x.com/aaryantwt" rel="noopener">X</a>
          <Link href="/uses">Uses</Link>
          <a href="/Aaryan-Singh-Resume.pdf">PDF résumé</a>
          <a href="/feed.xml">RSS</a>
          <Link href="/xp">Secret XP desktop</Link>
        </p>
      </section>
    </div>
  )
}
