import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "the-network-is-not-a-wire",
  title: "the network is not a wire",
  date: "apr 22, 2026",
  description:
    "A network is a shared, lossy, contended medium with queues at every hop. From AIMD to BBR to bufferbloat to the power of two choices — why bandwidth is easy, latency is hard, and your p99 has been lying to you.",
  readingTime: "12 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        People talk about &quot;sending data over the network&quot; as if the
        network were a wire: bytes in, bytes out, latency equal to distance
        divided by the speed of light. It is not. A network is a shared,
        contended, queued medium. The bandwidth part is mostly solved. The
        latency part is a story about queues, and queues are where
        engineering taste lives.
      </p>

      <h2>the packet&apos;s actual journey</h2>
      <p>
        When your application calls <code>send()</code>, the bytes go through
        roughly this many queues before the other side sees them: the
        application&apos;s own buffer, the kernel socket send buffer, the NIC
        ring buffer, the switch port queue, the router queue at each hop, the
        upstream link queue, and then the mirror image on the receiving end.
        Every one of those queues exists because the rate at which data
        arrives is not always the rate at which it can leave.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="a packet crosses a queue at every hop" packetHops />
        <Caption>
          Each hop has a queue because arrival rate and departure rate
          don&apos;t always match. The queues are necessary — without them
          you&apos;d drop packets whenever there&apos;s a momentary burst.
          But every byte ahead of you in a queue is latency you pay for and
          can&apos;t get back.
        </Caption>
      </Figure>

      <p>
        Two things fall out of this that matter more than bandwidth ever
        does. <strong>Queueing delay is variable</strong> — it depends on how
        full the queue is when you arrive, which depends on everyone else.
        And <strong>queueing delay dominates the tail</strong>: your median
        request might see empty queues, but your 99th percentile request
        arrived behind a burst and waited. At scale, the tail is where the
        queues live.
      </p>

      <h2>the problem congestion control actually solves</h2>
      <p>
        Multiple senders share a bottleneck link. There is no coordinator.
        No one knows the link&apos;s capacity; no one knows how many other
        flows are sharing it; no one can directly observe the queue depth at
        the bottleneck. Every sender has to <em>infer</em> all of this from
        the only signal that makes it back: acknowledgments (and the lack of
        them). Congestion control is the algorithm by which a sender picks
        its sending rate under that blindness, without either underusing the
        link or melting it.
      </p>
      <p>
        The answer TCP arrived at in 1988 (Jacobson, Van&nbsp;Jacobson, after
        the first internet congestion collapse) is{" "}
        <strong>AIMD</strong>: Additive Increase, Multiplicative Decrease.
        Probe for bandwidth by increasing your window by one packet per RTT.
        When you detect a loss, cut your window in half. The result is the
        famous sawtooth.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 280" title="AIMD sawtooth vs BBR steady-state" aimdVsBbr />
        <Caption>
          AIMD (Reno/CUBIC) probes by growing the window until loss, then
          halves. It needs to overflow a buffer to detect the limit, which
          means the buffer is full right before the backoff — exactly when
          latency is worst. BBR models the bottleneck instead and paces to
          it, holding a steady window without needing loss as a signal.
        </Caption>
      </Figure>

      <p>
        AIMD is elegant and it saved the internet. It also has a structural
        flaw that took 25 years to name: <strong>it uses loss as the
        signal that the link is full</strong>. That means it has to{" "}
        <em>fill a buffer</em> to find out. If the buffer is large — and in
        the 2000s, buffers everywhere got large — the sender fills the
        buffer before it sees a loss, and the queueing delay goes through
        the roof while the bandwidth is barely affected. This is{" "}
        <strong>bufferbloat</strong>, and it is the reason your home
        internet feels fine on a speed test and awful under load.
      </p>

      <h2>bufferbloat: the latency you didn&apos;t measure</h2>
      <p>
        The speed test measures bandwidth — how many bytes per second. It
        does not measure latency under load, which is the thing you actually
        feel. A 100 Mbps link with a 10-second buffer can pass a speed test
        perfectly and still make video calls unusable, because every packet
        sits in a 10-second queue behind a download. The bandwidth is fine;
        the latency is catastrophic.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 280" title="bufferbloat — latency spikes before loss arrives" bufferbloat />
        <Caption>
          As load increases, the queue fills before it overflows. Latency
          tracks the queue depth, so it climbs long before the loss event
          that AIMD is waiting for. The fix is not smaller buffers (you need
          some for bursts) — it is <strong>active queue management</strong>{" "}
          that drops early enough to signal &quot;back off&quot; before the
          queue is destructive. CoDel and fq_codel do this.
        </Caption>
      </Figure>

      <p>
        The fix, <strong>AQM</strong> (Active Queue Management), is to drop
        or mark packets <em>before</em> the queue is full, so the sender
        learns to back off while there&apos;s still headroom.{" "}
        <strong>CoDel</strong> (&quot;cooldown&quot;) and its fair variant{" "}
        <strong>fq_codel</strong> are the modern versions: they track the
        sojourn time of packets in the queue and start dropping when it
        exceeds a small threshold (typically ~5 ms), instead of waiting for
        the queue to fill. fq_codel is the default qdisc on most modern
        Linux distros, which is why your home router got better at video
        calls sometime around 2018 without you noticing.
      </p>

      <h2>BBR: stop using loss as the signal</h2>
      <p>
        In 2016, Google&apos;s BBR (Bottleneck Bandwidth and Round-trip
        propagation time) took a different cut. Instead of inferring
        congestion from loss, it <strong>estimates the bottleneck
        bandwidth</strong> and the <strong>minimum RTT</strong> directly,
        and paces sending to match their product — the{" "}
        <strong>BDP</strong> (Bandwidth-Delay Product), which is exactly the
        amount of data needed to keep the pipe full without overfilling it.
      </p>
      <p>
        The payoff: BBR doesn&apos;t need to fill a buffer to find the
        limit. It holds a steady window sized to the BDP, drains the queue,
        and keeps latency low. On long-haul, high-bandwidth links (where the
        BDP is huge and CUBIC&apos;s loss-based probing is especially
        wasteful), BBR is meaningfully better. The catch: BBR flows can be
        unfair to CUBIC flows sharing the same bottleneck, because BBR
        doesn&apos;t back off on loss the way CUBIC expects. The versions
        (BBR v2/v3) spend most of their complexity on coexistence and
        fairness — the steady-state model was the easy part.
      </p>

      <h2>why your p99 has been lying</h2>
      <p>
        The uncomfortable truth about tail latency at scale: your p99 is
        dominated by <em>rare bad events</em>, and rare bad events are
        normal in a system with many independent queueing points. If each
        hop has a 1% chance of being slow, and a request crosses 10 hops,
        the chance that <em>at least one</em> hop is slow is{" "}
        <code>1 - 0.99^10 ≈ 9.6%</code>. Your p99 is not telling you about
        the 99th percentile of your service — it is telling you about the
        99th percentile of the <em>sum</em> of every queue along the path,
        and the tail of a sum is fatter than the tail of any term.
      </p>
      <p>
        This is why the &quot;power of two choices&quot; result
        (Mitzenmacher, Richa, et&nbsp;al.) is so load-bearing for tail
        latency. Naive random load balancing: pick one server at random,
        send the request. The expected queue length at a random server is
        fine, but the <em>tail</em> is bad — you sometimes pick an already
        busy server. Power of two choices: pick <strong>two</strong> random
        servers, send the request to the one with the shorter queue. The
        difference is not linear; it is exponential in the tail. The
        expected maximum queue length drops from{" "}
        <code>O(log n / log log n)</code> to <code>O(log log n)</code>. A
        single extra sample turns a power law into a log log. Every
        load balancer that cares about tails does this, or something like it
        (least-outstanding-requests, power-of-k-choices).
      </p>
      <p>
        The general lesson, which I keep rediscovering:{" "}
        <strong>at scale, you don&apos;t optimize the average, you optimize
        the tail, and the tail is made of queues.</strong> The average
        request sees no queue. The 99th sees one. The 99.9th sees two at
        once. Your job is to make sure the queues are short, fair, and
        drained on a schedule — not to make the average fast.
      </p>

      <h2>the through-line</h2>
      <p>
        Networking is the last pillar of the same idea I keep circling: a
        system is a set of queues and a contract about how they drain. The
        storage post was about the contract that says &quot;this byte is
        durable&quot; (the fsync contract that&apos;s actually a flush). The
        consensus post was about the contract that says &quot;this history
        is agreed&quot; (the log that&apos;s replicated). The memory post
        was about the contract that says &quot;this store is visible&quot;
        (the barrier that drains the store buffer). The network post is
        about the contract that says &quot;this packet arrives without
        melting the shared pipe&quot; (the congestion control that paces to
        the bottleneck).
      </p>
      <p>
        In every case the hard part is not the steady state — it&apos;s the
        recovery from a queue that filled unexpectedly. AIMD sawtooths
        around a full buffer; Paxos view-changes around a dead leader; the
        store buffer drains around a barrier; the WAL replays around a
        crash. The steady state is where you live most of the time. The
        recovery is where you spend your design effort, because the steady
        state is easy and the recovery is where systems corrupt themselves.
      </p>
      <p>
        The network is not a wire. It is a queue you share with strangers.
        Treat it that way, and the latency stops being a mystery.
      </p>
    </article>
  )
}
