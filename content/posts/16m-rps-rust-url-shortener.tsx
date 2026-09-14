import { Figure, Caption } from "@/components/figure"

export const meta = {
  slug: "16m-rps-rust-url-shortener",
  title: "16M RPS in Rust — an 800-line URL shortener with no framework",
  date: "sep 14, 2026",
  description: "100M redirects in 10 seconds on loopback. what the number means, and the four tricks that earned it.",
  readingTime: "9 min",
}

function ThroughputBars() {
  const rows = [
    { label: "durable mixed", value: "1,158 RPS", w: 8 },
    { label: "round-trip", value: "165k RPS", w: 150 },
    { label: "100M in 10s", value: "10.0M RPS", w: 420 },
    { label: "peak saturate", value: "16.8M RPS", w: 640 },
  ]
  return (
    <svg viewBox="0 0 720 240" role="img" aria-label="throughput by workload, log scale">
      <text x={0} y={18} fill="#244b80" fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.04em">
        measured throughput by workload (log scale, M4 Pro loopback)
      </text>
      <line x1={0} y1={26} x2={720} y2={26} stroke="#cfc5b2" strokeWidth={1} />
      {rows.map((r, i) => {
        const y = 56 + i * 46
        return (
          <g key={r.label} fontFamily="var(--font-mono)">
            <text x={0} y={y + 15} fill="#514b40" fontSize={12}>
              {r.label}
            </text>
            <rect x={160} y={y} width={r.w} height={22} rx={3} fill={i === 3 ? "#244b80" : i === 2 ? "#244b80" : "#cfc5b2"} opacity={i < 2 ? 1 : 0.85} />
            <text x={170 + r.w} y={y + 16} fill={i >= 2 ? "#244b80" : "#817867"} fontSize={12}>
              {r.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        A URL shortener that does 100 million redirects in 10 seconds on a
        laptop. No framework, no router, no ORM. About 800 lines of Rust on
        the serving path, raw HTTP/1.1 on tokio, and a benchmark that fails
        itself on any dropped request. This is how it works, what the number
        actually means, and what it does not.
      </p>

      <p>
        The spark was{" "}
        <a href="https://x.com/aaryantwt/status/2099475672855204229">
          this post
        </a>{" "}
        about serving 100 million requests a day. 100M a day averages 1,157
        RPS. I wanted to know what it takes to do 100M in 10 seconds instead,
        and to report the number the way{" "}
        <a href="https://blog.railway.com/p/railway-cdn">Railway did</a> for
        their CDN: one title number, one daily number, one ideal-lab number,
        all labeled.
      </p>

      <h2>the numbers</h2>
      <p>
        Measured on a 14-core M4 Pro, client and server on the same machine
        over loopback. Every redirect verified against its expected URL. Any
        drop, error, or mismatch fails the run.
      </p>
      <ul>
        <li>
          <strong>10.0M RPS for 10s</strong> — 100,000,000 randomized redirect
          GETs in 10.002s, p99 17.6ms, 0 drops. 32 connections, pipeline depth
          128. The title number.
        </li>
        <li>
          <strong>16.8M RPS peak</strong> (median 16.3M) — closed-loop
          saturate, same pipelining. The ideal-lab number.
        </li>
        <li>
          <strong>165k RPS round-trip</strong> — no pipelining, 64 connections,
          p99 ~0.5ms. The honest browser-like number.
        </li>
        <li>
          <strong>1,158 RPS durable</strong> — 94% GET / 5% POST / 1% miss
          against SQLite, p99 6.4ms over 30s. That is exactly the 100M/day
          average rate, sustained with acknowledgments surviving SIGKILL.
        </li>
      </ul>

      <Figure>
        <ThroughputBars />
        <Caption>
          Four workloads, four orders of magnitude. Pipelining amortizes TCP
          round-trips, so the pipelined numbers measure request-processing
          capacity, not what a browser sees. The round-trip row is the one
          that generalizes.
        </Caption>
      </Figure>

      <h2>trick one: no framework</h2>
      <p>
        There is no router, no middleware stack, no streaming body parser on
        the hot path. One socket task per connection, a span-based header
        parser (<code>httparse</code>), and a match on{" "}
        <code>(method, path)</code>. A GET decodes the base62 code and indexes
        directly into a sharded <code>Vec&lt;Arc&lt;str&gt;&gt;</code>. No
        hashing, no key comparison, no allocation per read:
      </p>
      <pre>
        <code>{`pub fn resolve(&self, code: &str) -> Option<Arc<str>> {
    let id = usize::try_from(base62_decode(code)?).ok()?;
    self.shards[id & (self.shards.len() - 1)]
        .read()
        .get(id / self.shards.len())
        .cloned()
}`}</code>
      </pre>
      <p>
        Short codes are sequential IDs in base62. That is also the caveat:
        codes are identifiers, not secrets, and duplicate URLs get new codes.
        Fine for a trusted-creator shortener; wrong for anything needing
        unguessable links.
      </p>

      <h2>trick two: batched writes</h2>
      <p>
        The single most important optimization. Each read drains every
        complete request already buffered (up to 256) and replies with a
        single <code>write</code>. Per-request syscall and wakeup costs vanish.
        The pipelined path is 30–100x faster than the axum/hyper version of
        the same service on the same hardware (~169k RPS), and the difference
        is almost entirely this batching.
      </p>

      <h2>trick three: commit before ack</h2>
      <p>
        Reads never touch SQLite. Writes go through a single writer: insert
        into WAL with <code>synchronous=FULL</code> and{" "}
        <code>fullfsync=ON</code>, then publish to the read cache, then
        acknowledge. Acknowledgment follows commit and publication, so a
        SIGKILL after a 201 never loses the mapping — covered by an automated
        test that kills the process mid-run and re-reads after restart. A
        process lock rejects a second owner of the same database file.
      </p>
      <p>
        This is also why the durable number is 1,158 RPS and not 10M. An
        honest fsync per write costs what it costs. The 10M path is the
        in-memory read path.
      </p>

      <h2>trick four: a benchmark that fails itself</h2>
      <p>
        The load generator schedules arrivals on absolute deadlines
        (open-loop), independent of responses, with bounded queues. Overload
        drops instead of silently queuing forever, and drops fail the run.
        Latency is full batch completion, never divided by pipeline depth. A
        fixture suite proves it fails closed: all-500s fail, wrong stored URLs
        fail, duplicate codes fail, and a slow service shows up as send-lag
        plus drops rather than a pretty lie.
      </p>
      <p>
        The embarrassing version of this story: the first benchmark divided
        batch time by 128, counted an extra half-second of traffic, and
        reported PASS when every GET returned 500. All three bugs were real,
        all three are now regression tests.
      </p>

      <h2>burst vs durable</h2>
      <p>
        10M RPS × 10 seconds is burst capacity, not a daily volume claim.
        Extrapolated it would be ~864B/day, which would be a dishonest
        sentence: the run was 10 seconds, RAM-only, pipelined 128 deep, on
        loopback, on a fresh server (suite order matters — after 30s of
        saturate load the same box throttles and drops). The durable claim is
        the boring one: 1,158 RPS mixed traffic for 30s with every write
        re-verified. Boring is the point. That is the number I would put in a
        capacity plan.
      </p>

      <h2>reproduce it</h2>
      <pre>
        <code>{`git clone https://github.com/maskjelly/rushort
cd rushort
cargo test --release --locked
python3 tests/blackbox.py
./bench.sh --repeats 1 --seconds 10   # ~60s, writes target/benchmarks/<stamp>/CLAIMS.md`}</code>
      </pre>
      <p>
        Full validation is <code>./bench.sh --repeats 3 --seconds 30</code>.
        The code is MIT at{" "}
        <a href="https://github.com/maskjelly/rushort">
          github.com/maskjelly/rushort
        </a>
        .
      </p>

      <p>
        Inspired by{" "}
        <a href="https://x.com/aaryantwt/status/2099475672855204229">
          my post aiming at 100M
        </a>
        . The short version for the timeline: 16M RPS peak, 100M in 10s
        sustained, 165k honest round-trips, 1,158 durable. Pick the row that
        matches your workload.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            rushort source (MIT).{" "}
            <a href="https://github.com/maskjelly/rushort">
              github.com/maskjelly/rushort
            </a>
            . Bench harness, fail-closed fixtures, and deploy notes included.
          </li>
          <li>
            Walton (2026). &quot;How to build a 30M RPS CDN in 30 days with
            Rust and WASM.&quot;{" "}
            <a href="https://blog.railway.com/p/railway-cdn">
              blog.railway.com/p/railway-cdn
            </a>
            . The three-number reporting format copied here.
          </li>
          <li>
            The post that started it.{" "}
            <a href="https://x.com/aaryantwt/status/2099475672855204229">
              x.com/aaryantwt/status/2099475672855204229
            </a>
            .
          </li>
        </ol>
      </section>
    </article>
  )
}
