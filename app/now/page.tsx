import Link from "next/link"

export const metadata = {
  title: "now",
  description: "What I'm doing now.",
}

export default function NowPage() {
  return (
    <>
      <header className="page-header">
        <p className="page-kicker animate-fade-in">now</p>
        <h1 className="page-title animate-fade-in">
          lately.
        </h1>
        <p className="page-meta animate-fade-in-up">
          last updated jul 23, 2026
        </p>
      </header>

      <div className="prose-mono">
        <p>
          Building <strong>referrush</strong>. Mostly systems that need to stay up.
        </p>
        <p>
          Also building{" "}
          <Link href="https://lawjurius.com" className="text-accent hover:underline">
            <strong>jurius</strong>
          </Link>{" "}
          — litigation intelligence for lawyers.
        </p>
        <p>
          Reading <em>Designing Data-Intensive Applications</em>. Again.
        </p>
        <p>
          Writing here. Arguments welcome in my{" "}
          <Link href="https://twitter.com/aaryantwt" className="text-accent hover:underline">
            dms
          </Link>.
        </p>
      </div>

      <div className="back-row">
        <Link href="/" className="back-link">
          ← back home
        </Link>
      </div>
    </>
  )
}
