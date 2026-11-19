import { Fragment } from "react"
import Link from "next/link"
import type { Metadata } from "next"
import profile from "@/lib/resume-data.json"
import contributions from "@/lib/contributions.json"
import { projectItems } from "@/lib/project-items"
import { posts } from "@/lib/posts"
import { JsonLd, person, PERSON_ID, SITE } from "@/lib/structured-data"
import { getLiveStats, GITHUB_USER, type ContributionDay } from "@/lib/live"
import { LocalClock, RelativeTime, RushortPulse } from "@/components/live-widgets"
import "./home.css"

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
  { value: String(posts.length), unit: "essays", label: "on storage, consensus and things that lie", href: "/blog" },
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

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"]

function Head({ n, id, title, children }: { n: number; id: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mo-head">
      <span className="mo-head-num" aria-hidden="true">{ROMAN[n - 1]}</span>
      <h2 id={id}>{title}</h2>
      {children && <p className="mo-head-meta">{children}</p>}
    </div>
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

      <header className="mo-hero">
        <div className="mo-hero-copy">
          <p className="mo-kicker">Rust <i>·</i> Agent memory <i>·</i> Runtimes</p>
          <h1 className="mo-name">
            <span>Aaryan</span>
            <span>Singh</span>
          </h1>
          <p className="mo-lede">I build memory and runtimes for machines, in Rust, from Assam.</p>
          <p className="mo-now">
            Presently: <a href="https://instantkv.com" rel="noopener">instantKV</a>, memory for agents, and{" "}
            <a href="https://github.com/maskjelly/morse" rel="noopener">Morse</a>, a runtime that survives disconnects.{" "}
            <Link href="/now">More →</Link>
          </p>
          <div className="mo-cta">
            <a className="mo-btn mo-btn-solid" href={`mailto:${profile.email}`}>Correspond</a>
            <a className="mo-btn" href="https://github.com/maskjelly" rel="noopener">GitHub</a>
            <Link className="mo-btn" href="/blog">Writings</Link>
          </div>
        </div>
        <div className="mo-hero-figure" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/classical/head.webp" alt="" width={1074} height={1568} fetchPriority="high" />
        </div>
        <div className="mo-frieze" aria-hidden="true">
          <span className="mo-meander" />
          <span className="mo-frieze-text">MMXXVI</span>
          <span className="mo-meander" />
        </div>
      </header>

      <section className="mo-temple" aria-labelledby="pillars-title">
        <div className="mo-pediment" aria-hidden="true"><span /></div>
        <div className="mo-entablature">
          <h2 id="pillars-title">Four pillars</h2>
        </div>
        <div className="mo-colonnade">
          <span className="mo-column" aria-hidden="true" />
          {stats.map((s, i) => (
            <Fragment key={s.label}>
              <a href={s.href} rel="noopener" className="mo-bay">
                <span className="mo-bay-num">{ROMAN[i]}</span>
                <span className="mo-bay-value">{s.value}</span>
                <span className="mo-bay-unit">{s.unit}</span>
                <span className="mo-bay-label">{s.label}</span>
              </a>
              <span className="mo-column" aria-hidden="true" />
            </Fragment>
          ))}
        </div>
        <div className="mo-steps" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className="mo-section mo-ledger" aria-labelledby="live-title">
        <Head n={2} id="live-title" title="The living ledger">
          <span className="dot dot-live" aria-hidden="true" /> GitHub synced <RelativeTime iso={live.fetchedAt} />
        </Head>

        <div className="mo-ledger-grid">
          <div className="mo-panel mo-panel-contrib">
            <div className="mo-label">Contributions, past year</div>
            {live.contributions ? (
              <>
                <div className="mo-figure">{fmt(live.contributions.total)}</div>
                <dl className="mo-pairs">
                  <div><dt>Current streak</dt><dd>{live.contributions.streak} days</dd></div>
                  {live.contributions.best && (
                    <div><dt>Finest day</dt><dd>{live.contributions.best.count}</dd></div>
                  )}
                </dl>
                <Heatmap days={live.contributions.days} />
              </>
            ) : (
              <p className="mo-note">The graph is resting. <a href="https://github.com/maskjelly">See it on GitHub</a>.</p>
            )}
          </div>

          <div className="mo-panel mo-panel-clock">
            <div className="mo-arch">
              <div className="mo-label">Assam · IST</div>
              <LocalClock />
            </div>
          </div>

          <div className="mo-panel">
            <div className="mo-label">rushort telemetry</div>
            <RushortPulse />
            <Link href="/telemetry" className="mo-link">Open dashboard</Link>
          </div>

          <div className="mo-panel">
            <div className="mo-label">GitHub</div>
            <dl className="mo-pairs mo-pairs-col">
              {(
                [
                  ["Stars", live.stars],
                  ["Repositories", live.publicRepos],
                  ["Followers", live.followers],
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
            <a href={`https://github.com/${GITHUB_USER}`} className="mo-link" rel="noopener">@{GITHUB_USER}</a>
          </div>

          <div className="mo-panel">
            <div className="mo-label">Contributing upstream</div>
            <ul className="mo-rows">
              {upstream.map((r) => (
                <li key={r.repo}>
                  <a href={r.href} rel="noopener">
                    <span>{r.name}</span>
                    <small>{r.at ? <RelativeTime iso={r.at} /> : r.note}</small>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests"
              className="mo-link"
              rel="noopener"
            >
              All {contributions.totalMerged} merged
            </a>
          </div>

          <div className="mo-panel">
            <div className="mo-label">Languages</div>
            {live.languages.length ? (
              <>
                <div className="mo-langbar">
                  {live.languages.map((l, i) => (
                    <span key={l.name} style={{ flexGrow: l.count, opacity: 1 - i * 0.15 }} title={`${l.name}: ${l.count}`} />
                  ))}
                </div>
                <ul className="mo-rows">
                  {live.languages.map((l) => (
                    <li key={l.name}>
                      <span>
                        <span>{l.name}</span>
                        <small>{Math.round((l.count / langTotal) * 100)}%</small>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mo-note">Rust, mostly. TypeScript when required.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mo-band" aria-label="A maxim">
        <blockquote>
          <p>If it isn&rsquo;t benchmarked, it&rsquo;s a vibe.</p>
        </blockquote>
      </section>

      <section className="mo-section mo-gallery" id="projects" aria-labelledby="projects-title">
        <div className="mo-gallery-aside">
          <Head n={3} id="projects-title" title="The gallery" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/classical/column.webp" alt="" width={845} height={1593} loading="lazy" />
        </div>
        <ol className="mo-works">
          {projectItems.map((p, i) => {
            const inner = (
              <>
                <span className="mo-work-num">{ROMAN[i]}</span>
                <span className="mo-work-title">{p.title}</span>
                <span className="mo-work-desc">{p.description}</span>
                <span className="mo-work-arrow" aria-hidden="true">→</span>
              </>
            )
            return (
              <li key={p.title}>
                {p.href?.startsWith("/") ? (
                  <Link href={p.href} className="mo-work">{inner}</Link>
                ) : (
                  <a href={p.href} className="mo-work" rel="noopener">{inner}</a>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      <section className="mo-section mo-creed" aria-labelledby="creed-title">
        <div className="mo-creed-bust" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/classical/herodotos.webp" alt="" width={900} height={1626} loading="lazy" />
        </div>
        <div className="mo-creed-body">
          <Head n={4} id="creed-title" title="The creed" />
          <ol className="mo-maxims">
            {takes.map((t, i) => (
              <li key={t}>
                <span>{ROMAN[i]}</span>
                <p>{t}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mo-section mo-folklore" aria-labelledby="folklore-title">
        <Head n={5} id="folklore-title" title="Folklore" />
        <ul className="mo-tales">
          {profile.highlights.slice(0, 3).map((h, i) => (
            <li key={h.title}>
              <span className="mo-tale-num">{ROMAN[i]}</span>
              <span className="mo-tale-title">
                {"url" in h && h.url ? <a href={h.url} rel="noopener">{h.title.trim()}</a> : h.title.trim()}
              </span>
              <span className="mo-tale-desc">{h.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mo-section mo-writings" id="writing" aria-labelledby="writing-title">
        <Head n={6} id="writing-title" title="Writings">
          <Link href="/blog">All essays</Link>
        </Head>
        <ol className="mo-works mo-works-wide">
          {posts.map((p, i) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="mo-work">
                <span className="mo-work-num">{ROMAN[i]}</span>
                <span className="mo-work-title">{p.title}</span>
                <span className="mo-work-desc">{p.readingTime} · {p.date}</span>
                <span className="mo-work-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mo-outro" aria-labelledby="elsewhere">
        <span className="mo-head-num" aria-hidden="true">VII</span>
        <h2 id="elsewhere">Correspondence</h2>
        <a className="mo-mail" href={`mailto:${profile.email}`}>{profile.email}</a>
        <p className="mo-outro-links">
          <a href="https://github.com/maskjelly" rel="noopener">GitHub</a>
          <a href="https://x.com/aaryantwt" rel="noopener">X</a>
          <Link href="/uses">Uses</Link>
          <Link href="/resume">Résumé</Link>
          <a href="/feed.xml">RSS</a>
          <Link href="/xp">XP desktop</Link>
        </p>
      </section>
    </div>
  )
}
