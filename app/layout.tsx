import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { KeyboardHelp } from "@/components/keyboard-help"
import Link from "next/link"

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
          <footer className="site-footer">
            <span>
              <Link href="/">aaryan</Link> · built with next.js · press{" "}
              <kbd style={{
                display: "inline-block",
                background: "#111",
                border: "1px solid #2a2a2a",
                borderRadius: "0.2rem",
                padding: "0.05rem 0.3rem",
                fontSize: "0.7rem",
                color: "#9ca3af",
              }}>?</kbd> for shortcuts
            </span>
            <span>© {new Date().getFullYear()}</span>
          </footer>
        </div>
        <KeyboardHelp />
      </body>
    </html>
  )
}
