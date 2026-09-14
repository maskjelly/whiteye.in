import Link from "next/link"
import { KeyboardHelp } from "@/components/keyboard-help"
import { Navbar } from "@/components/navbar"

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="site-shell">
      <Navbar />
      {children}
      <footer className="site-footer">
        <Link href="/">aaryan</Link>
        <span className="flex items-center gap-4">
          <Link href="/blog">writing</Link>
          <Link href="/feed.xml">rss</Link>
          <a
            href="https://github.com/maskjelly"
            target="_blank"
            rel="noreferrer"
          >
            github
          </a>
        </span>
      </footer>
      <KeyboardHelp />
    </div>
  )
}
