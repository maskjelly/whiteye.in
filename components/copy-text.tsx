"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyText({ text, label = "copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="xg-copy"
      aria-label={copied ? "Copied" : `Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          },
          () => {},
        )
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? "copied" : label}</span>
    </button>
  )
}
