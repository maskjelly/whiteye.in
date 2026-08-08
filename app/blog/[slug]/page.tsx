import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPostMeta, posts } from "@/lib/posts"
import { TableOfContents } from "@/components/table-of-contents"
import PolynomialsPost from "@/content/posts/polynomials-at-the-speed-of-silicon"
import StoragePost from "@/content/posts/your-storage-is-lying-to-you"
import ConsensusPost from "@/content/posts/the-consensus-problem-and-why-raft-exists"
import MemoryPost from "@/content/posts/memory-ordering-is-not-what-you-think"
import BftPost from "@/content/posts/byzantine-fault-tolerance-when-nodes-lie"
import LogPost from "@/content/posts/the-log-is-the-database"
import NetworkPost from "@/content/posts/the-network-is-not-a-wire"

const components: Record<string, React.ComponentType> = {
  "polynomials-at-the-speed-of-silicon": PolynomialsPost,
  "your-storage-is-lying-to-you": StoragePost,
  "the-consensus-problem-and-why-raft-exists": ConsensusPost,
  "memory-ordering-is-not-what-you-think": MemoryPost,
  "byzantine-fault-tolerance-when-nodes-lie": BftPost,
  "the-log-is-the-database": LogPost,
  "the-network-is-not-a-wire": NetworkPost,
}

export const dynamicParams = false

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostMeta(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://whiteye.in/blog/${post.slug}`,
      siteName: "aaryan",
      locale: "en_US",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      title: post.title,
      description: post.description,
      card: "summary_large_image",
      creator: "@aaryantwt",
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostMeta(slug)
  const Content = components[slug]

  if (!post || !Content) {
    notFound()
  }

  const index = posts.findIndex((p) => p.slug === slug)
  const prevNext = {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  }

  return (
    <>
      <article>
        <header className="page-header">
          <p className="page-kicker animate-fade-in">
            <Link href="/blog" className="hover:underline">
              writing
            </Link>
          </p>
          <h1 className="page-title animate-fade-in">
            {post.title}
          </h1>
          <p className="page-meta animate-fade-in-up">
            {post.date} · {post.readingTime} read
          </p>
        </header>

        <div className="post-layout">
          <div className="post-content min-w-0">
            <Content />

            {prevNext && (
              <nav className="back-row grid grid-cols-2 gap-8">
                {prevNext.prev ? (
                  <Link
                    href={`/blog/${prevNext.prev.slug}`}
                    className="group block no-underline"
                  >
                    <p className="entry-meta mb-1">previous</p>
                    <p className="entry-name group-hover:text-accent">
                      {prevNext.prev.title}
                    </p>
                  </Link>
                ) : (
                  <span />
                )}
                {prevNext.next ? (
                  <Link
                    href={`/blog/${prevNext.next.slug}`}
                    className="group block text-right no-underline"
                  >
                    <p className="entry-meta mb-1">next</p>
                    <p className="entry-name group-hover:text-accent">
                      {prevNext.next.title}
                    </p>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}

            <div className="back-row flex items-center justify-between">
              <Link href="/blog" className="back-link">
                ← back to writing
              </Link>
              <Link href="/" className="back-link">
                home
              </Link>
            </div>
          </div>

          <TableOfContents />
        </div>
      </article>
    </>
  )
}
