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
      { name: "macbook pro m4 pro 16″", note: "14-core cpu / 20-core gpu / 24gb. thanks papa." },
      { name: "keychron k1", note: "low-profile mechanical. the one i keep coming back to." },
      { name: "logitech mx master 3s", note: "quiet clicks, infinite scroll. everything else feels wrong." },
    ],
  },
  {
    category: "editor & terminal",
    items: [
      { name: "neovim", note: "my config is in a repo. i have spent too long on it." },
      { name: "ghostty", note: "fast, native, no config ceremony." },
      { name: "tmux", note: "always running. always." },
      { name: "fish", note: "shell. sane defaults, sane scripting." },
    ],
  },
  {
    category: "dev tools",
    items: [
      { name: "git", note: "obviously." },
      { name: "bun", note: "for everything js/ts that doesn't need node specifically." },
      { name: "next.js", note: "this site runs on it." },
      { name: "tldraw + pen & paper", note: "0ms response time, full control. nothing beats it." },
    ],
  },
  {
    category: "the stack i reach for",
    items: [
      { name: "typescript", note: "the default. fast to ship, good enough types." },
      { name: "rust", note: "when i want it to be correct and fast and stay that way." },
      { name: "postgres", note: "i trust it more than i trust most software." },
      { name: "cloudflare", note: "workers, r2, pages. cheap, fast, honest edge." },
    ],
  },
]

export default function UsesPage() {
  return (
    <>
      <header className="mb-10 pt-6">
        <p className="text-gray-500 mb-3 animate-fade-in">/ uses</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white text-balance animate-fade-in">
          what i use
        </h1>
        <p className="text-pretty max-w-[60ch] text-gray-400 mt-4 animate-fade-in-up">
          the stuff i actually reach for, not the stuff that looks good in a
          list. a computer is a tool; here is the shape of mine.
        </p>
      </header>

      <div className="space-y-10">
        {setup.map((group) => (
          <section key={group.category}>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="text-accent accent-glow mr-2">*</span> {group.category}
            </h2>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div key={item.name} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-4">
                  <span className="text-gray-200 sm:w-56 shrink-0">{item.name}</span>
                  <span className="text-gray-500 text-sm">{item.note}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-neutral-800 text-sm">
        <Link href="/" className="text-gray-500 hover:text-accent transition-colors">
          ← back home
        </Link>
      </div>
    </>
  )
}
