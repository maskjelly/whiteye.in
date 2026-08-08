import type { Metadata } from "next"
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { KeyboardHelp } from "@/components/keyboard-help"
import Link from "next/link"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
})

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
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${cormorant.variable} antialiased min-h-screen`}
      >
        <div className="site-shell">
          <Navbar />
          {children}
          <footer className="site-footer">
            <Link href="/">aaryan</Link>
            <span>{new Date().getFullYear()}</span>
          </footer>
        </div>
        <KeyboardHelp />
      </body>
    </html>
  )
}
