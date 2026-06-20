import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { posts } from "@/lib/posts"

export function BlogSection() {
  const latest = posts.slice(0, 3)

  return (
    <section id="blog" className="mb-12 pt-10 border-t border-neutral-800 animate-fade-in-up">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center text-white">
          <span className="text-accent accent-glow mr-2">*</span>
          writing
        </h2>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline group"
        >
          all posts{" "}
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>
      <div className="space-y-3">
        {latest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1"
          >
            <span className="text-sm text-gray-600 sm:w-32 shrink-0 tabular-nums">
              {post.date}
            </span>
            <span className="text-gray-200 group-hover:text-accent transition-colors duration-200">
              {post.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
