import { xpSocialImage } from "@/components/xp-social-image"
import { posts } from "@/lib/posts"

export const alt = "Aaryan’s writing — notes from the machine room"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OG() {
  return xpSocialImage({
    title: "Notes from the machine room.",
    subtitle: `${posts.length} posts · infrastructure · security · rabbit holes`,
    windowTitle: "My Writing — Aaryan’s computer",
    path: "whiteye.in/blog",
  })
}
