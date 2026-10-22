import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "the-network-is-not-a-wire",
  title: "the network is not a wire",
  date: "apr 22, 2026",
  updated: "oct 23, 2026",
  description: "A queue can keep a link busy while making requests unusably slow. Working through bufferbloat, CoDel, BBR, and the limits of p99 arithmetic.",
  readingTime: "8 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        Put 125 MB ahead of a packet on a 100 Mbps link and it waits about ten seconds. The link can run at full throughput the whole time. That is the awkward thing about a queue: a bandwidth graph can look fine while an interactive request becomes unusable.
      </p>

      <p>
        I got interested in this while debugging a bad p99. The median looked normal; bandwidth didn&apos;t seem to be the problem. I had missed a queue at one hop. Since then, I start by drawing the request&apos;s path and marking where it can wait. The congestion-control algorithm is only one part of that drawing.
      </p>

      <h2>where a packet waits</h2>
      <p>
        After <code>send()</code> succeeds, the bytes may still be on your machine. They can wait in the socket send buffer, then in the NIC&apos;s transmit ring. Switches and routers have queues too. At the destination, arrival at the network stack still leaves the application waiting to be scheduled.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="a packet crosses a queue at every hop" packetHops />
        <Caption>
        A buffer absorbs a burst while the next link catches up. Every packet behind that burst pays in waiting time, even if its own processing takes almost no work.
      </Caption>
      </Figure>

      <p>
        For a FIFO draining at a fixed rate, divide the bytes ahead by the departure rate to estimate the wait. Arrive before a burst and you may see almost none of it; arrive just after and you inherit the backlog. An average hides that difference. A high p99 is a reason to investigate, though retransmissions or application scheduling could be responsible too.
      </p>

      <h2>how a sender finds the limit</h2>
      <p>
        The sender rarely knows the capacity of every link, much less the other traffic using it. It gets acknowledgments back and infers what is happening from their timing. Loss and ECN marks add evidence of congestion. All of this feedback is delayed. While one sender reacts, others are adjusting their rates as well.
      </p>
      <p>
        Consider Reno with a congestion window of 64 segments. During congestion avoidance, it adds roughly one segment per RTT: 65, then 66, and so on. Three duplicate acknowledgments trigger a loss response that roughly halves the window; a timeout cuts it more severely. Jacobson&apos;s <a href="https://ee.lbl.gov/papers/congavoid.pdf">1988 paper</a> explains the feedback needed after congestion collapse. That slow climb followed by a sharp cut is the sawtooth in the diagram.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 280" title="Reno-style probing and a BBR model reference" aimdVsBbr />
        <Caption>
        Reno roughly halves its window on a congestion event. CUBIC has a different growth curve and normally retains 70%. The BBR line is a schematic reference; a real BBR sender probes and changes its rate.
      </Caption>
      </Figure>

      <p>
        CUBIC grows its window with a cubic function of time since the last congestion event, as specified in <a href="https://datatracker.ietf.org/doc/rfc9438/">RFC 9438</a>. Its usual loss response leaves 70% of the window. Despite those differences from Reno, either controller can fill a large buffer if its congestion signal arrives only when that buffer overflows.
      </p>

      <h2>bufferbloat</h2>
      <p>
        A burst should subside and let a queue drain. Bufferbloat starts when the backlog sticks around. A bigger buffer can make this worse: the sender keeps probing, sees no overflow yet, and leaves still more bytes waiting. This is the behavior Gettys and Nichols describe in <a href="https://queue.acm.org/detail.cfm?id=2071893">Bufferbloat: Dark Buffers in the Internet</a>.
      </p>
      <p>
        The opening example uses decimal units: <code>100 Mbps / 8 = 12.5 MB/s</code>, so draining <code>125 MB</code> takes ten seconds. That is an idealized FIFO calculation, separate from my debugging incident. It explains why buying bandwidth and enlarging a buffer can have very different effects on a call or an interactive shell.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 280" title="bufferbloat — latency spikes before loss arrives" bufferbloat />
        <Caption>
        Drops or ECN marks can signal congestion before overflow. Buffer sizing and queue management work together; neither eliminates the capacity limit.
      </Caption>
      </Figure>

      <p>
        CoDel asks how long packets waited before leaving the queue. Its useful statistic is the recent minimum. With the usual settings from <a href="https://www.rfc-editor.org/rfc/rfc8289.html">RFC 8289</a>, the target is 5 ms and the interval is 100 ms. If even the minimum stays above the target for an interval, normal bursts have had time to drain and a persistent backlog remains. One packet waiting 6 ms does not meet that condition. This is why treating 5 ms as a per-packet expiry time gets CoDel wrong.
      </p>
      <p>
        A router can therefore drop or ECN-mark before it runs out of space, asking senders to back off sooner. fq_codel also gives flows separate queues and schedules between them. An SSH flow can get a turn while a bulk transfer still has a backlog. <a href="https://www.rfc-editor.org/rfc/rfc8290.html">RFC 8290</a> describes how it handles these sparse flows. The location matters. Enabling fq_codel on a host gives it control over its own queue, with no power to drain a backlog at another router.
      </p>

      <h2>what BBR estimates</h2>
      <p>
        Take a 100 Mbps path with a 20 ms baseline RTT. Its bandwidth-delay product is <code>12.5 MB/s × 0.020 s = 0.25 MB</code>: roughly 250 kB in flight keeps the path busy. An extra 1 MB waiting at that bottleneck adds another 80 ms without raising its delivery rate. These are model values, not observations from a test. BBR estimates the delivery rate and baseline RTT to find that operating point, as Cardwell and colleagues explain in their <a href="https://research.google/pubs/pub45646/">2016 paper</a>. It also paces departures to spread packets over time.
      </p>
      <p>
        Those estimates have to be refreshed. To discover spare bandwidth, the sender must try sending faster. To observe baseline RTT, it needs a chance to measure without its own standing queue. BBR probes for both, which is why its sending rate varies. The flat line in the diagram cannot describe the actual controller. Probes can themselves build queues, and competing flows complicate the estimate.
      </p>
      <p>
        The 2016 paper describes the original BBR. Later versions have changed its response to loss and its behavior alongside other flows, so a useful comparison names the version and the competing traffic. I would measure delivered rate and loaded latency together. A congestion controller can adjust what a sender offers; it cannot reserve capacity across the path or guarantee a deadline.
      </p>

      <h2>why the tail grows</h2>
      <p>
        Here is another small calculation. Suppose each of ten independent hops has a 1% chance of being slow. All ten avoid that state with probability <code>0.99^10</code>; at least one is slow with probability <code>1 − 0.99^10 ≈ 9.6%</code>. That is the probability of encountering a slow hop. Computing a request&apos;s latency still requires knowing how much delay that state adds.
      </p>
      <p>
        Actual hops can share a cause of congestion, breaking the independence assumption. There is another trap in adding component p99s. Construct a trace of 1,000 requests through A and B: six spend 100 ms in A, six different requests spend 100 ms in B, and all other stage times are zero. Each stage&apos;s p99 is zero because 99.4% of its samples are zero. The total is 100 ms for 1.2% of requests, making the end-to-end p99 100 ms. The slow requests have to stay paired across stages for the calculation to work.
      </p>
      <p>
        Server selection has a similar queueing problem. One random choice can land on a busy server while another sits free. Choose the shorter of two sampled queues and that risk drops sharply. Mitzenmacher studied a related model in his <a href="https://www.eecs.harvard.edu/~michaelm/postscripts/mythesis.pdf">power of two choices work</a>: place n jobs into n initially empty queues. With one random choice, the maximum load is <code>O(log n / log log n)</code>; with two, it is <code>O(log log n)</code>, with high probability. Real service queues also have jobs finishing, unequal request costs, and stale reports to contend with.
      </p>
      <p>
        For a p99 investigation, I would compare idle RTT with RTT during a bulk transfer. If RTT climbs while server processing stays steady, queues along the network path are worth inspecting. If RTT holds steady and an application span grows, I would look at server waits and connection pools. Queue-depth and drop counters can help distinguish the explanations.
      </p>

      <p>
        The queue I missed is why I want that comparison before changing a socket setting. A sender&apos;s congestion controller and a router&apos;s scheduler act at different places. After changing either, I would repeat the same traffic and check loaded latency alongside throughput. The useful result is a shorter wait for the requests that were slow.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Xu et al. (2023). <a href="https://datatracker.ietf.org/doc/rfc9438/">RFC
            9438: CUBIC for Fast and Long-Distance Networks</a>. The growth curve
            and 0.7 multiplicative-decrease factor.
          </li>
          <li>
            Jacobson (1988). &quot;Congestion Avoidance and Control.&quot;{" "}
            <a href="https://ee.lbl.gov/papers/congavoid.pdf">
              PDF
            </a>
            . Congestion collapse, acknowledgment feedback, and congestion avoidance.
          </li>
          <li>
            Nichols, Jacobson (2012). &quot;Controlling Queue Delay: A
            CoDel AQM.&quot;{" "}
            <a href="https://queue.acm.org/detail.cfm?id=2209336">
              ACM Queue
            </a>
            . The queue-delay estimator and control loop behind CoDel.
          </li>
          <li>
            Cardwell, Cheng, Gunn, Yeganeh, Jacobson (2016). &quot;BBR:
            Congestion-Based Congestion Control.&quot;{" "}
            <a href="https://research.google/pubs/pub45646/">
              Google Research
            </a>
            . The original BBR model and probing behavior, published in ACM Queue.
          </li>
          <li>
            Mitzenmacher (1996). &quot;The Power of Two Choices in
            Randomized Load Balancing.&quot;{" "}
            <a href="https://www.eecs.harvard.edu/~michaelm/postscripts/mythesis.pdf">
              PhD thesis
            </a>
            . Randomized load models, including the maximum-load result cited above.
          </li>
          <li>
            Gettys, Nichols (2011). &quot;Bufferbloat: Dark Buffers in the
            Internet.&quot;{" "}
            <a href="https://queue.acm.org/detail.cfm?id=2071893">
              ACM Queue
            </a>
            . Persistent queues and latency under load.
          </li>
          <li>
            Nichols et al. (2018). <a href="https://www.rfc-editor.org/rfc/rfc8289.html">RFC
            8289: Controlled Delay Active Queue Management</a>. Hoeiland-Joergensen et
            al. (2018). <a href="https://www.rfc-editor.org/rfc/rfc8290.html">RFC 8290:
            The Flow Queue CoDel Packet Scheduler and Active Queue Management
            Algorithm</a>.
          </li>
        </ol>
      </section>
    </article>
  )
}
