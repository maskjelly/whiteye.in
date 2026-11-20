"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Writing" },
  { href: "/now", label: "Now" },
  { href: "/resume", label: "Résumé" },
]

export function Navbar() {
  const pathname = usePathname()

  function isCurrent(href: string) {
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="site-nav" aria-label="Main">
      <Link href="/" className="site-wordmark" aria-label="Aaryan Singh, home">
        <span className="wordmark-text">Aaryan Singh</span>
      </Link>
      <div className="site-nav-links">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="site-nav-link"
            aria-current={isCurrent(l.href) ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
        <a className="nav-button" href="https://github.com/maskjelly" rel="noopener">GitHub</a>
        <button
          type="button"
          className="nav-theme"
          onClick={() => window.dispatchEvent(new CustomEvent("theme:toggle"))}
          aria-label="Toggle dark mode"
          title="Toggle theme (t)"
        >
          Theme
        </button>
      </div>
    </nav>
  )
}
