import profile from "@/lib/resume-data.json"
import contributions from "@/lib/contributions.json"

export const dynamic = "force-static"

export function GET() {
  const lines = [
    profile.name, profile.headline, `${profile.location} | ${profile.email}`,
    "https://whiteye.in/resume", "https://github.com/maskjelly", "https://x.com/aaryantwt",
    `Updated: ${profile.updated}`, "", profile.intro, profile.summary, "", "THE SHORT VERSION", "",
    ...profile.highlights.flatMap(h => [h.title, h.detail, ...("url" in h ? [h.url] : []), ""]), "EXPERIENCE", "",
  ]
  for (const e of profile.experience) {
    lines.push(`${e.role} | ${e.company} | ${e.period}`, ...e.bullets.map(b => `- ${b}`), "")
  }
  lines.push("SELECTED PROJECTS", "")
  for (const p of profile.projects) {
    lines.push(`${p.name} | ${p.stack}`, p.url, p.description)
    if (p.extra) lines.push(p.extra)
    if (p.demo) lines.push(`Website: ${p.demo}`)
    if (p.evidence) lines.push(`Evidence: ${p.evidence}`)
    lines.push("")
  }
  lines.push("OPEN SOURCE — CONTRIBUTOR", "", profile.oss,
    ...contributions.repositories.flatMap((c, index) => [`${c.displayName} | ${c.repository}${index < 6 ? ` | ${c.stars.toLocaleString("en-US")} repository stars` : ""}`, `Contributor | ${c.merged} merged PR${c.merged === 1 ? "" : "s"}`, c.detail, c.mergedUrl, ""]),
    `Repository stars and merged counts checked: ${contributions.checked}`,
    "https://github.com/search?q=author%3Amaskjelly+is%3Apr+is%3Amerged+-user%3Amaskjelly&type=pullrequests", "",
    "TECHNICAL SKILLS", "", ...profile.skills.map(s => `${s.label}: ${s.value}`), "",
    "EDUCATION & RECOGNITION", "", profile.education, profile.honors, "",
    "BENCHMARK REPORTS", "",
    "instantKV: Apple M4 Pro, 24 GiB RAM, macOS 27. Sampled Rust server RSS; query p95 excludes model inference.",
    "LongMemEval-S: 95.13% Recall@10; 500 questions; 14.34 MiB server RSS; 5.65 ms query p95.",
    "LoCoMo: 57.66% Recall@10; 1,533 scored questions of 1,986 queried; 11.25 MiB RSS; 0.79 ms query p95.",
    "BEIR SciFact: 81.43% Recall@10; 300 questions; 23.14 MiB RSS; 1.55 ms query p95.",
    "BEIR ArguAna: 76.96% Recall@10; 1,406 questions; 24.78 MiB RSS; 46.83 ms query p95; 688 truncated and 1,149 reduced queries.",
    "BEIR NFCorpus: 15.31% Recall@10; 323 questions; 22.92 MiB RSS; 0.93 ms query p95.",
    "Separate LongMemEval-S QA: 85.20% (426/500), 95% confidence interval 82.0-88.2%. GPT-6 Luna reader/judge model variant; not official leaderboard parity. Shared host load limits timing comparisons.",
    "Separate structured-memory test: three 10,000-record databases, 512-byte content plus metadata; 8.31 MiB binary; 30,000 memories recovered after process restarts. Device power loss and phone integration are unverified.",
    "https://instantkv.com/benchmarks/",
    "https://github.com/maskjelly/instantKV/blob/main/docs/performance.md",
    "https://github.com/maskjelly/instantKV/blob/main/docs/benchmarks.md",
    "https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-30.md", "",
    "PDF: https://whiteye.in/Aaryan-Singh-Resume.pdf", "")
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
