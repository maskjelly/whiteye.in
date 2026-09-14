import type { Metadata } from "next"
import "./globals.css"
import "./xp.css"
import "./games.css"
import "./browser.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://whiteye.in"),
  title: {
    default: "aaryan",
    template: "%s | aaryan",
  },
  description: "Aaryan's personal site. Software, systems, and notes.",
  openGraph: {
    title: "aaryan",
    description: "Aaryan's personal site. Software, systems, and notes.",
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
    <html lang="en" data-rs-theme="slate" data-rs-color-mode="light">
      <body>{children}</body>
    </html>
  )
}
