import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aaryan Singh",
    short_name: "Aaryan Singh",
    description: "Aaryan Singh, software engineer from Assam, India. High-scale consumer products, Rust systems and open source.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f5",
    theme_color: "#f7f6f5",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
