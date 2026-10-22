import { Figure, Caption } from "@/components/figure"

export const meta = {
  slug: "16m-rps-rust-url-shortener",
  title: "rushort: 16.8M redirects/s on M4 Pro loopback",
  date: "sep 14, 2026",
  updated: "oct 23, 2026",
  description: "What HTTP pipelining changed in rushort, how the benchmark checks its answers, and what separate M4 Pro, durable-write, and $4 VPS runs measured.",
  readingTime: "12 min",
}

function ThroughputBars() {
  const rows = [
    { label: "durable mixed", value: "1,158 RPS", rps: 1_158 },
    { label: "round-trip", value: "165k RPS", rps: 164_907 },
    { label: "100M in 10s", value: "10.0M RPS", rps: 9_997_937 },
    { label: "peak saturate", value: "16.8M RPS", rps: 16_847_534 },
  ]
  return (
    <svg viewBox="0 0 720 240" role="img" aria-label="throughput by workload, logarithmic scale from 1,000 RPS">
      <text x={0} y={18} fill="#244b80" fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.04em">
        fig. 1 — M4 Pro loopback (log scale, baseline 1k RPS)
      </text>
      <line x1={0} y1={26} x2={720} y2={26} stroke="#cfc5b2" strokeWidth={1} />
      {rows.map((r, i) => {
        const y = 56 + i * 46
        const w = 480 * Math.log10(r.rps / 1_000) / Math.log10(16_847_534 / 1_000)
        return (
          <g key={r.label} fontFamily="var(--font-mono)">
            <text x={0} y={y + 15} fill="#514b40" fontSize={12}>
              {r.label}
            </text>
            <rect x={160} y={y} width={w} height={22} rx={3} fill={i >= 2 ? "#244b80" : "#cfc5b2"} opacity={i < 2 ? 1 : 0.85} />
            <text x={170 + w} y={y + 16} fill={i >= 2 ? "#244b80" : "#817867"} fontSize={12}>
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
    { label: "pipeline depth 128", value: "951k RPS", w: 480 },
    { label: "no pipelining", value: "32.8k RPS", w: 480 * 32_835 / 951_012 },
  ]
  return (
    <svg viewBox="0 0 720 190" role="img" aria-label="four vCPU Linux VPS throughput, linear scale">
      <text x={0} y={18} fill="#244b80" fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.04em">
        fig. 2 — September 14 VPS baseline (linear scale, loopback)
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
        rushort peaked at 16.8 million redirects a second on my M4 Pro, with 32
        connections sending 128 requests per batch. Without pipelining, the median was
        about 165,000. The server was identical. How much came from the client, and what would hold up on a $4 VPS?
      </p>

      <p>
        The <a href="https://x.com/aaryantwt/status/2099475672855204229">post that
        started this</a> concerned 100 million requests a day. Spread evenly, that is
        about 1,157 requests a second. It says little about what those requests do. A
        redirect reads a URL already in memory; creating a link has to make a write
        durable before returning it. I chose a small URL shortener so I could test those
        paths separately. The daily average leaves out bursts.
      </p>

      <h2>what one redirect does</h2>
      <p>
        Each HTTP/1.1 connection runs in one tokio task. The parser reads header spans and routes on <code>(method, path)</code>. It handles up
        to 256 buffered requests before yielding, collecting responses for one
        {" "}<code>write_all</code> call. That call may take several socket writes, but
        avoids a separate send path for each response. The <a
        href="https://github.com/maskjelly/rushort/blob/ff72c9ce06d42bfccd097ab2cdd5a270fea51d29/src/lib.rs">connection
        loop</a> shows the batch boundary.
      </p>
      <p>
        Pipelining keeps that loop busy. In
        the peak M4 Pro setup, 32 connections each sent 128 requests per batch: <code>32
        × 128 = 4,096</code> requests could be outstanding. The unpipelined setup used
        64 connections and allowed 64 outstanding requests. Batch size and concurrency both changed, so this does not isolate socket-call cost.
      </p>
      <p>
        Resolving a code takes less work. The base62 code decodes to a sequential ID;
        the low bits choose a shard and integer division chooses a slot in its vector.
        As an illustration, with the default 64 shards, ID 130 belongs to shard 2, slot
        2. There&apos;s no hash lookup or per-read allocation here. The stored value is
        an <code>Arc&lt;str&gt;</code>, so returning it still changes a shared reference
        count. This is the <a
        href="https://github.com/maskjelly/rushort/blob/ff72c9ce06d42bfccd097ab2cdd5a270fea51d29/src/store.rs">lookup
        implementation</a>:
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
        This layout trades away properties a public shortener might need. Sequential IDs
        make links guessable. Creating the same URL twice uses two slots. I&apos;m
        assuming trusted link creators; secret links and abuse controls would need
        additional design work.
      </p>

      <h3>writes take a different path</h3>
      <p>
        Durable mode uses SQLite WAL with <code>synchronous=FULL</code> and fullfsync
        enabled. A single writer commits the record before publishing it to the 64-way
        sharded RAM cache. Only then does the request receive an acknowledgment.
        Reversing that order would let a reader resolve a link that the database
        hadn&apos;t committed yet. Blocking database work runs off the tokio workers;
        redirects keep using the read cache. Surviving a power loss also requires the OS
        and storage to honor the sync operations.
      </p>
      <p>
        A lock file rejects a second database owner. Startup checks contiguous IDs,
        valid URLs, and configured capacity. <code>src/store.rs</code> owns storage;
        {" "}<code>src/lib.rs</code> parses and routes; <code>src/bin/shortener.rs</code>{" "}
        configures the service and bearer-token authentication. SIGINT/SIGTERM allows
        ten seconds to drain connections. Serving takes roughly 1,000 lines; load generation is separate.
      </p>
      <p>
        Defaults are 1,024 connections, 32 concurrent writes, five-second
        header/body/socket deadlines, and one million URLs. Request limits are 8 KiB for
        the body and 16 KiB for headers. The corresponding options include
        {" "}<code>--max-connections</code>, <code>--max-writes</code>,
        {" "}<code>--timeout</code>, and <code>--max-urls</code>. Write-admission and
        capacity failures return 503. Duplicate Content-Length, Transfer-Encoding,
        conflicting expectations, and malformed or oversized requests are rejected with
        the appropriate 400/413/417/431 response.
      </p>
      <p>
        The <a href="https://whiteye.in/telemetry">dashboard</a> reads public,
        CORS-enabled <code>/api/metrics</code> (uptime, URL count, capacity, atomic
        request/redirect/write/error counters) and <code>/api/host</code> (CPU and
        memory). Shared counter updates create cache-coherence traffic worth measuring.
        The site creates links here too. Its <code>whiteye.in/s/…</code> redirect
        fetches upstream before returning a 302, adding a hop.
      </p>

      <h2>what the client counts</h2>
      <p>
        I used four workloads. Closed-loop connections send a batch and wait for
        responses, offering less work when the server slows down. Fixed-rate arrivals
        keep their schedule independently of responses, allowing a queue to grow.
        Unpipelined clients wait between requests on each connection. The durable mix
        adds authenticated link creation and SQLite commits. These tests don&apos;t
        isolate framework overhead or rank rushort against other servers.
      </p>
      <p>
        The runner, <code>./bench.sh</code> → <code>scripts/simulate.py</code>, builds
        release binaries and starts isolated servers with fresh credentials. It saves
        raw logs and a machine-stamped <code>CLAIMS.md</code> under
        {" "}<code>target/benchmarks/&lt;stamp&gt;/</code>. Fixed-rate arrivals use absolute
        deadlines and bounded queues. Overflow counts as dropped work and fails the run.
        Transport errors, wrong statuses, and 302s pointing at the wrong URL fail it
        too.
      </p>
      <p>
        Its pipelined latency timer covers the full batch, including scheduling delay in
        fixed-rate mode. For example, the 17.62ms batch p99 reported below cannot be
        divided by 128 to produce a 0.138ms request p99. The timer ended when the batch
        finished; there are no 128 equal request intervals to recover from it. With a
        queue, a fixed-rate run can have much longer measured latency than a closed-loop
        run, even when its throughput is lower.
      </p>
      <p>
        Earlier benchmark versions got this wrong. They divided batch latency by
        pipeline depth, counted an extra half-second of traffic outside the peak
        measurement window, and could award PASS to all-500 responses. Those were
        failures in my measurement code. Regression fixtures now reject those cases,
        wrong redirect URLs, and duplicate codes. Blackbox tests also check that
        acknowledged writes remain available after a SIGKILL restart. These checks
        implement the <a
        href="https://github.com/maskjelly/rushort#loadgen">load-generator contract</a>{" "}
        quoted with the results.
      </p>

      <h2>the measurements</h2>
      <h3>M4 Pro, client and server on loopback</h3>
      <p>
        Client and server shared a 14-core M4 Pro running macOS, built with
        {" "}<code>lto=thin</code> and <code>codegen-units=1</code>. The full invocation was
        {" "}<code>--repeats 3 --seconds 30</code>, but scenario durations differ. The <a
        href="https://github.com/maskjelly/rushort/blob/ff72c9ce06d42bfccd097ab2cdd5a270fea51d29/README.md#measured-m4-pro-loopback-clientserver-same-box">published
        results</a> include a 30-second durable mix, three five-second saturation runs,
        and a ten-second fixed-arrival test.
      </p>
      <ul>
        <li>
          <strong>Fixed-rate pipelined redirects.</strong> At a 10M RPS target for ten
          seconds, 32 connections and pipeline depth 128 completed 100,000,000 correct
          requests in 10.002s: 9,997,937 achieved RPS. Batch p99 was 17.62ms, with zero
          drops. The 16.8M peak came from the separate saturation test.
        </li>
        <li>
          <strong>Closed-loop saturation.</strong> With the same pipelining, the best
          single run reached 16,847,534 RPS. The median of three was 16,281,158 RPS,
          with batch p99 around 0.5ms.
        </li>
        <li>
          <strong>Requests without pipelining.</strong> With 64 connections, the median
          was 164,907 RPS and p99 around 0.5ms. This is a macOS loopback/kqueue baseline for clients waiting between requests, excluding external networking and TLS.
        </li>
        <li>
          <strong>Durable mixed traffic.</strong> For 30 seconds at 1,158 RPS, the mix
          was 94% GET, 5% authenticated POST, and 1% misses. It passed with zero drops
          and p99 6.39ms. Acknowledged writes were checked afterwards, including across
          a SIGKILL restart. Five percent POST means roughly 58 writes a second in this
          mix. The run gives no basis for claiming 1,158 durable writes a second. A 2×
          burst at 2,315 total RPS also passed, with p99 8.78ms.
        </li>
        <li>
          <strong>A larger working set.</strong> With 100,000 seed URLs and a 10% miss
          rate, the saturation result was 13,170,223 RPS.
        </li>
      </ul>

      <Figure>
        <ThroughputBars />
        <Caption>
          The four workloads have very different costs. The fixed-rate and peak
          pipelined tests amortize socket work over 128 requests. The round-trip case
          waits between requests on each connection. The durable mixed case includes
          committed writes. Their bar lengths use a logarithmic scale so the smaller
          rates remain visible.
        </Caption>
      </Figure>

      <h3>September 14: the $4 Linux VPS</h3>
      <p>
        The VPS had four KVM vCPUs and cost $4 according to its owner. For the <a
        href="https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-14.md">September
        14 comparison</a>, it ran Linux 5.4.0-208 and Rust 1.98.1. An isolated server
        listened on <code>127.0.0.1:18080</code> with 10,000 seeded links and 32
        connections. I pinned the server to CPUs 0–1 and the client to 2–3, then
        alternated baseline and candidate runs. Across three eight-second runs, the
        baseline medians were <strong>951,012 RPS at pipeline depth 128</strong> with
        48.2–48.6ms p99 batch latency, and <strong>32,835 RPS without
        pipelining</strong> with 1.5–3.1ms p99. Every controlled run passed the drop,
        transport-error, and redirect checks.
      </p>
      <p>
        Batching atomic-counter updates was the first experiment. In the unpinned
        pipeline-128 comparison, the baseline reached 1,034,168 RPS and the candidate
        1,013,335 RPS, about 2.0% lower. The initial pipeline-1 samples overlapped a
        build, so I excluded them from the comparison.
      </p>
      <p>
        The second candidate aligned shard locks to cache lines and borrowed the URL
        while copying the redirect response, avoiding an <code>Arc</code> clone and
        drop. In the pinned tests it reached 986,427 versus 951,012 RPS at depth 128, a
        3.72% gain. At depth 1 it lost 1.11%. That candidate&apos;s depth-1 p99 also
        ranged from 2.3 to 21.8ms, compared with 1.5–3.1ms for the baseline.
        Eight-second samples on a shared host gave me no reason to prefer a change that
        won one workload and lost the other. I restored the production binary and
        configuration; two regression tests from the work remained.
      </p>
      <Figure>
        <VpsBars />
        <Caption>
          On the September 14 VPS test, pipelining changed the median from 32.8k to 951k
          RPS. This chart uses a linear scale. Both figures describe loopback requests
          to the Rust listener, not public HTTPS throughput.
        </Caption>
      </Figure>
      <p>
        Public redirect latency was a separate problem. Three curl requests from the
        laptop measured time to first byte without following the 302. Against the
        VPS&apos;s HTTPS endpoint, <code>https://45.196.196.251/rushort/0</code>, they
        took 302.5, 279.7, and 292.9ms. Against <code>https://whiteye.in/s/0</code>,
        they took 5,451, 699, and 685ms. Even the two faster website samples were much
        slower than the direct VPS samples. These are six individual observations, not a
        latency distribution, and they don&apos;t isolate cold starts, TLS, geographic
        routing, or server time. The extra upstream fetch makes caching immutable mappings or serving the redirect domain through Caddy worth investigating. Neither change was measured here.
      </p>

      <h3>September 26: a different VPS configuration</h3>
      <p>
        The September 26 rerun used the same four-vCPU host on Linux 5.15, with an
        isolated RAM-only server and 1,000 preloaded URLs. These runs were unpinned. The
        synthetic traffic generator was paused during each suite and restored
        afterwards; production kept running. At 32 connections and pipeline depth 512,
        three eight-second saturation runs reached 1,383,376–1,428,007 RPS, giving a
        {" "}<strong>1,418,510 RPS median</strong>. They had zero drops, errors, or
        mismatches and 58.1–59.4ms p99 batch latency. A configuration sweep also
        recorded a best five-second result of 1,465,138 RPS at 16 connections and depth
        256.
      </p>
      <p>
        Scheduling arrivals at a fixed rate exposed a tighter limit. At a 1.3M RPS
        target, each of three runs verified all 13,000,000 redirects in 10.03–10.07
        seconds. Achieved throughput was 1.291–1.296M RPS and p99 batch latency was
        116–264ms. A 1.2M target also passed: 12,000,000 correct redirects at 1,199,289
        achieved RPS, with 46.9ms batch p99. At a 1.4M target, all 14M responses were
        correct, but completion took 10.62 seconds. The achieved 1,318,548 RPS fell
        below the runner&apos;s 99% requirement, so it failed; batch p99 had grown to
        904ms.
      </p>
      <p>
        The <a
        href="https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-26.md">method
        and raw results</a> record source baseline <code>ec01ce7</code>, also used on
        September 14. The earlier 951k test had a different kernel and CPU pinning, with
        more seed URLs and a shallower pipeline. Its difference from 1.42M doesn&apos;t
        establish a code speedup. Both are VPS loopback results; the 16.8M result
        belongs to the M4 Pro.
      </p>

      <h3>September 30: trying the borrowed lookup again</h3>
      <p>
        Results note added October 5, 2026. In the <a
        href="https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-30.md">September
        30 comparison</a>, I tested borrowing the redirect URL under the shard read
        guard again. This candidate also included monitoring changes. On Linux 5.15 with
        four shared VPS CPUs, the server was pinned to 0–1 and the verifying client to
        2–3. Each workload used three alternating baseline/candidate repetitions of
        eight seconds, against isolated ephemeral state on port 18080. The synthetic
        traffic service was paused and restored; the live service kept running.
      </p>
      <p>
        With 64 connections, no pipelining, and 10,000 URLs, median throughput moved
        from 34,423 to 34,566 RPS (+0.42%). With 32 connections and depth 128 over
        10,000 URLs, it moved from 1,045,055 to 1,028,081 RPS (−1.62%). At depth 512
        over 1,000 URLs, again with 32 connections, it moved from 1,341,131 to 1,333,296
        RPS (−0.58%). All 18 completed runs passed with zero drops, transport errors,
        unexpected statuses, or redirect mismatches. A fourth workload with 100,000 URLs
        exceeded the setup timeout and was excluded.
      </p>
      <p>
        I removed the borrowed lookup: a 0.42% round-trip gain alongside losses in both
        pipelined workloads didn&apos;t justify it. What stayed was a one-second cache
        for <code>/api/host</code>, with system inspection moved off tokio workers, and
        a monotonic <code>uptime_ms</code> counter for sampling metrics. Those changes
        address monitoring work and timing; this comparison establishes no
        redirect-throughput improvement.
      </p>

      <h2>what these tests leave out</h2>
      <p>
        The generator shared the server&apos;s CPU in every throughput test. None
        included a physical NIC or TLS. The M4 Pro&apos;s 10M and 16.8M rates also
        required 128-deep HTTP pipelining.
      </p>
      <p>
        The ten-second M4 Pro fixed-rate result came from a fresh server; repeated runs
        could throttle thermally and drop requests, which the runner treated as
        failures. Multiplying that rate into roughly 864 billion requests per day adds
        no evidence about sustained operation. The durable mix ran for 30 seconds and
        checked process recovery; it tested neither power loss nor replication. I still
        need a longer run with a specified workload to answer the original
        daily-capacity question.
      </p>
      <p>
        The public dashboard includes a continuous synthetic load generator. Its charts
        show that traffic as well as public requests; they aren&apos;t visitor counts.
      </p>

      <h2>what I kept</h2>
      <p>
        The batched socket path stays. The smaller lookup and counter changes
        didn&apos;t improve the tested workloads consistently enough to keep. Given the
        gap between pipelined and unpipelined throughput, I&apos;ll record the client
        configuration alongside every result, even when the server code is identical.
      </p>
      <p>
        For the public demo, I&apos;d measure the website redirect path next. The
        hundreds of milliseconds in those curl samples are a different scale of problem
        from a few percent in the in-memory lookup. Timing the upstream fetch separately
        would help establish how much delay removing that hop could actually save.
      </p>

      <h2>reproducing the VPS workload</h2>
      <p>
        The <a
        href="https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-26.md">September
        26 notes</a> record baseline <code>ec01ce7</code>, binary hashes, and setup. Use
        that baseline to reproduce the measurements; the source links above use later
        revision <code>ff72c9c</code>, including retained monitoring changes. Start the
        isolated RAM-only server in one terminal. Run the eight-second saturation test,
        then the ten-second fixed-rate test, in another. Avoid unrelated load and record
        any production traffic that remains.
      </p>
      <pre><code>{`target/release/shortener --bind 127.0.0.1:18080 --ephemeral --preload 1000

# Separate terminal: closed-loop saturation, then fixed arrivals.
target/release/loadgen --target http://127.0.0.1:18080 --preloaded \\
  --mode saturate --duration 8 --connections 32 --pipeline 512 --seed 1000

target/release/loadgen --target http://127.0.0.1:18080 --preloaded \\
  --rps 1300000 --duration 10 --connections 32 --pipeline 512 \\
  --queue 128 --seed 1000`}</code></pre>
      <p>
        Run the full suite with <code>./bench.sh --repeats 3 --seconds 30</code>. Keep its
        generated <code>CLAIMS.md</code> and raw logs with the result, including any
        failed runs. Report the actual elapsed time and the response checks alongside
        throughput so someone else can decide whether the workload resembles theirs.
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
            September 26 VPS rerun: method, configuration sweep, and raw JSON.{" "}
            <a href="https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-26.md">
              performance-2026-09-26.md
            </a>{" "}
            and{" "}
            <a href="https://github.com/maskjelly/rushort/blob/main/docs/benchmarks/rove-2026-09-26.json">
              rove-2026-09-26.json
            </a>
            .
          </li>
          <li>
            September 30 borrowed-lookup comparison and monitoring changes.{" "}
            <a href="https://github.com/maskjelly/rushort/blob/main/docs/performance-2026-09-30.md">
              performance-2026-09-30.md
            </a>{" "}
            and{" "}
            <a href="https://github.com/maskjelly/rushort/blob/main/docs/benchmarks/rove-2026-09-30.json">
              rove-2026-09-30.json
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
              Original post on X
            </a>
            .
          </li>
        </ol>
      </section>
    </article>
  )
}
