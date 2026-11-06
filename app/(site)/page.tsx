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

const stats = [
  { value: "1.34M redirects/s", label: "rushort on a 4-vCPU VPS, loopback", href: "https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-30.md" },
  { value: "95.13% Recall@10", label: "instantKV on LongMemEval-S", href: "https://instantkv.com/benchmarks/" },
  { value: `${contributions.totalMerged} merged PRs`, label: `across ${contributions.repositoryCount} external open-source repositories`, href: "https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests" },
  { value: "$1M+ processed", label: "ReferRush, 2,300 merchants", href: "https://referrush.com" },
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

      <header className="home-hero">
        <h1 className="home-title">Aaryan Singh</h1>
        <p className="home-tagline">Software engineer. AI agents, Rust systems, open source.</p>
        <p className="home-lede">
          I was the founding engineer at <a href="https://referrush.com" rel="noopener">ReferRush</a>, built early
          infrastructure at <a href="https://extraordinary.com" rel="noopener">Extraordinary</a>, and now build
          local-first agent memory and runtimes in Rust. Waterloo dropout. Based in Assam, India.
        </p>
        <p className="home-lede">
          Right now: <a href="https://instantkv.com" rel="noopener">instantKV</a>, memory for agents, and{" "}
          <a href="https://github.com/maskjelly/morse" rel="noopener">Morse</a>, an agent runtime that survives client
          disconnects. Open to founding-engineer and systems roles. <Link href="/now">More on now</Link>.
        </p>
        <p className="inline-links">
          <a href={`mailto:${profile.email}`}>Email</a>
          <a href="https://github.com/maskjelly" rel="noopener">GitHub</a>
          <a href="https://x.com/aaryantwt" rel="noopener">X</a>
          <Link href="/resume">Résumé</Link>
        </p>
      </header>

      <section className="section-block" aria-labelledby="numbers">
        <h2 id="numbers" className="section-title">Numbers</h2>
        <ul className="plain-list">
          {stats.map((s) => (
            <li key={s.label}>
              <a href={s.href} rel="noopener" className="row">
                <span className="row-title">{s.value}</span>
                <span className="row-desc">{s.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-block" aria-labelledby="short-version">
        <h2 id="short-version" className="section-title">Background</h2>
        <ul className="plain-list">
          {profile.highlights.map((h) => (
            <li key={h.title} className="row">
              <span className="row-title">
                {"url" in h && h.url ? <a href={h.url} rel="noopener">{h.title}</a> : h.title}
              </span>
              <span className="row-desc">{h.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-block" id="projects" aria-labelledby="projects-title">
        <h2 id="projects-title" className="section-title">Projects</h2>
        <ul className="plain-list">
          {projectItems.map((p) => {
            const inner = (
              <>
                <span className="row-title">{p.title}</span>
                <span className="row-desc">{p.description}</span>
              </>
            )
            return (
              <li key={p.title}>
                {p.href?.startsWith("/") ? (
                  <Link href={p.href} className="row">{inner}</Link>
                ) : (
                  <a href={p.href} className="row" rel="noopener">{inner}</a>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="section-block" id="work" aria-labelledby="work-title">
        <h2 id="work-title" className="section-title">Work</h2>
        <ul className="plain-list">
          {workItems.map((w) => {
            const inner = (
              <>
                <span className="row-head">
                  <span className="row-title">
                    {w.title} <span className="row-muted">· {w.role}</span>
                  </span>
                  {w.period && <span className="row-meta">{w.period}</span>}
                </span>
                <span className="row-desc">{w.description}</span>
              </>
            )
            return (
              <li key={w.title}>
                {w.href?.startsWith("/") ? (
                  <Link href={w.href} className="row">{inner}</Link>
                ) : w.href ? (
                  <a href={w.href} className="row" rel="noopener">{inner}</a>
                ) : (
                  <div className="row">{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="section-block" id="open-source" aria-labelledby="oss-title">
        <h2 id="oss-title" className="section-title">Open source</h2>
        <p className="section-note">
          {contributions.totalMerged} merged pull requests across {contributions.repositoryCount} external repositories.{" "}
          <a
            href="https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests"
            rel="noopener"
          >
            See all
          </a>
          .
        </p>
        <ul className="plain-list compact">
          {contributions.repositories.map((c) => (
            <li key={c.repository}>
              <a href={c.mergedUrl} className="row">
                <span className="row-head">
                  <span className="row-title">{c.displayName}</span>
                  <span className="row-meta">{c.merged} merged</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-block" id="writing" aria-labelledby="writing-title">
        <h2 id="writing-title" className="section-title">Writing</h2>
        <ul className="plain-list compact">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="row">
                <span className="row-head">
                  <span className="row-title">{p.title}</span>
                  <span className="row-meta">{p.date}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-block" aria-labelledby="elsewhere">
        <h2 id="elsewhere" className="section-title">Elsewhere</h2>
        <p className="inline-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href="https://github.com/maskjelly" rel="noopener">GitHub</a>
          <a href="https://x.com/aaryantwt" rel="noopener">X</a>
          <Link href="/uses">Uses</Link>
          <a href="/Aaryan-Singh-Resume.pdf">PDF résumé</a>
          <a href="/feed.xml">RSS</a>
        </p>
      </section>
    </>
  )
}
