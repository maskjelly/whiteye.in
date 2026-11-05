import { posts } from "@/lib/posts"

export const dynamic = "force-static"

const baseUrl = "https://whiteye.in"

function toRFC822(dateStr: string): string {
  const d = new Date(`${dateStr} UTC`)
  if (isNaN(d.getTime())) return new Date().toUTCString()
  return d.toUTCString()
}

export function GET() {
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${baseUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${p.slug}</guid>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${toRFC822(p.date)}</pubDate>
      <dc:creator>Aaryan Singh</dc:creator>
    </item>`
    )
    .join("\n")

  const newest = posts
    .map((p) => new Date(`${p.updated ?? p.date} UTC`))
    .reduce((a, b) => (b > a ? b : a), new Date(0))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Aaryan Singh · Writing</title>
    <link>${baseUrl}/blog</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Long-form essays on infrastructure, storage, consensus and the parts of systems that break.</description>
    <language>en-us</language>
    <lastBuildDate>${newest.toUTCString()}</lastBuildDate>
    <image>
      <url>${baseUrl}/opengraph-image</url>
      <title>Aaryan Singh · Writing</title>
      <link>${baseUrl}/blog</link>
    </image>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
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
