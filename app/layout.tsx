import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Arrival } from "@/components/arrival"

const description =
  "Aaryan Singh is a software engineer: founding engineer at ReferRush, early engineer at Extraordinary, now building Rust agent memory and runtimes. Projects, measured results, open-source contributions and essays on systems."

export const metadata: Metadata = {
  metadataBase: new URL("https://whiteye.in"),
  title: {
    default: "Aaryan Singh",
    template: "%s · Aaryan Singh",
  },
  description,
  applicationName: "whiteye.in",
  authors: [{ name: "Aaryan Singh", url: "https://whiteye.in" }],
  creator: "Aaryan Singh",
  publisher: "Aaryan Singh",
  keywords: [
    "Aaryan Singh",
    "software engineer",
    "founding engineer",
    "Rust",
    "AI agents",
    "agent memory",
    "instantKV",
    "rushort",
    "open source",
    "systems engineering",
    "whiteye",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Aaryan Singh",
    description,
    url: "https://whiteye.in",
    siteName: "Aaryan Singh",
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
    title: "Aaryan Singh",
    description,
    card: "summary_large_image",
    creator: "@aaryantwt",
    site: "@aaryantwt",
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
}

// Applies the stored theme before first paint so there is no flash.
const themeScript =
  "try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="alternate" type="application/rss+xml" title="Aaryan Singh · Writing" href="/feed.xml" />
        <link rel="me" href="https://github.com/maskjelly" />
        <link rel="me" href="https://x.com/aaryantwt" />
        <link rel="me" href="mailto:aaryan@whiteye.in" />
      </head>
      <body>
        {children}
        <Arrival />
      </body>
    </html>
  )
}
