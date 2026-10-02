import Link from "next/link"

export const metadata = {
  title: "now",
  description: "Building agent memory and runtimes in Rust, and contributing to open-source software.",
}

export default function NowPage() {
  return (
    <>
      <header className="page-header">
        <p className="page-kicker">now</p>
        <h1 className="page-title">lately.</h1>
        <p className="page-meta">last updated oct 02, 2026</p>
      </header>
      <div className="prose-mono">
        <p>Recently left <a href="https://referrush.com">ReferRush</a>, where I was the founding engineer.</p>
        <p>Building <a href="https://instantkv.com">instantKV</a>: a place for agents to keep shared facts, private notes and durable checkpoints. The code, restart checks and benchmark reports are public.</p>
        <p>Also working on <a href="https://github.com/maskjelly/morse">Morse</a>, a Rust agent runtime that keeps running when the client disconnects.</p>
        <p>Contributing to open source. 47 merged PRs across 13 external repositories so far, including Podman Desktop, Atuin and termlens.</p>
        <p>Reading <em>Designing Data-Intensive Applications</em>. Again.</p>
        <p><a href="/resume">My résumé has the work history, projects and measurements.</a></p>
      </div>
      <div className="back-row"><Link href="/" className="back-link">← back home</Link></div>
    </>
  )
}
