import { Figure, Caption } from "@/components/figure"

export const meta = {
  slug: "16m-rps-rust-url-shortener",
  title: "16M RPS in Rust — a 1,000-line URL shortener with no framework",
  date: "sep 14, 2026",
  description: "100M redirects in 10 seconds on loopback, plus what the same binary did on a 4-vCPU Linux VPS. what the numbers mean, and which optimizations didn't survive measurement.",
  readingTime: "15 min",
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

function VpsBars() {
  const rows = [
    { label: "pipeline depth 128", value: "951k RPS", w: 570 },
    { label: "no pipelining", value: "32.8k RPS", w: 20 },
  ]
  return (
    <svg viewBox="0 0 720 190" role="img" aria-label="four vCPU Linux VPS throughput, linear scale">
      <text x={0} y={18} fill="#244b80" fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.04em">
        fig. 2 — same binary on a 4-vCPU Linux VPS (linear scale, loopback)
      </text>
      <line x1={0} y1={26} x2={720} y2={26} stroke="#cfc5b2" strokeWidth={1} />
      {rows.map((r, i) => {
        const y = 56 + i * 52
        return (
          <g key={r.label} fontFamily="var(--font-mono)">
            <text x={0} y={y + 15} fill="#514b40" fontSize={12}>
              {r.label}
            </text>
            <rect x={160} y={y} width={r.w} height={24} rx={3} fill={i === 0 ? "#244b80" : "#cfc5b2"} opacity={i === 0 ? 0.85 : 1} />
            <text x={170 + r.w} y={y + 17} fill={i === 0 ? "#244b80" : "#817867"} fontSize={12}>
              {r.value}
            </text>
            <text x={160} y={y + 44} fill="#817867" fontSize={11}>
              {i === 0 ? "median of 3 × 8s runs, p99 batch latency 48.2–48.6 ms" : "median of 3 × 8s runs, p99 1.5–3.1 ms"}
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
        SIGKILL-safe acknowledgments. The same binary on a 4-vCPU Linux VPS
        sustains 951k pipelined RPS and 32.8k round-trip RPS with a co-resident
        pinned client; two follow-up micro-optimizations failed to beat
        baseline and were not deployed. The service now also exposes lock-free
        `/api/metrics` and `/api/host` counters that power a live telemetry
        dashboard, and accepts authenticated durable writes. This paper
        documents the design, the measurement methodology, the VPS follow-up,
        and the benchmark defects found and fixed along the way.
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
        The contribution is fourfold: (i) a production-configured
        implementation in approximately 1,000 lines of Rust on the serving
        path (<code>src/lib.rs</code>, <code>src/store.rs</code>,{" "}
        <code>src/bin/shortener.rs</code>), (ii) a fail-closed benchmark
        harness that verifies every response and fails on any drop, error, or
        mismatch, (iii) a controlled Linux VPS replication with two advertised
        optimizations rejected on evidence, and (iv) public telemetry
        endpoints that expose live counters behind a dashboard. Reporting
        follows the three-number convention of{" "}
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
    if code.len() > 11 || (code.len() > 1 && code.starts_with('0')) {
        return None;
    }
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
        Admission is bounded at every layer and configurable per deploy:
        1,024 connections, 32 concurrent writes, 5-second header/body/socket
        deadlines, 8 KiB bodies, 16 KiB header blocks, and a 1M-URL capacity
        (<code>--max-connections</code>, <code>--max-writes</code>,{" "}
        <code>--timeout</code>, <code>--max-urls</code>). Writes beyond
        capacity or admission return 503. Malformed framing — duplicate
        Content-Length, Transfer-Encoding, conflicting expectations — is
        rejected (400/413/417/431) rather than interpreted.
      </p>

      <h2>4. implementation</h2>
      <p>
        The server (<code>src/lib.rs</code>, 720 lines) implements the
        connection loop, the batch drain, routing, and a lock-free counter
        block for telemetry. The store (<code>src/store.rs</code>, 130 lines)
        holds a 64-way sharded RAM cache backed by a single SQLite writer; a
        lock file refuses a second owner of the same database, and startup
        verifies contiguous IDs, URL validity, and capacity before serving.
        The binary (<code>src/bin/shortener.rs</code>, 128 lines) parses
        configuration, enforces bearer-token authentication on writes for
        durable and non-loopback operation, and drains connections for up to
        10 seconds on SIGINT/SIGTERM. A separate load generator (
        <code>src/bin/loadgen.rs</code>) is bench-only and excluded from the
        serving line count.
      </p>
      <p>
        Two public, CORS-open read endpoints now power a live dashboard at{" "}
        <a href="https://whiteye.in/telemetry">whiteye.in/telemetry</a>:{" "}
        <code>/api/metrics</code> returns atomic counters (uptime, requests,
        redirects, writes, 4xx/5xx, URL count, capacity) and{" "}
        <code>/api/host</code> returns CPU, memory, OS, and load-average facts.
        Nothing in the counter block mutates shared state on the hot path, so
        the serving path is unchanged by telemetry. The site&apos;s shortening
        form posts to the same service and produces{" "}
        <code>whiteye.in/s/…</code> links behind a path-prefix reverse proxy.
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
        duplicate codes; blackbox tests additionally cover SIGKILL durability.
      </p>
      <h3>5.2 results — M4 Pro loopback</h3>
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

      <h3>5.3 results — Linux VPS follow-up</h3>
      <p>
        To check whether the loopback results survive a different kernel, CPU,
        and scheduler, the unchanged implementation was run on a four-vCPU KVM
        host (Linux 5.4.0-208, Rust 1.98.1) with a separate ephemeral server on{" "}
        <code>127.0.0.1:18080</code>, 10,000 seeded links, 32 connections,
        three 8-second runs per variant, and the server pinned to CPUs 0–1
        with the client pinned to 2–3. Baseline medians:{" "}
        <strong>951,012 RPS at pipeline depth 128</strong> (p99 batch latency
        48.2–48.6 ms) and <strong>32,835 RPS with no pipelining</strong> (p99
        1.5–3.1 ms). An unpinned first pass recorded 1,034,168 RPS at depth
        128. All controlled runs passed with zero drops, transport errors, or
        redirect mismatches.
      </p>
      <p>
        Two candidate optimizations were then measured against that baseline
        and <em>rejected</em>. Batching shared atomic counter updates per
        connection batch landed at 1,013,335 RPS unpinned (−2.0%). Cache-line
        aligned shard locks plus borrowing redirect URLs while copying
        responses measured +3.72% at pipeline 128 (986,427 vs 951,012) but
        −1.11% at pipeline 1, within host noise on 8-second runs; the
        production binary and configuration were restored unchanged. Two
        regression tests from the exercise were kept. The lesson is the
        obvious one: short loopback comparisons cannot establish small
        wins, and the harness should be trusted only when it can fail.
      </p>
      <Figure>
        <VpsBars />
        <Caption>
          fig. 2 — the same binary on four vCPUs: batching still dominates
          (951k vs 32.8k RPS), but the pipelined ceiling is 20× lower than the
          M4 Pro&apos;s. Loopback processing, not public HTTPS capacity.
        </Caption>
      </Figure>
      <p>
        The public redirect path was measured separately with curl (no
        redirect following). Direct to the Rust listener: time to first byte
        302.5 / 279.7 / 292.9 ms. Through the website wrapper (which performs
        an upstream fetch before returning its own 302): 5,451 / 699 / 685 ms.
        The wrapper — not the Rust service — is the bottleneck users actually
        touch; caching immutable code-to-URL mappings or serving redirects
        directly through the edge proxy is the next obvious move, ahead of any
        further Rust micro-optimization.
      </p>

      <h2>6. threats to validity</h2>
      <p>
        Five limitations bound these claims. (1) All figures are loopback on
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
        (5) The VPS comparison runs at 8 seconds per sample with both sides
        pinned on four shared vCPUs, so sub-5% differences are not resolvable.
        Extrapolating the 10-second burst to a daily volume (≈864B/day) would
        be arithmetic without evidentiary basis and is explicitly disclaimed.
        The public dashboard also includes a continuous synthetic load
        generator; its charts are not organic visitor traffic.
      </p>
      <p>
        Three defects in earlier benchmark revisions are disclosed for
        completeness: batch latency divided by pipeline depth, an extra
        half-second of unmeasured traffic in the peak window, and PASS verdicts
        on all-500 responses. Each is now covered by a regression test.
      </p>

      <h2>7. conclusion</h2>
      <p>
        A framework-free Rust shortener of ~1,000 serving-path lines sustains
        10M pipelined redirect RPS for 10 seconds, peaks at 16.8M RPS,
        answers 165k honest round-trips per second, and holds the 100M/day
        average rate durably with kill-safe acknowledgments. On a 4-vCPU Linux
        VPS the same binary holds 951k pipelined RPS and 32.8k round-trip RPS,
        and two plausible micro-optimizations failed to beat baseline. The
        dominant optimization is request batching at the socket layer; the
        dominant methodological requirement is a harness that fails itself.
        Source, harness, deployment notes, and live telemetry are MIT-licensed
        at{" "}
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
            Live telemetry dashboard.{" "}
            <a href="https://whiteye.in/telemetry">
              whiteye.in/telemetry
            </a>
            .
          </li>
          <li>
            Rove VPS investigation: method, rejected experiments, raw
            measurements.{" "}
            <a href="https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-14.md">
              docs/performance-2026-09-14.md
            </a>{" "}
            and{" "}
            <a href="https://github.com/maskjelly/rushort/blob/main/docs/benchmarks/rove-2026-09-14.json">
              rove-2026-09-14.json
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
