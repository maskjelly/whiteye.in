import profile from "@/lib/resume-data.json"
import contributions from "@/lib/contributions.json"
import { posts } from "@/lib/posts"
import { projectItems } from "@/lib/project-items"
import { faq } from "@/lib/faq"

export const dynamic = "force-static"

const SITE = "https://whiteye.in"

export function GET() {
  const lines: string[] = [
    "# Aaryan Singh — full text for language models",
    "",
    `Source: ${SITE}/llms-full.txt · Updated: ${profile.updated} · Canonical profile: ${SITE}`,
    "",
    "## Who",
    "",
    `${profile.name}. ${profile.headline}. ${profile.location}. ${profile.email}.`,
    profile.intro,
    profile.summary,
    "",
    "Links: https://github.com/maskjelly · https://x.com/aaryantwt · " + `${SITE}/resume · ${SITE}/Aaryan-Singh-Resume.pdf`,
    "",
    "## The short version",
    "",
    ...profile.highlights.flatMap((h) => [`- ${h.title} ${h.detail}${"url" in h && h.url ? ` (${h.url})` : ""}`]),
    "",
    "## Now",
    "",
    "I work on consumer products built for very large audiences, and am at present on trial with LinkMe, the creator platform for consumers and businesses. I recently left ReferRush, where I was the founding engineer. Before this I built instantKV (a local-first memory store for AI agents in Rust, with BM25 search, filters by topic, tag and time, and a native OpenCode MCP server) and Morse (an agent runtime in Rust that continues to run when the client disconnects). I continue to contribute to open source and remain open to founding-engineer and systems roles.",
    "",
    "## Questions and answers",
    "",
    ...faq.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`, ""]),
    "## Experience",
    "",
  ]

  for (const e of profile.experience) {
    lines.push(`### ${e.role}, ${e.company} (${e.period})${"location" in e && e.location ? ` · ${e.location}` : ""}`)
    if ("url" in e && e.url) lines.push(e.url)
    lines.push(...e.bullets.map((b) => `- ${b}`), "")
  }

  lines.push("## Projects", "")
  for (const p of profile.projects) {
    lines.push(`### ${p.name} (${p.stack})`, p.url, p.description)
    if (p.extra) lines.push(p.extra)
    if (p.demo) lines.push(`Website: ${p.demo}`)
    if (p.evidence) lines.push(`Evidence: ${p.evidence}`)
    lines.push("")
  }
  for (const p of projectItems.filter((i) => !profile.projects.some((x) => x.name === i.title))) {
    const href = p.href?.startsWith("/") ? `${SITE}${p.href}` : p.href
    lines.push(`### ${p.title}`, href ?? "", p.description, "")
  }

  lines.push(
    "## Open source",
    "",
    profile.oss,
    "",
    ...contributions.repositories.flatMap((c) => [
      `- ${c.displayName} (${c.repository}, ${c.stars.toLocaleString("en-US")} stars): ${c.merged} merged PR${c.merged === 1 ? "" : "s"}. ${c.detail}. ${c.mergedUrl}`,
    ]),
    `Stars and merged counts checked ${contributions.checked}. All merged external PRs: https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests`,
    "",
    "## Skills",
    "",
    ...profile.skills.map((s) => `- ${s.label}: ${s.value}`),
    "",
    "## Education and recognition",
    "",
    profile.education,
    profile.honors,
    "",
    "## Measured results",
    "",
    "instantKV retrieval (Apple M4 Pro, 24 GiB RAM, macOS 27; sampled Rust server RSS; query p95 excludes model inference):",
    "- LongMemEval-S: 95.13% Recall@10; 500 questions; 14.34 MiB RSS; 5.65 ms query p95.",
    "- LoCoMo: 57.66% Recall@10; 1,533 scored questions; 11.25 MiB RSS; 0.79 ms query p95.",
    "- BEIR SciFact: 81.43% Recall@10; 300 questions; 23.14 MiB RSS; 1.55 ms query p95.",
    "- BEIR ArguAna: 76.96% Recall@10; 1,406 questions; 24.78 MiB RSS; 46.83 ms query p95.",
    "- BEIR NFCorpus: 15.31% Recall@10; 323 questions; 22.92 MiB RSS; 0.93 ms query p95.",
    "- LongMemEval-S answer accuracy: 85.20% (426/500), 95% CI 82.0–88.2%, GPT-6 Luna reader and judge; a model variant, not official leaderboard parity.",
    "Source: https://instantkv.com/benchmarks/",
    "",
    "HTTP throughput (shared four-vCPU VPS, client and server on loopback, median of three runs, zero errors):",
    "- rushort redirects: 1.34M req/s with 32 connections and pipeline depth 512.",
    "- rushort round trip: 34,423 req/s with 64 connections and no pipelining.",
    "- instantKV knowledge GET: 4,010 req/s, 16 concurrent clients, p99 47.20 ms.",
    "- instantKV durable PUT: 744 req/s, 8 concurrent clients, p99 57.65 ms.",
    "These measure specific workloads, not public HTTPS capacity. Source: https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-30.md",
    "",
    "## Writing",
    "",
    `Index: ${SITE}/blog · RSS: ${SITE}/feed.xml · Each essay is readable as HTML without JavaScript.`,
    "",
    ...posts.flatMap((p) => [
      `### ${p.title}`,
      `${SITE}/blog/${p.slug} · Published ${p.date}${p.updated ? `, updated ${p.updated}` : ""} · ${p.readingTime}`,
      p.description,
      "",
    ]),
    "## Other pages",
    "",
    `- ${SITE}/uses: hardware, editor and stack.`,
    `- ${SITE}/plain-corners: native macOS utility for window corner radius.`,
    `- ${SITE}/telemetry: live rushort analytics; includes synthetic benchmark traffic.`,
    `- ${SITE}/xp: an interactive Windows XP desktop easter egg.`,
    ""
  )

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
