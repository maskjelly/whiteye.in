import Link from "next/link"
import type { Metadata } from "next"
import { JsonLd, PERSON_ID, SITE } from "@/lib/structured-data"

export const dynamic = "force-static"

const description = "The hardware, editor, terminal and stack Aaryan Singh actually uses day to day."

export const metadata: Metadata = {
  title: "Uses",
  description,
  alternates: { canonical: "/uses" },
  openGraph: { title: "Uses · Aaryan Singh", description, url: `${SITE}/uses`, type: "website" },
  twitter: { title: "Uses · Aaryan Singh", description, card: "summary_large_image" },
}

type UseItem = {
  category: string
  items: { name: string; note: string }[]
}

const setup: UseItem[] = [
  {
    category: "Hardware",
    items: [
      { name: "MacBook Pro 16″ M4 Pro", note: "14-core CPU, 20-core GPU, 24 GB. Also the benchmark box for instantKV." },
      { name: "Keychron K1", note: "Low-profile mechanical." },
      { name: "Logitech MX Master 3S", note: "Quiet clicks, infinite scroll." },
    ],
  },
  {
    category: "Editor and terminal",
    items: [
      { name: "Neovim", note: "Too configured." },
      { name: "Ghostty", note: "Fast and native." },
      { name: "tmux", note: "Always running." },
      { name: "fish", note: "Sane defaults." },
    ],
  },
  {
    category: "Dev tools",
    items: [
      { name: "git", note: "Obviously." },
      { name: "Bun", note: "The JS/TS default." },
      { name: "Next.js", note: "This site." },
      { name: "tldraw, pen and paper", note: "Still unbeaten." },
    ],
  },
  {
    category: "The stack I reach for",
    items: [
      { name: "TypeScript", note: "The default." },
      { name: "Rust", note: "When it should stay correct." },
      { name: "Postgres", note: "Reliable software." },
      { name: "Cloudflare", note: "Workers, R2, Pages." },
    ],
  },
]

export default function UsesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          url: `${SITE}/uses`,
          name: "Uses · Aaryan Singh",
          description,
          about: { "@id": PERSON_ID },
          isPartOf: { "@id": `${SITE}/#website` },
          inLanguage: "en",
        }}
      />
      <header className="page-header animate-fade-in-up">
        <p className="page-kicker">Uses</p>
        <h1 className="page-title">The tools</h1>
        <p className="page-intro">The things I reach for, and why.</p>
      </header>

      <div className="stagger">
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
        <Link href="/" className="back-link">← Home</Link>
      </div>
    </>
  )
}
