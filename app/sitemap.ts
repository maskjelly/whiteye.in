import type { MetadataRoute } from "next"
import { posts } from "@/lib/posts"
import profile from "@/lib/resume-data.json"

export const dynamic = "force-static"

const base = "https://whiteye.in"

function latestPostDate() {
  return posts
    .map((p) => new Date(`${p.updated ?? p.date} UTC`))
    .reduce((a, b) => (b > a ? b : a), new Date(0))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const profileDate = new Date(profile.updated)
  const blogDate = latestPostDate()
  const siteDate = blogDate > profileDate ? blogDate : profileDate

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: siteDate, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/resume`, lastModified: profileDate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/blog`, lastModified: blogDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/now`, lastModified: new Date("2026-11-05"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/plain-corners`, lastModified: profileDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/uses`, lastModified: profileDate, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/telemetry`, lastModified: profileDate, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/oracle`, lastModified: profileDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/xp`, lastModified: profileDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/crawler-guide`, lastModified: profileDate, changeFrequency: "monthly", priority: 0.3 },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(`${p.updated ?? p.date} UTC`),
    changeFrequency: "yearly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...postRoutes]
}
