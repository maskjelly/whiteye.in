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
        I built a URL shortener that does 100 million redirects in 10 seconds
        on my laptop. 800 lines of Rust on the serving path, no framework, raw
        HTTP/1.1 on tokio. Getting the number was easy. Trusting it took three
        rewrites of the benchmark.
      </p>

      <p>
        The target came from{" "}
        <a href="https://x.com/aaryantwt/status/2099475672855204229">
          this post
        </a>
        : 100 million requests a day. That averages 1,157 RPS, which sounded
        small enough to beat by an embarrassing margin. I stole the reporting
        format from{" "}
        <a href="https://blog.railway.com/p/railway-cdn">Railway&apos;s CDN
        writeup</a> — one title number, one daily number, one ideal-lab
        number, each labeled with exactly what produced it.
      </p>

      <h2>numbers first</h2>
      <p>
        M4 Pro, 14 cores, client and server on the same box over loopback.
        Every redirect checked against its expected URL. A single dropped
        request fails the run. From the last full validation:
      </p>
      <ul>
        <li>
          <strong>10.0M RPS for 10s</strong> — 100,000,000 randomized redirect
          GETs in 10.002s, p99 17.6ms, zero drops. 32 connections, pipeline
          depth 128. The title.
        </li>
        <li>
          <strong>16.8M RPS peak</strong>, 16.3M median — closed-loop
          saturate with the same pipelining. The lab ceiling.
        </li>
        <li>
          <strong>165k RPS round-trip</strong> — no pipelining, 64
          connections, p99 around 0.5ms. The number that generalizes.
        </li>
        <li>
          <strong>1,158 RPS durable</strong> — 94% GET, 5% authenticated POST,
          1% misses, against SQLite for 30 seconds, p99 6.4ms. Exactly the
          100M/day average rate, with every acknowledged write re-read after a
          SIGKILL.
        </li>
      </ul>

      <Figure>
        <ThroughputBars />
        <Caption>
          Four workloads spanning four orders of magnitude. Pipelining hides
          TCP round-trips, so the top two rows measure processing capacity and
          the third row measures what a browser would feel.
        </Caption>
      </Figure>

      <h2>no framework, on purpose</h2>
      <p>
        There is no router and no middleware. Each connection gets one socket
        task, headers go through a span-based parser, and routing is a match
        on <code>(method, path)</code>. A GET decodes the base62 code and
        indexes straight into a sharded vector of strings. No hashing. No key
        comparison. No per-read allocation:
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
        Codes are sequential IDs in base62, which buys the direct index and
        costs you unguessability. These are identifiers, not secrets, and the
        same URL shortened twice gets two codes. I would not put anything
        private behind this without a separate access layer.
      </p>

      <h2>the batch drain is the whole trick</h2>
      <p>
        If you take one thing from this post, take this. Each read drains
        every complete request already sitting in the buffer — up to 256 — and
        answers all of them with a single <code>write</code>. Syscall and
        wakeup cost per request drops to nearly nothing. An earlier axum/hyper
        version of the same service topped out near 169k RPS on this hardware.
        The raw version with batching is 30–100x faster on the pipelined path,
        and I could not find any other change that mattered half as much.
      </p>

      <h2>durability without paying on reads</h2>
      <p>
        Reads never touch the disk. Writes go through one writer: insert into
        SQLite WAL with <code>synchronous=FULL</code> plus fullfsync, publish
        to the read cache, then acknowledge. Commit first, cache second, 201
        last. A test kills the process right after a 201 and re-reads the code
        after restart; it passes because there is no window where the client
        has an ack the disk does not have. A lock file refuses a second owner
        of the same database.
      </p>
      <p>
        This ordering is also the reason the durable number is three orders of
        magnitude below the burst number. An honest fsync per write costs what
        it costs. Anyone quoting the 10M figure for a write-heavy workload is
        measuring the wrong path.
      </p>

      <h2>the benchmark lied three times</h2>
      <p>
        The first version of the load generator divided batch latency by 128,
        counted an extra half-second of traffic in the peak run, and — my
        favorite — printed PASS while every GET returned HTTP 500. Each bug
        survived because the harness never checked anything the server said.
        Now it checks everything: open-loop arrivals on absolute deadlines so
        the generator cannot pace itself to the server, bounded queues so
        overload shows up as drops instead of silent queueing, full batch
        latency with no division, and post-run re-verification of every write.
        The fixture suite asserts the harness fails closed on all-500s, wrong
        stored URLs, and duplicate codes.
      </p>
      <p>
        The flaky one took longest. At queue depth 32 the 100M run dropped
        half a million requests; at 128 it passed twice, then failed once with
        7,000 drops after 30 seconds of saturate tests had heat-soaked the
        box. The fix was not a bigger queue. It was giving the 100M run its
        own fresh server instead of reusing the one that had already served a
        quarter-billion requests. Thermal throttling is a benchmark input
        whether you model it or not.
      </p>

      <h2>what I will not claim</h2>
      <p>
        10M RPS times 86,400 seconds is 864 billion a day. I am not writing
        that sentence anywhere except here, as an example of arithmetic that
        proves nothing. The run lasted 10 seconds, in RAM, pipelined 128
        deep, on loopback. The durable claim is the boring one — 1,158 RPS of
        mixed traffic for 30 seconds with every write re-verified — and boring
        is what goes in a capacity plan. Real round-trips top out near 165k
        RPS on macOS loopback before the kernel, not the app, gives up. Past
        that you are talking io_uring and kernel bypass, which is a different
        project.
      </p>

      <h2>run it yourself</h2>
      <pre>
        <code>{`git clone https://github.com/maskjelly/rushort
cd rushort
cargo test --release --locked
python3 tests/blackbox.py
./bench.sh --repeats 1 --seconds 10   # ~60s, writes target/benchmarks/<stamp>/CLAIMS.md`}</code>
      </pre>
      <p>
        The full validation is <code>./bench.sh --repeats 3 --seconds
        30</code>. Source is MIT at{" "}
        <a href="https://github.com/maskjelly/rushort">
          github.com/maskjelly/rushort
        </a>
        . If your workload looks like the round-trip row, start there and
        ignore my title.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            rushort source (MIT).{" "}
            <a href="https://github.com/maskjelly/rushort">
              github.com/maskjelly/rushort
            </a>
            . Harness, fail-closed fixtures, and single-node deploy notes
            included.
          </li>
          <li>
            Walton (2026). &quot;How to build a 30M RPS CDN in 30 days with
            Rust and WASM.&quot;{" "}
            <a href="https://blog.railway.com/p/railway-cdn">
              blog.railway.com/p/railway-cdn
            </a>
            . Where the three-number reporting format comes from.
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
