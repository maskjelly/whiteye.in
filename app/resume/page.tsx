import type { Metadata } from "next"
import Link from "next/link"
import profile from "@/lib/resume-data.json"
import contributions from "@/lib/contributions.json"
import "./resume.css"

export const dynamic = "force-static"

const description = "Aaryan Singh: Waterloo dropout, founding engineer, early engineer at Extraordinary, Rice security disclosure at 17, a 1.34M req/s Rust benchmark and 47 merged PRs."

export const metadata: Metadata = {
  title: { absolute: "Aaryan Singh | Software Engineer" },
  description,
  alternates: { canonical: "https://whiteye.in/resume" },
  openGraph: {
    title: "Aaryan Singh | Software Engineer",
    description,
    url: "https://whiteye.in/resume",
    type: "profile",
  },
  twitter: { title: "Aaryan Singh | Software Engineer", description, card: "summary_large_image" },
}

export default function ResumePage() {
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person", "@id": "https://whiteye.in/resume#person",
        name: profile.name, url: "https://whiteye.in/resume", email: profile.email,
        jobTitle: "Software Engineer", description: profile.summary,
        sameAs: ["https://github.com/maskjelly", "https://x.com/aaryantwt"],
        knowsAbout: profile.skills.flatMap(s => s.value.split(", ")),
      },
      {
        "@type": "ProfilePage", "@id": "https://whiteye.in/resume#page",
        url: "https://whiteye.in/resume", name: "Aaryan Singh | Software Engineer",
        dateModified: profile.updated, mainEntity: { "@id": "https://whiteye.in/resume#person" },
        inLanguage: "en", description,
      },
      {
        "@type": "ItemList", name: "Selected software projects by Aaryan Singh",
        itemListElement: profile.projects.map((p, i) => ({
          "@type": "ListItem", position: i + 1,
          item: { "@type": "SoftwareSourceCode", name: p.name, codeRepository: p.url, description: p.description, author: { "@id": "https://whiteye.in/resume#person" } },
        })),
      },
    ],
  }

  return (
    <div className="resume-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
      <a href="#resume-main" className="resume-skip">Skip to résumé</a>
      <div className="resume-shell">
        <nav className="resume-nav" aria-label="Résumé navigation">
          <Link href="/">whiteye.in</Link>
          <div><a href="/resume.txt">Plain text</a><a href="/Aaryan-Singh-Resume.pdf" download>Download PDF ↗</a></div>
        </nav>
        <main id="resume-main" tabIndex={-1}>
          <header className="resume-header">
            <h1>{profile.name}</h1>
            <p className="resume-title">Software engineer · Product, AI agents &amp; systems</p>
            <p className="resume-intro">{profile.intro}</p>
            <p className="resume-summary">{profile.summary}</p>
            <div className="resume-contact">
              <span>{profile.location}</span>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <a href="https://github.com/maskjelly">GitHub ↗</a>
              <a href="https://x.com/aaryantwt">X ↗</a>
            </div>
          </header>

          <section className="resume-section" aria-labelledby="at-a-glance">
            <h2 id="at-a-glance">The short version</h2>
            <ul className="resume-proof">
              {profile.highlights.map(h => <li key={h.title}>
                <strong>{"url" in h ? <a href={h.url}>{h.title}</a> : h.title}</strong>
                <span>{h.detail}</span>
              </li>)}
            </ul>
          </section>

          <section className="resume-section" aria-labelledby="open-source">
            <h2 id="open-source">Contributor. 47 merged PRs. 13 repositories.</h2>
            <p>My changes are merged in Atuin, Podman Desktop and 11 other public repositories. Each credit links to the accepted work.</p>
            <ul className="resume-contributions">{contributions.repositories.map((c, index) => <li key={c.repository}>
              <div className="resume-contribution-heading">
                <h3><a href={c.url}>{c.displayName} ↗</a></h3>
                {index < 6 ? (
                  <span className="resume-contribution-stat resume-repo-stars" aria-label={`${c.stars.toLocaleString("en-US")} repository stars`}><span aria-hidden="true">★</span> {c.stars.toLocaleString("en-US")}</span>
                ) : (
                  <span className="resume-contribution-stat resume-merge-stats">{c.merged} merged {c.merged === 1 ? "PR" : "PRs"}</span>
                )}
              </div>
              <p className="resume-contribution-credit"><a href={c.mergedUrl}>Contributor{index < 6 && <> · {c.merged} merged {c.merged === 1 ? "PR" : "PRs"}</>}</a></p>
              <p className="resume-contribution-detail">{c.detail}</p>
            </li>)}</ul>
            <p className="resume-note"><a href="https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests">All merged external PRs ↗</a> · Repository stars and merged counts checked October 2, 2026.</p>
          </section>

          <section className="resume-section" aria-labelledby="experience">
            <h2 id="experience">Experience</h2>
            {profile.experience.map(e => (
              <article className="resume-entry" key={e.company}>
                <div className="resume-entry-heading"><h3>{"url" in e ? <a href={e.url}>{e.company} ↗</a> : e.company}</h3><p>{e.period}</p></div>
                <p className="resume-role">{e.role}{"location" in e ? ` · ${e.location}` : ""}</p>
                <ul>{e.bullets.map(b => <li key={b}>{b}</li>)}</ul>
              </article>
            ))}
          </section>

          <section className="resume-section" aria-labelledby="projects">
            <h2 id="projects">Selected projects</h2>
            {profile.projects.map(p => (
              <article className="resume-entry" key={p.name}>
                <h3><a href={p.url}>{p.name} ↗</a></h3>
                <p className="resume-role">{p.stack}</p>
                <p>{p.description}</p>
                {"extra" in p && <p className="resume-note">{p.extra}</p>}
                {("demo" in p || "evidence" in p) && <div className="resume-source-links">
                  {"demo" in p && <a href={p.demo}>{p.name === "rushort" ? "Live telemetry" : "Website & docs"} ↗</a>}
                  {"evidence" in p && <a href={p.evidence}>Measurements & conditions ↗</a>}
                </div>}
              </article>
            ))}
            <p className="resume-note">Also built <a href="/plain-corners">Plain Corners</a>, a native macOS utility, and this <Link href="/">Windows XP portfolio</Link> in React, Next.js and TypeScript.</p>
          </section>

          <section className="resume-section" aria-labelledby="measurements">
            <h2 id="measurements">Measured, with the conditions attached</h2>
            <p>Current instantKV retrieval runs: Apple M4 Pro, 24 GiB RAM, macOS 27. Server RAM is sampled Rust process RSS; query time excludes model inference.</p>
            <div className="resume-table-wrap" role="region" aria-label="Local memory measurements" tabIndex={0}>
              <table>
                <caption>Full source-evidence retrieval tests. Recall@10 is separate from answer accuracy.</caption>
                <thead><tr><th scope="col">Benchmark</th><th scope="col">Recall@10</th><th scope="col">Server RAM / query p95</th></tr></thead>
                <tbody>
                  <tr><th scope="row">LongMemEval-S · 500 questions</th><td>95.13%</td><td>14.34 MiB / 5.65 ms</td></tr>
                  <tr><th scope="row">LoCoMo · 1,533 scored questions</th><td>57.66%</td><td>11.25 MiB / 0.79 ms</td></tr>
                  <tr><th scope="row">BEIR SciFact · 300 questions</th><td>81.43%</td><td>23.14 MiB / 1.55 ms</td></tr>
                  <tr><th scope="row">BEIR ArguAna · 1,406 questions</th><td>76.96%</td><td>24.78 MiB / 46.83 ms</td></tr>
                  <tr><th scope="row">BEIR NFCorpus · 323 questions</th><td>15.31%</td><td>22.92 MiB / 0.93 ms</td></tr>
                </tbody>
              </table>
            </div>
            <p className="resume-note">LongMemEval-S answer accuracy: 85.20% (426/500), 95% confidence interval 82.0–88.2%. GPT-6 Luna was reader and judge; this is a model variant, not official leaderboard parity. ArguAna had 688 truncated and 1,149 reduced queries. Timings include shared host load. <a href="https://instantkv.com/benchmarks/">All run conditions, limits, comparisons and raw results ↗</a></p>
            <p className="resume-note">Separate structured-memory test: three fresh 10,000-record databases, 512-byte content plus metadata. Recorded binary: 8.31 MiB. All 30,000 memories recovered after process restarts; device power loss was not tested. <a href="https://github.com/maskjelly/instantKV/blob/main/docs/performance.md">Performance report ↗</a></p>
            <p>Earlier HTTP throughput runs: shared four-vCPU VPS, client and server on loopback.</p>
            <div className="resume-table-wrap" role="region" aria-label="Benchmark results" tabIndex={0}>
              <table>
                <caption>Successful throughput; source reports include workload, latency and error counts.</caption>
                <thead><tr><th scope="col">Workload</th><th scope="col">Result</th><th scope="col">Conditions</th></tr></thead>
                <tbody>
                  <tr><th scope="row"><a href="https://github.com/maskjelly/instantKV/blob/main/docs/benchmarks.md">instantKV knowledge GET</a></th><td>4,010 req/s</td><td>16 concurrent clients; p99 47.20 ms</td></tr>
                  <tr><th scope="row"><a href="https://github.com/maskjelly/instantKV/blob/main/docs/benchmarks.md">instantKV durable PUT</a></th><td>744 req/s</td><td>8 concurrent clients; immediate commits; p99 57.65 ms</td></tr>
                  <tr><th scope="row"><a href="https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-30.md">rushort redirects</a></th><td>1.34M req/s</td><td>32 connections; pipeline depth 512</td></tr>
                  <tr><th scope="row"><a href="https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-30.md">rushort round trip</a></th><td>34,423 req/s</td><td>64 connections; no pipelining</td></tr>
                </tbody>
              </table>
            </div>
            <p className="resume-note">Median of three runs per workload, zero errors. instantKV completed 157,500 measured requests across five profiles. These runs measure specific workloads, not public HTTPS capacity.</p>
          </section>

          <section className="resume-section" aria-labelledby="skills">
            <h2 id="skills">Tools I work with</h2>
            <dl className="resume-skills">{profile.skills.map(s => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl>
          </section>

          <section className="resume-section" aria-labelledby="education">
            <h2 id="education">Education &amp; early work</h2>
            <p>{profile.education}</p>
            <p>{profile.honors}</p>
          </section>
        </main>
        <footer className="resume-footer"><p>Updated <time dateTime={profile.updated}>October 5, 2026</time></p><a href={`mailto:${profile.email}`}>Let’s talk ↗</a></footer>
      </div>
    </div>
  )
}
