import { xpSocialImage } from "@/components/xp-social-image"

export const alt = "Aaryan’s Windows XP desktop — software, systems, and notes"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OG() {
  return xpSocialImage({
    title: "Hi, I’m Aaryan.",
    subtitle: "I make software and write about the parts that break.",
    windowTitle: "Welcome — Aaryan’s computer",
  })
}
