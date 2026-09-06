"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  BROWSER_HOME,
  normalizeWebAddress,
  visitAddress,
  type BrowserHistory,
} from "@/lib/xp-browser"
import { XpIcon } from "./xp-icons"

const favorites = [
  {
    title: "Wikipedia",
    detail: "Follow your curiosity",
    url: "https://en.wikipedia.org/wiki/Main_Page",
    icon: "documents",
  },
  {
    title: "The Rust Book",
    detail: "Learn something new",
    url: "https://doc.rust-lang.org/book/",
    icon: "notepad",
  },
  {
    title: "Windows XP",
    detail: "A little nostalgia",
    url: "https://en.wikipedia.org/wiki/Windows_XP",
    icon: "computer",
  },
]

export default function BrowserApp() {
  const [history, setHistory] = useState<BrowserHistory>({
    entries: [BROWSER_HOME],
    index: 0,
  })
  const [address, setAddress] = useState(BROWSER_HOME)
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [slow, setSlow] = useState(false)
  const [error, setError] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const current = history.entries[history.index]
  const isHome = current === BROWSER_HOME

  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setSlow(true), 12000)
    return () => clearTimeout(timer)
  }, [loading, current, reloadKey])

  function prepare(address: string) {
    setAddress(address)
    setError("")
    setSlow(false)
    setLoading(address !== BROWSER_HOME)
    setReloadKey((key) => key + 1)
  }

  function navigate(value: string) {
    try {
      const next = normalizeWebAddress(value)
      if (
        next !== BROWSER_HOME &&
        window.location.protocol === "https:" &&
        next.startsWith("http:")
      ) {
        throw new Error(
          "This page needs an HTTPS address. Try https:// at the start."
        )
      }
      setHistory((previous) => visitAddress(previous, next))
      prepare(next)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Please enter a valid website address."
      )
      input.current?.focus()
    }
  }

  function moveHistory(offset: number) {
    const index = history.index + offset
    if (index < 0 || index >= history.entries.length) return
    setHistory({ ...history, index })
    prepare(history.entries[index])
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    navigate(address)
  }

  return (
    <div className="internet-browser">
      <div
        className="internet-toolbar"
        role="toolbar"
        aria-label="Browser navigation"
      >
        <button
          title="Back to previous address"
          aria-label="Back to previous address"
          disabled={history.index === 0}
          onClick={() => moveHistory(-1)}
        >
          <XpIcon name="back" size={25} />
          <span>Back</span>
        </button>
        <button
          title="Forward to next address"
          aria-label="Forward to next address"
          disabled={history.index === history.entries.length - 1}
          onClick={() => moveHistory(1)}
        >
          <span className="internet-forward">
            <XpIcon name="back" size={25} />
          </span>
        </button>
        <span className="toolbar-divider" />
        <button
          title="Refresh website"
          aria-label="Refresh website"
          onClick={() => prepare(current)}
        >
          <span className="internet-refresh" aria-hidden="true">
            ↻
          </span>
          <span>Refresh</span>
        </button>
        <button
          title="Browser home"
          aria-label="Browser home"
          onClick={() => navigate(BROWSER_HOME)}
        >
          <XpIcon name="computer" size={25} />
          <span>Home</span>
        </button>
        {!isHome && (
          <a
            className="internet-external"
            href={current}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in new tab <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
      <form className="xp-addressbar internet-addressbar" onSubmit={submit}>
        <label htmlFor="internet-address">Address</label>
        <div className="address-value">
          <XpIcon name="ie" size={16} />
          <input
            ref={input}
            id="internet-address"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "internet-error" : undefined}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            onFocus={(event) => event.target.select()}
            placeholder="Enter a website address"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="go"
          />
        </div>
        <button type="submit">
          <span className="go-arrow">➜</span>
          <span>Go</span>
        </button>
      </form>
      <nav className="internet-favorites" aria-label="Browser favorites">
        <span>Links</span>
        {favorites.map((favorite) => (
          <button key={favorite.url} onClick={() => navigate(favorite.url)}>
            <XpIcon name="ie" size={16} />
            {favorite.title}
          </button>
        ))}
      </nav>
      {error && (
        <p id="internet-error" className="internet-error" role="alert">
          {error}
        </p>
      )}
      <div className="internet-viewport">
        {isHome ? (
          <div className="internet-home">
            <div className="internet-home-heading">
              <XpIcon name="ie" size={64} />
              <div>
                <span>MICROSOFT INTERNET EXPLORER</span>
                <h1>The internet is calling.</h1>
                <p>Type an address above and see where it takes you.</p>
              </div>
            </div>
            <h2>A few places to start</h2>
            <div className="internet-home-links">
              {favorites.map((favorite) => (
                <button
                  key={favorite.url}
                  onClick={() => navigate(favorite.url)}
                >
                  <XpIcon name={favorite.icon} size={32} />
                  <span>
                    <strong>{favorite.title}</strong>
                    <small>{favorite.detail}</small>
                  </span>
                  <span className="internet-link-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              ))}
            </div>
            <p className="internet-home-note">
              <XpIcon name="help" size={20} />
              <span>
                Some websites don’t allow opening inside another site. Use{" "}
                <strong>Open in new tab</strong> for those.
              </span>
            </p>
          </div>
        ) : (
          <iframe
            key={`${current}-${reloadKey}`}
            src={current}
            title={`Website: ${current}`}
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            onLoad={() => {
              setLoading(false)
              setSlow(false)
            }}
          />
        )}
      </div>
      {!isHome && (
        <div className="internet-load-status" role="status">
          <span
            className={loading ? "internet-loading-dot" : ""}
            aria-hidden="true"
          />
          <span>
            {slow
              ? "Taking a while? Try opening this address in a new tab."
              : loading
                ? "Opening website…"
                : "Page blank? This website may block embedding. Try Open in new tab."}
          </span>
        </div>
      )}
    </div>
  )
}
