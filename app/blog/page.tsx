import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { posts } from "@/lib/posts"

export const metadata = {
  title: "writing",
  description:
    "Long-form notes on security, infrastructure, and systems that are hard to corrupt.",
}

export default function BlogIndex() {
  return (
    <>
      <header className="mb-12 pt-6">
        <p className="text-gray-500 mb-3 animate-fade-in">/ writing</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white text-balance animate-fade-in">
          notes on systems that are hard to corrupt
        </h1>
        <p className="text-pretty max-w-[60ch] text-gray-400 mt-4 animate-fade-in-up">
          long-form pieces where i fall down a rabbit hole and write up what i
          found. mostly security, infrastructure, and the math underneath
          both.
        </p>
        <p className="text-sm text-gray-600 mt-3 animate-fade-in-up">
          {posts.length} posts · updated jun 21, 2026
        </p>
      </header>

      <div className="space-y-3 border-t border-neutral-800 pt-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-lg p-4 -mx-4 hover:bg-neutral-900/50 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-white group-hover:text-accent transition-colors duration-200">
                  {post.title}
                </h2>
                <p className="text-gray-400 mt-1.5 text-pretty">{post.description}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {post.date} · {post.readingTime}
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 mt-1.5 text-gray-600 group-hover:text-accent transition-colors shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-neutral-800 text-sm">
        <Link href="/" className="text-gray-500 hover:text-accent transition-colors">
          ← back home
        </Link>
      </div>
    </>
  )
}
