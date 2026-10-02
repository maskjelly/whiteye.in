import type { Metadata } from "next"
import Link from "next/link"
import profile from "@/lib/resume-data.json"
import "./resume.css"

export const dynamic = "force-static"

const description = "Aaryan Singh: founding engineer, email product experience, Rust agent infrastructure and 47 merged open-source contributions. Projects, benchmarks and work history."

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

const contributions = [
  { name: "Podman Desktop", detail: "UI error handling and disabled file inputs", url: "https://github.com/podman-desktop/podman-desktop/pull/19300" },
  { name: "Atuin", detail: "Hook response compatibility", url: "https://github.com/atuinsh/atuin/pull/4171" },
  { name: "IBM Granite CLI", detail: "MCP setup and configuration failures", url: "https://github.com/ibm-granite-community/granite-cli/pull/146" },
  { name: "spate", detail: "Removed JSON key clones", url: "https://github.com/spate-etl/spate/pull/542" },
  { name: "dial9", detail: "Worker IDs in task-spawn telemetry", url: "https://github.com/dial9-rs/dial9/pull/931" },
  { name: "termlens", detail: "27 merged fixes and improvements", url: "https://github.com/vyncint/termlens/pulls?q=is%3Apr+is%3Amerged+author%3Amaskjelly" },
]

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
            <p className="resume-intro">I build products people use and the systems they depend on.</p>
            <p className="resume-summary">{profile.summary}</p>
            <div className="resume-contact">
              <span>{profile.location}</span>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <a href="https://github.com/maskjelly">GitHub ↗</a>
              <a href="https://x.com/aaryantwt">X ↗</a>
            </div>
          </header>

          <section className="resume-section" aria-labelledby="at-a-glance">
            <h2 id="at-a-glance">A few things I’ve done</h2>
            <ul className="resume-proof">
              <li><strong>Built ReferRush from the first commit.</strong> Shopify installs, WhatsApp referrals, UPI payouts, production recovery and customer conversations.</li>
              <li><strong>47 merged PRs across 13 external repositories.</strong> UI, runtime behavior, telemetry, performance and developer tooling.</li>
              <li><strong>Shipped agent runtimes and memory infrastructure in Rust.</strong> Persistent sessions, isolated memory, restart recovery and published measurements.</li>
            </ul>
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
            <p>Published runs on a shared four-vCPU VPS. Client and server used loopback HTTP.</p>
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
            <p className="resume-note">The newer <a href="https://github.com/maskjelly/instantKV/blob/main/docs/demo-results/2026-10-02-mac/README.md">M4 Pro demo workload</a> acknowledged 330,000 writes with zero errors: 42,517 RAM writes/s and 225 immediate durable writes/s. Separate unique-record workload; throughput excludes setup and pauses between batches.</p>
          </section>

          <section className="resume-section" aria-labelledby="open-source">
            <h2 id="open-source">Open source</h2>
            <p>{profile.oss}</p>
            <ul className="resume-contributions">{contributions.map(c => <li key={c.name}><a href={c.url}>{c.name} ↗</a><span>{c.detail}</span></li>)}</ul>
            <p className="resume-note"><a href="https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests">All merged external PRs ↗</a> · Count checked October 2, 2026.</p>
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
        <footer className="resume-footer"><p>Updated <time dateTime={profile.updated}>October 2, 2026</time></p><a href={`mailto:${profile.email}`}>Let’s talk ↗</a></footer>
      </div>
    </div>
  )
}
