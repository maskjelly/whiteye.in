import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "byzantine-fault-tolerance-when-nodes-lie",
  title: "byzantine fault tolerance, and when nodes lie",
  date: "jun 02, 2026",
  description:
    "The consensus post assumed nodes crash. This one assumes they lie. From the Byzantine Generals Problem to the 3f+1 bound to PBFT to HotStuff, and when you actually need any of this.",
  readingTime: "11 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        The previous post on consensus assumed a forgiving fault model: nodes
        either work or they crash. They never lie. Reality is not always that
        kind. In a permissioned chain, a federated database, or any system
        where the operators do not fully trust each other, a faulty node can
        say different things to different peers, forge messages, or collude
        with other faulty nodes. That is a Byzantine fault, and tolerating it
        costs you roughly a third of your cluster and a quadratic message
        bill.
      </p>

      <p>
        I promised at the end of the consensus post that I would write about
        this separately. This is that post.
      </p>

      <h2>the generals</h2>
      <p>
        The framing comes from Lamport, Shostak, and Pease&apos;s 1982 paper,
        <em> The Byzantine Generals Problem</em>. Several generals have
        surrounded a city. They must agree on a common plan, attack or
        retreat, or they all lose. They communicate only by messengers. One or
        more of the generals or the messengers may be a traitor, actively
        trying to prevent agreement. The loyal generals need an algorithm that
        reaches agreement anyway.
      </p>
      <p>
        The traitor&apos;s power is asymmetry. A traitorous commander can send
        <code>&quot;attack&quot;</code> to one lieutenant and{" "}
        <code>&quot;retreat&quot;</code> to another. A traitorous lieutenant
        can tell one peer &quot;the commander said attack&quot; and another
        &quot;the commander said retreat.&quot; Crash faults are passive. A
        dead node sends nothing. Byzantine faults are active. A lying node
        sends whatever will break you.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="a traitorous commander — two honest lieutenants, two different orders" byzCommander />
        <Caption>
          The commander is a traitor. Lieutenant 1 hears &quot;attack,&quot;
          Lieutenant 2 hears &quot;retreat.&quot; Without a way to
          cross-check, they disagree and the battle is lost. The whole subject
          is the search for a protocol where honest nodes agree despite this.
        </Caption>
      </Figure>

      <h2>why 3f+1</h2>
      <p>
        For crash faults you need <code>2f+1</code> nodes to tolerate{" "}
        <code>f</code> failures (any two majorities overlap in at least one
        honest node). For Byzantine faults the bound is{" "}
        <code>3f+1</code>. This is the number that explains why BFT systems
        feel expensive.
      </p>
      <p>
        The argument: of <code>N</code> nodes, up to <code>f</code> are
        Byzantine (liars) and up to <code>f</code> can be crashed (silent).
        You need the honest, non-crashed nodes to outnumber the liars, so that
        a vote reflects the truth. The worst case leaves you with{" "}
        <code>N - f</code> active nodes, of which <code>f</code> are liars.
        For the honest ones to be a strict majority of the active ones:{" "}
        <code>N - 2f &gt; f</code>, i.e. <code>N &gt; 3f</code>, i.e.{" "}
        <code>N at least 3f + 1</code>.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="why 3f+1 — the honest must outnumber the liars among the alive" threeFPlusOne />
        <Caption>
          With N = 3f+1 and f liars and f crashed, you are left with 2f+1
          active nodes, of which f+1 are honest. The honest are a strict
          majority of the active. With only 3f nodes, the worst case leaves f
          honest and f liars active, a tie, and you cannot distinguish truth
          from lies by counting.
        </Caption>
      </Figure>

      <p>
        The deeper reason for the gap: with crash faults, silence is
        informative (a silent node did not vote, so it did not corrupt the
        count). With Byzantine faults, a lying vote is anti-informative. It
        counts against you. You need a margin wide enough that the liars
        cannot outvote the honest even when some honest nodes are unavailable.
        That margin is the extra <code>f+1</code> nodes.
      </p>

      <h2>PBFT</h2>
      <p>
        For years, BFT was considered a thought experiment. The protocols
        existed but were too slow to use. That changed in 1999 when Castro and
        Liskov published PBFT (Practical Byzantine Fault Tolerance). The key
        word is practical. PBFT runs in two message round-trips in the steady
        state, which is only one more than crash-fault Paxos. That made it
        usable for real workloads.
      </p>
      <p>
        PBFT is a three-phase protocol with a stable leader (the primary):
      </p>
      <ol>
        <li>
          <strong>Pre-prepare.</strong> The primary assigns a sequence number
          to a request and broadcasts <code>pre-prepare</code> to the
          replicas. This establishes ordering.
        </li>
        <li>
          <strong>Prepare.</strong> Replicas broadcast <code>prepare</code> to
          each other. A node is ready when it has collected{" "}
          <code>2f+1</code> matching prepares (including its own). This proves
          a quorum agreed on the ordering, so no conflicting order can also
          reach this stage.
        </li>
        <li>
          <strong>Commit.</strong> Replicas broadcast <code>commit</code> and
          execute once they have <code>2f+1</code> matching commits. This
          proves the ordering is stable. Even a view change will not undo it.
        </li>
      </ol>

      <Figure>
        <Diagram viewBox="0 0 720 380" title="PBFT — three phases, quadratic chatter" pbft />
        <Caption>
          Every replica talks to every other replica in prepare and commit.
          That is O(n^2) messages per request. The price of Byzantine fault
          tolerance. Crash-fault Paxos is O(n) with a stable leader. The extra
          factor is the cost of not trusting your peers.
        </Caption>
      </Figure>

      <p>
        The view change protocol handles a faulty primary. If replicas suspect
        the primary (timeout, bad signature), they exchange view-change
        messages, and the new primary must prove it has a quorum&apos;s support
        and a consistent prepared log. This is the fiddly part of every BFT
        protocol. The steady state is easy. The leader replacement is where
        correctness lives or dies. This is the same pattern as crash-fault
        consensus, where Paxos view changes are where the real engineering
        hides.
      </p>

      <h2>message complexity</h2>
      <p>
        PBFT&apos;s <code>O(n^2)</code> messages are fine for tens of nodes.
        They are catastrophic for thousands. A 100-node cluster doing{" "}
        <code>n^2</code> = 10,000 messages per request per second will
        saturate its network long before it saturates its CPUs. This is why
        early BFT was never going to run public blockchains.
      </p>
      <p>
        The breakthrough that unlocked larger BFT was linear message
        complexity, protocols where the total communication is{" "}
        <code>O(n)</code> per view, not <code>O(n^2)</code>. The trick is a
        threshold signature: the replicas collectively sign a single
        attestation using a multi-party signing scheme, so instead of every
        node sending its vote to every other node, the leader collects{" "}
        <code>2f+1</code> partial signatures and aggregates them into one
        proof that everyone can verify with one check. HotStuff (Yin, Malkhi,
        et al. 2019) is the cleanest expression of this idea and the basis for
        a lot of modern consensus. Tendermint takes a different route to the
        same goal with a rotating leader and two rounds of voting.
      </p>

      <h2>blockchains</h2>
      <p>
        Public blockchains (Bitcoin, Ethereum) face an even harder version:
        thousands of nodes, anonymous participants, no identity, and Sybil
        attacks (an attacker can spin up as many nodes as it wants). BFT
        assumes a fixed membership. Public chains cannot. So they replace
        identity with cost: proof-of-work makes votes expensive (hash power),
        proof-of-stake makes votes risky (slashable capital). The result is not
        BFT in the PBFT sense. It is probabilistic finality, where a decision
        is &quot;final&quot; once it is buried under enough subsequent work or
        enough attestations that reverting it would cost more than the
        attacker can afford.
      </p>
      <p>
        Ethereum&apos;s Casper FFG is the bridge: a BFT-style finality gadget
        layered on top of a proof-of-stake chain, giving economic finality to
        blocks that a pure longest-chain rule would only probabilistically
        confirm. The design is explicitly a hybrid. The BFT layer provides the
        strong safety. The stake provides the Sybil resistance.
      </p>

      <h2>do you actually need BFT</h2>
      <p>
        The honest engineering question: do you need Byzantine fault tolerance
        at all? The answer is almost always no.
      </p>
      <ul>
        <li>
          <strong>You control all the nodes</strong> (your own database
          cluster, your own microservices). Crash fault tolerance (Raft,
          Paxos) is enough. Byzantine faults do not happen if you trust your
          own binaries and your own admins. Paying 3f+1 here is waste.
        </li>
        <li>
          <strong>Federated or permissioned</strong> (consortium of
          organizations that do not fully trust each other, e.g. a group of
          banks running a shared ledger). This is the sweet spot for
          PBFT-class protocols. Membership is known and limited, so{" "}
          <code>O(n^2)</code> is tolerable, and the distrust is real.
        </li>
        <li>
          <strong>Public or open membership</strong> (anyone can join). You
          need Sybil resistance plus BFT-style finality. This is proof-of-stake
          territory. If you are here, you are building a blockchain, and the
          question is not whether to use BFT but which hybrid fits.
        </li>
      </ul>
      <p>
        The trap is reaching for BFT because it sounds more robust.
        Byzantine fault tolerance is not a stronger version of crash fault
        tolerance. It is a different protocol for a different problem, with a
        different cost. If your threat model does not include malicious
        operators, you are paying 50% more nodes and a quadratic message bill
        to defend against a threat you do not have.
      </p>

      <p>
        The fault model determines the lower bound, and the lower bound
        determines the cost. Crash faults give you <code>2f+1</code> and{" "}
        <code>O(n)</code> messages. Byzantine faults give you{" "}
        <code>3f+1</code> and <code>O(n^2)</code> (or <code>O(n)</code> with
        cryptography). In both cases the safety argument is a quorum-overlap
        counting argument. It just happens that liars count against you in a
        way that crashed nodes do not. And in both cases, the hard part is not
        the steady state. It is leader replacement under failure. Paxos Made
        Live and every BFT view-change paper are telling the same story: the
        protocol is easy to specify and painful to implement, and the pain
        lives in the recovery paths.
      </p>
      <p>
        I do not think most engineers will ever need to implement BFT. I think
        understanding why it costs what it costs is valuable anyway, because
        the same pattern (fault model determines lower bound determines cost)
        shows up in every distributed system. BFT is just the case where the
        fault model is the most adversarial it can be.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Lamport, Shostak, Pease (1982). &quot;The Byzantine Generals
            Problem.&quot;{" "}
            <a href="https://lamport.org/publications/pubs.html#byz">
              lamport.org
            </a>
            . The paper that named the problem.
          </li>
          <li>
            Castro, Liskov (1999). &quot;Practical Byzantine Fault
            Tolerance.&quot;{" "}
            <a href="https://pmg.csail.mit.edu/papers/osdi99.pdf">
              PDF
            </a>
            . The paper that made BFT usable. Castro&apos;s PhD thesis has
            the engineering details.
          </li>
          <li>
            Yin, Malkhi, et al. (2019). &quot;HotStuff: BFT Consensus with
            Linearity and Responsive Optimality.&quot;{" "}
            <a href="https://arxiv.org/abs/1803.05069">arXiv:1803.05069</a>.
            Linear-complexity BFT. The basis for Libra/Diem&apos;s consensus.
          </li>
          <li>
            Buchman (2016). &quot;Tendermint: Byzantine Fault Tolerance in
            the Age of Blockchains.&quot;{" "}
            <a href="https://dRx.digital/assets/Tendermint.pdf">
              thesis PDF
            </a>
            . A different route to linear BFT.
          </li>
          <li>
            Buterin, Griffith (2017). &quot;Casper FFG: A Hybrid
            Consensus Layer.&quot;{" "}
            <a href="https://arxiv.org/abs/1710.09437">arXiv:1710.09437</a>.
            Ethereum&apos;s BFT-over-PoS design.
          </li>
        </ol>
      </section>
    </article>
  )
}
