import Link from "next/link"
import type { Metadata } from "next"
import profile from "@/lib/resume-data.json"
import contributions from "@/lib/contributions.json"
import { projectItems } from "@/lib/project-items"
import { posts } from "@/lib/posts"
import { JsonLd, person, PERSON_ID, SITE } from "@/lib/structured-data"
import { getLiveStats, GITHUB_USER, type ContributionDay } from "@/lib/live"
import { LocalClock, RelativeTime, RushortPulse } from "@/components/live-widgets"

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
    <div className="head">
      <span className="head-num" aria-hidden="true">{ROMAN[n - 1]}</span>
      <h2 id={id} className="head-title">{title}</h2>
      {children && <p className="head-meta">{children}</p>}
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

      <header className="hero">
        <p className="hero-kicker">Software engineer <i>·</i> Rust <i>·</i> Agent memory &amp; runtimes</p>
        <h1 className="hero-name">
          <span>Aaryan</span> <span>Singh</span>
        </h1>
        <p className="hero-lede">
          I build memory and runtimes for machines, in Rust, from a quiet corner of Assam.
        </p>
        <p className="hero-now">
          Presently: <a href="https://instantkv.com" rel="noopener">instantKV</a>, memory for agents, and{" "}
          <a href="https://github.com/maskjelly/morse" rel="noopener">Morse</a>, a runtime that survives disconnects.{" "}
          <Link href="/now">More →</Link>
        </p>
        <div className="hero-cta">
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>Correspond</a>
          <a className="btn" href="https://github.com/maskjelly" rel="noopener">GitHub</a>
          <a className="btn" href="https://x.com/aaryantwt" rel="noopener">X</a>
          <Link className="btn" href="/blog">Writings</Link>
        </div>
      </header>

      <section className="colonnade-wrap" aria-labelledby="pillars-title">
        <Head n={1} id="pillars-title" title="Four pillars" />
        <div className="colonnade">
          {stats.map((s) => (
            <a key={s.label} href={s.href} rel="noopener" className="pillar">
              <span className="pillar-cap" aria-hidden="true" />
              <span className="pillar-shaft">
                <span className="pillar-value">{s.value}</span>
                <span className="pillar-unit">{s.unit}</span>
                <span className="pillar-label">{s.label}</span>
              </span>
              <span className="pillar-base" aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="stylobate" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className="slab" aria-labelledby="live-title">
        <div className="slab-inner">
          <Head n={2} id="live-title" title="The living ledger">
            <span className="dot dot-live" aria-hidden="true" /> GitHub synced <RelativeTime iso={live.fetchedAt} />
          </Head>

          <div className="ledger-top">
            <div className="ledger-contrib">
              <div className="label">Contributions, past year</div>
              {live.contributions ? (
                <>
                  <div className="figure">{fmt(live.contributions.total)}</div>
                  <dl className="pairs">
                    <div><dt>Current streak</dt><dd>{live.contributions.streak} days</dd></div>
                    {live.contributions.best && (
                      <div><dt>Finest day</dt><dd>{live.contributions.best.count}</dd></div>
                    )}
                  </dl>
                  <Heatmap days={live.contributions.days} />
                </>
              ) : (
                <p className="note">The graph is resting. <a href="https://github.com/maskjelly">See it on GitHub</a>.</p>
              )}
            </div>
            <div className="arch">
              <div className="label">Assam, India · IST</div>
              <LocalClock />
            </div>
          </div>

          <div className="ledger-row">
            <div className="cell">
              <div className="label">rushort telemetry</div>
              <RushortPulse />
              <Link href="/telemetry" className="text-link">Open dashboard</Link>
            </div>

            <div className="cell">
              <div className="label">GitHub</div>
              <dl className="pairs pairs-col">
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
              <a href={`https://github.com/${GITHUB_USER}`} className="text-link" rel="noopener">@{GITHUB_USER}</a>
            </div>

            <div className="cell">
              <div className="label">Contributing upstream</div>
              <ul className="rows">
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
                className="text-link"
                rel="noopener"
              >
                All {contributions.totalMerged} merged
              </a>
            </div>

            <div className="cell">
              <div className="label">Languages</div>
              {live.languages.length ? (
                <>
                  <div className="lang-bar">
                    {live.languages.map((l, i) => (
                      <span key={l.name} style={{ flexGrow: l.count, opacity: 1 - i * 0.15 }} title={`${l.name}: ${l.count}`} />
                    ))}
                  </div>
                  <ul className="rows rows-plain">
                    {live.languages.map((l) => (
                      <li key={l.name}>
                        <span>{l.name}</span>
                        <small>{Math.round((l.count / langTotal) * 100)}%</small>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="note">Rust, mostly. TypeScript when required.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="projects" aria-labelledby="projects-title">
        <Head n={3} id="projects-title" title="The gallery" />
        <ul className="gallery">
          {projectItems.map((p, i) => {
            const inner = (
              <>
                <span className="niche-num">{ROMAN[i]}</span>
                <span className="niche-title">{p.title}</span>
                <span className="niche-desc">{p.description}</span>
              </>
            )
            return (
              <li key={p.title}>
                {p.href?.startsWith("/") ? (
                  <Link href={p.href} className="niche">{inner}</Link>
                ) : (
                  <a href={p.href} className="niche" rel="noopener">{inner}</a>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="block" aria-labelledby="creed-title">
        <Head n={4} id="creed-title" title="The creed" />
        <ol className="creed">
          {takes.map((t, i) => (
            <li key={t}>
              <span className="creed-num">{ROMAN[i]}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="block" aria-labelledby="folklore-title">
        <Head n={5} id="folklore-title" title="Folklore" />
        <ul className="folklore">
          {profile.highlights.slice(0, 3).map((h) => (
            <li key={h.title}>
              <span className="folk-title">
                {"url" in h && h.url ? <a href={h.url} rel="noopener">{h.title.trim()}</a> : h.title.trim()}
              </span>
              <span className="folk-desc">{h.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="block" id="writing" aria-labelledby="writing-title">
        <Head n={6} id="writing-title" title="Writings">
          <Link href="/blog">All essays</Link>
        </Head>
        <ul className="works works-essays">
          {posts.map((p, i) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="work">
                <span className="work-num">{ROMAN[i]}</span>
                <span className="work-title">{p.title}</span>
                <span className="work-desc">{p.readingTime} · {p.date}</span>
                <span className="work-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="outro" aria-labelledby="elsewhere">
        <span className="head-num" aria-hidden="true">VII</span>
        <h2 id="elsewhere" className="outro-title">Correspondence</h2>
        <a className="outro-mail" href={`mailto:${profile.email}`}>{profile.email}</a>
        <p className="outro-links">
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
