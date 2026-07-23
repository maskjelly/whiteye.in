import Link from "next/link"

export const metadata = {
  title: "now",
  description: "What I'm doing now.",
}

export default function NowPage() {
  return (
    <>
      <header className="mb-10 pt-6">
        <p className="text-gray-500 mb-3 animate-fade-in">/ now</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white text-balance animate-fade-in">
          what i&apos;m doing now
        </h1>
        <p className="text-sm text-gray-600 mt-3 animate-fade-in-up">
          last updated jul 23, 2026
        </p>
      </header>

      <div className="prose-mono">
        <p>
          Building <strong>referrush</strong> as a founding engineer — the
          core systems, the late-night infra, the things that have to stay up.
          Most of my days are in the terminal.
        </p>
        <p>
          On the side I&apos;m building <strong>jurius</strong> — an ai
          workspace for lawyers. Upload a case, it structures the facts and
          legal signals, finds similar past cases on an intelligence graph,
          and stress-tests strategy with multi-agent litigation simulations.
          The core idea: turn legal history into legal strategy.
        </p>
        <p>
          Reading: <em>Designing Data-Intensive Applications</em> (re-reading
          the replication chapters), and Paul McKenney&apos;s memory-model
          papers when I have the patience for them.
        </p>
        <p>
          Writing more here. The posts are long because the topics deserve
          long. If you read one and want to argue, my{" "}
          <Link href="https://twitter.com/aaryantwt" className="text-accent hover:underline">
            dms
          </Link>{" "}
          are open.
        </p>
        <p>
          Not currently looking for work — but always open to talk to people
          who care about the same things.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-neutral-800 text-sm">
        <Link href="/" className="text-gray-500 hover:text-accent transition-colors">
          ← back home
        </Link>
      </div>
    </>
  )
}
