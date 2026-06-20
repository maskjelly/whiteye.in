import { meta as polynomialsMeta } from "@/content/posts/polynomials-at-the-speed-of-silicon"
import { meta as storageMeta } from "@/content/posts/your-storage-is-lying-to-you"

export type PostMeta = {
  slug: string
  title: string
  date: string
  description: string
  readingTime: string
}

export const posts: PostMeta[] = [polynomialsMeta, storageMeta]

export function getPostMeta(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug)
}
