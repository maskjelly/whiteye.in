import { xpSocialImage } from "@/components/xp-social-image"
import { getPostMeta, posts } from "@/lib/posts"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "An essay from Aaryan’s Windows XP desktop"

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostMeta(slug)
  return xpSocialImage({
    title: post?.title ?? "My Writing",
    subtitle: post
      ? `${post.date} · ${post.readingTime} read`
      : "Notes from the machine room.",
    windowTitle: "My Writing — Internet Explorer",
    path: "whiteye.in/blog",
  })
}
