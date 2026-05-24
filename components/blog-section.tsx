import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const posts = [
  { slug: "under-work", date: "dec 16, 2024", title: "under work" },
  { slug: "future", date: "dec 16, 2024", title: "future..." },
  { slug: "under-work-2", date: "dec 16, 2024", title: "under work" },
  { slug: "future-2", date: "dec 16, 2024", title: "future..." },
]

export function BlogSection() {
  return (
    <section id="blog" className="mb-12 pt-10 border-t border-neutral-800 animate-fade-in-up">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center text-white">
          <span className="text-accent accent-glow mr-2">*</span>
          blog
        </h2>
        <span className="inline-flex items-center gap-1 text-sm text-accent group">
          all posts{" "}
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
          >
            <span className="text-sm text-gray-500 sm:w-28 shrink-0 tabular-nums">
              {post.date}
            </span>
            <span className="text-gray-200">
              {post.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
