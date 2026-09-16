"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function Navbar() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        event.target instanceof HTMLInputElement
      ) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const key = event.key.toLowerCase()

      switch (key) {
        case "h":
          router.push("/")
          break
        case "b":
          router.push("/blog")
          break
        case "n":
          router.push("/now")
          break
        case "p":
          document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
          break
        case "w":
          document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [router])

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link href="/" className="site-wordmark" aria-label="Aaryan, home">
        aaryan.
      </Link>
      <div className="site-nav-links">
        <Link
          href="/blog"
          className="site-nav-link"
        >
          writing
        </Link>
        <Link
          href="/now"
          className="site-nav-link"
        >
          now
        </Link>
        <Link
          href="/plain-corners"
          className="site-nav-link"
        >
          corners
        </Link>
      </div>
    </nav>
  )
}
