import Link from "next/link"
import type { Metadata } from "next"
import profile from "@/lib/resume-data.json"
import contributions from "@/lib/contributions.json"
import { projectItems } from "@/lib/project-items"
import { workItems } from "@/lib/work-items"
import { posts } from "@/lib/posts"
import { JsonLd, person, PERSON_ID, SITE } from "@/lib/structured-data"

export const dynamic = "force-static"

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

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  )
}

const stats = [
  { value: "1.34M", label: "redirects/s, rushort on a 4-vCPU VPS", href: "https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-30.md" },
  { value: "95.13%", label: "Recall@10, instantKV on LongMemEval-S", href: "https://instantkv.com/benchmarks/" },
  { value: `${contributions.totalMerged}`, label: `merged PRs across ${contributions.repositoryCount} external repos`, href: "https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests" },
  { value: "$1M+", label: "processed by ReferRush, 2,300 merchants", href: "https://referrush.com" },
]

export default function HomePage() {
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
    <>
      <JsonLd data={structured} />

      <header className="home-hero stagger">
        <h1 className="home-title">Aaryan Singh</h1>
        <p className="home-tagline">Software engineer · AI agents, Rust systems, open source</p>
        <p className="home-lede">
          I was the founding engineer at <a href="https://referrush.com" rel="noopener">ReferRush</a>, built early
          infrastructure at <a href="https://extraordinary.com" rel="noopener">Extraordinary</a>, and now build
          local-first agent memory and runtimes in Rust. Waterloo dropout. Contributor to Atuin, Podman Desktop and
          eleven other repositories.
        </p>
        <div className="home-actions link-row">
          <a className="pill pill-primary" href={`mailto:${profile.email}`}>
            Email me
          </a>
          <a className="pill" href="https://github.com/maskjelly" rel="noopener">
            GitHub <Arrow />
          </a>
          <a className="pill" href="https://x.com/aaryantwt" rel="noopener">
            X <Arrow />
          </a>
          <Link className="pill" href="/resume">
            Résumé
          </Link>
        </div>
      </header>

      <section className="section-block" aria-labelledby="numbers">
        <h2 id="numbers" className="sr-only">Measured results</h2>
        <div className="stat-grid stagger">
          {stats.map((s) => (
            <a key={s.label} className="stat" href={s.href} rel="noopener">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </a>
          ))}
        </div>
        <p className="stat-note">
          Every number links to its measurement conditions. Throughput figures are controlled local runs, not public
          HTTPS capacity.
        </p>
      </section>

      <section className="section-block" aria-labelledby="now">
        <div className="section-heading">
          <h2 id="now" className="section-title">Now</h2>
          <Link href="/now" className="section-link">
            More <Arrow />
          </Link>
        </div>
        <div className="now-card">
          <p>
            <span className="pulse" aria-hidden="true" />
            Building <a href="https://instantkv.com" rel="noopener">instantKV</a>, local-first memory for agents in
            Rust, and <a href="https://github.com/maskjelly/morse" rel="noopener">Morse</a>, an agent runtime that
            keeps running when the client disconnects.
          </p>
          <p>Open to founding-engineer and systems roles. Based in Assam, India, working remotely.</p>
        </div>
      </section>

      <section className="section-block" aria-labelledby="short-version">
        <div className="section-heading">
          <h2 id="short-version" className="section-title">The short version</h2>
        </div>
        <ul className="highlight-list">
          {profile.highlights.map((h) => (
            <li key={h.title}>
              <p className="highlight-title">
                {"url" in h && h.url ? <a href={h.url} rel="noopener">{h.title}</a> : h.title}
              </p>
              <p className="highlight-detail">{h.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-block" id="projects" aria-labelledby="projects-title">
        <div className="section-heading">
          <h2 id="projects-title" className="section-title">Projects</h2>
          <Link href="/resume#projects" className="section-link">
            Details and benchmarks <Arrow />
          </Link>
        </div>
        <div className="project-grid">
          {projectItems.map((p) => {
            const stack = profile.projects.find((x) => x.name === p.title)?.stack
            const internal = p.href?.startsWith("/")
            const Card = (
              <>
                <div className="project-card-head">
                  <span className="project-card-title">{p.title}</span>
                  <span className="entry-arrow" aria-hidden="true">
                    <Arrow />
                  </span>
                </div>
                {stack && <span className="project-card-stack">{stack}</span>}
                <span className="project-card-desc">{p.description}</span>
              </>
            )
            return internal ? (
              <Link key={p.title} href={p.href!} className="project-card group">
                {Card}
              </Link>
            ) : (
              <a key={p.title} href={p.href} className="project-card group" rel="noopener">
                {Card}
              </a>
            )
          })}
        </div>
      </section>

      <section className="section-block" id="work" aria-labelledby="work-title">
        <div className="section-heading">
          <h2 id="work-title" className="section-title">Work</h2>
          <Link href="/resume" className="section-link">
            Full résumé <Arrow />
          </Link>
        </div>
        <div className="entry-list">
          {workItems.map((w) => {
            const body = (
              <>
                <div className="min-w-0">
                  <p className="entry-title">
                    {w.title} <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>· {w.role}</span>
                  </p>
                  <p className="entry-description">{w.description}</p>
                </div>
                {w.period && <span className="entry-meta">{w.period}</span>}
              </>
            )
            if (w.href?.startsWith("/")) {
              return (
                <Link key={w.title} href={w.href} className="entry-row">
                  {body}
                </Link>
              )
            }
            if (w.href) {
              return (
                <a key={w.title} href={w.href} className="entry-row" rel="noopener">
                  {body}
                </a>
              )
            }
            return (
              <div key={w.title} className="entry-row">
                {body}
              </div>
            )
          })}
        </div>
      </section>

      <section className="section-block" id="open-source" aria-labelledby="oss-title">
        <div className="section-heading">
          <h2 id="oss-title" className="section-title">Open source</h2>
          <a
            href="https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests"
            className="section-link"
            rel="noopener"
          >
            All merged PRs <Arrow />
          </a>
        </div>
        <ul className="oss-list">
          {contributions.repositories.map((c) => (
            <li key={c.repository}>
              <a href={c.mergedUrl} className="oss-row" rel="noopener">
                <span className="oss-name">
                  {c.displayName}
                  <span className="oss-detail">{c.detail}</span>
                </span>
                <span className="oss-stat">
                  {c.merged} merged · ★ {c.stars.toLocaleString("en-US")}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="stat-note">
          {contributions.totalMerged} merged pull requests across {contributions.repositoryCount} repositories, including{" "}
          27 in termlens. Stars checked {contributions.checked}.
        </p>
      </section>

      <section className="section-block" id="writing" aria-labelledby="writing-title">
        <div className="section-heading">
          <h2 id="writing-title" className="section-title">Writing</h2>
          <Link href="/blog" className="section-link">
            All essays <Arrow />
          </Link>
        </div>
        <div className="entry-list">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="entry-row">
              <span className="entry-name">{p.title}</span>
              <span className="entry-meta">{p.date}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block" aria-labelledby="elsewhere">
        <div className="section-heading">
          <h2 id="elsewhere" className="section-title">Elsewhere</h2>
        </div>
        <div className="link-row">
          <a className="pill" href={`mailto:${profile.email}`}>{profile.email}</a>
          <a className="pill" href="https://github.com/maskjelly" rel="noopener">github.com/maskjelly</a>
          <a className="pill" href="https://x.com/aaryantwt" rel="noopener">@aaryantwt</a>
          <Link className="pill" href="/uses">Uses</Link>
          <a className="pill" href="/Aaryan-Singh-Resume.pdf">Résumé PDF</a>
          <a className="pill" href="/feed.xml">RSS</a>
        </div>
      </section>
    </>
  )
}
