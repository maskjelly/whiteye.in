import { posts } from "@/lib/posts"

export const dynamic = "force-static"

function toRFC822(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return new Date().toUTCString()
  return d.toUTCString()
}

export function GET() {
  const baseUrl = "https://whiteye.in"
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${baseUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${p.slug}</guid>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${toRFC822(p.date)}</pubDate>
    </item>`
    )
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>aaryan — writing</title>
    <link>${baseUrl}/blog</link>
    <description>Long-form notes on security, infrastructure, and systems that are hard to corrupt.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
