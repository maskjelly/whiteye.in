"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Writing" },
  { href: "/now", label: "Now" },
  { href: "/resume", label: "Résumé" },
]

function Glyph() {
  return (
    <svg className="wordmark-glyph" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="8" height="8" />
      <rect x="11" y="11" width="8" height="8" />
      <rect x="11" y="1" width="8" height="8" opacity="0.28" />
      <rect x="1" y="11" width="8" height="8" opacity="0.28" />
    </svg>
  )
}

export function Navbar() {
  const pathname = usePathname()

  function isCurrent(href: string) {
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="site-nav" aria-label="Main">
      <Link href="/" className="site-wordmark" aria-label="Aaryan Singh, home">
        <Glyph />
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
