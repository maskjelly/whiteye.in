import { Figure, Diagram, Caption } from "@/components/figure"
import { Code } from "@/components/code"

export const meta = {
  slug: "polynomials-at-the-speed-of-silicon",
  title: "polynomials at the speed of silicon",
  date: "jun 21, 2026",
  updated: "oct 23, 2026",
  description: "Following a degree-four polynomial through a hardware pipeline, from Horner's dependency chain to precision and propagation limits.",
  readingTime: "11 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        A polynomial can take four multiply-add steps to evaluate and still produce one
        result every clock. The trick is to have several evaluations in flight, each at
        a different stage. Reading about FPGA trading systems made me want to understand
        that distinction properly: what determines the delay for one input, and what
        determines the rate at which a circuit can accept the next?
      </p>

      <p>
        I haven&apos;t built trading hardware; I&apos;m working from papers and
        specifications here. Horner&apos;s method supplies a small enough arithmetic
        graph to follow by hand, and the DSP48E2 documentation shows what mapping it to
        hardware involves. Trading adds a useful complication: after accounting for
        nanoseconds inside a circuit, a cross-country network still has milliseconds of
        propagation delay.
      </p>

      <h2>two different latency budgets</h2>
      <p>
        The familiar US examples are Nasdaq&apos;s Carteret site in New Jersey and
        CME&apos;s Aurora site in Illinois. A colocated system competes over the time
        between receiving market data and emitting an order. A strategy connecting the
        two regions also pays for the cross-country path. Saving nanoseconds on the
        first path cannot remove milliseconds from the second.
      </p>
      <p>
        At 10 Gbps, serializing one byte takes <code>8 / 10¹⁰ = 0.8 ns</code>, before
        encoding and protocol overhead. That number follows directly from the line rate.
        The often-quoted order of 100 ns for a main-memory access is much less portable:
        the CPU, memory subsystem, and access pattern matter. A dedicated FPGA path can
        avoid CPU cache misses and branch mispredictions, but its own memory, parsing,
        and I/O still consume time. Each stage needs a timing boundary before numbers
        from different designs can be compared.
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
          Illustrative timings for the stages, not measurements of a system I built. The
          cross-country link is shown alongside the local processing stages to make the
          units visible. The stage numbers depend on the implementation and cannot
          establish an end-to-end trading latency.
        </Caption>
      </Figure>

      <h2>why use a polynomial model</h2>
      <p>
        With fixed coefficients, a polynomial gives the circuit a known sequence of
        additions and multiplications. There is no search to finish before producing a
        value. That makes it a useful example of bounded online work. A neural network
        can also map to an FPGA; its graph size and arithmetic precision lead to a
        different resource budget. Public descriptions do not establish how often
        proprietary trading models use either approach.
      </p>
      <p>
        Several financial models expose related arithmetic, though they should not all
        be described as polynomials:
      </p>
      <ul>
        <li>
          <strong>Volatility surfaces.</strong> A fitted surface over strike{" "}
          <code>K</code> and maturity <code>T</code> can use a basis expansion such as{" "} <code>σ(K,T) = Σ cᵢⱼ · fᵢ(K) · gⱼ(T)</code>. A polynomial basis makes
          evaluation regular. SVI is another parametric representation, but is not
          itself a polynomial. <a href="https://arxiv.org/abs/1204.0646">Gatheral and
          Jacquier</a> study how to calibrate SVI without static arbitrage. A polynomial
          surface also needs suitable constraints; ease of evaluation says nothing about
          whether its fitted prices are consistent.
        </li>
        <li>
          <strong>Cross-venue conditions.</strong> Some pricing relationships can be
          expressed as algebraic inequalities. If a strategy can reduce its online
          decision to evaluating those conditions, expensive fitting or region analysis
          can happen off the immediate response path. The exact reduction depends on the
          model.
        </li>
        <li>
          <strong>Fixed-income curves.</strong> Cubic splines and B-splines use
          piecewise polynomials. <a
          href="https://www.nber.org/papers/w1594">Nelson-Siegel</a>{" "} uses
          exponential terms and is a different curve representation. Selecting the
          interval and evaluating its coefficients are separate steps for a spline.
        </li>
        <li>
          <strong>Risk sensitivities.</strong> Differentiating a polynomial price
          approximation gives another polynomial. For a model in <code>S</code>, its
          derivative supplies an approximation to delta. Differentiation is simple, but
          delta accuracy needs its own check: a bound on price error alone does not give
          the same bound on derivative error.
        </li>
      </ul>
      <p>
        The arithmetic problem is to evaluate a fixed expression such as{" "}
        <code>p(x₁,…,xₙ) = Σ cᵢ · x₁^a · x₂^b … xₙ^z</code> repeatedly as live inputs
        change. How the coefficients were found is a different computation, usually on a
        slower path.
      </p>

      <h2>evaluation and solving are different jobs</h2>
      <p>
        Solving a polynomial system means finding inputs that satisfy its equations.
        Gröbner-basis methods such as Buchberger, F4, and F5, along with resultants and
        homotopy methods, address versions of that problem. General systems can be very
        expensive to solve. Evaluating a fitted expression at a known input is a much
        smaller task with a different algorithm.
      </p>
      <p>
        For evaluation, the coefficients and arithmetic structure are already available.
        The hardware designer chooses how to arrange the operations and represent the
        numbers. Horner&apos;s method gives a direct arrangement with a fixed operation
        count, so a circuit can compute the result without a data-dependent search for a
        root.
      </p>

      <h2>Horner evaluation</h2>
      <p>
        Start with a univariate polynomial written as a sum of powers:
      </p>
      <Code lang="text">{`p(x) = a₀ + a₁x + a₂x² + a₃x³ + a₄x⁴`}</Code>
      <p>
        Horner&apos;s method rewrites it in nested form:
      </p>
      <Code lang="text">{`p(x) = a₀ + x·(a₁ + x·(a₂ + x·(a₃ + x·a₄)))`}</Code>
      <p>
        A degree-<code>n</code> polynomial needs <code>n</code> multiplications and{" "}
        <code>n</code> additions in this form. Each stage consumes the previous result,
        so one evaluation has a dependency chain. With multiple inputs in flight,
        however, different stages can work on different inputs at the same time.
        Multivariate evaluation can nest the variables too, although the nesting order
        affects the work.
      </p>

      <Figure>
        <Diagram
          viewBox="0 0 720 360"
          title="Horner datapath — degree 4, pipelined"
          datapath
        />
        <Caption>
          Four conceptual multiply-accumulate stages. Each multiplies the running value
          by <code>x</code> and adds a coefficient. The drawing assumes one registered
          stage per operation; a real DSP implementation may need more internal
          registers to meet its clock target.
        </Caption>
      </Figure>

      <p>
        Under the drawing&apos;s one-cycle-per-stage assumption, input A takes four
        clock periods to cross the chain. Input B can enter one clock after A and finish
        one clock after it. Once full, the four stages work on four different inputs at
        once. If the clock period is <code>T</code>, the arithmetic latency is
        {" "}<code>4T</code> and the result rate is <code>1/T</code>. This is an illustrative
        schedule, not a measured clock rate or implementation result.
      </p>
      <p>
        The real DSP block imposes more choices. AMD&apos;s <a
        href="https://docs.amd.com/api/khub/documents/pTysoma4TYgNH95BrY1Sbw/content">UG579
        guide</a> describes the UltraScale+ DSP48E2&apos;s 27×18-bit multiplier,
        arithmetic unit, and optional pipeline registers. Appropriate pipelining can let
        a slice accept a new operation each clock while an individual result takes
        several clocks. A degree-eight Horner chain has eight arithmetic steps; its
        cycle count depends on widths, register settings, and routing. Copies of{" "}
        <code>x</code> must be delayed to meet their corresponding partial results, and
        coefficient updates need to reach the stages coherently.
      </p>
      <p>
        Two details can invalidate the appealing schedule:
      </p>
      <ul>
        <li>
          <strong>Numeric precision.</strong> Fixed-point arithmetic can save resources
          when the value ranges are known. The design still needs bounds for
          intermediates, rounding behavior, and overflow. A coefficient that fits at the
          input does not prove that a later partial sum will fit. Floating-point support
          varies across FPGA families. A model needs an error budget before either
          representation can be called sufficient.
        </li>
        <li>
          <strong>A fixed path.</strong> The straight arithmetic sequence avoids a
          data-dependent branch or loop count. That helps bound its latency.
          Backpressure, shared memory, or a variable-length parser elsewhere in the
          design can still delay when an input enters that sequence.
        </li>
      </ul>

      <h2>putting the arithmetic in a feed path</h2>
      <p>
        The arithmetic circuit needs inputs that agree about the state of the market. A
        simplified feed path might connect these stages, using the message formats in
        Nasdaq&apos;s <a
        href="https://www.nasdaqtrader.com/technicalspecifications">protocol
        specifications</a>:
      </p>
      <ol>
        <li>
          A network interface receives the market-data packets. The FPGA can contain
          that interface itself rather than waiting for the OS networking stack.
        </li>
        <li>
          A hardware decoder parses the relevant ITCH messages and turns them into book
          updates. Handling missing or out-of-order feed packets needs rules of its own.
        </li>
        <li>
          An order-book block updates the selected price levels. On-chip RAM can hold
          some of this state, but the representation depends on the feed and the
          strategy&apos;s requirements.
        </li>
        <li>
          Selected book values enter the model pipeline. A Horner chain evaluates the
          polynomial with the configured precision and produces a result after its fixed
          stage latency.
        </li>
        <li>
          Decision logic checks the result and the required risk limits. An order
          encoder then produces the outbound protocol message, such as OUCH for an
          appropriate Nasdaq connection.
        </li>
      </ol>
      <p>
        A CPU can configure and supervise the path without handling each tick. The
        boundary used to report latency still matters. Timing from the first received
        bit includes a different amount of work from timing after the last required
        field has arrived. Likewise, reaching the first outbound bit is different from
        completing the order message. The stage values in the diagram do not specify
        those boundaries, so adding them up would not establish a measured trading
        response time.
      </p>

      <h2>what the transmission medium changes</h2>
      <p>
        For silica fiber, a refractive index around 1.5 gives a propagation speed near{" "} <code>0.67c</code>, using <code>v = c/n</code>. Radio through air travels
        close to c. Over an illustrative 1,100 km route, that puts fiber propagation at
        about 5.5 ms and the air-path lower bound near 3.7 ms. Actual paths add
        distance, equipment delay, and constraints such as line of sight.
      </p>
      <p>
        On equal-length paths, that is roughly a 1.8 ms difference before equipment
        overhead. For scale, the diagram&apos;s 10–40 ns arithmetic stage fits into 1.8
        ms between 45,000 and 180,000 times. This division compares illustrative
        budgets; it does not measure an advantage available to a particular trader.
        Straighter fiber routes and microwave links address that part of the budget. The
        Spread Networks account in <em>Flash Boys</em> and the microwave reporting
        linked below give some history, but the physical comparison does not depend on
        their reported construction costs.
      </p>

      <Figure>
        <Diagram
          viewBox="0 0 720 280"
          title="fiber vs. microwave — Carteret → Aurora (~1,100 km)"
          compare
        />
        <Caption>
          These are illustrative route timings. Radio is about 50% faster in propagation
          speed than light in fiber with n=1.5, which means about one-third less travel
          time over the same distance. Route length and equipment change the end-to-end
          saving.
        </Caption>
      </Figure>

      <p>
        A shorter arithmetic chain changes local processing time. A straighter route
        changes propagation time. For a strategy that crosses both regions, the
        end-to-end budget must include both. A strategy trading only at a colocated
        venue has a different path to measure, so the cross-country comparison cannot
        tell us where its engineering effort belongs.
      </p>

      <h2>latency arbitrage and front-running</h2>
      <p>
        These terms describe different uses of information. A faster feed or processor
        does not, by itself, tell you which behavior is taking place.
      </p>
      <ul>
        <li>
          <strong>Latency arbitrage</strong> uses a price change observed on one venue
          to trade against a quote that has not yet adjusted elsewhere. The important
          input is the price information available to the trader. This description alone
          does not settle the legality of a particular practice or venue arrangement.
        </li>
        <li>
          <strong>Front-running</strong> involves trading ahead using knowledge of a
          pending transaction, often a customer&apos;s. For a concrete US rule, <a
          href="https://www.finra.org/rules-guidance/rulebooks/finra-rules/5270">FINRA
          Rule 5270</a> restricts trading while holding material nonpublic information
          about an imminent block transaction, subject to its stated provisions.
        </li>
      </ul>
      <p>
        The same hardware capability says little about the source of a trader&apos;s
        information. A claim about front-running has to identify the conduct and the
        applicable rule. The circuit question remains: how quickly can it turn an
        allowed input into an allowed output?
      </p>

      <h2>what the arithmetic example establishes</h2>
      <p>
        The same reasoning applies to radar signal processing, packet inspection, and
        control systems with bounded response times. An FPGA can be a good fit for a
        fixed arithmetic graph. A CPU, microcontroller, DSP, or ASIC may fit a different
        budget better; programmable logic is not automatically the right answer for
        every real-time problem.
      </p>
      <p>
        Horner gives the degree-four example four dependent multiply-add steps. The
        pipeline schedule shows how to overlap different inputs; it does not shorten
        that dependency chain for any one input. Another arrangement may expose more
        parallel work at the cost of more arithmetic resources. Choosing between them
        requires an input-rate target and an error budget, followed by synthesis and
        timing analysis on a particular device.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Horner, W. G. (1819). &quot;A new method of solving numerical
            equations of all orders, by continuous approximation.&quot;{" "}
            <a href="https://doi.org/10.1098/rstl.1819.0023">
              Philosophical Transactions
            </a>{" "}
            109, 308–335.
          </li>
          <li>
            Gatheral, J., Jacquier, A. (2012 preprint, revised 2013).
            &quot;Arbitrage-free SVI volatility surfaces.&quot;{" "}
            <a href="https://arxiv.org/abs/1204.0646">arXiv:1204.0646</a>.
          </li>
          <li>
            Xilinx. &quot;UltraScale Architecture DSP Slice User Guide&quot;
            (UG579).{" "}
            <a href="https://docs.amd.com/api/khub/documents/pTysoma4TYgNH95BrY1Sbw/content">
              AMD/Xilinx docs
            </a>
            . DSP48E2 arithmetic widths and pipeline-register options.
          </li>
          <li>
            NASDAQ. &quot;ITCH Protocol Specification.&quot;{" "}
            <a href="https://www.nasdaqtrader.com/technicalspecifications">
              nasdaqtrader.com
            </a>
            . Feed and order-entry message formats.
          </li>
          <li>
            Nelson, C. R., Siegel, A. F. (1985 working paper; published 1987).
            &quot;Parsimonious Modeling of Yield Curves.&quot;{" "}
            <a href="https://www.nber.org/papers/w1594">NBER working paper</a>.
            A curve model with exponential terms, distinct from a polynomial basis.
          </li>
          <li>
            Lewis, M. (2014). <em>Flash Boys</em>. Reporting on Spread Networks
            and the competition over route latency; background rather than a hardware
            specification.
          </li>
          <li>
            The Wall Street Journal (2015). Reporting on{" "}
            <a href="https://www.wsj.com/articles/high-speed-stock-traders-use-microwave-networks-1430979708">
              microwave trading networks
            </a>{" "}
            and their deployment. This is historical context for the propagation
            comparison.
          </li>
        </ol>
      </section>
    </article>
  )
}
