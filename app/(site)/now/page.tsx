import Link from "next/link"
import type { Metadata } from "next"
import { JsonLd, PERSON_ID, SITE, SOCIAL_IMAGE } from "@/lib/structured-data"

export const dynamic = "force-static"

const updated = "2026-11-20"
const description =
  "What Aaryan Singh is working on at present: consumer products at scale, a trial with LinkMe, and open-source contributions."

export const metadata: Metadata = {
  title: "Now",
  description,
  alternates: { canonical: "/now" },
  openGraph: { title: "Now · Aaryan Singh", description, url: `${SITE}/now`, type: "website", images: [SOCIAL_IMAGE] },
  twitter: { title: "Now · Aaryan Singh", description, card: "summary_large_image", images: [SOCIAL_IMAGE] },
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
        <h1 className="page-title">What occupies me at present</h1>
        <p className="page-meta">
          Updated <time dateTime={updated}>November 20, 2026</time> · the idea comes from{" "}
          <a href="https://nownownow.com/about" rel="noopener">nownownow</a>
        </p>
      </header>
      <article className="prose-mono">
        <p>
          My attention is on consumer products built for very large audiences, where the difficult part is keeping
          them quick and correct under load. I am at present on trial with LinkMe, the creator platform for consumers
          and businesses.
        </p>
        <p>
          I recently left <a href="https://referrush.com" rel="noopener">ReferRush</a>, where I was the founding
          engineer from the first commit until the platform served 2,300 merchants and had processed more than $1M.
        </p>
        <p>
          Before this I built <a href="https://instantkv.com" rel="noopener">instantKV</a>, a local-first memory
          store for AI agents, written in Rust. It offers BM25 search, filters by topic, tag and time, and a native
          OpenCode MCP server, so that an agent retains facts and task state across restarts without calling a model
          or the cloud.
        </p>
        <p>
          The <a href="https://instantkv.com/benchmarks/" rel="noopener">full retrieval results</a> are published
          for LongMemEval-S, LoCoMo and three BEIR datasets. On LongMemEval-S it reached 95.13% Recall@10 with
          14.34 MiB of sampled server memory on an M4 Pro. Answer accuracy was 85.20% with GPT-6 Luna, which is a
          separate, model-based test. Phone integration remains planned.
        </p>
        <p>
          I also built <a href="https://github.com/maskjelly/morse" rel="noopener">Morse</a>, an agent runtime in
          Rust that continues to run when the client disconnects, with streamed tool output, session replay and
          crash recovery.
        </p>
        <p>
          In open source I am a part-time maintainer of Atuin, Podman Desktop and WebTUI, and contribute to several
          smaller projects besides.
        </p>
        <p>
          I am reading <em>Designing Data-Intensive Applications</em>, not for the first time.
        </p>
        <p>
          I remain open to founding-engineer and systems roles. Do <a href="mailto:aaryan@whiteye.in">write to me</a>,
          or consult the <Link href="/resume">résumé</Link>.
        </p>
      </article>
      <div className="back-row">
        <Link href="/" className="back-link">← Home</Link>
      </div>
    </>
  )
}
