"use client"

import { useEffect, useState } from "react"

const shortcuts = [
  { key: "h", label: "home" },
  { key: "b", label: "writing" },
  { key: "n", label: "now" },
  { key: "w", label: "work" },
  { key: "p", label: "projects" },
  { key: "?", label: "this help" },
  { key: "esc", label: "close" },
]

export function KeyboardHelp() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        e.target instanceof HTMLInputElement
      ) {
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === "?") {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (!open) return null

  return (
    <div
      className="kbd-overlay"
      role="dialog"
      aria-label="keyboard shortcuts"
      onClick={() => setOpen(false)}
    >
      <div className="kbd-panel" onClick={(e) => e.stopPropagation()}>
        <p className="kbd-title">keyboard shortcuts</p>
        <ul>
          {shortcuts.map((s) => (
            <li key={s.key}>
              <kbd>{s.key}</kbd>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
        <p className="kbd-hint">press esc or click anywhere to close</p>
      </div>
    </div>
  )
}
