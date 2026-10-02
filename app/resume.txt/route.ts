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
    "https://github.com/maskjelly/instantKV/blob/main/docs/benchmarks.md",
    "https://github.com/maskjelly/instantKV/blob/main/docs/demo-results/2026-10-02-mac/README.md",
    "https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-30.md", "",
    "PDF: https://whiteye.in/Aaryan-Singh-Resume.pdf", "")
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
