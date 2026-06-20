import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "the-network-is-not-a-wire",
  title: "the network is not a wire",
  date: "apr 22, 2026",
  description:
    "On queues at every hop, AIMD, BBR, bufferbloat, the power of two choices, and why your p99 has been lying to you.",
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
        latency part is a story about queues.
      </p>

      <p>
        I got interested in this after debugging a p99 that made no sense. The
        median was fine, the bandwidth was fine, and the tail was
        catastrophic. It turned out to be a queue at a hop I did not know
        existed. This post is what I learned trying to understand why.
      </p>

      <h2>the packet&apos;s journey</h2>
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
          Each hop has a queue because arrival rate and departure rate do not
          always match. The queues are necessary. Without them you would drop
          packets whenever there is a momentary burst. But every byte ahead of
          you in a queue is latency you pay for and cannot get back.
        </Caption>
      </Figure>

      <p>
        Two things fall out of this. Queueing delay is variable. It depends on
        how full the queue is when you arrive, which depends on everyone else.
        And queueing delay dominates the tail. Your median request might see
        empty queues, but your 99th percentile request arrived behind a burst
        and waited. At scale, the tail is where the queues live.
      </p>

      <h2>congestion control</h2>
      <p>
        Multiple senders share a bottleneck link. There is no coordinator. No
        one knows the link&apos;s capacity. No one knows how many other flows
        are sharing it. No one can directly observe the queue depth at the
        bottleneck. Every sender has to infer all of this from the only signal
        that makes it back: acknowledgments, and the lack of them.
      </p>
      <p>
        The answer TCP arrived at in 1988, after the first internet congestion
        collapse, is AIMD: Additive Increase, Multiplicative Decrease. Probe
        for bandwidth by increasing your window by one packet per RTT. When
        you detect a loss, cut your window in half. The result is the famous
        sawtooth.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 280" title="AIMD sawtooth vs BBR steady-state" aimdVsBbr />
        <Caption>
          AIMD (Reno/CUBIC) probes by growing the window until loss, then
          halves. It needs to overflow a buffer to detect the limit, which
          means the buffer is full right before the backoff, exactly when
          latency is worst. BBR models the bottleneck instead and paces to it,
          holding a steady window without needing loss as a signal.
        </Caption>
      </Figure>

      <p>
        AIMD saved the internet. It also has a structural flaw that took 25
        years to name: it uses loss as the signal that the link is full. That
        means it has to fill a buffer to find out. If the buffer is large (and
        in the 2000s, buffers everywhere got large), the sender fills the
        buffer before it sees a loss, and the queueing delay goes through the
        roof while the bandwidth is barely affected. This is bufferbloat, and
        it is the reason your home internet feels fine on a speed test and
        awful under load.
      </p>

      <h2>bufferbloat</h2>
      <p>
        The speed test measures bandwidth, how many bytes per second. It does
        not measure latency under load, which is the thing you actually feel.
        A 100 Mbps link with a 10-second buffer can pass a speed test perfectly
        and still make video calls unusable, because every packet sits in a
        10-second queue behind a download. The bandwidth is fine. The latency
        is catastrophic.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 280" title="bufferbloat — latency spikes before loss arrives" bufferbloat />
        <Caption>
          As load increases, the queue fills before it overflows. Latency
          tracks the queue depth, so it climbs long before the loss event that
          AIMD is waiting for. The fix is not smaller buffers (you need some
          for bursts). It is active queue management that drops early enough
          to signal &quot;back off&quot; before the queue is destructive.
        </Caption>
      </Figure>

      <p>
        The fix, AQM (Active Queue Management), is to drop or mark packets
        before the queue is full, so the sender learns to back off while there
        is still headroom. CoDel and its fair variant fq_codel are the modern
        versions. They track the sojourn time of packets in the queue and
        start dropping when it exceeds a small threshold (around 5 ms),
        instead of waiting for the queue to fill. fq_codel is the default
        qdisc on most modern Linux distros, which is why your home router got
        better at video calls sometime around 2018 without you noticing.
      </p>

      <h2>BBR</h2>
      <p>
        In 2016, Google&apos;s BBR took a different cut. Instead of inferring
        congestion from loss, it estimates the bottleneck bandwidth and the
        minimum RTT directly, and paces sending to match their product, the
        BDP (Bandwidth-Delay Product), which is the amount of data needed to
        keep the pipe full without overfilling it.
      </p>
      <p>
        BBR does not need to fill a buffer to find the limit. It holds a
        steady window sized to the BDP, drains the queue, and keeps latency
        low. On long-haul, high-bandwidth links where the BDP is huge and
        CUBIC&apos;s loss-based probing is especially wasteful, BBR is
        meaningfully better. The catch: BBR flows can be unfair to CUBIC
        flows sharing the same bottleneck, because BBR does not back off on
        loss the way CUBIC expects. The versions (BBR v2, v3) spend most of
        their complexity on coexistence and fairness. The steady-state model
        was the easy part.
      </p>

      <h2>p99</h2>
      <p>
        The uncomfortable truth about tail latency at scale: your p99 is
        dominated by rare bad events, and rare bad events are normal in a
        system with many independent queueing points. If each hop has a 1%
        chance of being slow, and a request crosses 10 hops, the chance that
        at least one hop is slow is <code>1 - 0.99^10</code>, about 9.6%. Your
        p99 is not telling you about the 99th percentile of your service. It
        is telling you about the 99th percentile of the sum of every queue
        along the path, and the tail of a sum is fatter than the tail of any
        term.
      </p>
      <p>
        This is why the &quot;power of two choices&quot; result is so
        load-bearing for tail latency. Naive random load balancing: pick one
        server at random, send the request. The expected queue length at a
        random server is fine, but the tail is bad. You sometimes pick an
        already busy server. Power of two choices: pick two random servers,
        send the request to the one with the shorter queue. The difference is
        not linear. It is exponential in the tail. The expected maximum queue
        length drops from <code>O(log n / log log n)</code> to{" "}
        <code>O(log log n)</code>. A single extra sample turns a power law
        into a log log. Every load balancer that cares about tails does this,
        or something like it (least-outstanding-requests, power-of-k-choices).
      </p>
      <p>
        At scale you do not optimize the average. You optimize the tail, and
        the tail is made of queues. The average request sees no queue. The
        99th sees one. The 99.9th sees two at once. Your job is to make sure
        the queues are short, fair, and drained on a schedule.
      </p>

      <p>
        I keep noticing the same pattern across the systems I have written
        about. The storage post was about the contract that says &quot;this
        byte is durable&quot; (the fsync that is actually a flush). The
        consensus post was about the contract that says &quot;this history is
        agreed&quot; (the replicated log). The memory post was about the
        contract that says &quot;this store is visible&quot; (the barrier
        that drains the store buffer). The network post is about the contract
        that says &quot;this packet arrives without melting the shared
        pipe&quot; (the congestion control that paces to the bottleneck).
      </p>
      <p>
        In every case the hard part is not the steady state. It is the
        recovery from a queue that filled unexpectedly. AIMD sawtooths around
        a full buffer. Paxos view-changes around a dead leader. The store
        buffer drains around a barrier. The WAL replays around a crash. The
        steady state is where you live most of the time. The recovery is where
        you spend your design effort, because that is where systems corrupt
        themselves. I am not sure I have ever seen a system where this was not
        true.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Jacobson (1988). &quot;Congestion Avoidance and Control.&quot;{" "}
            <a href="https://ee.lbl.gov/papers/congavoid.pdf">
              PDF
            </a>
            . The paper that gave us AIMD. Still worth reading.
          </li>
          <li>
            Nichols, Jacobson (2012). &quot;Controlling Queue Delay: A
            CoDel AQM.&quot;{" "}
            <a href="https://queue.acm.org/detail.cfm?id=2209336">
              ACM Queue
            </a>
            . The bufferbloat fix.
          </li>
          <li>
            Cardwell, Cheng, Gunn, Yeganeh, Jacobson (2017). &quot;BBR:
            Congestion-Based Congestion Control.&quot;{" "}
            <a href="https://research.google/pubs/pub45646/">
              Google Research
            </a>
            . The BBR paper. Read with the v2/v3 follow-ups for the
            fairness story.
          </li>
          <li>
            Mitzenmacher (1996). &quot;The Power of Two Choices in
            Randomized Load Balancing.&quot;{" "}
            <a href="https://www.eecs.harvard.edu/~michaelm/postscripts/mythesis.pdf">
              PhD thesis
            </a>
            . The result that makes your p99 survivable.
          </li>
          <li>
            Gettys, Nichols (2011). &quot;Bufferbloat: Dark Buffers in the
            Internet.&quot;{" "}
            <a href="https://queue.acm.org/detail.cfm?id=2071893">
              ACM Queue
            </a>
            . The naming of the problem.
          </li>
        </ol>
      </section>
    </article>
  )
}
