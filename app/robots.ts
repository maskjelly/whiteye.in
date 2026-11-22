import type { MetadataRoute } from "next"

export const dynamic = "force-static"

// Search engines and AI crawlers are all welcome. Listing the AI agents
// explicitly makes the intent unambiguous for engines that look for it.
const aiCrawlers = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "meta-externalagent",
  "Amazonbot",
  "DuckAssistBot",
  "YouBot",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/s/", "/stats"] },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/api/", "/s/", "/stats"] })),
    ],
    sitemap: "https://whiteye.in/sitemap.xml",
    host: "https://whiteye.in",
  }
}
