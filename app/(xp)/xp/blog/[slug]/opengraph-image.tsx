import { xpSocialImage } from "@/components/xp-social-image"
import { getPostMeta, posts } from "@/lib/posts"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "An essay from Aaryan’s Windows XP desktop"

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
    return xpSocialImage({
      title: "Notes from the machine room.",
      subtitle: "infrastructure · security · rabbit holes",
      windowTitle: "My Writing — Aaryan’s computer",
      path: "whiteye.in/xp/blog",
    })
  }
  const fullTitle = `${post.title} — Aaryan’s computer`
  return xpSocialImage({
    title: post.title,
    subtitle: post.description,
    windowTitle:
      fullTitle.length > 48 ? "writing — Aaryan’s computer" : fullTitle,
    path: `whiteye.in/xp/blog/${post.slug}`,
  })
}
