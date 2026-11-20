import Link from "next/link"
import type { Metadata } from "next"
import profile from "@/lib/resume-data.json"
import contributions from "@/lib/contributions.json"
import { projectItems } from "@/lib/project-items"
import { posts } from "@/lib/posts"
import { JsonLd, person, PERSON_ID, SITE } from "@/lib/structured-data"
import { getLiveStats, GITHUB_USER, type ContributionDay } from "@/lib/live"
import { getUsage, compact } from "@/lib/usage"
import { BASELINE, CACHE_SHARE, DAILY_MEAN } from "@/lib/token-estimate"
import { LocalClock, RelativeTime, TokenEstimate } from "@/components/live-widgets"
import "./home.css"

export const revalidate = 1800

const description =
  "Aaryan Singh is a software engineer from Assam, India, working remotely: founding engineer at ReferRush, early engineer at Extraordinary, University of Waterloo dropout, now building high-scale consumer products and trialing with LinkMe. 47 merged open-source pull requests, measured benchmarks and essays on systems."

export const metadata: Metadata = {
  title: { absolute: "Aaryan Singh · Remote software engineer from India, Rust and AI agents" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Aaryan Singh · Remote software engineer from India, Rust and AI agents",
    description,
    url: SITE,
    type: "profile",
    firstName: "Aaryan",
    lastName: "Singh",
    username: "maskjelly",
  },
  twitter: { title: "Aaryan Singh · Remote software engineer from India, Rust and AI agents", description, card: "summary_large_image" },
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

const num = (n: number) => String(n).padStart(2, "0")

function Section({ n, id, title, wide, children }: { n: number; id?: string; title?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <section className={`cg-sec${wide ? " cg-wide" : ""}`} id={id} aria-labelledby={title ? `${id}-title` : undefined}>
      <span className="cg-num" aria-hidden="true">{num(n)}</span>
      <div className="cg-body">
        {title && <h2 id={`${id}-title`}>{title}</h2>}
        {children}
      </div>
    </section>
  )
}

export default async function HomePage() {
  const [live, usage] = await Promise.all([getLiveStats(), getUsage()])
  const usagePeak = usage ? Math.max(1, ...usage.days.map((d) => d.tokens)) : 1

  const langTotal = Math.max(1, live.languageTotal)

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
        name: "Aaryan Singh · Remote software engineer from India, Rust and AI agents",
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

      <section className="cg-sec cg-hero">
        <span className="cg-num" aria-hidden="true">01</span>
        <div className="cg-body">
          <h1>Aaryan Singh builds consumer products that have to hold up at scale.</h1>
          <p>
            I&rsquo;m a software engineer in Assam, working remotely. I care about products a lot of people use at
            once, and about the systems underneath that keep them fast. I like numbers that can be re-run, so nearly
            everything on this page links to the benchmark or the pull request behind it.
          </p>
          <p>
            Right now that means high-scale consumer work: I&rsquo;m trialing with LinkMe, the creator platform for
            consumers and businesses. Before that I built agent memory and runtimes in Rust, which are still in the
            projects below. <Link href="/now">What I&rsquo;m doing now</Link>.
          </p>
          <div className="cg-cta">
            <a className="cg-btn cg-btn-solid" href={`mailto:${profile.email}`}>Get in touch</a>
            <a className="cg-btn" href="https://github.com/maskjelly" rel="noopener">GitHub</a>
            <Link className="cg-btn" href="/blog">Read the essays</Link>
          </div>
        </div>
      </section>

      <section className="cg-sec cg-wide" aria-label="Measured results">
        <span className="cg-num" aria-hidden="true">02</span>
        <div className="cg-body">
          <div className="cg-wall">
            {stats.map((s) => (
              <a key={s.label} href={s.href} rel="noopener" className="cg-stat">
                <span className="cg-stat-value">{s.value}</span>
                <span className="cg-stat-unit">{s.unit}</span>
                <span className="cg-stat-label">{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Section n={3} id="live" title="Live from GitHub" wide>
        <p className="cg-lede">
          Pulled from my public profile and refreshed every half hour. Synced <RelativeTime iso={live.fetchedAt} />.
        </p>

        <div className="cg-card">
          <div className="cg-card-head">
            <span>Contributions, past year</span>
            <a href={`https://github.com/${GITHUB_USER}`} rel="noopener">@{GITHUB_USER}</a>
          </div>
          {live.contributions ? (
            <>
              <dl className="cg-figures">
                <div><dt>Total</dt><dd>{fmt(live.contributions.total)}</dd></div>
                <div><dt>Current streak</dt><dd>{live.contributions.streak} days</dd></div>
                {live.contributions.best && <div><dt>Best day</dt><dd>{live.contributions.best.count}</dd></div>}
                {live.stars != null && <div><dt>Stars</dt><dd>{fmt(live.stars)}</dd></div>}
                {live.publicRepos != null && <div><dt>Repositories</dt><dd>{fmt(live.publicRepos)}</dd></div>}
                {live.followers != null && <div><dt>Followers</dt><dd>{fmt(live.followers)}</dd></div>}
              </dl>
              <Heatmap days={live.contributions.days} />
            </>
          ) : (
            <p className="cg-note">The graph is unavailable right now. <a href="https://github.com/maskjelly">See it on GitHub</a>.</p>
          )}
        </div>

        <div className="cg-pair">
          <div className="cg-card">
            <div className="cg-card-head">
              <span>Contributing upstream</span>
              <a
                href="https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests"
                rel="noopener"
              >
                All {contributions.totalMerged} merged
              </a>
            </div>
            <ol className="cg-board">
              {upstream.map((r, i) => (
                <li key={r.repo}>
                  <a href={r.href} rel="noopener">
                    <span className="cg-board-n">{i + 1}</span>
                    <span className="cg-board-name">{r.name}</span>
                    <span className="cg-board-meta">{r.at ? <RelativeTime iso={r.at} /> : r.note}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>

          <div className="cg-card">
            <div className="cg-card-head">
              <span>Languages</span>
              <span>by repository</span>
            </div>
            {live.languages.length ? (
              <ol className="cg-board">
                {live.languages.map((l, i) => {
                  const pct = Math.round((l.count / langTotal) * 100)
                  return (
                    <li key={l.name}>
                      <span>
                        <span className="cg-board-n">{i + 1}</span>
                        <span className="cg-board-name">{l.name}</span>
                        <span className="cg-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span>
                        <span className="cg-board-meta">{pct}%</span>
                      </span>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="cg-note">Rust, mostly. TypeScript when required.</p>
            )}
          </div>
        </div>

        <div className="cg-pair">
          {usage ? (
            <div className="cg-card">
              <div className="cg-card-head">
                <span>Token spend</span>
                <span>updated <RelativeTime iso={usage.updatedAt} /></span>
              </div>
              <dl className="cg-figures cg-figures-3">
                <div><dt>Today</dt><dd>{compact(usage.today.tokens)}</dd></div>
                <div><dt>Last 30 days</dt><dd>{compact(usage.last30.tokens)}</dd></div>
                <div><dt>API price, 30 days</dt><dd>${fmt(Math.round(usage.last30.cost))}</dd></div>
              </dl>
              <div className="cg-cols" role="img" aria-label="Tokens per day over the last 30 days">
                {usage.days.map((d) => (
                  <i key={d.date} style={{ height: `${Math.max(2, (d.tokens / usagePeak) * 100)}%` }} title={`${compact(d.tokens)} tokens on ${d.date}`} />
                ))}
              </div>
              <p className="cg-foot">
                {usage.agents.length
                  ? usage.agents.map((a) => `${a.name} ${Math.round((a.tokens / Math.max(1, usage.last30.tokens)) * 100)}%`).join(" · ")
                  : "Claude Code and Codex"}
                {usage.topModel ? ` · mostly ${usage.topModel}` : ""}
              </p>
            </div>
          ) : (
            <div className="cg-card">
              <div className="cg-card-head">
                <span>Token spend</span>
                <span>estimate</span>
              </div>
              <TokenEstimate />
              <p className="cg-foot">
                Modelled on my last {BASELINE.days} days in Claude Code and Codex: {compact(BASELINE.processed)} tokens,
                about {compact(DAILY_MEAN)} a day, {Math.round(CACHE_SHARE * 100)}% of it cache reads,{" "}
                {compact(BASELINE.output)} written out.
              </p>
            </div>
          )}
          <div className="cg-card">
            <div className="cg-card-head">
              <span>Local time</span>
              <span>Assam · IST</span>
            </div>
            <LocalClock />
          </div>
        </div>
      </Section>

      <Section n={4} id="projects" title="Things I&rsquo;ve built" wide>
        <ul className="cg-list">
          {projectItems.map((p) => {
            const inner = (
              <>
                <span className="cg-list-title">{p.title}</span>
                <span className="cg-list-desc">{p.description}</span>
                <span className="cg-list-arrow" aria-hidden="true">→</span>
              </>
            )
            return (
              <li key={p.title}>
                {p.href?.startsWith("/") ? (
                  <Link href={p.href}>{inner}</Link>
                ) : (
                  <a href={p.href} rel="noopener">{inner}</a>
                )}
              </li>
            )
          })}
        </ul>
      </Section>

      <Section n={5} id="beliefs" title="What I believe">
        <ul className="cg-beliefs">
          {takes.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>

      <Section n={6} id="stories" title="A few stories">
        <dl className="cg-stories">
          {profile.highlights.slice(0, 3).map((h) => (
            <div key={h.title}>
              <dt>{"url" in h && h.url ? <a href={h.url} rel="noopener">{h.title.trim()}</a> : h.title.trim()}</dt>
              <dd>{h.detail}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <section className="cg-sec cg-wide cg-articles" id="writing" aria-labelledby="writing-title">
        <span className="cg-num" aria-hidden="true">07</span>
        <div className="cg-body">
          <div className="cg-articles-head">
            <h2 id="writing-title">Writing</h2>
            <Link href="/blog" className="cg-btn">All essays</Link>
          </div>
          <ul className="cg-reel">
            {posts.map((p, i) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`}>
                  <span className={`cg-cover cg-cover-${i % 4}`} aria-hidden="true"><i /><b /></span>
                  <span className="cg-reel-title">{p.title}</span>
                  <span className="cg-reel-meta">{p.date} · {p.readingTime}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Section n={8} id="contact" title="Say hello">
        <p>
          The fastest way to reach me is email: <a href={`mailto:${profile.email}`}>{profile.email}</a>. I read
          everything, and I like hearing about storage bugs.
        </p>
        <p className="cg-links">
          <a href="https://github.com/maskjelly" rel="noopener">GitHub</a>
          <a href="https://x.com/aaryantwt" rel="noopener">X</a>
          <Link href="/uses">Uses</Link>
          <Link href="/resume">Résumé</Link>
          <a href="/feed.xml">RSS</a>
          <Link href="/xp">XP desktop</Link>
        </p>
      </Section>
    </div>
  )
}
