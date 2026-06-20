import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPostMeta, posts } from "@/lib/posts"
import PolynomialsPost from "@/content/posts/polynomials-at-the-speed-of-silicon"
import StoragePost from "@/content/posts/your-storage-is-lying-to-you"

const components: Record<string, React.ComponentType> = {
  "polynomials-at-the-speed-of-silicon": PolynomialsPost,
  "your-storage-is-lying-to-you": StoragePost,
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

  return (
    <>
      <article className="pt-6">
        <header className="mb-12">
          <p className="text-gray-500 mb-3 animate-fade-in">
            <Link href="/blog" className="hover:text-accent transition-colors">
              / writing
            </Link>
            <span className="text-gray-700"> / </span>
            <span className="text-gray-400">{post.slug}</span>
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white text-balance animate-fade-in">
            {post.title}
          </h1>
          <p className="text-sm text-gray-600 mt-4 animate-fade-in-up">
            {post.date} · {post.readingTime} read
          </p>
        </header>

        <Content />

        <div className="mt-16 pt-8 border-t border-neutral-800 text-sm flex items-center justify-between">
          <Link href="/blog" className="text-gray-500 hover:text-accent transition-colors">
            ← back to writing
          </Link>
          <Link href="/" className="text-gray-500 hover:text-accent transition-colors">
            home
          </Link>
        </div>
      </article>
    </>
  )
}
