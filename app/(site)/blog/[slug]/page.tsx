import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPostMeta, posts } from "@/lib/posts"
import { getPostComponent } from "@/lib/post-components"
import { TableOfContents } from "@/components/table-of-contents"
import { JsonLd, PERSON_ID, SITE } from "@/lib/structured-data"

export const dynamicParams = false

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

function toIso(date: string) {
  return new Date(`${date} UTC`).toISOString()
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
      url: `${SITE}/blog/${post.slug}`,
      type: "article",
      authors: [SITE],
      publishedTime: toIso(post.date),
      modifiedTime: post.updated ? toIso(post.updated) : undefined,
      section: "Engineering",
    },
    twitter: {
      title: post.title,
      description: post.description,
      card: "summary_large_image",
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
  const prev = index > 0 ? posts[index - 1] : null
  const next = index < posts.length - 1 ? posts[index + 1] : null
  const minutes = parseInt(post.readingTime, 10)

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "@id": `${SITE}/blog/${post.slug}#article`,
          url: `${SITE}/blog/${post.slug}`,
          mainEntityOfPage: `${SITE}/blog/${post.slug}`,
          headline: post.title,
          description: post.description,
          datePublished: toIso(post.date),
          dateModified: toIso(post.updated ?? post.date),
          author: { "@id": PERSON_ID },
          publisher: { "@id": PERSON_ID },
          image: `${SITE}/blog/${post.slug}/opengraph-image`,
          isPartOf: { "@id": `${SITE}/blog#blog` },
          inLanguage: "en",
          isAccessibleForFree: true,
          timeRequired: Number.isFinite(minutes) ? `PT${minutes}M` : undefined,
        }}
      />
      <div className="read-progress" aria-hidden="true" />
      <header className="page-header animate-fade-in-up">
        <p className="page-kicker">
          <Link href="/blog">Writing</Link>
        </p>
        <h1 className="page-title">{post.title}</h1>
        <p className="page-meta">
          <time dateTime={toIso(post.date)}>{post.date}</time> · {post.readingTime} read
          {post.updated && (
            <>
              {" "}· updated <time dateTime={toIso(post.updated)}>{post.updated}</time>
            </>
          )}
        </p>
      </header>

      <div className="post-layout">
        <div className="post-content min-w-0">
          <Content />

          <nav className="back-row post-nav" aria-label="Neighbouring essays">
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="post-nav-link">
                <span className="entry-meta">← Previous</span>
                <span className="entry-name">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/blog/${next.slug}`} className="post-nav-link next">
                <span className="entry-meta">Next →</span>
                <span className="entry-name">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>

          <div className="back-row" style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
            <Link href="/blog" className="back-link">← All writing</Link>
            <Link href="/" className="back-link">Home</Link>
          </div>
        </div>

        <TableOfContents />
      </div>
    </div>
  )
}
