import Link from "next/link"
import type { Metadata } from "next"
import { posts } from "@/lib/posts"
import { JsonLd, PERSON_ID, SITE } from "@/lib/structured-data"

export const dynamic = "force-static"

const description =
  "Essays by Aaryan Singh on systems: storage durability, consensus, memory ordering, Byzantine fault tolerance, networks and a Rust URL shortener measured at 16.8M redirects per second."

export const metadata: Metadata = {
  title: "Writing",
  description,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { title: "Writing · Aaryan Singh", description, url: `${SITE}/blog`, type: "website" },
  twitter: { title: "Writing · Aaryan Singh", description, card: "summary_large_image" },
}

function toIso(date: string) {
  return new Date(`${date} UTC`).toISOString()
}

export default function BlogIndex() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "@id": `${SITE}/blog#blog`,
          url: `${SITE}/blog`,
          name: "Writing · Aaryan Singh",
          description,
          inLanguage: "en",
          author: { "@id": PERSON_ID },
          publisher: { "@id": PERSON_ID },
          isPartOf: { "@id": `${SITE}/#website` },
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            "@id": `${SITE}/blog/${p.slug}#article`,
            url: `${SITE}/blog/${p.slug}`,
            headline: p.title,
            description: p.description,
            datePublished: toIso(p.date),
            dateModified: toIso(p.updated ?? p.date),
            author: { "@id": PERSON_ID },
          })),
        }}
      />
      <header className="page-header animate-fade-in-up">
        <p className="page-kicker">Writing</p>
        <h1 className="page-title">Notes from the machine room</h1>
        <p className="page-intro">
          Long-form essays on infrastructure, storage, consensus and the places where systems fail. Every claim is
          tied to a source or to a check the reader can reproduce.
        </p>
        <p className="page-meta">
          {posts.length} essays · <a href="/feed.xml">RSS</a>
        </p>
      </header>

      <div className="entry-list stagger">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="entry-card group">
            <div className="entry-body">
              <div className="min-w-0">
                <h2 className="entry-title">{post.title}</h2>
                <p className="entry-description">{post.description}</p>
                <p className="entry-meta" style={{ marginTop: "0.4rem", whiteSpace: "normal" }}>
                  <time dateTime={toIso(post.date)}>{post.date}</time> · {post.readingTime}
                </p>
              </div>
              <svg className="entry-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="back-row">
        <Link href="/" className="back-link">← Home</Link>
      </div>
    </>
  )
}
