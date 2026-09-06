"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { usePathname, useRouter } from "next/navigation"
import { XpIcon, WindowsFlag } from "./xp-icons"
import {
  apps,
  WelcomeApp,
  CollectionApp,
  WritingApp,
  ReadmeApp,
  ContactApp,
  RecycleApp,
  HelpApp,
  SearchApp,
  type AppId,
  type OpenApp,
} from "./xp-apps"
import type { PostMeta } from "@/lib/posts"

const BrowserApp = dynamic(() => import("./xp-browser"))
const GamesApp = dynamic(() =>
  import("./xp-games").then((module) => module.GamesApp)
)
const MinesweeperApp = dynamic(() =>
  import("./xp-games").then((module) => module.MinesweeperApp)
)
const SolitaireApp = dynamic(() =>
  import("./xp-games").then((module) => module.SolitaireApp)
)

function trapDialogFocus(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return
  const controls =
    event.currentTarget.querySelectorAll<HTMLButtonElement>("button")
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

type WindowState = {
  id: AppId
  minimized: boolean
  maximized: boolean
  z: number
}
const shortcuts: AppId[] = [
  "welcome",
  "browser",
  "projects",
  "writing",
  "work",
  "contact",
  "minesweeper",
  "solitaire",
  "readme",
  "recycle",
]

export function XpDesktop({
  children,
  posts,
}: {
  children: ReactNode
  posts: PostMeta[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [windows, setWindows] = useState<WindowState[]>(() =>
    pathname === "/"
      ? []
      : [{ id: "page", minimized: false, maximized: false, z: 2 }]
  )
  const [startOpen, setStartOpen] = useState(false)
  const [clock, setClock] = useState("--:--")
  const [date, setDate] = useState("")
  const [clockOpen, setClockOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [powerOpen, setPowerOpen] = useState(false)
  const [sleeping, setSleeping] = useState(false)
  const [desktopNotice, setDesktopNotice] = useState(true)
  const layer = useRef(3)
  const startRef = useRef<HTMLDivElement>(null)
  const previousPath = useRef(pathname)
  const visibleWindows = windows.filter(
    (item) => !item.minimized && (item.id !== "page" || pathname !== "/")
  )
  const activeId = [...visibleWindows].sort((a, b) => b.z - a.z)[0]?.id

  const open = useCallback<OpenApp>((id) => {
    const z = ++layer.current
    setWindows((current) =>
      current.some((item) => item.id === id)
        ? current.map((item) =>
            item.id === id ? { ...item, minimized: false, z } : item
          )
        : [...current, { id, minimized: false, maximized: false, z }]
    )
    setStartOpen(false)
    setDesktopNotice(false)
  }, [])

  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    setStartOpen(false)
    if (pathname !== "/") open("page")
    else {
      setWindows((current) => current.filter((item) => item.id !== "page"))
    }
  }, [pathname, open])

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setClock(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "Asia/Kolkata",
        })
      )
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Kolkata",
        })
      )
    }
    update()
    const timer = setInterval(update, 10000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const outside = (event: globalThis.PointerEvent) => {
      if (startRef.current && !startRef.current.contains(event.target as Node))
        setStartOpen(false)
    }
    document.addEventListener("pointerdown", outside)
    return () => document.removeEventListener("pointerdown", outside)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStartOpen(false)
        setClockOpen(false)
        setPowerOpen(false)
        return
      }
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (event.target instanceof HTMLElement &&
          event.target.closest(
            "input, textarea, select, [contenteditable=true]"
          ))
      )
        return
      const keys: Record<string, AppId> = {
        h: "welcome",
        b: "writing",
        p: "projects",
        w: "work",
        "?": "help",
        g: "games",
        i: "browser",
      }
      if (keys[event.key.toLowerCase()]) {
        event.preventDefault()
        open(keys[event.key.toLowerCase()])
      }
      if (event.key.toLowerCase() === "n") router.push("/now")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, router])

  function focus(id: AppId) {
    const z = ++layer.current
    setWindows((current) =>
      current.map((item) => (item.id === id ? { ...item, z } : item))
    )
    setStartOpen(false)
  }
  function close(id: AppId) {
    setWindows((current) => current.filter((item) => item.id !== id))
    if (id === "page") router.push("/")
  }
  function minimize(id: AppId) {
    setWindows((current) =>
      current.map((item) =>
        item.id === id ? { ...item, minimized: true } : item
      )
    )
  }
  function maximize(id: AppId) {
    setWindows((current) =>
      current.map((item) =>
        item.id === id ? { ...item, maximized: !item.maximized } : item
      )
    )
    focus(id)
  }
  function showDesktop() {
    const shouldMinimize = windows.some((item) => !item.minimized)
    setWindows((current) =>
      current.map((item) => ({ ...item, minimized: shouldMinimize }))
    )
    setStartOpen(false)
  }
  function restartDesktop() {
    setWindows([])
    setPowerOpen(false)
    setDesktopNotice(true)
    if (pathname !== "/") router.push("/")
  }
  function playChime() {
    if (soundOn) {
      setSoundOn(false)
      return
    }
    setSoundOn(true)
    try {
      const context = new AudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = "sine"
        oscillator.frequency.value = frequency
        gain.gain.setValueAtTime(0, context.currentTime + index * 0.13)
        gain.gain.linearRampToValueAtTime(
          0.075,
          context.currentTime + index * 0.13 + 0.04
        )
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          context.currentTime + index * 0.13 + 0.65
        )
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.start(context.currentTime + index * 0.13)
        oscillator.stop(context.currentTime + index * 0.13 + 0.7)
      })
      setTimeout(() => void context.close(), 1500)
    } catch {
      setSoundOn(false)
    }
  }

  const pageTitle =
    pathname === "/now"
      ? "Now — Internet Explorer"
      : pathname === "/uses"
        ? "My Setup — Internet Explorer"
        : pathname === "/blog"
          ? "Writing — Internet Explorer"
          : `${posts.find((post) => pathname === `/blog/${post.slug}`)?.title ?? "Page not found"} — Internet Explorer`

  return (
    <main
      className="xp-desktop"
      aria-label="Aaryan’s Windows XP desktop"
      onClickCapture={(event) => {
        const href = (event.target as HTMLElement)
          .closest("a")
          ?.getAttribute("href")
        if (href === pathname && pathname !== "/") open("page")
      }}
    >
      <a className="skip-link" href="#desktop-windows">
        Skip to open windows
      </a>
      <div
        className="desktop-workspace"
        inert={powerOpen || sleeping}
        onClick={() => {
          setClockOpen(false)
        }}
      >
        <nav className="desktop-icons" aria-label="Desktop shortcuts">
          {shortcuts.map((id) => (
            <button
              key={id}
              className="desktop-shortcut"
              onClick={() => open(id)}
              title={`Open ${apps[id].short}`}
            >
              <XpIcon name={apps[id].icon} size={44} />
              <span>{id === "welcome" ? "My Computer" : apps[id].short}</span>
            </button>
          ))}
          <a
            className="desktop-shortcut"
            href="https://github.com/maskjelly"
            target="_blank"
            rel="noreferrer"
            title="Open GitHub"
          >
            <div className="shortcut-icon">
              <XpIcon name="ie" size={44} />
              <span className="shortcut-arrow">↗</span>
            </div>
            <span>GitHub</span>
          </a>
        </nav>
        <div className="desktop-signature">
          <span>aaryan’s computer</span>
          <span>personal space / public internet</span>
        </div>
        <div id="desktop-windows" tabIndex={-1}>
          {windows
            .filter((item) => item.id !== "page" || pathname !== "/")
            .map((item) => (
              <XpWindow
                key={item.id}
                state={item}
                title={item.id === "page" ? pageTitle : apps[item.id].title}
                active={activeId === item.id}
                onFocus={() => focus(item.id)}
                onClose={() => close(item.id)}
                onMinimize={() => minimize(item.id)}
                onMaximize={() => maximize(item.id)}
                open={open}
                pathname={pathname}
                showDesktop={showDesktop}
              >
                {item.id === "welcome" && <WelcomeApp open={open} />}
                {(item.id === "projects" || item.id === "work") && (
                  <CollectionApp kind={item.id} />
                )}
                {item.id === "writing" && <WritingApp posts={posts} />}
                {item.id === "readme" && <ReadmeApp />}
                {item.id === "contact" && <ContactApp />}
                {item.id === "recycle" && <RecycleApp />}
                {item.id === "help" && <HelpApp />}
                {item.id === "games" && <GamesApp open={open} />}
                {item.id === "minesweeper" && <MinesweeperApp />}
                {item.id === "solitaire" && <SolitaireApp />}
                {item.id === "browser" && <BrowserApp />}
                {item.id === "search" && (
                  <SearchApp posts={posts} open={open} />
                )}
                {item.id === "page" && (
                  <div key={pathname} className="xp-document">
                    {children}
                  </div>
                )}
              </XpWindow>
            ))}
        </div>
        {desktopNotice && (
          <div className="desktop-tip">
            <XpIcon name="help" size={16} />
            <span>Your desktop, your pace. Click an icon to explore.</span>
            <button
              aria-label="Dismiss desktop tip"
              onClick={() => setDesktopNotice(false)}
            >
              ×
            </button>
          </div>
        )}
        <div className="desktop-watermark">
          aaryan · whiteye.in
          <br />
          <span>Built for the web. Feels like home.</span>
        </div>
      </div>
      <div
        ref={startRef}
        className="start-container"
        inert={powerOpen || sleeping}
      >
        {startOpen && (
          <div className="start-menu" aria-label="Start menu">
            <div className="start-header">
              <div className="start-avatar">
                <XpIcon name="user" size={44} />
              </div>
              <span>Aaryan</span>
            </div>
            <div className="start-columns">
              <div className="start-primary">
                <button onClick={() => open("browser")}>
                  <XpIcon name="ie" size={36} />
                  <span>
                    <strong>Internet</strong>
                    <small>Internet Explorer</small>
                  </span>
                </button>
                <button onClick={() => open("contact")}>
                  <XpIcon name="mail" size={36} />
                  <span>
                    <strong>E-mail</strong>
                    <small>Let’s start a conversation</small>
                  </span>
                </button>
                <hr />
                {(
                  ["projects", "writing", "work", "games", "readme"] as AppId[]
                ).map((id) => (
                  <button key={id} onClick={() => open(id)}>
                    <XpIcon name={apps[id].icon} size={32} />
                    <span>{apps[id].short}</span>
                  </button>
                ))}
                <hr />
                <button
                  onClick={() => {
                    setStartOpen(false)
                    open("search")
                  }}
                  className="all-programs"
                >
                  <strong>Explore this computer</strong>
                  <span>▶</span>
                </button>
              </div>
              <div className="start-secondary">
                <button onClick={() => open("welcome")}>
                  <XpIcon name="computer" size={24} />
                  <strong>My Computer</strong>
                </button>
                <Link href="/now" onClick={() => setStartOpen(false)}>
                  <XpIcon name="documents" size={24} />
                  What I’m up to
                </Link>
                <Link href="/uses" onClick={() => setStartOpen(false)}>
                  <XpIcon name="settings" size={24} />
                  My Setup
                </Link>
                <hr />
                <a
                  href="https://github.com/maskjelly"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setStartOpen(false)}
                >
                  <XpIcon name="network" size={24} />
                  GitHub
                </a>
                <a
                  href="https://twitter.com/aaryantwt"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setStartOpen(false)}
                >
                  <XpIcon name="ie" size={24} />
                  Twitter / X
                </a>
                <hr />
                <button onClick={() => open("help")}>
                  <XpIcon name="help" size={24} />
                  Help and Support
                </button>
                <button onClick={() => open("search")}>
                  <XpIcon name="search" size={24} />
                  Search
                </button>
              </div>
            </div>
            <div className="start-footer">
              <button onClick={showDesktop}>
                <XpIcon name="computer" size={25} />
                Show desktop
              </button>
              <button
                onClick={() => {
                  setPowerOpen(true)
                  setStartOpen(false)
                }}
              >
                <XpIcon name="power" size={25} />
                Turn off computer
              </button>
            </div>
          </div>
        )}
        <button
          className={`start-button ${startOpen ? "is-open" : ""}`}
          aria-expanded={startOpen}
          aria-label="Start"
          onClick={() => setStartOpen((value) => !value)}
        >
          <WindowsFlag />
          <span>start</span>
        </button>
      </div>
      <footer
        className="xp-taskbar"
        aria-label="Taskbar"
        inert={powerOpen || sleeping}
      >
        <div className="quick-launch">
          <button
            onClick={showDesktop}
            aria-label="Show desktop"
            title="Show desktop"
          >
            <XpIcon name="computer" size={20} />
          </button>
          <button
            onClick={() => open("browser")}
            aria-label="Open Internet Explorer"
            title="Internet Explorer"
          >
            <XpIcon name="ie" size={20} />
          </button>
        </div>
        <div className="taskbar-apps">
          {windows
            .filter((item) => item.id !== "page" || pathname !== "/")
            .map((item) => (
              <button
                key={item.id}
                className={`taskbar-app ${activeId === item.id && !item.minimized ? "active" : ""}`}
                title={item.id === "page" ? pageTitle : apps[item.id].title}
                onClick={() =>
                  activeId === item.id && !item.minimized
                    ? minimize(item.id)
                    : open(item.id)
                }
              >
                <XpIcon name={apps[item.id].icon} size={17} />
                <span>
                  {item.id === "page" ? pageTitle : apps[item.id].title}
                </span>
              </button>
            ))}
        </div>
        <div className="system-tray">
          <button
            onClick={playChime}
            aria-label={soundOn ? "Mute sound" : "Play a desktop chime"}
            title={
              soundOn
                ? "Sound on — click to mute"
                : "Sound off — click for a little nostalgia"
            }
          >
            <XpIcon name="sound" size={17} />
            {!soundOn && <span className="muted-mark">×</span>}
          </button>
          <button
            className="network-tray"
            onClick={() => open("contact")}
            aria-label="Connect with Aaryan"
            title="Connected to the internet"
          >
            <XpIcon name="network" size={19} />
          </button>
          <button
            className="taskbar-clock"
            onClick={() => setClockOpen((value) => !value)}
            aria-expanded={clockOpen}
            title={`${date} · Bangalore (IST)`}
          >
            {clock}
          </button>
        </div>
      </footer>
      {clockOpen && (
        <div className="clock-popup">
          <strong>{clock}</strong>
          <p>{date}</p>
          <span>Bangalore, India · India Standard Time</span>
        </div>
      )}
      {powerOpen && (
        <div className="xp-modal-backdrop" onClick={() => setPowerOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="power-title"
            className="power-dialog"
            onKeyDown={trapDialogFocus}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="power-heading">
              <h2 id="power-title">Turn off computer</h2>
              <WindowsFlag />
            </div>
            <p>Time for a little break?</p>
            <div className="power-actions">
              <button
                autoFocus
                onClick={() => {
                  setSleeping(true)
                  setPowerOpen(false)
                }}
              >
                <XpIcon name="power" size={40} />
                <span>Stand by</span>
              </button>
              <button onClick={restartDesktop}>
                <XpIcon name="computer" size={40} />
                <span>Restart desktop</span>
              </button>
            </div>
            <div className="power-footer">
              <button className="xp-button" onClick={() => setPowerOpen(false)}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}
      {sleeping && (
        <div
          className="xp-sleep-screen"
          role="dialog"
          aria-modal="true"
          aria-label="Computer on standby"
          onKeyDown={trapDialogFocus}
        >
          <div>
            <WindowsFlag />
            <h1>See you soon.</h1>
            <p>It’s a beautiful day to go outside.</p>
            <button
              className="xp-button"
              autoFocus
              onClick={() => setSleeping(false)}
            >
              Back to my desktop →
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

function XpWindow({
  state,
  title,
  active,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  open,
  pathname,
  showDesktop,
  children,
}: {
  state: WindowState
  title: string
  active: boolean
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  open: OpenApp
  pathname: string
  showDesktop: () => void
  children: ReactNode
}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  )
  const [sidebar, setSidebar] = useState(true)
  const [menu, setMenu] = useState<string | null>(null)
  const windowRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    x: number
    y: number
    originX: number
    originY: number
  } | null>(null)
  const router = useRouter()
  const explorer = [
    "welcome",
    "projects",
    "work",
    "writing",
    "recycle",
  ].includes(state.id)
  const browser = state.id === "page"

  useEffect(() => {
    const dismiss = (event: globalThis.PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(null)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null)
    }
    document.addEventListener("pointerdown", dismiss)
    document.addEventListener("keydown", key)
    return () => {
      document.removeEventListener("pointerdown", dismiss)
      document.removeEventListener("keydown", key)
    }
  }, [])

  useEffect(() => {
    const clamp = () =>
      setPosition((current) =>
        current
          ? {
              x: Math.max(
                0,
                Math.min(
                  current.x,
                  window.innerWidth -
                    Math.min(
                      windowRef.current?.offsetWidth ?? 320,
                      window.innerWidth
                    )
                )
              ),
              y: Math.max(0, Math.min(current.y, window.innerHeight - 110)),
            }
          : null
      )
    window.addEventListener("resize", clamp)
    return () => window.removeEventListener("resize", clamp)
  }, [])

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (
      event.button !== 0 ||
      state.maximized ||
      window.innerWidth <= 680 ||
      (event.target as HTMLElement).closest("button")
    )
      return
    const rect = windowRef.current?.getBoundingClientRect()
    if (!rect) return
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      originX: rect.left,
      originY: rect.top,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    setPosition({
      x: Math.max(
        0,
        Math.min(
          window.innerWidth -
            Math.min(windowRef.current?.offsetWidth ?? 320, window.innerWidth),
          drag.current.originX + event.clientX - drag.current.x
        )
      ),
      y: Math.max(
        0,
        Math.min(
          window.innerHeight - 110,
          drag.current.originY + event.clientY - drag.current.y
        )
      ),
    })
  }
  const menuActions: Record<string, { label: string; action: () => void }[]> = {
    File: [
      { label: "Welcome", action: () => open("welcome") },
      { label: "Internet Explorer", action: () => open("browser") },
      { label: "Games", action: () => open("games") },
      { label: "My Projects", action: () => open("projects") },
      { label: "My Writing", action: () => open("writing") },
      { label: "Close window", action: onClose },
    ],
    Edit: [
      { label: "Find something…", action: () => open("search") },
      { label: "Contact Aaryan…", action: () => open("contact") },
    ],
    View: [
      {
        label: state.maximized ? "Restore window" : "Maximize window",
        action: onMaximize,
      },
      { label: "Minimize window", action: onMinimize },
      ...(explorer
        ? [
            {
              label: `${sidebar ? "Hide" : "Show"} folders sidebar`,
              action: () => setSidebar((value) => !value),
            },
          ]
        : []),
      { label: "Show desktop", action: showDesktop },
    ],
    Favorites: [
      { label: "My writing", action: () => open("writing") },
      { label: "What I’m up to", action: () => router.push("/now") },
      { label: "My setup", action: () => router.push("/uses") },
    ],
    Tools: [
      { label: "My setup", action: () => router.push("/uses") },
      { label: "Search this computer…", action: () => open("search") },
    ],
    Help: [
      { label: "Help and keyboard shortcuts", action: () => open("help") },
      { label: "About Aaryan", action: () => open("welcome") },
    ],
  }
  const style: CSSProperties = {
    zIndex: state.z,
    ...(position && !state.maximized
      ? { left: position.x, top: position.y }
      : {}),
  }
  const path = browser
    ? `https://whiteye.in${pathname}`
    : `C:\\Documents and Settings\\Aaryan${state.id === "welcome" ? "" : `\\${apps[state.id].short}`}`

  return (
    <section
      ref={windowRef}
      className={`xp-window window-${state.id} ${active ? "is-active" : "is-inactive"} ${state.maximized ? "is-maximized" : ""}`}
      style={style}
      hidden={state.minimized}
      aria-label={title}
      onPointerDownCapture={onFocus}
      onFocusCapture={() => {
        if (!active) onFocus()
      }}
    >
      <div
        className="xp-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => {
          drag.current = null
        }}
        onLostPointerCapture={() => {
          drag.current = null
        }}
        onDoubleClick={(event) => {
          if (!(event.target as HTMLElement).closest("button")) onMaximize()
        }}
      >
        <XpIcon name={apps[state.id].icon} size={17} />
        <h2>{title}</h2>
        <div className="window-controls">
          <button
            className="minimize-control"
            onClick={onMinimize}
            aria-label={`Minimize ${apps[state.id].short}`}
            title="Minimize"
          >
            <span />
          </button>
          <button
            className={state.maximized ? "restore-control" : "maximize-control"}
            onClick={onMaximize}
            aria-label={`${state.maximized ? "Restore" : "Maximize"} ${apps[state.id].short}`}
            title={state.maximized ? "Restore" : "Maximize"}
          >
            <span />
          </button>
          <button
            className="close-control"
            onClick={onClose}
            aria-label={`Close ${apps[state.id].short}`}
            title="Close"
          >
            <span />
          </button>
        </div>
      </div>
      <div className="xp-menubar" ref={menuRef}>
        {(["readme", "games", "minesweeper", "solitaire"].includes(state.id)
          ? ["File", "Edit", "View", "Help"]
          : ["File", "Edit", "View", "Favorites", "Tools", "Help"]
        ).map((label) => (
          <div className="menu-holder" key={label}>
            <button
              className={menu === label ? "menu-active" : ""}
              aria-expanded={menu === label}
              aria-haspopup="true"
              onClick={() =>
                setMenu((current) => (current === label ? null : label))
              }
            >
              <span className="menu-mnemonic">{label[0]}</span>
              {label.slice(1)}
            </button>
            {menu === label && (
              <div className="xp-dropdown">
                {menuActions[label].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      action.action()
                      setMenu(null)
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {(explorer || browser) && (
          <div className="menubar-logo">
            <WindowsFlag />
          </div>
        )}
      </div>
      {(explorer || browser) && (
        <>
          <div className="xp-toolbar">
            <button
              className="toolbar-back"
              onClick={() =>
                browser
                  ? router.push(pathname.startsWith("/blog/") ? "/blog" : "/")
                  : open("welcome")
              }
              title="Back to home"
            >
              <XpIcon name="back" size={27} />
              <span>Back</span>
              <span className="tiny-caret">▾</span>
            </button>
            <button
              className="toolbar-up"
              onClick={() => open("welcome")}
              title="Up to My Computer"
              aria-label="Up to My Computer"
            >
              <XpIcon name="up" size={27} />
            </button>
            <div className="toolbar-divider" />
            <button onClick={() => open("search")}>
              <XpIcon name="search" size={27} />
              <span>Search</span>
            </button>
            {explorer && (
              <button
                className={sidebar ? "toolbar-selected" : ""}
                onClick={() => setSidebar((value) => !value)}
                aria-pressed={sidebar}
              >
                <XpIcon name="folder" size={27} />
                <span>Folders</span>
              </button>
            )}
            {browser && (
              <button onClick={() => open("writing")}>
                <XpIcon name="notepad" size={25} />
                <span>My Writing</span>
              </button>
            )}
          </div>
          <div className="xp-addressbar">
            <span>Address</span>
            <div className="address-value">
              <XpIcon name={browser ? "ie" : "folder"} size={16} />
              <span>{path}</span>
              <span className="address-dropdown">▾</span>
            </div>
            <button
              onClick={() => (browser ? router.refresh() : open(state.id))}
              title={browser ? "Refresh page" : "Open folder"}
            >
              <span className="go-arrow">➜</span>
              <span>Go</span>
            </button>
          </div>
        </>
      )}
      <div className="xp-window-body">
        {explorer && sidebar && (
          <aside className="explorer-sidebar">
            <div className="explorer-group">
              <h3>
                System Tasks <span>⌃</span>
              </h3>
              <div>
                <button onClick={() => open("welcome")}>
                  <XpIcon name="computer" size={16} />
                  About this human
                </button>
                <Link href="/now">
                  <XpIcon name="ie" size={16} />
                  What I’m up to
                </Link>
                <Link href="/uses">
                  <XpIcon name="settings" size={16} />
                  View my setup
                </Link>
              </div>
            </div>
            <div className="explorer-group">
              <h3>
                Other Places <span>⌃</span>
              </h3>
              <div>
                <button onClick={() => open("projects")}>
                  <XpIcon name="folder" size={16} />
                  My Projects
                </button>
                <button onClick={() => open("writing")}>
                  <XpIcon name="notepad" size={16} />
                  My Writing
                </button>
                <button onClick={() => open("work")}>
                  <XpIcon name="documents" size={16} />
                  My Work
                </button>
                <button onClick={() => open("contact")}>
                  <XpIcon name="mail" size={16} />
                  Contact Me
                </button>
              </div>
            </div>
            <div className="explorer-group">
              <h3>
                Details <span>⌃</span>
              </h3>
              <div className="explorer-details">
                <strong>
                  {state.id === "welcome"
                    ? "Aaryan’s computer"
                    : apps[state.id].short}
                </strong>
                <span>
                  {state.id === "welcome" ? "Personal website" : "File folder"}
                </span>
                <p>
                  Some software.
                  <br />
                  Some words.
                  <br />A work in progress.
                </p>
              </div>
            </div>
          </aside>
        )}
        <div
          className="xp-content-scroll"
          tabIndex={0}
          aria-label={`${apps[state.id].short} content`}
        >
          {children}
        </div>
      </div>
      <div className="xp-statusbar">
        <span>
          {state.id === "readme"
            ? "Just a little note."
            : state.id === "welcome"
              ? "Welcome to my corner of the internet."
              : state.id === "recycle"
                ? "0 objects"
                : "Done"}
        </span>
        <span>
          <XpIcon
            name={browser || state.id === "browser" ? "ie" : "computer"}
            size={14}
          />
          {state.id === "readme"
            ? "UTF-8"
            : browser || state.id === "browser"
              ? "Internet"
              : "My Computer"}
        </span>
        <i className="resize-grip" aria-hidden="true" />
      </div>
    </section>
  )
}
