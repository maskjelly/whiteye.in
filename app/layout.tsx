import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google"
import "./globals.css"
import { Arrival } from "@/components/arrival"

const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" })
const serif = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-source-serif", display: "swap" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })

const description =
  "Aaryan Singh is a software engineer from Assam, India, working remotely: founding engineer at ReferRush, early engineer at Extraordinary, University of Waterloo dropout, now building high-scale consumer products and trialing with LinkMe. 47 merged open-source pull requests, measured benchmarks and essays on systems."

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
    "consumer products",
    "high-scale consumer apps",
    "LinkMe",
    "instantKV",
    "rushort",
    "open source",
    "systems engineering",
    "whiteye",
    "remote software engineer India",
    "Rust engineer India",
    "Indian software engineer",
    "young founding engineer",
    "early-career engineer",
    "University of Waterloo dropout",
    "self-taught systems engineer",
    "consumer product engineer",
    "open-source contributor India",
    "maskjelly",
  ],
  category: "technology",
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
  colorScheme: "light",
  themeColor: "#f7f6f5",
}

// Applies the stored theme and colour palette before first paint so there is no flash.
const themeScript =
  "try{var d=document.documentElement,t=localStorage.getItem('theme');if(t==='dark'||t==='light'){d.setAttribute('data-theme',t)}}catch(e){}"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
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
