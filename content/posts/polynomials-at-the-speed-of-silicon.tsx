import { Figure, Diagram, Caption } from "@/components/figure"
import { Code } from "@/components/code"

export const meta = {
  slug: "polynomials-at-the-speed-of-silicon",
  title: "polynomials at the speed of silicon",
  date: "jun 21, 2026",
  description:
    "On multivariate polynomial evaluation, Horner's method on FPGA DSP slices, microwave vs fiber propagation, and the difference between latency arbitrage and front-running.",
  readingTime: "11 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        A few months ago I got pulled into reading about how HFT desks actually
        work, and the part that stuck with me was not the finance part. It was
        the engineering constraint. You have a model, usually a polynomial not a
        neural net, and you have to evaluate it in tens of nanoseconds, on
        hardware that cannot branch or cache-miss, fed by a radio link that is
        faster than fiber because of the refractive index of glass.
      </p>

      <p>
        This is mostly me writing that down so I do not forget it. The shape of
        it: multivariate polynomials, FPGA fabric, and a microwave dish between
        Carteret and Aurora. The math is not hard. The part that is hard is
        believing the latency budget, and understanding what is legal and what
        is not.
      </p>

      <h2>the stakes, in nanoseconds</h2>
      <p>
        NASDAQ matches in Carteret, New Jersey. CME matches in Aurora,
        Illinois. If you are in the building, your order book is a few meters
        of fiber away. If you are not, you are somewhere across the country,
        and by the time you see a price, someone inside the building has
        already seen it and acted on it.
      </p>
      <p>
        The difference is not milliseconds. It is hundreds of nanoseconds,
        sometimes tens. For scale: at a 10 Gbps interface one byte takes about
        0.8 ns to serialize onto the wire. A cache miss to main memory on a
        fast CPU is around 100 ns. A branch mispredict costs you 15 to 20
        cycles. In a software path you hit all of these. On an FPGA with a
        fixed pipeline you hit none of them.
      </p>

      <Figure>
        <Diagram
          viewBox="0 0 720 470"
          title="latency budget"
          nodes={[
            { y: 30, label: "exchange tick (ITCH)", time: "—" },
            { y: 80, label: "microwave direct link", time: "~4.2 ms NJ → IL" },
            { y: 150, label: "FPGA NIC (kernel bypass)", time: "~100 ns" },
            { y: 210, label: "ITCH decode in fabric", time: "~30 ns" },
            { y: 270, label: "orderbook update", time: "~20 ns" },
            { y: 330, label: "polynomial model eval (DSP)", time: "~10–40 ns" },
            { y: 390, label: "signal → OUCH order out", time: "~15 ns" },
          ]}
        />
        <Caption>
          A rough latency budget for a co-located FPGA path. The numbers are
          approximate, gathered from vendor whitepapers and a few people who
          actually build these things. The cross-country hop dominates
          everything else combined by four orders of magnitude. Which is why
          the dish, not the chip, is the first thing desks spend on.
        </Caption>
      </Figure>

      <h2>where the polynomials live</h2>
      <p>
        People imagine HFT models as neural networks. Some are. But neural
        nets are awkward in fabric: the multiply-accumulate pattern is fine,
        the indirection and dynamic shapes fight you. The models that actually
        win on latency are cheap and closed-form, and a lot of them are
        polynomials.
      </p>
      <p>
        A few places this shows up for real:
      </p>
      <ul>
        <li>
          <strong>Implied volatility surfaces.</strong> Given a grid of option
          prices across strikes <code>K</code> and maturities <code>T</code>,
          you fit a smooth surface{" "}
          <code>σ(K,T) = Σ cᵢⱼ · fᵢ(K) · gⱼ(T)</code>. Gatheral&apos;s SVI
          and its variants are parametric. A polynomial basis (Laguerre or
          plain monomial) is what you reach for when you want to evaluate it
          in single-digit nanoseconds. You fit the coefficients offline.
          Online, as the underlying moves, you re-evaluate.
        </li>
        <li>
          <strong>Cross-venue no-arbitrage conditions.</strong> The boundary
          where a set of quotes becomes arbitrageable is the zero set of a
          system of polynomial inequalities in the prices. Offline, you
          characterize the regions. Online, you evaluate which region you are
          in.
        </li>
        <li>
          <strong>Curve fitting for fixed income.</strong> Nelson-Siegel,
          cubic splines, cubic B-splines. All polynomials. Recomputing a
          discount curve as quotes move is polynomial evaluation.
        </li>
        <li>
          <strong>Greeks for risk.</strong> Many sensitivities are derived
          polynomials of the pricing polynomial. If price is a polynomial in
          <code>S</code>, delta is a polynomial in <code>S</code> for free.
        </li>
      </ul>
      <p>
        The common shape: a multivariate polynomial{" "}
        <code>p(x₁,…,xₙ) = Σ cᵢ · x₁^a · x₂^b … xₙ^z</code> that you need to
        evaluate, very fast, with inputs that change every time the book
        moves.
      </p>

      <h2>solving is not the same as evaluating</h2>
      <p>
        A lot of pop-finance writing gets this wrong, so it is worth being
        precise about. Solving a multivariate polynomial system, finding the
        common zeros, inverting the map, is expensive. Grobner bases
        (Buchberger, F4, F5), resultants, homotopy continuation: beautiful and
        slow. NP-hard in the worst case and frequently dreadful in practice.
        None of this is happening in the hot path of a trading system.
      </p>
      <p>
        What happens in the hot path is evaluation. Given fixed coefficients
        (computed offline, refreshed on a slower clock), plug in live inputs
        and get a number out. Evaluation is cheap and parallelizes well. The
        art is restructuring the polynomial so that evaluation is a fixed,
        pipelined computation with no data-dependent branching.
      </p>
      <p>
        That restructuring has a name.
      </p>

      <h2>Horner, and why it loves silicon</h2>
      <p>
        Horner&apos;s method (which is apparently much older than Horner, but
        his name stuck) rewrites a univariate polynomial
      </p>
      <Code lang="text">{`p(x) = a₀ + a₁x + a₂x² + a₃x³ + a₄x⁴`}</Code>
      <p>as the nested form</p>
      <Code lang="text">{`p(x) = a₀ + x·(a₁ + x·(a₂ + x·(a₃ + x·a₄)))`}</Code>
      <p>
        Same value, but a degree-<code>n</code> polynomial is now{" "}
        <code>n</code> multiplies and <code>n</code> adds, with a dependency
        chain of length <code>n</code>. For multivariates you nest one
        variable at a time. The dependency chain is the catch. Each stage
        needs the previous result. But each stage is a single
        multiply-accumulate, and that is the operation silicon is best at.
      </p>

      <Figure>
        <Diagram
          viewBox="0 0 720 360"
          title="Horner datapath — degree 4, pipelined"
          datapath
        />
        <Caption>
          Four pipelined MAC stages. Each stage multiplies the running
          accumulator by <code>x</code> and adds the next coefficient. One MAC
          per cycle, one register between stages, deterministic latency. A
          Xilinx UltraScale+ DSP slice does this MAC in one cycle at hundreds
          of MHz.
        </Caption>
      </Figure>

      <p>
        On a modern FPGA, say a Xilinx UltraScale+, the DSP48E2 slice is
        basically a 27x18-bit multiplier feeding an accumulator. It can do one
        MAC per clock cycle once pipelined. A degree-8 Horner chain is eight
        DSP slices in a row, eight pipeline registers, and a fixed eight-cycle
        latency from input to result. No cache. No predictor. No operating
        system. The latency is a number you can write down and trust.
      </p>
      <p>
        Two more things make this fit:
      </p>
      <ul>
        <li>
          <strong>Fixed-point, not floating.</strong> Floating point on an
          FPGA is possible but burns resources and adds latency for
          normalization. Fixed-point with enough headroom is deterministic,
          cheap, and good enough for the precision a vol surface actually
          needs. I am told this is less true than it used to be, that modern
          FPGAs have hardened floating-point blocks, but the people I talked
          to still default to fixed-point for this use case.
        </li>
        <li>
          <strong>No data-dependent branches.</strong> Horner is a straight
          pipeline. The same cycles run every time. That is what makes the
          latency predictable, which matters more than making it low. A path
          that is usually 40 ns but occasionally 400 ns is useless here. A
          path that is always 48 ns is gold.
        </li>
      </ul>

      <h2>the pipeline in the fabric</h2>
      <p>
        Stitched together, the whole hot path lives on one chip:
      </p>
      <ol>
        <li>
          A kernel-bypass NIC (or the FPGA itself acting as the NIC) pulls
          raw ITCH bytes off the wire in hardware.
        </li>
        <li>
          A protocol decoder in fabric parses the multicast feed and emits
          order-book deltas.
        </li>
        <li>
          The order book is an FPGA block, usually a BRAM-backed sorted array
          of price levels.
        </li>
        <li>
          The book&apos;s top-of-book and a few depth levels feed the model:
          the Horner chain in the DSP slices, evaluating your polynomial in a
          handful of cycles.
        </li>
        <li>
          The model output crosses a threshold (also just a comparator) and
          emits an OUCH order, which goes straight back onto the wire.
        </li>
      </ol>
      <p>
        At no point does a CPU see any of this. At no point does a cache miss
        happen. The entire loop from &quot;the book moved&quot; to &quot;I
        have a new order on the wire&quot; can be a few tens of nanoseconds.
        I have not built one of these. I have read the specs and talked to
        people who have, and the numbers I am quoting are second-hand. Take
        them as approximate.
      </p>

      <h2>the physical edge</h2>
      <p>
        Light in fiber travels at roughly <code>0.67c</code>. The refractive
        index of silica is about 1.5, and <code>v = c/n</code>. A radio wave
        through air travels at <code>0.97c</code> or better. So for the ~1,100
        km between Carteret and Aurora, a fiber path takes roughly 5.5 ms
        one-way, and a microwave path along the same route, if you can build
        it tower by tower with line of sight, takes roughly 3.8 ms.
      </p>
      <p>
        That 1.7 ms is not a margin. It is larger than the entire in-fabric
        pipeline by about four orders of magnitude. The reason HFT desks lease
        mountaintops and build dedicated millimeter-wave links across the
        Midwest is that no amount of silicon cleverness recovers a 1.7 ms
        physics deficit. Spread Networks spent roughly $300M burying a
        straighter fiber route through Pennsylvania in 2010 and still lost to
        the microwave people.
      </p>

      <Figure>
        <Diagram
          viewBox="0 0 720 280"
          title="fiber vs. microwave — Carteret → Aurora (~1,100 km)"
          compare
        />
        <Caption>
          Same endpoints, different media. Real routes land closer to 30%
          faster end-to-end once you account for repeater towers and terrain,
          not the 50% the physics suggests. But the floor is set by physics,
          not engineering.
        </Caption>
      </Figure>

      <p>
        The FPGA is the second derivative. The dish is the first. Together
        they form a moat that is hard to copy: you cannot buy a faster law of
        physics, and you cannot get a county zoning board to approve your
        tower any faster.
      </p>

      <h2>the part nobody likes to say out loud</h2>
      <p>
        Two terms that get used interchangeably and should not be:
      </p>
      <ul>
        <li>
          <strong>Latency arbitrage</strong> is when a price on one venue
          moves and you act on a slower venue before that venue&apos;s quote
          updates. You are not ahead of anyone&apos;s order. You are ahead of
          a price. It is controversial, it is arguably a negative-sum tax on
          slower participants, but it is legal.
        </li>
        <li>
          <strong>Front-running</strong> is when you learn of a specific
          pending order, usually a client&apos;s, and trade ahead of it. That
          is illegal, and it should be. The hardware is identical. The
          information is different.
        </li>
      </ul>
      <p>
        The FPGA-and-dish stack I described is the machinery of latency
        arbitrage. It is not, by itself, front-running. Conflating the two is
        either sloppy or dishonest. If you want to argue that latency
        arbitrage should be regulated, argue that, on its own terms, not by
        relabeling it.
      </p>
      <p>
        My interest in this is not &quot;how do I build a desk.&quot; It is
        that the design problem is unusually pure: a hard real-time budget, a
        closed-form mathematical core, and a physical layer you can reason
        about from first principles. I keep a folder of papers on this and I
        do not know if I will ever do anything with them. It is just
        interesting.
      </p>

      <h2>where else this shows up</h2>
      <p>
        The trading part is not the point. Whenever you have a computation
        that can be expressed as a fixed arithmetic DAG and must run with a
        hard, predictable latency, the CPU is the wrong answer and the FPGA
        is the right one. Radar DSP. Packet inspection. Any control loop
        where &quot;usually fast&quot; is not fast enough.
      </p>
      <p>
        The restructuring, every time, is the one Horner teaches: rearrange
        the math to match the hardware, not the other way around. The
        polynomial does not change. Your appreciation of how it evaluates
        does.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Horner, W. G. (1819). &quot;A new method of solving numerical
            equations of all orders.&quot;{" "}
            <a href="https://en.wikipedia.org/wiki/Horner%27s_method">
              Wikipedia summary
            </a>{" "}
            (the original is hard to find online).
          </li>
          <li>
            Gatheral, J. (2004). &quot;Arbitrage-free SVI volatility
            surfaces.&quot;{" "}
            <a href="https://arxiv.org/abs/1004.1101">arXiv:1004.1101</a> (the
            published version is later, this is the preprint people cite).
          </li>
          <li>
            Xilinx. &quot;UltraScale Architecture DSP Slice User Guide&quot;
            (UG579).{" "}
            <a href="https://docs.amd.com/r/en-US/ug579-ultrascale-dsp">
              AMD/Xilinx docs
            </a>
            . The DSP48E2 section is what you want.
          </li>
          <li>
            NASDAQ. &quot;ITCH Protocol Specification.&quot;{" "}
            <a href="https://www.nasdaqtrader.com/technicalspecifications">
              nasdaqtrader.com
            </a>
            . The raw format you parse in fabric.
          </li>
          <li>
            Lewis, M. (2014). <em>Flash Boys</em>. The pop-science version of
            this story. Not technically precise but the Spread Networks
            narrative is real.
          </li>
          <li>
            Various. The microwave network buildout is poorly documented in
            public. WSJ had a{" "}
            <a href="https://www.wsj.com/articles/high-speed-stock-traders-use-microwave-networks-1430979708">
              piece in 2015
            </a>{" "}
            that is the best lay overview I have found.
          </li>
        </ol>
      </section>
    </article>
  )
}
