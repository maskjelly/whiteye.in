import { socialImage } from "@/components/social-image"
import { posts } from "@/lib/posts"

export const alt = "Aaryan’s writing — notes from the machine room"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OG() {
  return socialImage({
    title: "Notes from the machine room.",
    subtitle: `${posts.length} essays on infrastructure, security, and systems.`,
    path: "whiteye.in/blog",
  })
}
