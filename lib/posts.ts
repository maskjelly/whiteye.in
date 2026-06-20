import { meta as polynomialsMeta } from "@/content/posts/polynomials-at-the-speed-of-silicon"
import { meta as storageMeta } from "@/content/posts/your-storage-is-lying-to-you"
import { meta as consensusMeta } from "@/content/posts/the-consensus-problem-and-why-raft-exists"
import { meta as memoryMeta } from "@/content/posts/memory-ordering-is-not-what-you-think"
import { meta as bftMeta } from "@/content/posts/byzantine-fault-tolerance-when-nodes-lie"
import { meta as logMeta } from "@/content/posts/the-log-is-the-database"

export type PostMeta = {
  slug: string
  title: string
  date: string
  description: string
  readingTime: string
}

export const posts: PostMeta[] = [
  polynomialsMeta,
  storageMeta,
  bftMeta,
  consensusMeta,
  memoryMeta,
  logMeta,
]

export function getPostMeta(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug)
}
