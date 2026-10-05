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
        <p className="page-meta">last updated oct 05, 2026</p>
      </header>
      <div className="prose-mono">
        <p>Recently left <a href="https://referrush.com">ReferRush</a>, where I was the founding engineer.</p>
        <p>Building <a href="https://instantkv.com">instantKV</a>: local-first memory in Rust with BM25 search, topic/tag/time filters and a native OpenCode MCP. Agents can keep useful facts and task state across restarts.</p>
        <p>Published <a href="https://instantkv.com/benchmarks/">full retrieval results</a> for LongMemEval-S, LoCoMo and three BEIR datasets. LongMemEval-S scored 95.13% Recall@10 with 14.34 MiB sampled server RAM on an M4 Pro. Answer accuracy was 85.20% with GPT-6 Luna; that is a separate model-based test. Phone integration is still planned.</p>
        <p>Also working on <a href="https://github.com/maskjelly/morse">Morse</a>, a Rust agent runtime that keeps running when the client disconnects.</p>
        <p>Contributing to open source. 47 merged PRs across 13 external repositories so far, including Podman Desktop, Atuin and termlens.</p>
        <p>Reading <em>Designing Data-Intensive Applications</em>. Again.</p>
        <p><a href="/resume">My résumé has the work history, projects and measurements.</a></p>
      </div>
      <div className="back-row"><Link href="/" className="back-link">← back home</Link></div>
    </>
  )
}
