import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://whiteye.in"),
  title: {
    default: "aaryan",
    template: "%s | aaryan",
  },
  description: "20 y/o engineer. 2x YC. Founding engineer at Referrush. Security, infrastructure, and systems that are hard to corrupt.",
  openGraph: {
    title: "aaryan",
    description: "20 y/o engineer. 2x YC. Founding engineer at Referrush. Security, infrastructure, and systems that are hard to corrupt.",
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
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} antialiased min-h-screen font-mono`}
      >
        <div className="max-w-4xl mx-auto px-5 sm:px-4 py-8">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  )
}
