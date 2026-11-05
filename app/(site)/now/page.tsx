import Link from "next/link"
import type { Metadata } from "next"
import { JsonLd, PERSON_ID, SITE } from "@/lib/structured-data"

export const dynamic = "force-static"

const updated = "2026-11-05"
const description =
  "What Aaryan Singh is working on now: instantKV local-first agent memory in Rust, the Morse agent runtime, and open-source contributions."

export const metadata: Metadata = {
  title: "Now",
  description,
  alternates: { canonical: "/now" },
  openGraph: { title: "Now · Aaryan Singh", description, url: `${SITE}/now`, type: "website" },
  twitter: { title: "Now · Aaryan Singh", description, card: "summary_large_image" },
}

export default function NowPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${SITE}/now#page`,
          url: `${SITE}/now`,
          name: "Now · Aaryan Singh",
          description,
          dateModified: updated,
          about: { "@id": PERSON_ID },
          isPartOf: { "@id": `${SITE}/#website` },
          inLanguage: "en",
        }}
      />
      <header className="page-header animate-fade-in-up">
        <p className="page-kicker">Now</p>
        <h1 className="page-title">What I’m doing lately</h1>
        <p className="page-meta">
          Updated <time dateTime={updated}>November 5, 2026</time> · the idea comes from{" "}
          <a href="https://nownownow.com/about" rel="noopener">nownownow</a>
        </p>
      </header>
      <article className="prose-mono">
        <p>
          Recently left <a href="https://referrush.com" rel="noopener">ReferRush</a>, where I was the founding
          engineer from the first commit through 2,300 merchants and $1M+ processed.
        </p>
        <p>
          Building <a href="https://instantkv.com" rel="noopener">instantKV</a>: local-first memory in Rust with BM25
          search, topic/tag/time filters and a native OpenCode MCP. Agents keep useful facts and task state across
          restarts without a model or cloud call.
        </p>
        <p>
          Published <a href="https://instantkv.com/benchmarks/" rel="noopener">full retrieval results</a> for
          LongMemEval-S, LoCoMo and three BEIR datasets. LongMemEval-S scored 95.13% Recall@10 with 14.34 MiB sampled
          server RAM on an M4 Pro. Answer accuracy was 85.20% with GPT-6 Luna, which is a separate model-based test.
          Phone integration is still planned.
        </p>
        <p>
          Also working on <a href="https://github.com/maskjelly/morse" rel="noopener">Morse</a>, a Rust agent runtime
          that keeps running when the client disconnects, with streamed tool output, session replay and crash recovery.
        </p>
        <p>
          Contributing to open source: 47 merged PRs across 13 external repositories so far, including Podman Desktop,
          Atuin and termlens.
        </p>
        <p>
          Reading <em>Designing Data-Intensive Applications</em>. Again.
        </p>
        <p>
          Open to founding-engineer and systems roles. <a href="mailto:aaryan@whiteye.in">Email me</a> or read the{" "}
          <Link href="/resume">résumé</Link>.
        </p>
      </article>
      <div className="back-row">
        <Link href="/" className="back-link">← Home</Link>
      </div>
    </>
  )
}
