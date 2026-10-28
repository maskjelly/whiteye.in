import type { Metadata } from "next"
import "./globals.css"
import { Arrival } from "@/components/arrival"
import { arrivalUrl, arrivalSiteId } from "@/lib/arrival/config"

export const metadata: Metadata = {
  metadataBase: new URL("https://whiteye.in"),
  title: {
    default: "aaryan",
    template: "%s | aaryan",
  },
  description: "Aaryan Singh. Founding engineer, AI agents, Rust systems and open-source software. Projects, work history and engineering notes.",
  openGraph: {
    title: "aaryan",
    description: "Aaryan Singh. Founding engineer, AI agents, Rust systems and open-source software. Projects, work history and engineering notes.",
    url: "https://whiteye.in",
    siteName: "aaryan",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  twitter: {
    title: "aaryan",
    card: "summary_large_image",
    creator: "@aaryantwt",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-rs-theme="slate" data-rs-color-mode="dark">
      <head>
        {arrivalUrl && <link rel="alternate" type="application/json" title="Optional agent check-in" href={`${arrivalUrl}/api/agent/manifest/${arrivalSiteId}`} />}
      </head>
      <body>{children}<Arrival /></body>
    </html>
  )
}
