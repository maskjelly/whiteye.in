import { socialImage } from "@/components/social-image"

export const alt = "Aaryan Singh. Software engineer: AI agents, Rust systems, open source."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OG() {
  return socialImage({
    title: "Aaryan Singh",
    subtitle: "Founding engineer. High-scale consumer products and Rust systems. 47 merged PRs in 13 open-source repositories.",
    path: "whiteye.in",
    meta: "SOFTWARE ENGINEER",
  })
}
