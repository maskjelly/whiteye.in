import { socialImage } from "@/components/social-image"
import { getPostMeta, posts } from "@/lib/posts"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "An essay from Aaryan’s writing"

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostMeta(slug)
  if (!post) {
    return socialImage({
      title: "Notes from the machine room.",
      subtitle: "infrastructure, security, and the occasional rabbit hole.",
      path: "whiteye.in/blog",
    })
  }
  return socialImage({
    title: post.title,
    subtitle: post.description,
    path: `whiteye.in/blog/${post.slug}`,
    meta: post.date.toUpperCase(),
  })
}
