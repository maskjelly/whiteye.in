import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "byzantine-fault-tolerance-when-nodes-lie",
  title: "byzantine fault tolerance, and when nodes lie",
  date: "jun 02, 2026",
  updated: "oct 23, 2026",
  description: "Why a Byzantine quorum needs an honest overlap, and how PBFT carries evidence through a dishonest leader's proposals.",
  readingTime: "10 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        A leader sends one history to you and a different history to another replica.
        Both messages really came from the leader. Checking the sender&apos;s identity
        won&apos;t tell you which history to keep. A Byzantine participant can follow the
        protocol selectively, including voting for conflicting proposals.
      </p>

      <p>
        Raft and Paxos exclude that behavior from their fault model. Their replicas may
        crash, but the safety argument assumes they obey the voting rules and preserve
        required state. When different organizations operate replicas, that assumption
        can be too strong. What evidence remains trustworthy after a leader contradicts
        itself? PBFT makes that question concrete.
      </p>

      <h2>the generals problem</h2>
      <p>
        Lamport, Shostak, and Pease&apos;s <a
        href="https://lamport.azurewebsites.net/pubs/byz.pdf">1982 paper</a> uses
        generals communicating by messenger. Loyal generals need to agree on an action
        even if some participants send false instructions. If the commander is loyal,
        the loyal lieutenants should follow its order; if the commander is faulty, they
        must still agree with one another.
      </p>
      <p>
        A faulty commander can tell one lieutenant <code>&quot;attack&quot;</code> and
        another <code>&quot;retreat&quot;</code>. A faulty lieutenant can also lie when
        forwarding an order. Sending contradictory accounts to different peers is
        equivocation. Authentication identifies the sender; it cannot stop that sender
        signing both messages.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="a traitorous commander — two honest
        lieutenants, two different orders" byzCommander />
        <Caption>
          The two loyal lieutenants must reach the same decision despite receiving
          different orders. Neither can take the commander&apos;s message as the
          trustworthy answer.
        </Caption>
      </Figure>

      <h2>where 3f+1 comes from</h2>
      <p>
        For majority-based crash-tolerant replication, <code>2f+1</code> replicas allow
        progress after <code>f</code> crashes. PBFT uses <code>3f+1</code> replicas and
        quorums of <code>2f+1</code> to tolerate up to <code>f</code> Byzantine faults.
        Faulty replicas can vote on both sides, so the overlap must contain an honest
        participant.
      </p>
      <p>
        Two sets of <code>2f+1</code> voters drawn from <code>3f+1</code> replicas
        overlap in at least <code>2(2f+1) − (3f+1) = f+1</code> places. Even if every
        faulty replica is in that intersection, one honest replica remains. It must
        retain its state and apply the voting and locking rules across leader changes
        to prevent the quorums from certifying conflicting decisions.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="quorum overlap with at most f Byzantine replicas" threeFPlusOne />
        <Caption>
          Any two Byzantine quorums of 2f+1 intersect in at least f+1 participants,
          including an honest one. The fault budget is f total faulty replicas, not f malicious replicas
          plus another f crashes.
        </Caption>
      </Figure>

      <p>
        Availability puts an upper bound on the quorum size. Faulty replicas can all
        stay silent, leaving <code>N-f</code> possible replies. A quorum of size{" "}
        <code>q</code> must satisfy{" "} <code>q ≤ N−f</code>. Safety requires an
        overlap larger than the fault budget:{" "} <code>2q−N &gt; f</code>.
        Substituting the largest usable quorum gives{" "} <code>N−2f &gt; f</code>, or
        {" "}<code>N &gt; 3f</code>. The smallest integer replica count is therefore
        {" "}<code>3f+1</code> for this quorum construction. At <code>N=3f</code>, the
        overlap could consist entirely of the{" "} <code>f</code> faulty replicas.
      </p>
      <p>
        With <code>f=1</code>, four replicas use three-vote quorums. Any two such
        quorums share at least two replicas, so one shared voter must be honest. Three
        replicas cannot provide the same protection with two-vote quorums: their only
        shared voter could be the faulty one. This bound applies to the quorum
        construction above; other timing, authentication, and decision models can give
        different Byzantine agreement bounds.
      </p>

      <h2>PBFT</h2>
      <p>
        Castro and Liskov&apos;s <a
        href="https://pdos.csail.mit.edu/6.824/papers/castro-practicalbft.pdf">1999 PBFT
        paper</a> replicates a deterministic service among known replicas with
        authenticated communication. It avoids expensive public-key operations on every
        normal-path message. Safety holds through arbitrary delays; progress requires
        communication to become sufficiently well behaved.
      </p>
      <p>
        In a stable view, the primary proposes an order and replicas exchange evidence
        before executing it:
      </p>
      <ol>
        <li>
          <strong>Pre-prepare.</strong> The primary assigns a sequence number and sends
          a <code>pre-prepare</code> containing the request&apos;s digest and view.
          Replicas check the proposal before accepting it for that position.
        </li>
        <li>
          <strong>Prepare.</strong> Backups multicast <code>prepare</code> messages. In
          the original protocol, a replica becomes prepared with the matching
          pre-prepare and <code>2f</code> matching prepares from distinct backups
          (including its own if it is a backup). That certificate ties the request to its
          sequence number within the view.
        </li>
        <li>
          <strong>Commit.</strong> A prepared replica multicasts <code>commit</code>.
          Once it has <code>2f+1</code> matching commits, including its own, it can
          execute after earlier requests in the sequence have executed. A client waits
          for <code>f+1</code> matching replies, which ensures at least one came from an
          honest replica.
        </li>
      </ol>

      <Figure>
        <Diagram viewBox="0 0 720 380" title="PBFT — three phases, quadratic chatter" pbft />
        <Caption>
          Prepare and commit use all-to-all communication in PBFT, so the normal path
          has O(n^2) messages across n replicas. Stable-leader Multi-Paxos uses O(n)
          messages. Other Byzantine-tolerant protocols reduce this cost.
        </Caption>
      </Figure>

      <p>
        Take four replicas: faulty primary P and honest backups A, B, and C. P pre-prepares <code>x</code> to A and B, and a
        conflicting <code>y</code> to C at the same sequence number in the same view. A
        and B each send a prepare for <code>x</code>. Their two backup prepares,
        together with P&apos;s matching pre-prepare, are enough for A and B to become
        prepared. C has only its own prepare for <code>y</code>. P cannot supply the
        missing second backup prepare by sending another message under its own name.
      </p>
      <p>
        Why have a commit phase after that? An honest replica sends a commit only after
        it is prepared. A set of three commits therefore includes two honest prepared
        replicas. Any three-replica view-change set must include at least one of those
        two, carrying evidence of <code>x</code> into the replacement leader&apos;s
        selection. Section 4.4 of the PBFT paper gives the rules for checking those
        reports and constructing the new view.
      </p>
      <p>
        Timeouts let replicas try another primary when the current one stalls or
        misbehaves. Prepared certificates determine which continuation they can accept.
      </p>

      <h2>the communication cost</h2>
      <p>
        An all-to-all round among 100 replicas has <code>100 × 99 = 9,900</code>{" "}
        directed sends if each sends once to every other replica. PBFT&apos;s exact
        count differs because the primary and backups have different roles; batching
        also changes work per request. Throughput depends on packet sizes,
        authentication costs, and hardware.
      </p>
      <p>
        <a href="https://arxiv.org/abs/1803.05069">HotStuff</a> reduces communication
        using quorum certificates that can have a compact threshold signature. Replicas
        send votes to a collector; a certificate combines enough votes into evidence the
        others can verify. The paper gives a partially synchronous protocol with linear
        communication and responsive progress under a correct leader. <a
        href="https://dRx.digital/assets/Tendermint.pdf">Tendermint</a>{" "} also uses
        rotating proposers and vote rounds. Its gossip of votes has a different
        communication pattern; it is not the linear scheme from HotStuff.
      </p>

      <h2>public membership adds another problem</h2>
      <p>
        A permissioned protocol knows which replicas have votes. In an open network, an
        attacker could create thousands of identities to gain thousands of votes. Proof of work weights influence by computing effort; proof of stake
        weights it by committed stake, with penalties defined by the protocol.
        These Sybil-resistance mechanisms determine who gets influence; consensus
        determines how those voters agree.
      </p>
      <p>
        Bitcoin-style longest-chain consensus has probabilistic settlement: further
        blocks reduce the chance of a reorganization under its assumptions. Casper FFG,
        described in <a href="https://arxiv.org/abs/1710.09437">Buterin and
        Griffith&apos;s paper</a>, adds checkpoint votes with an accountable-safety
        property. Conflicting finalized checkpoints imply that a threshold of stake
        violated the rules and can be penalized. A block count and a BFT certificate
        therefore provide different evidence of finality.
      </p>

      <h2>when the fault model fits</h2>
      <p>
        Choose the trust assumption before the replica count:
      </p>
      <ul>
        <li>
          <strong>One operator controls the cluster.</strong> Raft or Paxos is often a
          reasonable choice when replicas are trusted to follow the protocol. Bugs and
          compromised machines can still cause arbitrary faults. Checksums, isolation,
          and operational controls address parts of that risk without a full BFT
          deployment.
        </li>
        <li>
          <strong>Several organizations share a service.</strong> Known membership with
          limited mutual trust is a natural setting for PBFT-class designs. The group
          must also decide how to admit members, replace keys, and handle a participant
          that stops cooperating.
        </li>
        <li>
          <strong>Participation is open.</strong> The design needs a Sybil-resistance
          mechanism and a way to determine voting weight or membership. Proof of stake
          with BFT-style finality is one option among several.
        </li>
      </ul>
      <p>
        BFT&apos;s extra protection costs replicas and communication. The
        {" "}<code>2f+1</code> and <code>3f+1</code> counts compare the same f under
        different fault assumptions. They do not imply a fixed percentage increase in
        operating cost; message complexity depends on the protocol.
      </p>

      <p>
        The four-replica example is the part I find most useful. P can manufacture
        contradictory proposals, but it cannot manufacture A&apos;s or B&apos;s
        authenticated prepares. An honest replica can then carry that evidence into a
        later view, provided it preserves protocol state through recovery and checks
        the evidence before voting again. Extra replicas cannot make up for either
        missing obligation.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Lamport, Shostak, Pease (1982). &quot;The Byzantine Generals
            Problem.&quot;{" "}
            <a href="https://lamport.azurewebsites.net/pubs/byz.pdf">
              Author’s PDF
            </a>
            . The paper that named the problem.
          </li>
          <li>
            Castro, Liskov (1999). &quot;Practical Byzantine Fault
            Tolerance.&quot;{" "}
            <a href="https://pdos.csail.mit.edu/6.824/papers/castro-practicalbft.pdf">
              PDF
            </a>
            . Sections 4.2 and 4.4 describe normal operation and view changes.
            Castro&apos;s PhD thesis develops the implementation further.
          </li>
          <li>
            Yin, Malkhi, et al. (2019). &quot;HotStuff: BFT Consensus in the
            Lens of Blockchain.&quot;{" "}
            <a href="https://arxiv.org/abs/1803.05069">arXiv:1803.05069</a>.
            The quorum-certificate construction and its communication analysis.
          </li>
          <li>
            Buchman (2016). &quot;Tendermint: Byzantine Fault Tolerance in
            the Age of Blockchains.&quot;{" "}
            <a href="https://dRx.digital/assets/Tendermint.pdf">
              thesis PDF
            </a>
            . Proposer rotation and voting in Tendermint.
          </li>
          <li>
            Buterin, Griffith (2017). &quot;Casper FFG: A Hybrid
            Consensus Layer.&quot;{" "}
            <a href="https://arxiv.org/abs/1710.09437">arXiv:1710.09437</a>.
            Checkpoint voting and accountable safety in the proposed finality layer.
          </li>
        </ol>
      </section>
    </article>
  )
}
