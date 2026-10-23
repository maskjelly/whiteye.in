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
        The first answer comes out on cycle 4. The next comes out on cycle 5.
        Each has gone through four dependent multiply-add steps. That is the
        distinction I wanted to follow through accounts of FPGA trading systems:
        how long one evaluation takes, and how soon the circuit can start another.
      </p>
      <p>
        Those cycle numbers come from a Python model, with one clock assigned to
        each arithmetic stage. I haven&apos;t built trading hardware. I can check
        the schedule, then use the DSP48E2 documentation to ask what mapping it to
        an FPGA would involve. The financial examples raise a separate question:
        what must the arithmetic preserve for its answer to be useful?
      </p>

      <h2>following one input through four steps</h2>
      <p>
        Take a degree-four polynomial:
      </p>
      <Code lang="text">{`p(x) = a₀ + a₁x + a₂x² + a₃x³ + a₄x⁴`}</Code>
      <p>
        Regrouping it with Horner&apos;s method gets rid of the separate powers of x:
      </p>
      <Code lang="text">{`p(x) = a₀ + x·(a₁ + x·(a₂ + x·(a₃ + x·a₄)))`}</Code>
      <p>
        Begin at a₄, inside the innermost brackets. Getting to a₃ costs one multiply and one add. Reaching a₂ costs another pair, and so on until a₀. That makes four of each operation here, or <code>n</code> multiplications and <code>n</code> additions for degree <code>n</code>. The bracket on the right has to finish before we can work on the next one to its left.
      </p>
      <p>
        I used 1, 2, 3, 4, 5 as the coefficients in the <a href="https://github.com/maskjelly/whiteye.in/blob/main/scripts/blog-models.py">clocked check</a>. Working through x=2 gives this trail: 5 → 14 → 31 → 64 → 129. Each arrow means double the previous answer and add the next coefficient. In the pipeline run, that input enters on cycle 2 and returns 129 on cycle 6. With x=0 through x=4 arriving in order, the outputs are 1, 15, 129, 547, and 1593, on cycles 4 through 8. I check every one against a separate Horner calculation with an assertion.
      </p>
      <Figure>
        <Diagram
          viewBox="0 0 720 360"
          title="Horner datapath — degree 4, pipelined"
          datapath
        />
        <Caption>
        One multiply-add and a register per box. I have allowed one clock for each box here; using a DSP&apos;s internal registers could change that count. The target clock period is still an open question.
      </Caption>
      </Figure>
      <p>
        By cycle 3 the model has four evaluations in flight. They are at different steps: x=0 is about to finish, while x=3 has only just arrived. On the next clock, the completed answer leaves and x=4 takes the vacant first stage. The four-clock journey for an input has not become shorter. We have arranged for the next input to be only one clock behind it.
      </p>
      <p>
        Calling the clock period <code>T</code> gives latency <code>4T</code> and,
        once the pipeline fills, throughput <code>1/T</code>. Every evaluation
        still obeys its dependencies. The overlap is between different inputs.
        Multivariate Horner evaluation can nest variables too, though choosing
        their order changes how much arithmetic is left to do.
      </p>
      <p>
        The partial result alone is not enough to pass between stages. It needs its original x alongside it. Otherwise, when the second stage is working on x=2, it might multiply by the 3 that has just arrived at the first stage. That would quietly change the polynomial being evaluated. The script carries the pair together.
      </p>

      <h2>what the DSP block actually offers</h2>
      <p>
        What clock could those four stages sustain? Python leaves that question
        open. AMD&apos;s <a
        href="https://docs.amd.com/api/khub/documents/pTysoma4TYgNH95BrY1Sbw/content">UG579
        guide</a> gives something concrete to map onto: the UltraScale+ DSP48E2
        has a 27×18-bit multiplier, an arithmetic unit, and optional pipeline
        registers. With suitable register settings, a slice can accept an
        operation every clock while an earlier result is still inside it.
      </p>
      <p>
        Degree eight requires eight Horner arithmetic steps. Their widths,
        register settings, and routing determine how those steps map to a device.
        The delayed copies of <code>x</code> need to follow that schedule as well.
        Changing coefficients adds another question: which set does an evaluation
        use if the update happens while it is halfway through? All its stages
        need one coherent set.
      </p>
      <p>
        The script uses Python integers. It has therefore left overflow and
        rounding out of the exercise. Fixed point can save resources when the
        ranges are known, but I would need room for every intermediate, including
        that growing partial result, and an error budget for rounding. Floating
        point also costs hardware, with support that varies across FPGA families.
        Choosing it would still leave accuracy to check.
      </p>
      <p>
        For an accepted input, this arithmetic path has a useful property: its
        work does not depend on a branch or a variable loop count. I can count
        the steps. Getting the input accepted is a separate matter if shared
        memory, backpressure, or a variable-length parser can hold it up.
      </p>

      <h2>what is known before the tick arrives?</h2>
      <p>
        Fitting the coefficients could happen well before any live input arrives. The evaluator would then reuse them as the inputs change. Our example has only x; a multivariate version could be <code>p(x₁,…,xₙ) = Σ cᵢ · x₁^a · x₂^b … xₙ^z</code>. I can supply those inputs and work forward through the arithmetic, without searching for a root.
      </p>
      <p>
        &quot;Polynomial computation&quot; also covers a much harder job.
        Solving a system means finding inputs
        that satisfy its equations. That can be expensive: Buchberger, F4, and
        F5 are Gröbner-basis methods for versions of this problem; resultants and
        homotopy methods are other approaches. Our Horner chain is doing the
        simpler job of evaluating at a supplied input. Its remaining design
        choices concern how to arrange the arithmetic and represent the numbers.
      </p>
      <p>
        For a volatility surface, take strike <code>K</code> and maturity <code>T</code>. I could write a basis expansion <code>σ(K,T) = Σ cᵢⱼ · fᵢ(K) · gⱼ(T)</code> and choose polynomial basis functions to make the arithmetic regular. That choice would say nothing about whether the fitted prices make sense together. <a href="https://arxiv.org/abs/1204.0646">Gatheral and Jacquier&apos;s arbitrage-free SVI work</a> addresses that consistency problem for SVI. SVI itself is nonpolynomial; a polynomial fit would need constraints of its own.
      </p>
      <p>
        Even choosing a curve model changes what belongs before the first
        multiply. For fixed-income cubic splines and B-splines, an input selects
        an interval and its coefficients before the polynomial can be evaluated.
        {" "}<a
        href="https://www.nber.org/papers/w1594">Nelson-Siegel</a> uses exponential
        terms. Choosing that model would mean mapping those terms too; calling
        all of these &quot;curve evaluation&quot; hides the difference.
      </p>
      <p>
        Delta is where I would be especially wary of accepting a fit on price
        error alone. Differentiating a polynomial price approximation in
        {" "}<code>S</code> gives another polynomial, so the arithmetic remains
        convenient. The approximation error has a derivative too. How large
        can that be if the price error is small?
      </p>
      <p>
        Here is an error that makes the problem visible: ε Tₙ(x), where Tₙ is a Chebyshev polynomial and ε=10⁻⁶. From its <a href="https://dlmf.nist.gov/18.5.E1">cosine form</a>, I know its magnitude stays within ε everywhere on [-1, 1]. For the slope I used x=1, where each Tₙ is 1. Differentiating <code>Tₙ₊₁ = 2xTₙ − Tₙ₋₁</code> at that point leaves <code>Dₙ₊₁ = 2 + 2Dₙ − Dₙ₋₁</code>. Starting at D₀=0 and D₁=1, the script gets a slope error of 0.000064 at degree 8, 0.001024 at degree 32, and 0.004096 at degree 64. That last value is 4,096 times ε. The bound on the values never changed.
      </p>
      <p>
        This gives a specific reason to check the derivative separately. The
        small value-error bound by itself does not carry over to the slope.
        These are constructed errors, rather than errors measured on a fitted
        price surface; they show what the value bound leaves open. A delta
        calculation would need its own accuracy check, including rounding at
        the chosen arithmetic width.
      </p>

      <p>
        For a cross-venue pricing relationship written as algebraic inequalities,
        I would ask the same question about preparation: can fitting or region
        analysis leave only a few conditions to evaluate online? That reduction
        needs to be worked out for the particular model. Polynomials make a small
        example I can inspect. Neural networks can map to FPGAs too, with their
        own graph sizes and precision costs. These public sources give me no
        basis for saying how often proprietary strategies choose either.
      </p>

      <h2>from a packet to the polynomial</h2>
      <p>
        The script can simply supply x=2. Where would that input come from in a
        trading system? Following Nasdaq&apos;s <a
        href="https://www.nasdaqtrader.com/technicalspecifications">protocol
        specifications</a>, one possible path starts with an FPGA network
        interface receiving packets without waiting for the OS networking stack.
        A hardware decoder extracts the relevant ITCH messages. An order-book
        block applies their updates to selected price levels, with some state
        held in on-chip RAM as the feed and strategy allow. Missing or out-of-order
        packets need explicit handling, or those book values may no longer
        describe the intended market state.
      </p>
      <p>
        Selected book values can now enter the Horner chain. What comes out still needs a decision and risk checks before anything goes on the wire. An encoder could then build an OUCH order-entry message for the Nasdaq connection in question. A CPU can configure and supervise the circuit without seeing each tick. Counting the four arithmetic stages alone leaves all of that other work unaccounted for.
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
        The labels suggest scales for the blocks, including a cross-country link. I cannot add them into a trading-latency claim: they are illustrative, with neither hardware measurements nor defined timing boundaries behind them.
      </Caption>
      </Figure>
      <p>
        Before using a number from that diagram, I would want to know where
        timing begins and ends. At the first received bit, or after the last
        required field arrives? At the first outbound bit, or after the complete
        order message? Moving those boundaries changes how much serialization
        and processing the number includes.
      </p>
      <p>
        At 10 Gbps, eight bits take <code>8 / 10¹⁰ = 0.8 ns</code> to send. That much follows from the line rate, before encoding or protocol overhead. A rough 100 ns estimate for main-memory access needs more context. Which CPU and memory subsystem? Was the access sequential, random, or contended? I have no such details for that number. Moving this path into FPGA fabric gets rid of the CPU&apos;s cache misses and branch mispredictions, but I still owe measurements for the parser, memory, and I/O.
      </p>

      <h2>the milliseconds outside the circuit</h2>
      <p>
        The cross-country link in the diagram needs its own explanation. For a
        colocated system, I would measure from market-data arrival to order
        emission at that venue. Connecting Nasdaq&apos;s Carteret site in New
        Jersey with CME&apos;s Aurora site in Illinois adds the travel between
        the two regions. That delay is already measured in milliseconds.
      </p>
      <p>
        I can compare propagation alone by giving both routes an illustrative
        length of 1,100 km. With silica fiber&apos;s refractive index roughly 1.5,
        {" "}<code>v = c/n</code> gives about <code>0.67c</code>: a travel time near
        5.5 ms. Radio through air travels close to c, giving a lower bound near
        3.7 ms over that distance. The gap is about 1.8 ms before equipment
        overhead. A real route adds distance, and radio also has to satisfy
        line-of-sight constraints.
      </p>
      <Figure>
        <Diagram
          viewBox="0 0 720 280"
          title="fiber vs. microwave — Carteret → Aurora (~1,100 km)"
          compare
        />
        <Caption>
          At equal distance and fiber index n=1.5, radio&apos;s roughly 50% higher
          propagation speed saves about one-third of the travel time. Actual
          savings depend on the route and its equipment.
        </Caption>
      </Figure>
      <p>
        Against the diagram&apos;s illustrative 10–40 ns arithmetic budget, that
        1.8 ms gap is 45,000–180,000 times as long. I am comparing scales here;
        neither number measures a trading advantage. A straighter fiber route
        or a microwave link can reduce the travel delay. The Spread Networks
        account in <em>Flash Boys</em> and the microwave reporting below describe
        that competition. Their reported construction costs are background;
        the propagation calculation depends on distance and speed.
      </p>
      <p>
        I would not use that ratio to dismiss the local arithmetic. A
        cross-region strategy pays for both travel and processing. A strategy
        confined to one colocated venue has a different path to measure, and
        the 1.8 ms comparison says little about where it should spend engineering
        effort. The useful budget follows the strategy&apos;s actual path.
      </p>

      <h2>what speed says about the trade</h2>
      <p>
        Following the input also helps keep two trading descriptions separate.
        In latency arbitrage, the input may be a price change at one venue,
        while a quote at another has yet to adjust. Front-running involves
        knowledge of a pending transaction, often a customer&apos;s, and trading
        ahead of it. The same kind of fast circuit could act on either input;
        its speed tells me little about how the information was obtained.
      </p>
      <p>
        <a href="https://www.finra.org/rules-guidance/rulebooks/finra-rules/5270">FINRA Rule 5270</a> supplies a more specific test in the US: its restrictions concern trading with material nonpublic information about an imminent block transaction, under the rule&apos;s provisions. I would need the facts of the trade and the applicable rule before calling an activity front-running. Nor does describing it as &quot;latency arbitrage&quot; settle its legality for a venue arrangement.
      </p>
      <p>
        I would take this schedule into synthesis only after choosing the arithmetic widths, registers, and target device. Then the timing report could answer the question Python left open: what clock period works, and how many stages does it need? That is also the appeal for radar processing, packet inspection, or a control loop with a deadline. It is a reason to compare hardware, though. A CPU, microcontroller, DSP, or ASIC could meet the input rate and error budget more cheaply. For this polynomial I could also try spending more arithmetic resources on parallel evaluation. I have a schedule to compare those choices against.
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
