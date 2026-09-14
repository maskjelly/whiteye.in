import { Figure, Caption } from "@/components/figure"

export const meta = {
  slug: "16m-rps-rust-url-shortener",
  title: "16M RPS in Rust — an 800-line URL shortener with no framework",
  date: "sep 14, 2026",
  description: "100M redirects in 10 seconds on loopback. what the number means, and the four tricks that earned it.",
  readingTime: "12 min",
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
        fig. 1 — measured throughput by workload (log scale, M4 Pro loopback)
      </text>
      <line x1={0} y1={26} x2={720} y2={26} stroke="#cfc5b2" strokeWidth={1} />
      {rows.map((r, i) => {
        const y = 56 + i * 46
        return (
          <g key={r.label} fontFamily="var(--font-mono)">
            <text x={0} y={y + 15} fill="#514b40" fontSize={12}>
              {r.label}
            </text>
            <rect x={160} y={y} width={r.w} height={22} rx={3} fill={i >= 2 ? "#244b80" : "#cfc5b2"} opacity={i < 2 ? 1 : 0.85} />
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
        <strong>Abstract.</strong> rushort is a minimal URL shortener in Rust
        serving raw HTTP/1.1 on tokio with no web framework. On a 14-core M4
        Pro over loopback it sustains 10.0M redirect RPS for 10 seconds
        (100,000,000 requests, zero drops, p99 17.6ms), peaks at 16.8M RPS
        under closed-loop saturation, serves 165k round-trip RPS without
        pipelining, and holds 1,158 RPS of durable mixed traffic with
        SIGKILL-safe acknowledgments. This paper documents the design, the
        measurement methodology, and the three benchmark defects found and
        fixed along the way. All results are reproducible from the
        open-source harness.
      </p>

      <h2>1. introduction</h2>
      <p>
        The motivating observation, stated in{" "}
        <a href="https://x.com/aaryantwt/status/2099475672855204229">
          the post that prompted this work
        </a>
        , is that 100 million requests per day averages only 1,157 RPS — a
        rate any single modern server should exceed by orders of magnitude on
        reads. The question is by how much, under what conditions, and with
        what durability semantics. This paper answers all three for one
        deliberately narrow service: URL shortening, i.e. mapping short codes
        to long URLs with 302 redirects.
      </p>
      <p>
        The contribution is twofold: (i) a production-configured
        implementation in approximately 800 lines of Rust on the serving path
        (<code>src/lib.rs</code>, <code>src/store.rs</code>,{" "}
        <code>src/bin/shortener.rs</code>), and (ii) a fail-closed benchmark
        harness that verifies every response and fails on any drop, error, or
        mismatch. Reporting follows the three-number convention of{" "}
        <a href="https://blog.railway.com/p/railway-cdn">Railway&apos;s CDN
        writeup</a>: a sustained title number, a daily-rate number, and an
        ideal-lab peak, each bound to its workload.
      </p>

      <h2>2. background and related work</h2>
      <p>
        High-throughput HTTP serving on commodity hardware is well charted.
        Framework-based Rust services (axum/hyper) peak near 169k RPS on the
        evaluation hardware; the pipelined results below exceed that by 30–100x
        on the same machine, consistent with prior observations that per-request
        syscall and wakeup overhead dominates at high connection counts.
        Published reference points for non-pipelined traffic include Seastar at
        approximately 7M RPS (DPDK, 2×14-core), F-Stack nginx at 5M RPS, and
        io_uring configurations sustaining 7.8M RPS on 64-core EPYC hardware.
        Railway reports 30M RPS absorbed under DDoS across a 180-node anycast
        fleet with a 150M RPS laboratory ceiling — a distributed result that is
        not comparable to single-node loopback figures and is cited here only
        for its reporting discipline.
      </p>
      <p>
        The durability design follows the standard write-ahead discipline: a
        single writer appends to SQLite in WAL mode with{" "}
        <code>synchronous=FULL</code> and fullfsync enabled, publishes to the
        read cache only after commit, and acknowledges last. This is the
        conventional log-first ordering shared by Postgres (WAL + heap) and
        other durable engines.
      </p>

      <h2>3. design</h2>
      <p>
        Three decisions determine nearly all observed performance. First, there
        is no framework on the hot path: one socket task per connection, a
        span-based header parser, and a direct match on{" "}
        <code>(method, path)</code>. Second, every read drains all complete
        requests already buffered (up to 256 per batch) and answers them with
        a single <code>write</code> syscall, amortizing kernel crossings. Third,
        the store avoids lookup entirely: short codes are sequential IDs in
        base62, so a GET decodes the code and indexes directly into a sharded
        vector, with no hashing, no key comparison, and no per-read
        allocation.
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
        Sequential codes are a deliberate tradeoff: O(1) resolution in
        exchange for guessable identifiers and no URL deduplication. The
        service is therefore specified for trusted link creators; unguessable
        links and abuse controls are out of scope.
      </p>
      <p>
        Admission is bounded at every layer: 1,024 connections, 32 concurrent
        writes, 5-second header/body/socket deadlines, 8 KiB bodies, 16 KiB
        header blocks, and a 1M-URL capacity. Writes beyond capacity or
        admission return 503. Malformed framing — duplicate Content-Length,
        Transfer-Encoding, conflicting expectations — is rejected (400/413/
        417/431) rather than interpreted.
      </p>

      <h2>4. implementation</h2>
      <p>
        The server (<code>src/lib.rs</code>, 546 lines) implements the
        connection loop, the batch drain, and routing. The store (
        <code>src/store.rs</code>, 130 lines) holds a 64-way sharded RAM cache
        backed by a single SQLite writer; a lock file refuses a second owner
        of the same database, and startup verifies contiguous IDs, URL
        validity, and capacity before serving. The binary (
        <code>src/bin/shortener.rs</code>, 128 lines) parses configuration,
        enforces bearer-token authentication on writes for durable and
        non-loopback operation, and drains connections for up to 10 seconds on
        SIGINT/SIGTERM. A separate load generator (
        <code>src/bin/loadgen.rs</code>) is bench-only and excluded from the
        serving line count.
      </p>

      <h2>5. evaluation</h2>
      <h3>5.1 methodology</h3>
      <p>
        All measurements use the checked-in harness (<code>./bench.sh</code>{" "}
        → <code>scripts/simulate.py</code>), which builds release, starts
        isolated servers with fresh credentials, and retains raw logs under{" "}
        <code>target/benchmarks/&lt;stamp&gt;/</code> with a machine-stamped{" "}
        <code>CLAIMS.md</code>. The generator schedules arrivals on absolute
        deadlines (open-loop), independent of responses, through bounded
        per-connection queues: overload manifests as counted drops, and any
        drop, transport error, unexpected status, or location mismatch fails
        the run. Latency is full batch-completion time including scheduling
        delay; it is never divided by pipeline depth. A fixture suite verifies
        the harness fails closed on all-500 fixtures, wrong stored URLs, and
        duplicate codes.
      </p>
      <h3>5.2 results</h3>
      <p>
        Hardware: 14-core Apple Silicon, macOS, client and server co-resident
        over loopback. Release profile: <code>lto=thin</code>,{" "}
        <code>codegen-units=1</code>. Source: full validation run (
        <code>--repeats 3 --seconds 30</code>).
      </p>
      <ul>
        <li>
          <strong>Sustained pipeline (title).</strong> 10M RPS target, 10s,
          32 connections, pipeline depth 128: 100,000,000 successful requests
          in 10.002s (9,997,937 RPS), p99 17.62ms, zero drops.
        </li>
        <li>
          <strong>Peak saturate (ceiling).</strong> Closed-loop, same
          pipelining: best single run 16,847,534 RPS, median 16,281,158 RPS
          across three runs, p99 approximately 0.5ms.
        </li>
        <li>
          <strong>Round-trip (generalizable).</strong> No pipelining, 64
          connections: median 164,907 RPS, p99 approximately 0.5ms, limited by
          macOS loopback/kqueue rather than application CPU.
        </li>
        <li>
          <strong>Durable mixed (daily rate).</strong> 1,158 RPS for 30s at
          94% GET / 5% authenticated POST / 1% miss: p99 6.39ms, zero drops,
          every acknowledged write re-verified after the run, including across
          a SIGKILL restart. A 2× burst at 2,315 RPS passes at p99 8.78ms.
        </li>
        <li>
          <strong>Wide mixed.</strong> 100k-seed working set at 10% miss rate:
          13,170,223 RPS saturate.
        </li>
      </ul>

      <Figure>
        <ThroughputBars />
        <Caption>
          fig. 1 — the four workloads span four orders of magnitude. The top
          two rows amortize TCP round-trips via 128-deep pipelining and
          measure processing capacity; the round-trip row measures
          request/response latency as experienced by ordinary clients.
        </Caption>
      </Figure>

      <h2>6. threats to validity</h2>
      <p>
        Four limitations bound these claims. (1) All figures are loopback on
        one machine with no NIC, no TLS, and a co-resident generator consuming
        4–6 cores; they do not predict networked or multi-tenant behavior.
        (2) The 10M and 16.8M figures require 128-deep HTTP pipelining, a
        synthetic pattern that measures server processing rather than client-
        observed latency. (3) The 10-second sustained run was conducted on a
        fresh server; repeated back-to-back runs exhibit thermal throttling and
        measurable drops, which the harness reports as failures rather than
        absorbing. (4) The durable rate test covers 30 seconds at the 100M/day
        average rate; it is not a 24-hour soak, a power-loss test, or a
        replication evaluation — the system is single-writer by design.
        Extrapolating the 10-second burst to a daily volume (≈864B/day) would
        be arithmetic without evidentiary basis and is explicitly disclaimed.
      </p>
      <p>
        Three defects in earlier benchmark revisions are disclosed for
        completeness: batch latency divided by pipeline depth, an extra
        half-second of unmeasured traffic in the peak window, and PASS verdicts
        on all-500 responses. Each is now covered by a regression test.
      </p>

      <h2>7. conclusion</h2>
      <p>
        A framework-free Rust shortener of ~800 serving-path lines sustains
        10M pipelined redirect RPS for 10 seconds, peaks at 16.8M RPS,
        answers 165k honest round-trips per second, and holds the 100M/day
        average rate durably with kill-safe acknowledgments. The dominant
        optimization is request batching at the socket layer; the dominant
        methodological requirement is a harness that fails itself. Source,
        harness, and deployment notes are MIT-licensed at{" "}
        <a href="https://github.com/maskjelly/rushort">
          github.com/maskjelly/rushort
        </a>
        ; reproduction is <code>./bench.sh --repeats 3 --seconds 30</code>.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            rushort source (MIT).{" "}
            <a href="https://github.com/maskjelly/rushort">
              github.com/maskjelly/rushort
            </a>
            .
          </li>
          <li>
            Walton (2026). &quot;How to build a 30M RPS CDN in 30 days with
            Rust and WASM.&quot;{" "}
            <a href="https://blog.railway.com/p/railway-cdn">
              blog.railway.com/p/railway-cdn
            </a>
            .
          </li>
          <li>
            Motivating post.{" "}
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
