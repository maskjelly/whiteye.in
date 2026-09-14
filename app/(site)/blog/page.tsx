import Link from "next/link"
import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { posts } from "@/lib/posts"

export const metadata: Metadata = {
  title: "writing",
  description: "Notes on infrastructure, security, and machines.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "writing",
    description: "Notes on infrastructure, security, and machines.",
    url: "https://whiteye.in/blog",
    siteName: "aaryan",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "writing",
    description: "Notes on infrastructure, security, and machines.",
    card: "summary_large_image",
    creator: "@aaryantwt",
  },
}

export default function BlogIndex() {
  return (
    <>
      <header className="page-header">
        <p className="page-kicker animate-fade-in">writing</p>
        <h1 className="page-title animate-fade-in">
          notes from the machine room.
        </h1>
        <p className="page-intro animate-fade-in-up">
          infrastructure, security, and the occasional rabbit hole.
        </p>
        <p className="page-meta animate-fade-in-up">
          {posts.length} posts ·{" "}
          <Link href="/feed.xml" className="text-accent hover:underline">
            rss
          </Link>
        </p>
      </header>

      <div className="entry-list">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="entry-card group"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <h2 className="entry-title">{post.title}</h2>
                <p className="entry-description">{post.description}</p>
                <p className="entry-meta mt-2">
                  {post.date} · {post.readingTime}
                </p>
              </div>
              <ArrowUpRight className="entry-arrow" />
            </div>
          </Link>
        ))}
      </div>

      <div className="back-row">
        <Link href="/" className="back-link">
          ← back home
        </Link>
      </div>
    </>
  )
}
