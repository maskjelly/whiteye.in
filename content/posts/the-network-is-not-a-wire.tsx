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
        In the script&apos;s output, stage A and stage B both have p99=0 ms. The combined path has p99=100 ms. I supplied all 1,000 synthetic request timings to the <a href="https://github.com/maskjelly/whiteye.in/blob/main/scripts/blog-models.py">reproduction</a>, so I can see exactly where the summaries lost information: they kept the delay and discarded the identity of the slow requests. Before explaining that result, I want to follow the places where a request can wait.
      </p>

      <p>
        Here is a FIFO with <code>125 MB</code> ahead of our small packet and a 100 Mbps link to drain it. The units need converting before I divide: <code>100 Mbps / 8 = 12.5 MB/s</code>, in decimal bytes. At that rate, clearing the backlog takes ten seconds. Put another way, 125 MB occupies 1,000 megabits of the link&apos;s capacity. It could be busy for the entire wait, making the throughput graph look excellent while the shell command or call behind the backlog stalls. I need the bytes to leave faster to shorten that wait. Giving them a bigger buffer would only allow a longer backlog.
      </p>

      <h2>after send() returns</h2>
      <p>
        Start the request&apos;s path at <code>send()</code>. A successful return can
        mean the bytes are still in the sending machine&apos;s socket send buffer.
        They may wait again at the NIC&apos;s transmit ring, then in switches and
        routers. At the far end, the receiving application has to be scheduled even
        after the bytes reach its network stack. I would put those waits on the
        drawing alongside the physical links.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="a packet crosses a queue at every hop" packetHops />
        <Caption>
          The buffer absorbs a burst that the next link cannot send immediately.
          Our small packet arrives behind it and waits for bytes belonging to
          other requests.
        </Caption>
      </Figure>

      <p>
        Hold the FIFO&apos;s departure rate fixed and divide the bytes ahead by
        that rate for the approximate wait. Arrive just before
        a burst and the queue may be empty; arrive just after and those bytes are
        now ahead of you. That split can vanish in an average. It makes queueing
        worth checking when p99 rises, alongside retransmissions and time waiting
        for the application to run.
      </p>

      <h2>waiting for a congestion signal</h2>
      <p>
        From the sender&apos;s end, most of those queues are out of sight. It has
        acknowledgments for delivery and timing, plus loss or ECN marks as possible
        congestion signals. It rarely knows every link&apos;s capacity. And while it
        waits for feedback, other senders change how much capacity is available.
        They are making their own decisions from delayed feedback too.
      </p>
      <p>
        For Reno, picture the sender with a window of 64 segments in congestion avoidance. Give it an RTT of successful delivery and it can grow to about 65; another, about 66. Then three duplicate acknowledgments arrive. The loss response roughly halves the window, so the climb starts again from lower down. A timeout is a more severe setback. That repeated climb and cut gives the diagram its sawtooth. Jacobson&apos;s <a href="https://ee.lbl.gov/papers/congavoid.pdf">1988 paper</a> traces the feedback problem that led to congestion collapse.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 280" title="Reno-style probing and a BBR model reference" aimdVsBbr />
        <Caption>
          After a congestion event, Reno roughly halves its window and CUBIC usually
          keeps 70%, then follows a different growth curve. The BBR line marks a
          model reference; probing moves an actual sender&apos;s rate around it.
        </Caption>
      </Figure>

      <p>
        For CUBIC, start a loss event with a window of 100 segments. Its usual decrease would leave 70, or 70%, after which growth follows a cubic function of elapsed time since the congestion event. <a href="https://datatracker.ietf.org/doc/rfc9438/">RFC 9438</a> specifies the rule. Follow it or Reno while our router keeps accepting packets: neither sees an overflow signal yet. They can continue probing upward while bytes are already piling up in that router. Changing how the window grows has left the signal arriving too late.
      </p>
      <p>
        Let the burst drain and the buffer has done useful work. Let the backlog
        persist and we have bufferbloat. Extra buffer space can move the overflow
        signal further away, so the sender leaves more bytes waiting before it
        learns to back off. Gettys and Nichols describe this failure in <a
        href="https://queue.acm.org/detail.cfm?id=2071893">Bufferbloat: Dark Buffers in
        the Internet</a>. Our ten-second FIFO makes its cost easy to see: all that
        latency while the throughput graph still looks busy.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 280" title="bufferbloat — latency spikes before loss arrives" bufferbloat />
        <Caption>
          We can drop or ECN-mark a packet before the buffer fills. Choosing when
          to signal congestion changes the wait, alongside choosing the buffer size.
          Neither increases the link&apos;s delivery rate.
        </Caption>
      </Figure>

      <h2>CoDel looks for a queue that stays</h2>
      <p>
        Six milliseconds of waiting by itself tells me little. Perhaps this packet arrived just after a burst and the next few will find an empty queue. CoDel watches the least waiting time among recent departures to distinguish that case. The defaults in <a href="https://www.rfc-editor.org/rfc/rfc8289.html">RFC 8289</a> use 5 ms as the target. The other number, a 100 ms interval, is what keeps me from reading that target as an expiration date on each packet. If even the least-delayed departures stay above the target through that interval, the backlog has persisted. A burst has had time to clear before we act on a standing queue.
      </p>
      <p>
        CoDel can now send the warning as a drop or ECN mark while the buffer still has space. Add fq_codel and we can also change which flow gets the next turn. With a sparse SSH flow in its own queue, packets need not sit behind a bulk transfer&apos;s entire backlog. <a href="https://www.rfc-editor.org/rfc/rfc8290.html">RFC 8290</a> describes that treatment of sparse flows. I would first locate the queue I mean to fix. Enabling fq_codel on a host changes that host&apos;s scheduling; it cannot pull bytes out of a backlog already waiting in another router.
      </p>

      <h2>250 kB in flight, another 1 MB waiting</h2>
      <p>
        For the same link, take an otherwise unqueued RTT of 20 ms. During that time it sends about 250 kB: <code>12.5 MB/s × 0.020 s = 0.25 MB</code>. That is the bandwidth-delay product, our estimate of what needs to be in flight to keep this path busy. What if I add 1 MB of queue at the bottleneck? At 12.5 MB/s those extra bytes take another 80 ms to clear, without raising the delivery rate.
      </p>
      <p>
        BBR needs estimates for the two inputs we just multiplied: delivery rate
        and baseline RTT. It uses them to find an operating point and paces packet
        departures instead of releasing everything at once. Cardwell and colleagues&apos; <a
        href="https://research.google/pubs/pub45646/">2016 paper</a> describes the
        original model. To find spare bandwidth, the sender has to try sending
        faster. To observe baseline RTT, it needs a measurement without its own
        standing queue in the way. Those probes move its sending rate, which is
        why I would not read the diagram&apos;s flat BBR reference as a trace of
        the controller running.
      </p>
      <p>
        A bandwidth probe can itself build a queue. Put competing flows on the
        path and the estimates get harder to interpret. Later BBR versions changed
        loss response and behavior alongside other flows, so a useful comparison
        needs the version and the competing traffic beside its results. I would
        look at delivered rate together with latency under load. Adjusting the
        offered load gives the sender some control, but it reserves no capacity
        along the path from which to guarantee a request&apos;s deadline.
      </p>

      <h2>p99 needs the requests to stay paired</h2>
      <p>
        There is a probability calculation I want to keep separate from the p99
        trace. Give each of ten independent hops a 1% chance of being slow.
        The chance of avoiding every slow hop is <code>0.99^10</code>, so the
        chance of meeting at least one is <code>1 − 0.99^10 ≈ 9.6%</code>.
        We have counted encounters with a slow hop. We still need the delay that
        &quot;slow&quot; adds to calculate request latency. Shared congestion could
        also make the independence assumption wrong.
      </p>
      <p>
        Run the script and inspect the request IDs before looking at the percentiles. In stage A, requests 1–6 each take 100 ms. Stage B delays a different set, 7–12, by the same amount. All other times are zero. That puts 994 zeros at the beginning of either sorted stage array: 99.4% of the 1,000 samples. Nearest-rank p99 asks for sample 990, which is still zero in both.
      </p>
      <p>
        Adding the stages with <code>zip</code> keeps each request with its own timings. There are now twelve slow sums and only 988 zeros. Look for sample 990 in that sorted array: it has to be one of the 100 ms requests. The printed end-to-end p99 is therefore 100 ms. Both stage summaries had printed 0 ms. I supplied these synthetic times, with exact request identities, so there are no real clocks to align and no trace to reconstruct. Reducing each stage to a percentile was enough to lose the information.
      </p>

      <p>
        Dispatch adds another place for a request to wait. A random choice might put it on a busy server while an idle one is available; sampling two queues and choosing the shorter makes that less likely. In Mitzenmacher&apos;s <a href="https://www.eecs.harvard.edu/~michaelm/postscripts/mythesis.pdf">power of two choices work</a>, I can compare those choices in a static setup: n jobs enter n initially empty queues. The maximum load with one random choice has the bound <code>O(log n / log log n)</code>, with high probability. Allowing two choices improves that bound to <code>O(log log n)</code>. I would try sampling in a server design, then check the things this static setup left out. Jobs depart, their costs differ, and a queue report may already be stale when the dispatcher acts on it.
      </p>
      <p>
        To investigate a real p99, I would first compare idle RTT with RTT during a bulk transfer. Rising RTT with steady server processing would send me along the network path looking for queued bytes. If RTT stayed flat, I would follow a growing application span into the server queues and connection pools instead. Queue-depth and drop counters could help test either explanation. Then I could change the controller&apos;s offered traffic or the scheduler&apos;s choice of the next packet and repeat the experiment. I would keep the traffic the same before and after, recording delivered rate and latency under load. The request timings would stay paired until that comparison was done.
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
