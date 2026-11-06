"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/blog", label: "Writing" },
  { href: "/now", label: "Now" },
  { href: "/resume", label: "Résumé" },
]

function SunMoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9c0-.5 0-1-.1-1.4A5.5 5.5 0 0 1 13.4 3.1C13 3 12.5 3 12 3z" />
    </svg>
  )
}

export function Navbar() {
  const pathname = usePathname()

  function isCurrent(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="site-nav" aria-label="Main">
      {pathname === "/" ? (
        <span aria-hidden="true" />
      ) : (
        <Link href="/" className="site-wordmark" aria-label="Aaryan Singh, home">
          Aaryan Singh
        </Link>
      )}
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
        <button
          type="button"
          className="icon-button"
          onClick={() => window.dispatchEvent(new CustomEvent("theme:toggle"))}
          aria-label="Toggle dark mode"
          title="Toggle theme (t)"
        >
          <SunMoon />
        </button>
      </div>
    </nav>
  )
}
