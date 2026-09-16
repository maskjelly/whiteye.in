import "../xp.css"
import "../games.css"
import "../browser.css"
import { XpDesktop } from "@/components/xp-desktop"
import { posts } from "@/lib/posts"

export default function XpLayout({ children }: { children: React.ReactNode }) {
  return <XpDesktop posts={posts}>{children}</XpDesktop>
}
