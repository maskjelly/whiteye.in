import Link from "next/link"

export const metadata = {
  title: "now",
  description: "Learning Rust and opening PRs in Tokio and other Rust repos.",
}

export default function NowPage() {
  return (
    <>
      <header className="page-header">
        <p className="page-kicker animate-fade-in">now</p>
        <h1 className="page-title animate-fade-in">lately.</h1>
        <p className="page-meta animate-fade-in-up">
          last updated sep 06, 2026
        </p>
      </header>

      <div className="prose-mono">
        <p>
          Recently left <strong>referrush</strong>.
        </p>
        <p>
          Currently learning <strong>Rust</strong> and opening pull requests in{" "}
          <Link
            href="https://github.com/tokio-rs/tokio"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            <strong>Tokio</strong>
          </Link>{" "}
          and other Rust repositories.
        </p>
        <p>
          Also building{" "}
          <Link
            href="https://lawjurius.com"
            className="text-accent hover:underline"
          >
            <strong>jurius</strong>
          </Link>{" "}
          — litigation intelligence for lawyers.
        </p>
        <p>
          Reading <em>Designing Data-Intensive Applications</em>. Again.
        </p>
        <p>
          Writing here. Arguments welcome in my{" "}
          <Link
            href="https://twitter.com/aaryantwt"
            className="text-accent hover:underline"
          >
            dms
          </Link>
          .
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
