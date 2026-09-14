import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPostMeta, posts } from "@/lib/posts"
import { getPostComponent } from "@/lib/post-components"
import { TableOfContents } from "@/components/table-of-contents"

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
    alternates: { canonical: `/blog/${post.slug}` },
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
  const Content = getPostComponent(slug)

  if (!post || !Content) {
    notFound()
  }

  const index = posts.findIndex((p) => p.slug === slug)
  const prevNext = {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  }

  return (
    <div>
      <header className="page-header">
        <p className="page-kicker animate-fade-in">
          <Link href="/blog" className="hover:underline">
            writing
          </Link>
        </p>
        <h1 className="page-title animate-fade-in">{post.title}</h1>
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
              ← all writing
            </Link>
            <Link href="/" className="back-link">
              home
            </Link>
          </div>
        </div>

        <TableOfContents />
      </div>
    </div>
  )
}
