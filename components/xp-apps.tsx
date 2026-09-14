"use client"

import Link from "next/link"
import { useState } from "react"
import { XpIcon } from "./xp-icons"
import { projectItems } from "@/lib/project-items"
import { workItems } from "@/lib/work-items"
import type { PostMeta } from "@/lib/posts"

export type AppId =
  | "welcome"
  | "projects"
  | "work"
  | "writing"
  | "readme"
  | "contact"
  | "recycle"
  | "help"
  | "search"
  | "page"
  | "browser"
  | "games"
  | "minesweeper"
  | "solitaire"
export type OpenApp = (id: AppId) => void
export const apps: Record<
  AppId,
  { title: string; icon: string; short: string }
> = {
  welcome: {
    title: "Welcome — Aaryan’s computer",
    icon: "computer",
    short: "Welcome",
  },
  projects: { title: "My Projects", icon: "folder", short: "My Projects" },
  work: { title: "Work Experience", icon: "documents", short: "My Work" },
  writing: { title: "My Writing", icon: "notepad", short: "My Writing" },
  readme: {
    title: "readme.txt - Notepad",
    icon: "notepad",
    short: "readme.txt",
  },
  contact: {
    title: "Let’s talk — Address Book",
    icon: "mail",
    short: "Contact Me",
  },
  recycle: { title: "Recycle Bin", icon: "recycle", short: "Recycle Bin" },
  help: { title: "Help and Support", icon: "help", short: "Help" },
  search: { title: "Search this computer", icon: "search", short: "Search" },
  page: { title: "Internet Explorer", icon: "ie", short: "Internet Explorer" },
  browser: { title: "Internet Explorer", icon: "ie", short: "Internet" },
  games: { title: "Games", icon: "solitaire", short: "Games" },
  minesweeper: {
    title: "Minesweeper",
    icon: "minesweeper",
    short: "Minesweeper",
  },
  solitaire: { title: "Solitaire", icon: "solitaire", short: "Solitaire" },
}

export function WelcomeApp({ open }: { open: OpenApp }) {
  return (
    <div className="welcome-content">
      <div className="welcome-kicker">
        <span className="online-dot" /> A little corner of the internet
      </div>
      <div className="welcome-heading">
        <div>
          <h1>
            Hi, I’m Aaryan<span>.</span>
          </h1>
          <p className="welcome-location">
            Software engineer · Bangalore, India
          </p>
        </div>
        <div className="profile-picture">
          <XpIcon name="user" size={62} />
        </div>
      </div>
      <p className="welcome-intro">
        I make software and write about
        <br className="desktop-break" /> the parts that break.
      </p>
      <p className="welcome-detail">
        Learning Rust and opening PRs in{" "}
        <a
          href="https://github.com/tokio-rs/tokio"
          target="_blank"
          rel="noreferrer"
        >
          Tokio
        </a>{" "}
        and other Rust repos.
        <br />
        Previously at{" "}
        <a href="https://referrush.com" target="_blank" rel="noreferrer">
          referrush
        </a>
        . Two-time YC alum.
      </p>
      <div className="xp-section-heading">
        <h2>Make yourself at home</h2>
        <span>There’s a bit to explore.</span>
      </div>
      <div className="welcome-folders">
        <AppShortcut
          icon="folder"
          title="My Projects"
          description="Things I’ve built"
          onClick={() => open("projects")}
        />
        <AppShortcut
          icon="notepad"
          title="My Writing"
          description="Notes from the machine room"
          onClick={() => open("writing")}
        />
        <AppShortcut
          icon="documents"
          title="My Work"
          description="Founding engineer · YC ×2"
          onClick={() => open("work")}
        />
        <Link href="/now" className="app-shortcut">
          <XpIcon name="ie" size={38} />
          <span>
            <strong>What I’m up to</strong>
            <small>The now page</small>
          </span>
        </Link>
      </div>
      <div className="welcome-bottom">
        <span>
          <span className="online-dot" /> Always curious. Usually building.
        </span>
        <button onClick={() => open("contact")}>
          Say hello <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  )
}

function AppShortcut({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button className="app-shortcut" onClick={onClick}>
      <XpIcon name={icon} size={38} />
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </button>
  )
}

export function CollectionApp({ kind }: { kind: "projects" | "work" }) {
  const items = kind === "projects" ? projectItems : workItems
  return (
    <div className="collection-content">
      <div className="folder-heading">
        <XpIcon name={kind === "projects" ? "folder" : "documents"} size={48} />
        <div>
          <h1>{kind === "projects" ? "My Projects" : "My Work"}</h1>
          <p>
            {kind === "projects"
              ? "Little experiments. Real-world software."
              : "Founding engineer. Two-time YC alum."}
          </p>
        </div>
      </div>
      <div className="file-list">
        {items.map((item) => (
          <div className="file-row" key={item.title}>
            <XpIcon
              name={kind === "projects" ? "folder" : "computer"}
              size={32}
            />
            <div>
              <h2>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.title} <span className="external-arrow">↗</span>
                  </a>
                ) : (
                  item.title
                )}
              </h2>
              <p>{item.description}</p>
              <small>
                {item.role}
                {item.period && ` · ${item.period}`}
              </small>
            </div>
          </div>
        ))}
      </div>
      {kind === "projects" && (
        <a
          className="xp-text-link"
          href="https://github.com/maskjelly"
          target="_blank"
          rel="noreferrer"
        >
          More experiments on GitHub ↗
        </a>
      )}
    </div>
  )
}

export function WritingApp({ posts }: { posts: PostMeta[] }) {
  return (
    <div className="collection-content">
      <div className="folder-heading">
        <XpIcon name="notepad" size={44} />
        <div>
          <h1>My Writing</h1>
          <p>Notes from the machine room.</p>
        </div>
      </div>
      <div className="file-list">
        {posts.map((post) => (
          <Link
            className="file-row writing-file"
            key={post.slug}
            href={`/xp/blog/${post.slug}`}
          >
            <XpIcon name="notepad" size={28} />
            <div>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <small>
                {post.date} · {post.readingTime} read
              </small>
            </div>
            <span className="external-arrow">↗</span>
          </Link>
        ))}
      </div>
      <div className="xp-text-links">
        <Link href="/xp/blog" className="xp-text-link">
          Open the writing archive →
        </Link>
        <Link href="/blog" className="xp-text-link">
          Read in the web reader →
        </Link>
      </div>
    </div>
  )
}

export function ReadmeApp() {
  return (
    <div className="readme-content">
      <p>hey, welcome to my desktop :)</p>
      <p>
        some things never get old.
        <br />
        blue skies. green hills.
        <br />
        making things on a computer.
      </p>
      <p>
        click around. open a folder.
        <br />
        stay a little while.
      </p>
      <p className="readme-signoff">— aaryan</p>
      <div className="readme-divider">-----------------------------</div>
      <p className="readme-postscript">p.s. the start button works.</p>
    </div>
  )
}

export function ContactApp() {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText("aaryan@whiteye.in")
      setCopied(true)
      setCopyFailed(false)
    } catch {
      setCopyFailed(true)
    }
  }
  return (
    <div className="contact-content">
      <XpIcon name="mail" size={48} />
      <h1>Good conversations start here.</h1>
      <p>
        Building something interesting? Have a question about a post?
        <br />
        Or just want to say hello?
      </p>
      <a className="email-address" href="mailto:aaryan@whiteye.in">
        aaryan@whiteye.in
      </a>
      <div className="contact-buttons">
        <a className="xp-button" href="mailto:aaryan@whiteye.in">
          Write an email
        </a>
        <button className="xp-button" onClick={copyEmail}>
          {copied ? "Copied!" : "Copy address"}
        </button>
      </div>
      <p role="status">
        {copyFailed
          ? "Select the email address above to copy it."
          : copied
            ? "Email address copied to your clipboard."
            : ""}
      </p>
      <div className="elsewhere-links">
        <a href="https://github.com/maskjelly" target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a
          href="https://twitter.com/aaryantwt"
          target="_blank"
          rel="noreferrer"
        >
          Twitter / X ↗
        </a>
        <a href="/feed.xml">RSS feed ↗</a>
      </div>
    </div>
  )
}

export function RecycleApp() {
  return (
    <div className="empty-bin">
      <XpIcon name="recycle" size={64} />
      <h1>The Recycle Bin is empty.</h1>
      <p>The bad ideas are still in my drafts.</p>
      <span>0 objects · 0 bytes</span>
    </div>
  )
}

export function HelpApp() {
  return (
    <div className="help-content">
      <div className="folder-heading">
        <XpIcon name="help" size={40} />
        <div>
          <h1>A familiar place. A few new tricks.</h1>
          <p>Welcome to Aaryan’s personal computer.</p>
        </div>
      </div>
      <p>
        Click a desktop icon to open it. Drag a window by its blue title bar, or
        double-click the title bar to maximize it. Minimized windows live in the
        taskbar.
      </p>
      <dl className="shortcut-list">
        {[
          ["H", "Welcome"],
          ["P", "My Projects"],
          ["W", "My Work"],
          ["B", "My Writing"],
          ["N", "Now page"],
          ["G", "Games"],
          ["I", "Internet Explorer"],
          ["?", "Help and Support"],
          ["Esc", "Dismiss menus"],
        ].map(([key, label]) => (
          <div key={key}>
            <dt>
              <kbd>{key}</kbd>
            </dt>
            <dd>{label}</dd>
          </div>
        ))}
      </dl>
      <p className="help-footnote">
        A personal website inspired by Windows XP. Windows imagery belongs to
        Microsoft.{" "}
        <a href="/xp/credits.txt" target="_blank" rel="noreferrer">
          Asset credits
        </a>
        .
      </p>
    </div>
  )
}

export function SearchApp({
  posts,
  open,
}: {
  posts: PostMeta[]
  open: OpenApp
}) {
  const [query, setQuery] = useState("")
  const entries = [
    ...projectItems.map((item) => ({
      title: item.title,
      description: item.description,
      href: item.href!,
      icon: "folder",
      app: undefined as AppId | undefined,
    })),
    ...posts.map((post) => ({
      title: post.title,
      description: post.description,
      href: `/xp/blog/${post.slug}`,
      icon: "notepad",
      app: undefined as AppId | undefined,
    })),
    ...workItems.map((item) => ({
      title: item.title,
      description: item.description,
      href: "",
      icon: "documents",
      app: "work" as AppId,
    })),
  ]
  const results = query.trim()
    ? entries.filter((item) =>
        `${item.title} ${item.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : []
  return (
    <div className="search-content">
      <h1>What are you looking for?</h1>
      <label htmlFor="desktop-search">Search projects, writing, and work</label>
      <input
        id="desktop-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        placeholder="Try “systems” or “jurius”…"
      />
      <p className="search-status" role="status">
        {query.trim()
          ? `${results.length} result${results.length === 1 ? "" : "s"} found`
          : "Type a few words to explore this computer."}
      </p>
      <div className="file-list">
        {results.map((item) => {
          const content = (
            <>
              <XpIcon name={item.icon} size={28} />
              <div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </>
          )
          return item.app ? (
            <button
              className="file-row"
              key={item.title}
              onClick={() => open(item.app!)}
            >
              {content}
            </button>
          ) : (
            <Link
              className="file-row"
              key={item.title}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
