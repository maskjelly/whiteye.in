import Link from "next/link"

import { ArrowUpRight } from "lucide-react"
import { posts } from "@/lib/posts"

export function BlogSection() {
  const latest = posts.slice(0, 3)

  return (
    <section id="blog" className="section-block animate-fade-in-up">
      <div className="section-heading">
        <h2 className="section-title">writing</h2>
        <Link
          href="/blog"
          className="section-link group"
        >
          all posts{" "}
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>
      <div className="entry-list">
        {latest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="entry-row group"
          >
            <span className="entry-meta">
              {post.date}
            </span>
            <span className="entry-name">
              {post.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
