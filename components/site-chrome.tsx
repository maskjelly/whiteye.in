"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Post = { slug: string; title: string }

type Command = {
  id: string
  label: string
  group: "Pages" | "Writing" | "Actions" | "Elsewhere"
  hint?: string
  keywords?: string
  href?: string
  external?: boolean
  run?: () => void
}

const EMAIL = "aaryan@whiteye.in"

function Icon({ name }: { name: "page" | "doc" | "bolt" | "link" | "search" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      )
    case "doc":
      return (
        <svg {...common}>
          <path d="M6 3h8l5 5v13H6z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      )
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </svg>
      )
    case "link":
      return (
        <svg {...common}>
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M4 10h16" />
        </svg>
      )
  }
}

function getTheme(): "light" | "dark" {
  const attr = document.documentElement.getAttribute("data-theme")
  if (attr === "dark" || attr === "light") return attr
  return "light"
}

function setTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme)
  try {
    localStorage.setItem("theme", theme)
  } catch {
    /* storage unavailable */
  }
}

export function SiteChrome({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [index, setIndex] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const pendingG = useRef(false)

  const notify = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 1600)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = getTheme() === "dark" ? "light" : "dark"
    setTheme(next)
    notify(next === "dark" ? "Dark mode" : "Light mode")
  }, [notify])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      notify("Email copied")
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }, [notify])

  const commands = useMemo<Command[]>(
    () => [
      { id: "home", label: "Home", group: "Pages", href: "/", hint: "g h", keywords: "index about" },
      { id: "blog", label: "Writing", group: "Pages", href: "/blog", hint: "g w", keywords: "blog essays posts notes" },
      { id: "now", label: "Now", group: "Pages", href: "/now", hint: "g n", keywords: "current lately" },
      { id: "resume", label: "Résumé", group: "Pages", href: "/resume", hint: "g r", keywords: "cv experience work history" },
      { id: "uses", label: "Uses", group: "Pages", href: "/uses", hint: "g u", keywords: "setup tools hardware" },
      { id: "corners", label: "Plain Corners", group: "Pages", href: "/plain-corners", keywords: "macos app window" },
      { id: "telemetry", label: "rushort telemetry", group: "Pages", href: "/telemetry", keywords: "analytics live metrics" },
      { id: "oracle", label: "Oracle", group: "Pages", href: "/oracle", keywords: "yes no" },
      { id: "xp", label: "Windows XP desktop", group: "Pages", href: "/xp", keywords: "games minesweeper solitaire easter egg" },
      ...posts.map((p) => ({ id: `post-${p.slug}`, label: p.title, group: "Writing" as const, href: `/blog/${p.slug}`, keywords: "essay post" })),
      { id: "theme", label: "Toggle dark mode", group: "Actions", hint: "t", run: toggleTheme, keywords: "light theme appearance" },
      { id: "email", label: "Copy email address", group: "Actions", run: copyEmail, keywords: EMAIL + " contact mail" },
      { id: "pdf", label: "Download résumé PDF", group: "Actions", href: "/Aaryan-Singh-Resume.pdf", external: true, keywords: "cv" },
      { id: "github", label: "GitHub", group: "Elsewhere", href: "https://github.com/maskjelly", external: true, keywords: "code maskjelly" },
      { id: "x", label: "X / Twitter", group: "Elsewhere", href: "https://x.com/aaryantwt", external: true, keywords: "social" },
      { id: "rss", label: "RSS feed", group: "Elsewhere", href: "/feed.xml", external: true, keywords: "subscribe" },
      { id: "source", label: "Site source", group: "Elsewhere", href: "https://github.com/maskjelly/whiteye.in", external: true, keywords: "repo" },
    ],
    [posts, toggleTheme, copyEmail]
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    const terms = q.split(/\s+/)
    return commands.filter((c) => {
      const hay = `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase()
      return terms.every((t) => hay.includes(t))
    })
  }, [commands, query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
    setIndex(0)
  }, [])

  const execute = useCallback(
    (c: Command) => {
      close()
      if (c.run) {
        c.run()
        return
      }
      if (!c.href) return
      if (c.external || c.href.startsWith("http")) {
        window.open(c.href, c.href.startsWith("http") ? "_blank" : "_self", "noopener")
        return
      }
      router.push(c.href)
    },
    [close, router]
  )

  useEffect(() => {
    function isTyping(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable === true
    }

    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (open) return
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key
      if (key === "?" || key === "/") {
        e.preventDefault()
        setOpen(true)
        return
      }
      if (key === "t") {
        toggleTheme()
        return
      }
      if (key === "g") {
        pendingG.current = true
        window.setTimeout(() => {
          pendingG.current = false
        }, 900)
        return
      }
      if (pendingG.current) {
        pendingG.current = false
        const map: Record<string, string> = { h: "/", w: "/blog", b: "/blog", n: "/now", r: "/resume", u: "/uses" }
        const href = map[key.toLowerCase()]
        if (href) router.push(href)
      }
    }

    function onOpen() {
      setOpen(true)
    }

    window.addEventListener("keydown", onKey)
    window.addEventListener("cmd:open", onOpen)
    window.addEventListener("theme:toggle", toggleTheme)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("cmd:open", onOpen)
      window.removeEventListener("theme:toggle", toggleTheme)
    }
  }, [open, router, toggleTheme])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const id = window.setTimeout(() => inputRef.current?.focus(), 10)
    return () => {
      document.body.style.overflow = previous
      window.clearTimeout(id)
    }
  }, [open])

  useEffect(() => {
    setIndex(0)
  }, [query])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [index])

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const c = results[index]
      if (c) execute(c)
    } else if (e.key === "Escape") {
      e.preventDefault()
      close()
    }
  }

  const groups: Command["group"][] = ["Pages", "Writing", "Actions", "Elsewhere"]
  let flat = -1

  return (
    <>
      {open && (
        <div className="cmd-overlay" onMouseDown={close} role="presentation">
          <div
            className="cmd-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="cmd-input-row">
              <Icon name="search" />
              <input
                ref={inputRef}
                className="cmd-input"
                placeholder="Search pages, essays, actions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                role="combobox"
                aria-expanded="true"
                aria-controls="cmd-list"
                aria-autocomplete="list"
              />
              <kbd>esc</kbd>
            </div>
            <ul className="cmd-list" id="cmd-list" role="listbox" ref={listRef}>
              {results.length === 0 && <li className="cmd-empty">Nothing matches “{query}”.</li>}
              {groups.map((g) => {
                const items = results.filter((c) => c.group === g)
                if (items.length === 0) return null
                return (
                  <li key={g} role="presentation">
                    <div className="cmd-group-label">{g}</div>
                    <ul role="presentation" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {items.map((c) => {
                        flat += 1
                        const i = flat
                        const icon = c.group === "Writing" ? "doc" : c.group === "Actions" ? "bolt" : c.external ? "link" : "page"
                        return (
                          <li key={c.id} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={i === index}
                              data-index={i}
                              className="cmd-item"
                              onMouseEnter={() => setIndex(i)}
                              onClick={() => execute(c)}
                            >
                              <Icon name={icon} />
                              <span className="cmd-item-label">{c.label}</span>
                              {c.hint && <span className="cmd-item-hint">{c.hint}</span>}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                )
              })}
            </ul>
            <div className="cmd-footer">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> open</span>
              <span><kbd>g</kbd> then a key to jump</span>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  )
}
