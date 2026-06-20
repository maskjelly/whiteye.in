"use client"

import { useEffect, useState } from "react"

type TocItem = {
  id: string
  text: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const article = document.querySelector("article.prose-mono")
    if (!article) return

    const headings = Array.from(article.querySelectorAll("h2"))
    const toc: TocItem[] = []

    headings.forEach((h) => {
      const text = h.textContent?.trim() ?? ""
      if (!text) return
      const id = slugify(text)
      h.id = id

      // inject anchor link if not already there
      if (!h.querySelector("a.anchor")) {
        const anchor = document.createElement("a")
        anchor.className = "anchor"
        anchor.href = `#${id}`
        anchor.setAttribute("aria-label", `link to ${text}`)
        h.appendChild(anchor)
      }

      toc.push({ id, text })
    })

    setItems(toc)

    // scroll to hash if present
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1))
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50)
      }
    }

    // scroll-spy
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  if (items.length === 0) return null

  return (
    <nav className="toc" aria-label="table of contents">
      <p className="toc-title">on this page</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={activeId === item.id ? "active" : ""}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
