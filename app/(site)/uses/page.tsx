import Link from "next/link"
import type { Metadata } from "next"
import { JsonLd, PERSON_ID, SITE } from "@/lib/structured-data"

export const dynamic = "force-static"

const description = "The hardware, editor, terminal and stack that Aaryan Singh works with each day."

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
      { name: "MacBook Pro 16″ M4 Pro", note: "14-core CPU, 20-core GPU, 24 GB. Also the machine on which instantKV is benchmarked." },
      { name: "Keychron K1", note: "A low-profile mechanical keyboard." },
      { name: "Logitech MX Master 3S", note: "Quiet switches and a free-spinning scroll wheel." },
    ],
  },
  {
    category: "Editor and terminal",
    items: [
      { name: "Neovim", note: "Configured rather more than is sensible." },
      { name: "Ghostty", note: "Quick, and native to the platform." },
      { name: "tmux", note: "Never closed." },
      { name: "fish", note: "Sensible defaults." },
    ],
  },
  {
    category: "Dev tools",
    items: [
      { name: "git", note: "As a matter of course." },
      { name: "Bun", note: "My runtime of choice for JavaScript and TypeScript." },
      { name: "Next.js", note: "What this site is built with." },
      { name: "tldraw, pen and paper", note: "Still without equal for thinking a design through." },
    ],
  },
  {
    category: "The stack I favour",
    items: [
      { name: "TypeScript", note: "For most product work." },
      { name: "Rust", note: "Where correctness and speed both matter." },
      { name: "Postgres", note: "Dependable, as a database ought to be." },
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
        <p className="page-intro">The instruments I rely upon, and my reasons for each.</p>
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
