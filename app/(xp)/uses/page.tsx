import Link from "next/link"

export const metadata = {
  title: "uses",
  description: "Hardware and software I actually use.",
}

type UseItem = {
  category: string
  items: { name: string; note: string }[]
}

const setup: UseItem[] = [
  {
    category: "hardware",
    items: [
      { name: "macbook pro m4 pro 16″", note: "14-core / 20-core / 24gb." },
      { name: "keychron k1", note: "low-profile mechanical." },
      { name: "logitech mx master 3s", note: "quiet clicks, infinite scroll." },
    ],
  },
  {
    category: "editor & terminal",
    items: [
      { name: "neovim", note: "too configured." },
      { name: "ghostty", note: "fast and native." },
      { name: "tmux", note: "always running." },
      { name: "fish", note: "sane defaults." },
    ],
  },
  {
    category: "dev tools",
    items: [
      { name: "git", note: "obviously." },
      { name: "bun", note: "the js/ts default." },
      { name: "next.js", note: "this site." },
      { name: "tldraw + pen & paper", note: "still unbeaten." },
    ],
  },
  {
    category: "the stack i reach for",
    items: [
      { name: "typescript", note: "the default." },
      { name: "rust", note: "when it should stay correct." },
      { name: "postgres", note: "reliable software." },
      { name: "cloudflare", note: "workers, r2, pages." },
    ],
  },
]

export default function UsesPage() {
  return (
    <>
      <header className="page-header">
        <p className="page-kicker animate-fade-in">uses</p>
        <h1 className="page-title animate-fade-in">
          the tools.
        </h1>
        <p className="page-intro animate-fade-in-up">
          the things i reach for.
        </p>
      </header>

      <div>
        {setup.map((group) => (
          <section key={group.category} className="uses-group">
            <h2 className="section-title">{group.category}</h2>
            <div className="uses-list">
              {group.items.map((item) => (
                <div key={item.name} className="uses-row">
                  <span className="uses-name">{item.name}</span>
                  <span className="uses-note">{item.note}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="back-row">
        <Link href="/" className="back-link">
          ← back home
        </Link>
      </div>
    </>
  )
}
