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
        With three replicas and two votes required, I can leave two conflicting histories supported by quorums that share only the liar. Neither honest replica has to vote twice. Add a fourth replica and require three votes, and every quorum pair has an honest voter in common. That is the result of the small set check below. The protocol still has to make that honest voter refuse the conflicting history, including after the leader changes.
      </p>

      <p>
        Raft and Paxos assume that replicas obey the voting rules and keep the required state through a crash. A replica that votes for conflicting proposals has stepped outside that model. Signing both proposals would only confirm who contradicted itself. If different organizations operate the replicas, I need to decide whether I can trust them to follow those rules. PBFT gives me a way to trace a proposal when one primary refuses to do so.
      </p>

      <h2>two orders from the commander</h2>
      <p>
        In Lamport, Shostak, and Pease&apos;s <a
        href="https://lamport.azurewebsites.net/pubs/byz.pdf">1982 paper</a>, generals
        send orders by messenger. When the commander is loyal, all loyal lieutenants
        should decide on that commander&apos;s order. Now let the commander tell one to
        {" "}<code>&quot;attack&quot;</code> and another to <code>&quot;retreat&quot;</code>;
        the commander is faulty, but the loyal lieutenants still have to agree with
        each other. Asking them to forward what they heard adds another possible
        liar: a faulty lieutenant can invent an order it never received.
      </p>
      <p>
        Sending those conflicting accounts is equivocation. Even with an identified
        sender, each lieutenant has only its own copy of the order to work from.
        The sender may have told everyone else something different.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="a traitorous commander — two honest
        lieutenants, two different orders" byzCommander />
        <Caption>
          Both loyal lieutenants heard from the commander, and their orders disagree.
          A decision rule has to bring them to the same answer even in this case.
        </Caption>
      </Figure>

      <h2>the overlap must outnumber the faults</h2>
      <p>
        I started the <a href="https://github.com/maskjelly/whiteye.in/blob/main/scripts/blog-models.py">enumerator</a> with three replicas and asked for two votes. Its three pairs of quorums include &#123;0, 1&#125; paired with &#123;0, 2&#125;. Replica 0 is the entire overlap. If it lies, it can give each of the other replicas a different history and a second vote to go with it. Replicas 1 and 2 need never contradict themselves. In the script&apos;s output, the minimum overlap is one; remove faulty replica 0 and the honest overlap falls to zero.
      </p>
      <p>
        Now add replica 3 and ask for three votes. There are six pairs to check this time. Every intersection contains at least two replicas, so removing 0 always leaves someone. That remaining honest voter is what I was missing with three replicas. The script checks the sets, not PBFT: no messages or elections run in this model.
      </p>
      <p>
        I can work backward from those counts. How many replies can I demand if all <code>f</code> faulty replicas refuse to answer? At most <code>N−f</code>, so <code>q ≤ N−f</code>. Now let the faulty ones answer both ways instead. Two sets of <code>q</code> votes drawn from <code>N</code> replicas must share at least <code>2q−N</code> names. I need that overlap to contain more than the <code>f</code> names the attacker controls: <code>2q−N &gt; f</code>.
      </p>
      <p>
        Try the largest reachable quorum, <code>q=N−f</code>. Substitution leaves <code>N−2f &gt; f</code>, or <code>N &gt; 3f</code>. Hence <code>3f+1</code> is the first integer replica count that works. Stop at <code>N=3f</code> and the smallest overlap is exactly <code>f</code>; the attacker can occupy all of it. Replica 0 did just that in our three-replica check.
      </p>
      <p>
        Use PBFT&apos;s counts in the same calculation: <code>N=3f+1</code>, <code>q=2f+1</code>, hence <code>2(2f+1) − (3f+1) = f+1</code> shared voters. Spend the entire budget of <code>f</code> faults on that overlap and there is still a voter left. A crash-only majority can survive <code>f</code> crashes with <code>2f+1</code> replicas because it trusts the shared voter&apos;s behavior. Replica 0 showed why I could not use that argument here. I still owe the honest voter a rule: what state must it remember, and which vote must it refuse after a leader change? The protocol&apos;s voting and locking rules have to answer that.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 300" title="quorum overlap with at most f Byzantine replicas" threeFPlusOne />
        <Caption>
          Even if all f faulty replicas sit in the overlap, one of its f+1 voters
          is honest. A crashed replica uses the same fault budget as a malicious one;
          allowing f of each would exceed it.
        </Caption>
      </Figure>

      <p>
        I read <code>3f+1</code> with those two conditions attached: collect a quorum
        while faulty replicas are silent, and keep an honest voter in every
        intersection. Change the timing, authentication, or decision model for
        Byzantine agreement and the bound may change. The enumeration checks this
        particular construction.
      </p>


      <h2>following a proposal through PBFT</h2>
      <p>
        Castro and Liskov&apos;s <a
        href="https://pdos.csail.mit.edu/6.824/papers/castro-practicalbft.pdf">1999 PBFT
        paper</a> supplies the rules missing from the set check. Its replicas run
        a deterministic service, know the membership, and authenticate messages.
        The normal path avoids doing a public-key operation for every message.
        We can delay messages arbitrarily and retain safety, although progress can
        stop. To make progress, communication must eventually behave well enough
        for a correct primary to finish its work.
      </p>
      <p>
        For the message trace, I&apos;ll call the faulty primary P. Its three backups, A, B, and C, all follow the protocol. P picks a sequence number and view, then sends a <code>pre-prepare</code> naming the request digest. Give A and B a proposal for <code>x</code>. Give C a proposal for <code>y</code> at that very same position in that view. P has contradicted itself, but each backup has only its own proposal to check before accepting it.
      </p>
      <p>
        A and B multicast <code>prepare</code> messages for <code>x</code>. C sends
        one for <code>y</code>. In the original protocol, being prepared requires the
        matching pre-prepare and <code>2f</code> matching prepares from distinct
        backups. A backup counts its own prepare. Here <code>f=1</code>, so A and B
        each have the two backup prepares needed for <code>x</code>, along with
        P&apos;s matching pre-prepare. Both can become prepared. C has only its own
        prepare for <code>y</code>.
      </p>
      <p>
        P can&apos;t add a second backup prepare by sending another message under its
        own name. Its authority as primary let it propose conflicting histories;
        it doesn&apos;t let it impersonate another voter. The prepared certificate ties
        {" "}<code>x</code> to this sequence number in this view.
      </p>
      <p>
        I can follow that argument within one view. What will the next primary
        know? After becoming prepared, a replica multicasts <code>commit</code>.
        A prepared replica needs
        {" "}<code>2f+1</code> matching commits, including its own, before executing the
        request, and earlier sequence numbers must have executed first. In our
        four-replica case, three commits include at least two honest senders. Both
        were prepared for <code>x</code> before sending those commits.
      </p>
      <p>
        Try to collect three view-change reports while avoiding both honest
        prepared replicas. Only two replicas remain, so it can&apos;t be done. At
        least one report carries evidence of <code>x</code> to the replacement
        primary. Section 4.4 of the paper spells out how the new primary must
        check the reports and choose a continuation; honest replicas check that
        evidence before voting in the new view. The commit phase makes execution
        depend on evidence that reaches across this change of primary. It also
        explains why preserving protocol state through recovery matters: a replica
        that forgets what it prepared can&apos;t supply the evidence this argument needs.
      </p>
      <p>
        A timeout lets replicas attempt another primary when P stalls or misbehaves.
        They still have to check the prepared certificates before accepting the new
        view. On the client side, <code>f+1</code> matching replies are enough to
        include at least one honest replica; a single reply could have come from P.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 380" title="PBFT — three phases, quadratic chatter" pbft />
        <Caption>
          Pre-prepare assigns the position. Prepare gathers evidence within the view;
          commit makes it safe to execute across a later view change. PBFT&apos;s
          all-to-all prepare and commit rounds cost O(n^2) messages, against O(n)
          for stable-leader Multi-Paxos. Other BFT protocols can reduce that cost.
        </Caption>
      </Figure>

      <h2>paying for the exchanged evidence</h2>
      <p>
        For one replica in a group of 100, there are 99 outgoing destinations in an all-to-all round. Do that for every sender and I have <code>100 × 99 = 9,900</code> directed sends to account for. It is tempting to turn that straight into a cost per request. I still need the primary&apos;s and backups&apos; actual message counts, the number of requests sharing a batch, and the sizes and authentication work that the hardware must handle.
      </p>
      <p>
        In the <a href="https://arxiv.org/abs/1803.05069">HotStuff paper</a>, I can stop drawing an arrow from every voter to every recipient. The votes first meet at a collector. With a threshold signature, the evidence leaving that collector is a compact quorum certificate, so each recipient has one thing to check instead of the whole vote list. The paper gets linear communication under partial synchrony and responsive progress with a correct leader. <a href="https://dRx.digital/assets/Tendermint.pdf">Tendermint</a> also rotates proposers, but I&apos;d need another message trace for it. Its vote rounds use gossip. The fact that a proposer rotates gives me no message count on its own.
      </p>

      <h2>who gets a vote?</h2>
      <p>
        What stops replica 0 from renaming itself a thousand times? The configured membership does, both in the set check and in PBFT&apos;s A, B, C, and P. Each name has one known owner. For open participation, counting names would hand an attacker as many votes as it could invent. That is the Sybil problem. Proof of work gives influence to computing effort rather than names. More names can&apos;t create more committed stake. With proof of stake, I&apos;d count that stake, then check the protocol&apos;s rules for the penalties a voter faces. After either choice, we have assigned influence; we have yet to say how those votes agree on a history.
      </p>
      <p>
        With a Bitcoin-style history, each additional confirmation can make a replacement by reorganization less likely, under the protocol&apos;s assumptions. A client still relies on that probability. <a href="https://arxiv.org/abs/1710.09437">Buterin and Griffith&apos;s Casper FFG paper</a> adds checkpoint votes with accountable safety. Two conflicting finalized checkpoints would implicate a threshold of stake in broken voting rules, for which it can be penalized. Clients get a different kind of evidence from a BFT certificate than from a count of confirmations.
      </p>

      <h2>choosing the fault assumption</h2>
      <p>
        Bring P back under the same operator as A, B, and C. I might now be willing to trust all four to persist their voting state and follow the rules, in which case Raft or Paxos could be enough. But a software bug could still produce the two proposals we traced, and a compromise could produce them deliberately. The backups would see the same x and y whether I owned P or somebody else did. I&apos;d still use checksums against corruption, plus isolation and operational controls for the risks they can reduce. I can use those protections without full BFT, while keeping the crash model&apos;s limit explicit. Adding machines doesn&apos;t make it handle arbitrary messages.
      </p>
      <p>
        Leave P with another organization and require safety despite its contradictions, and I need an argument like the PBFT trace. Known membership also leaves decisions outside that trace. Who may admit a new member or replace its key? What happens when a member refuses to cooperate? An open network needs a rule for voting weight as well. Proof of stake with BFT-style finality is one possible answer, rather than a consequence of allowing anyone to participate.
      </p>
      <p>
        For f=1, the two formulas ask for three crash-tolerant replicas or four Byzantine-tolerant ones. The fault count includes different behavior in each case. Neither formula prices a request: that depends on the protocol&apos;s message exchange and the system running it, and a fixed operating-cost percentage would need a deployment measurement. The set check stops at finding the honest overlap. The PBFT trace then tells me what its honest voter must retain, and why the next primary cannot simply discard that evidence.
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
