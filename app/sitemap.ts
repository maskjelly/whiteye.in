import type { MetadataRoute } from "next"
import { posts } from "@/lib/posts"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://whiteye.in"
  const staticRoutes = [
    { url: base, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/plain-corners`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/oracle`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/now`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/uses`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.4 },
    { url: `${base}/crawler-guide`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ]

  const postRoutes = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...postRoutes]
}
