"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

/** Reports one page view per navigation to the site's own counter. */
export function Analytics() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (!pathname || pathname.startsWith("/stats") || pathname === "/x") return
    const body = JSON.stringify({ p: pathname, r: first.current ? document.referrer : "" })
    first.current = false
    if (!navigator.sendBeacon?.("/api/hit", body)) {
      fetch("/api/hit", { method: "POST", body, keepalive: true }).catch(() => {})
    }
  }, [pathname])

  return null
}
