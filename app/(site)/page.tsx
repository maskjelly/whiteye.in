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
const tint = (i: number) => ({ ["--c" as string]: color(i) })

const stickers = [
  { label: "rust ♥", color: "--c1", x: 79, y: 36, r: -8 },
  { label: "waterloo dropout", color: "--c4", x: 58, y: 57, r: 5 },
  { label: "hacked rice.edu @ 17", color: "--c3", x: 61, y: 72, r: -4 },
  { label: "assam → everywhere", color: "--c6", x: 56, y: 86, r: 6 },
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

function Smile({ text }: { text: string }) {
  const id = `ring-${text.replace(/[^a-z]+/gi, "-")}`
  return (
    <svg className="smile" viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <path id={id} d="M80,80 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" />
      </defs>
      <g className="smile-ring">
        <text>
          <textPath href={`#${id}`} textLength="400">{text}</textPath>
        </text>
      </g>
      <g className="smile-face">
        <circle cx="80" cy="80" r="46" fill="var(--c2)" stroke="currentColor" strokeWidth="3" />
        <ellipse className="smile-eye" cx="65" cy="71" rx="5" ry="7.5" fill="currentColor" />
        <ellipse className="smile-eye" cx="95" cy="71" rx="5" ry="7.5" fill="currentColor" />
        <circle cx="57" cy="88" r="6" fill="var(--c6)" opacity="0.8" />
        <circle cx="103" cy="88" r="6" fill="var(--c6)" opacity="0.8" />
        <path d="M60 90 Q80 112 100 90" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
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

  // Recent upstream activity first, then the merged-PR credits, without duplicates.
  const upstream: { repo: string; name: string; href: string; at?: string; note?: string }[] = live.recentUpstream.map((r) => ({
    repo: r.repo.toLowerCase(),
    name: r.repo.split("/")[1],
    href: `https://github.com/${r.repo}/pulls?q=is%3Apr+author%3A${GITHUB_USER}`,
    at: r.at,
  }))
  for (const c of contributions.repositories) {
    if (upstream.length >= 6) break
    if (upstream.some((u) => u.repo === c.repository.toLowerCase())) continue
    upstream.push({ repo: c.repository.toLowerCase(), name: c.displayName, href: c.mergedUrl, note: `${c.merged} merged` })
  }

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
        <div className="hero-grid">
          <div>
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
          </div>
          <div className="hero-art">
            <Smile text="ship happy things ✺ rust ✺ systems ✺ agents ✺ " />
          </div>
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
            <span className="block-num" style={tint(0)}>01</span> Live board
          </h2>
          <p className="block-meta">
            <span className="dot dot-live" aria-hidden="true" /> GitHub synced <RelativeTime iso={live.fetchedAt} />
          </p>
        </div>

        <div className="bento">
          <article className="card card-wide tinted" style={tint(2)}>
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

          <article className="card tinted" style={tint(0)}>
            <div className="card-kicker">rushort / telemetry</div>
            <RushortPulse />
            <Link href="/telemetry" className="card-link">open dashboard →</Link>
          </article>

          <article className="card tinted" style={tint(1)}>
            <div className="card-kicker">assam, india / IST</div>
            <LocalClock />
          </article>

          <article className="card tinted" style={tint(3)}>
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

          <article className="card card-half tinted" style={tint(4)}>
            <div className="card-kicker">contributing to / upstream</div>
            <ul className="contrib-list">
              {upstream.map((r) => (
                <li key={r.repo}>
                  <a href={r.href} rel="noopener">
                    {r.name}
                    <small>{r.at ? <RelativeTime iso={r.at} /> : r.note}</small>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests"
              className="card-link"
              rel="noopener"
            >
              all {contributions.totalMerged} merged PRs →
            </a>
          </article>

          <article className="card card-half tinted" style={tint(5)}>
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

          <article className="card card-half tinted" style={tint(1)}>
            <div className="card-kicker">hot takes / served fresh</div>
            <HotTakes takes={takes} />
          </article>
        </div>
      </section>

      <section className="block" aria-labelledby="receipts-title">
        <div className="block-head">
          <h2 id="receipts-title" className="block-title">
            <span className="block-num" style={tint(1)}>02</span> Receipts
          </h2>
        </div>
        <div className="receipts">
          {stats.map((s, i) => (
            <a key={s.label} href={s.href} rel="noopener" className="receipt tinted" style={tint(i)}>
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
            <span className="block-num" style={tint(2)}>03</span> Things I build
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
              <li key={p.title} style={tint(i)}>
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
              <span className="block-num" style={tint(3)}>04</span> Work
            </h2>
          </div>
          <ol className="timeline">
            {workItems.map((w, i) => {
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
                <li key={w.title} style={tint(i)}>
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
              <span className="block-num" style={tint(4)}>05</span> Lore
            </h2>
          </div>
          <ul className="lore">
            {profile.highlights.map((h, i) => (
              <li key={h.title} style={tint(i + 1)}>
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
            <span className="block-num" style={tint(5)}>06</span> Open source
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
              <a href={c.mergedUrl} className="chip" rel="noopener" style={tint(i)}>
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
            <span className="block-num" style={tint(6)}>07</span> Writing
          </h2>
          <p className="block-meta">
            <Link href="/blog">all essays →</Link>
          </p>
        </div>
        <ul className="essays">
          {posts.map((p, i) => (
            <li key={p.slug} style={tint(i)}>
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
        <div>
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
        </div>
        <div className="outro-art">
          <Smile text="say hi ✺ say hi ✺ say hi ✺ say hi ✺ " />
        </div>
      </section>
    </div>
  )
}
