import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "byzantine-fault-tolerance-when-nodes-lie",
  title: "byzantine fault tolerance, and when nodes lie",
  date: "jun 02, 2026",
  description:
    "The consensus post assumed nodes crash. This one assumes they lie. From the Byzantine Generals Problem to the 3f+1 bound to PBFT to HotStuff — why trusting no one costs you a third of your cluster and a lot more messages.",
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
        with other faulty nodes. That is a <strong>Byzantine</strong> fault,
        and tolerating it costs you roughly a third of your cluster and a
        quadratic message bill.
      </p>

      <h2>the generals, and the traitor</h2>
      <p>
        The framing comes from Lamport, Shostak, and Pease&apos;s 1982 paper,
        <em> The Byzantine Generals Problem</em>. Several generals have
        surrounded a city. They must agree on a common plan — attack or
        retreat — or they all lose. They communicate only by messengers. One
        or more of the generals (or the messengers) may be a traitor,
        actively trying to prevent agreement. The loyal generals need an
        algorithm that reaches agreement anyway.
      </p>
      <p>
        The traitor&apos;s power is asymmetry. A traitorous commander can
        send <code>&quot;attack&quot;</code> to one lieutenant and{" "}
        <code>&quot;retreat&quot;</code> to another. A traitorous lieutenant
        can tell one peer &quot;the commander said attack&quot; and another
        &quot;the commander said retreat.&quot; Crash faults are passive — a
        dead node sends nothing. Byzantine faults are active — a lying node
        sends <em>whatever will break you</em>.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="a traitorous commander — two honest lieutenants, two different orders" byzCommander />
        <Caption>
          The commander is a traitor. Lieutenant 1 hears &quot;attack,&quot;
          Lieutenant 2 hears &quot;retreat.&quot; Without a way to cross-check,
          they disagree and the battle is lost. The whole subject is the
          search for a protocol where honest nodes agree despite this.
        </Caption>
      </Figure>

      <h2>the lower bound: why you need 3f+1</h2>
      <p>
        For crash faults, you need <code>2f+1</code> nodes to tolerate{" "}
        <code>f</code> failures (any two majorities overlap in at least one
        honest node). For Byzantine faults the bound is{" "}
        <code>3f+1</code>. The intuition is worth memorizing because it is
        the single number that explains why BFT systems feel expensive.
      </p>
      <p>
        The argument: of <code>N</code> nodes, up to <code>f</code> are
        Byzantine (liars) and up to <code>f</code> can be crashed (silent).
        You need the honest, <em>non-crashed</em> nodes to outnumber the
        liars, so that a vote reflects the truth. The worst case leaves you
        with <code>N - f</code> active nodes, of which <code>f</code> are
        liars. For the honest ones to be a strict majority of the active
        ones: <code>N - 2f &gt; f</code>, i.e. <code>N &gt; 3f</code>, i.e.{" "}
        <code>N ≥ 3f + 1</code>.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="why 3f+1 — the honest must outnumber the liars among the alive" threeFPlusOne />
        <Caption>
          With N = 3f+1 and f liars and f crashed, you are left with 2f+1
          active nodes, of which f+1 are honest. The honest are a strict
          majority of the active. With only 3f nodes, the worst case leaves
          f honest and f liars active — a tie — and you cannot distinguish
          truth from lies by counting.
        </Caption>
      </Figure>

      <p>
        The deeper reason for the gap: with crash faults, silence is
        informative (a silent node didn&apos;t vote, so it didn&apos;t
        corrupt the count). With Byzantine faults, a lying vote is{" "}
        <em>anti-informative</em> — it counts against you. You need a margin
        wide enough that the liars can&apos;t outvote the honest even when
        some honest nodes are unavailable. That margin is the extra{" "}
        <code>f+1</code> nodes.
      </p>

      <h2>PBFT: the algorithm that made BFT practical</h2>
      <p>
        For years, BFT was considered a thought experiment — the protocols
        existed but were too slow to use. That changed in 1999 when Castro
        and Liskov published <strong>PBFT</strong> (Practical Byzantine
        Fault Tolerance). The key word is <em>practical</em>: PBFT runs in
        two message round-trips in the steady state, which is only one more
        than crash-fault Paxos. That made it usable for real workloads.
      </p>
      <p>
        PBFT is a three-phase protocol with a stable leader (the{" "}
        <strong>primary</strong>):
      </p>
      <ol>
        <li>
          <strong>Pre-prepare.</strong> The primary assigns a sequence
          number to a request and broadcasts <code>pre-prepare</code> to the
          replicas. This establishes ordering.
        </li>
        <li>
          <strong>Prepare.</strong> Replicas broadcast <code>prepare</code>{" "}
          to each other. A node is ready when it has collected{" "}
          <code>2f+1</code> matching prepares (including its own). This
          proves a quorum agreed on the ordering, so no conflicting order can
          also reach this stage.
        </li>
        <li>
          <strong>Commit.</strong> Replicas broadcast <code>commit</code>{" "}
          and execute once they have <code>2f+1</code> matching commits.
          This proves the ordering is stable — even a view change will not
          undo it.
        </li>
      </ol>

      <Figure>
        <Diagram viewBox="0 0 720 380" title="PBFT — three phases, quadratic chatter" pbft />
        <Caption>
          Every replica talks to every other replica in prepare and commit.
          That is O(n²) messages per request — the price of Byzantine
          fault tolerance. Crash-fault Paxos is O(n) with a stable leader;
          the extra factor is the cost of not trusting your peers.
        </Caption>
      </Figure>

      <p>
        The <strong>view change</strong> protocol handles a faulty primary.
        If replicas suspect the primary (timeout, bad signature), they
        exchange view-change messages, and the new primary must prove it has
        a quorum&apos;s support and a consistent prepared log. This is the
        fiddly part of every BFT protocol — the steady state is easy, the
        leader replacement is where correctness lives or dies.
      </p>

      <h2>the message complexity wall</h2>
      <p>
        PBFT&apos;s <code>O(n²)</code> messages are fine for tens of nodes.
        They are catastrophic for thousands. A 100-node cluster doing{" "}
        <code>n²</code> = 10,000 messages per request, per second, will
        saturate its network long before it saturates its CPUs. This is why
        early BFT was never going to run public blockchains.
      </p>
      <p>
        The breakthrough that unlocked larger BFT was{" "}
        <strong>linear message complexity</strong> — protocols where the
        total communication is <code>O(n)</code> per view, not{" "}
        <code>O(n²)</code>. The trick is a <strong>threshold
        signature</strong>: the replicas collectively sign a single
        attestation using a multi-party signing scheme, so instead of every
        node sending its vote to every other node, the leader collects{" "}
        <code>2f+1</code> partial signatures and aggregates them into one
        proof that everyone can verify with one check. HotStuff (Yin,
        Malkhi, et al. 2019) is the cleanest expression of this idea and the
        basis for a lot of modern consensus. Tendermint takes a different
        route to the same goal with a rotating leader and two rounds of
        voting.
      </p>

      <h2>the blockchain question, and the honest answer</h2>
      <p>
        Public blockchains (Bitcoin, Ethereum) face an even harder version:
        thousands of nodes, anonymous participants, no identity, and
        Sybil attacks (an attacker can spin up as many nodes as it wants).
        BFT assumes a fixed membership; public chains can&apos;t. So they
        replace identity with <strong>cost</strong>: proof-of-work makes
        votes expensive (hash power), proof-of-stake makes votes risky
        (slashable capital). The result is not BFT in the PBFT sense — it is
        probabilistic finality, where a decision is &quot;final&quot; once
        it is buried under enough subsequent work or enough attestations
        that reverting it would cost more than the attacker can afford.
      </p>
      <p>
        Ethereum&apos;s Casper FFG is the bridge: a BFT-style finality
        gadget layered on top of a proof-of-stake chain, giving economic
        finality to blocks that a pure longest-chain rule would only
        probabilistically confirm. The design is explicitly a hybrid — the
        BFT layer provides the strong safety, the stake provides the Sybil
        resistance.
      </p>

      <h2>when you actually need BFT (and when you don&apos;t)</h2>
      <p>
        The honest engineering question: do you need Byzantine fault
        tolerance at all? The answer is almost always no, and knowing when
        it is yes is the test.
      </p>
      <ul>
        <li>
          <strong>You control all the nodes</strong> (your own database
          cluster, your own microservices) — crash fault tolerance (Raft,
          Paxos) is enough. Byzantine faults don&apos;t happen if you trust
          your own binaries and your own admins. Paying 3f+1 here is waste.
        </li>
        <li>
          <strong>Federated / permissioned</strong> (consortium of
          organizations that don&apos;t fully trust each other, e.g. a
          group of banks running a shared ledger) — this is the sweet spot
          for PBFT-class protocols. Membership is known and limited, so{" "}
          <code>O(n²)</code> is tolerable, and the distrust is real.
        </li>
        <li>
          <strong>Public / open membership</strong> (anyone can join) — you
          need Sybil resistance plus BFT-style finality. This is
          proof-of-stake territory. If you are here, you are building a
          blockchain, and the question is not whether to use BFT but which
          hybrid fits.
        </li>
      </ul>
      <p>
        The trap is engineers reaching for BFT because it sounds more
        &quot;robust.&quot; Byzantine fault tolerance is not a stronger
        version of crash fault tolerance; it is a different protocol for a
        different problem, with a different cost. If your threat model
        doesn&apos;t include malicious operators, you are paying 50% more
        nodes and a quadratic message bill to defend against a threat you
        don&apos;t have.
      </p>

      <h2>what ties it back together</h2>
      <p>
        The through-line from the crash-fault post to this one is the same
        shape: <strong>the fault model determines the lower bound, and the
        lower bound determines the cost.</strong> Crash faults give you{" "}
        <code>2f+1</code> and <code>O(n)</code> messages. Byzantine faults
        give you <code>3f+1</code> and <code>O(n²)</code> (or{" "}
        <code>O(n)</code> with cryptography). In both cases the safety
        argument is a quorum-overlap counting argument — it just happens
        that liars count against you in a way that crashed nodes do not.
      </p>
      <p>
        And in both cases, the hard part is not the steady state. It is
        leader replacement under failure. Paxos Made Live and every BFT
        view-change paper are telling the same story: the protocol is easy
        to specify and painful to implement, and the pain lives in the
        recovery paths. That is the sentence I would underline if I could
        only underline one.
      </p>
      <p>
        Systems that are hard to corrupt, in the end, are systems that take
        the fault model seriously — that know exactly which kinds of failure
        they are defending against, and refuse to pay for the ones they
        don&apos;t have. BFT is the extreme case: it defends against the
        failures you only have when you can&apos;t trust the box. Use it when
        that is true. Use something cheaper when it isn&apos;t.
      </p>
    </article>
  )
}
