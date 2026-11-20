import { socialImage } from "@/components/social-image"

export const alt = "Aaryan Singh. Software engineer: consumer products at scale, systems in Rust, open source."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OG() {
  return socialImage({
    title: "Aaryan Singh",
    subtitle: "Consumer products at scale and systems in Rust. 47 pull requests merged across 13 open-source repositories.",
    path: "whiteye.in",
    meta: "SOFTWARE ENGINEER",
  })
}
