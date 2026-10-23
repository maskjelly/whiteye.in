import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "the-consensus-problem-and-why-raft-exists",
  title: "the consensus problem, and why raft exists",
  date: "may 28, 2026",
  updated: "oct 23, 2026",
  description: "What a replacement leader must preserve: quorum rules, FLP's liveness limit, and a worked Raft recovery trace.",
  readingTime: "12 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        A database leader acknowledges a write, then disappears. The replacement still
        owes the client that write, even if the acknowledgment was the old leader&apos;s
        last message. Following the write through that failure made consensus concrete
        for me. The election has to carry an earlier decision into a new term.
      </p>

      <p>
        I tried to learn Paxos three times. Reading Ongaro&apos;s Raft thesis finally
        helped me connect the voting rules to the log a database needs. I could follow
        a command as it was appended and committed, then ask whether the next leader
        would still have it.
      </p>

      <h2>what counts as a decision</h2>
      <p>
        I&apos;ll start with one log slot. Any of <code>N</code> nodes can propose its value. For now, allow the network to lose a message, deliver it late, or deliver it after a newer message; allow a node to crash as well. I want agreement to survive all that: once a correct node decides on a value, no other correct node may decide on a different value for this slot.
      </p>
      <p>
        There are two other obligations. Validity requires a value that somebody
        proposed; always returning <code>null</code> cannot satisfy it when nobody
        proposed null. Termination requires every correct node to decide eventually.
        Agreement is about safety. Termination is about progress, and its promise will
        depend on what we assume about message delivery.
      </p>

      <h2>three votes out of which five?</h2>
      <p>
        Fix the membership at five. A majority now means three votes, including when two members cannot reach the other three. The three-node side can collect enough votes to continue. The two-node side is stuck one vote short. Waiting longer changes neither count.
      </p>
      <p>
        Now try counting only the machines that answer. The two-node side suddenly needs just two votes, so it can acknowledge writes too. Restoring the link won&apos;t retract an acknowledgment from a client that has already acted on it. The failure was in changing the meaning of a majority during the outage.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 340" title="split brain — two quorums that do not overlap" splitbrain />
        <Caption>
        The configured membership still contains five nodes. Two replies leave one missing vote; treating those replies as a complete membership creates the split brain.
      </Caption>
      </Figure>

      <p>
        Name the nodes A through E. Put a write on A, B, and C, then ask C, D, and E to vote next. C is the witness connecting the two groups. Every possible three-node group has at least one such witness. But a witness that forgets on restart is useless. C needs persisted evidence and a voting rule that uses it; merely storing the earlier write does not yet tell C which future votes to refuse.
      </p>
      <p>
        I can&apos;t finish that argument with a timeout. Without a delivery deadline, no reply could mean a crash or just a longer wait. It is reasonable to trigger another election. It is unsafe to conclude that the old leader has ceased to exist. Agreement can remain intact while the protocol waits forever for enough information.
      </p>

      <h2>what FLP rules out</h2>
      <p>
        The <a href="https://dl.acm.org/doi/10.1145/3149.214121">1985 FLP result</a>
        {" "}makes that last problem precise. Fischer, Lynch, and Paterson consider a
        deterministic protocol in a fully asynchronous system where even one node
        might crash. They construct an admissible execution in which a protocol
        preserving agreement never reaches a decision. It loses the termination
        guarantee.
      </p>
      <p>
        The proof keeps the execution bivalent: either decision is still possible.
        Each carefully chosen delay leaves another way to postpone the deciding step.
        This is possible even though non-faulty processes keep taking steps and their
        messages are eventually delivered. No fixed upper bound forces a message to
        arrive in time to end the indecision.
      </p>
      <p>
        To recover a progress guarantee, something in that model has to give. Ben-Or uses randomness and proves probabilistic progress under the protocol&apos;s stated assumptions. Partial synchrony takes a different route: in one formulation, delays become bounded after an unknown time. A leader can eventually get a long enough stretch of useful communication. The <a href="https://dl.acm.org/doi/10.1145/42283.42285">Dwork–Lynch–Stockmeyer paper</a> spells out the timing models behind that argument.
      </p>
      <p>
        For Paxos and Raft, I separate two claims when reading a design. Late messages must not corrupt an earlier decision. Finishing a new decision requires enough working replicas and communication that cooperates for long enough. Raft&apos;s random election timeouts help break repeated split votes, but leave the arbitrary-delay problem in place. I used to blur this. A cluster refusing writes during a partition may be doing precisely what its safety contract requires.
      </p>

      <h2>Paxos</h2>
      <p>
        In Paxos, C keeps promises and accepted proposals for the next proposer to inspect. I start with <a href="https://lamport.azurewebsites.net/pubs/paxos-simple.pdf">Paxos Made Simple</a>, Lamport&apos;s 2001 explanation. The original work was written in 1989 and reached the journal in 1998. The distinction I need before following either account is between one acceptor accepting a proposal and a quorum choosing a value.
      </p>
      <p>
        The proposer puts a value forward, acceptors hold the durable voting state, and
        learners discover the chosen result. The proposer works in two phases:
      </p>
      <ol>
        <li>
          <strong>Prepare and promise.</strong> Pick a unique ballot number{" "}
          <code>n</code> and send <code>Prepare(n)</code>. An acceptor that promises to
          reject lower ballots also reports its highest accepted proposal, if it has
          one. Wait for a quorum of those promises.
        </li>
        <li>
          <strong>Accept.</strong> Look through the replies for the highest accepted
          ballot and use its value. Only if none of the replies reports an accepted
          proposal may the proposer choose its own value. Send{" "}
          <code>Accept(n, value)</code>. An acceptor can accept unless it has promised
          a higher ballot. Once a quorum accepts, the value is chosen.
        </li>
      </ol>

      <Figure>
        <Diagram viewBox="0 0 720 380" title="basic Paxos — the two-phase dance" paxos />
        <Caption>
          A higher ballot lets a proposer try again, subject to the value-selection
          rule. Its acceptors must recover with their promises and accepted proposals
          intact. Otherwise the next prepare can lose the evidence it needs.
        </Caption>
      </Figure>

      <p>
        There is a wrinkle in the usual overlap explanation. After a quorum chooses <code>v</code> at ballot <code>n</code>, the shared acceptor may move on to another ballot. Its next reply need not mention <code>n</code> at all. The proof follows those intervening ballots by induction: any higher proposal that could have been accepted must still carry <code>v</code>. Taking the highest accepted ballot from the prepare replies therefore preserves that value. That value-selection step is doing work the overlap count cannot do alone.
      </p>
      <p>
        One chosen value is a start. For a database log, Multi-Paxos uses an instance
        for each slot and lets a stable leader skip a fresh full prepare for every
        entry. The implementation still has to persist ballots and fill gaps, bring
        followers up to date, compact old entries, and replace failed leaders.
        Chandra, Griesemer, and Redstone&apos;s <a
        href="https://dl.acm.org/doi/10.1145/1281100.1281103">Paxos Made Live</a>{" "}
        describes those engineering problems in Google&apos;s Chubby service. Lamport&apos;s
        original fictional parliament leaves more of that work to the reader.
      </p>

      <h2>Raft</h2>
      <p>
        Ongaro and Ousterhout&apos;s <a href="https://raft.github.io/raft.pdf">2014 Raft
        paper</a> puts the log and its recovery into the protocol&apos;s main
        explanation. The authors compared student understanding of Raft and Paxos, too.
        For me, the useful part is being able to keep following the same command when
        the leader changes.
      </p>
      <p>
        Each election attempt has a term. A node can vote once in that term, and a
        candidate needs a majority to win. Two elected leaders in one term would need
        a shared voter to vote twice. There can be a term with no leader, though.
        Randomized timeouts help the candidates get out of repeated split votes.
      </p>
      <p>
        After winning, the leader appends commands and sends them to followers. A
        current-term entry can be committed when a majority has stored it. That
        qualification, current-term, is necessary. A majority of copies of an older
        entry does not give the leader the same permission.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="Raft — terms, elections, and log replication" raft />
        <Caption>
          Followers reject messages from stale terms. After an election they reconcile
          conflicting uncommitted suffixes with the new leader; every committed entry
          must survive. An entry sitting in the leader&apos;s log may still be uncommitted.
        </Caption>
      </Figure>

      <p>
        Before voting, a node compares its log with the candidate&apos;s. It compares
        the last entry&apos;s term first and uses the index only to break a tie. So a
        shorter log ending in a later term can beat a longer one. This election
        restriction and the log-matching and commit rules make future leaders retain
        the committed prefix. All of them depend on nodes persisting the required
        state before replying.
      </p>

      <h2>why an old entry on a majority can still be unsafe</h2>
      <p>
        Figure 8 of the Raft paper gives a counterexample to treating every majority
        of stored copies as a commitment. This illustrative trace uses five nodes,
        all starting with a common prefix. The next log position is the disputed one:
      </p>
      <ol>
        <li>
          In term 2, leader A stores <code>x</code> on A and B, then fails before
          reaching a majority.
        </li>
        <li>
          E wins term 3 with votes from C, D, and E. It appends a conflicting{" "}
          <code>y</code> from term 3, but stores it only on itself before losing
          contact.
        </li>
        <li>
          A returns and wins term 4 with A, B, and C. Those voters have no term-3 entry.
          A copies <code>x</code> to C, so the term-2 entry now exists on a majority: A,
          B, and C.
        </li>
      </ol>
      <p>
        If A fails again here, E can win a later election with C, D, and E. E&apos;s
        last log term is 3; C&apos;s is 2. C can legally vote for E, whose log will
        replace <code>x</code> with <code>y</code>. The three stored copies did not make
        the older entry safe to acknowledge as committed.
      </p>
      <p>
        Instead, A must get an entry from its current term, term 4, stored on a
        majority. Committing that entry also commits its preceding log prefix, including
        {" "}<code>x</code>. A no-op can supply the new entry when there is no client command
        to append. Sections 5.4.2–5.4.3 of the paper explain why this rule, the election
        restriction, and log matching preserve the prefix across every later election.
      </p>
      <p>
        I put those two snapshots through a <a href="https://github.com/maskjelly/whiteye.in/blob/main/scripts/blog-models.py">small check of
        the log-freshness predicate</a>. With A and B unavailable, E can get votes
        from C, D, and E while C ends in term 2. Append the term-4 entry on A, B,
        and C, and the eligible reachable voters shrink to D and E. Two votes cannot
        elect a leader in this membership. The check only compares the last log
        term and index in the stated snapshots; it does not model the full election
        protocol. It does let me inspect exactly where C&apos;s answer changes.
      </p>


      <h2>keeping the evidence after the log grows</h2>
      <p>
        Compaction removes some of the evidence we have been following. Before dropping a prefix, save its applied state together with the log position it covers. A follower that has fallen far behind can receive this through <code>InstallSnapshot</code>. I would check the interrupted installation too: after restarting halfway through, the node still needs a consistent pair of saved state and covered log position. Otherwise it cannot tell which entries remain to be applied.
      </p>
      <p>
        Before counting replies I also need the configuration they belong to. Changing the members can leave a majority of the old group disjoint from a majority of the new one. Joint consensus requires both majorities during the transition. Some implementations restrict changes to one member at a time, with the safety rules for that procedure. Either way, changing membership is part of the protocol.
      </p>
      <p>
        Reads have a leadership problem even when they append nothing. An isolated old
        leader can believe it still has authority and answer from stale state. For a
        linearizable read, a leader needs evidence that it still has authority, plus
        the required committed state already applied. <code>ReadIndex</code> gets
        quorum confirmation. <code>LeaseRead</code> needs additional assumptions about
        timing and clocks.
      </p>

      <h2>where these protocols show up</h2>
      <p>
        Raft appears in etcd, Consul, TiKV, and CockroachDB. Their read and storage paths add choices beyond the core protocol. ZooKeeper takes a different route with Zab, which predates Raft. Zab orders broadcasts through a leader and also has to carry the committed order through leader replacement.
      </p>
      <p>
        Spanner uses Paxos groups for replication, then combines that with timestamp rules and TrueTime for externally consistent transactions. Cassandra exposes Paxos through lightweight transactions, which clients request for conditional operations. Its classic protocol needs several network phases beyond an ordinary write. I would compare the latency of the requested operation rather than attach one latency claim to the whole database.
      </p>
      <p>
        Some applications can merge concurrent updates with a CRDT under a different
        consistency contract. The
        replicas here have been trusted to obey the protocol even when they crash or
        recover. Allow them to send contradictory messages and the fault model changes;
        that is the problem Byzantine protocols address.
      </p>
      <p>
        I still find replacing the leader just after an acknowledgment the revealing
        test. In the trace, the question lands on C. With only a term-2 entry it can
        vote for E and let <code>x</code> disappear. Once a term-4 entry is committed,
        a later election must pass voters whose persisted state protects <code>x</code>.
        The client&apos;s acknowledgment depends on the votes those nodes will refuse.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Fischer, Lynch, Paterson (1985). &quot;Impossibility of
            Distributed Consensus with One Faulty Process.&quot;{" "}
            <a href="https://dl.acm.org/doi/10.1145/3149.214121">
              JACM paper
            </a>
            . The FLP result. Short, dense, worth reading in full.
          </li>
          <li>
            Lamport (1998, written 1989). &quot;The Part-Time
            Parliament.&quot;{" "}
            <a href="https://lamport.azurewebsites.net/pubs/lamport-paxos.pdf">
              Author’s PDF
            </a>
            . The original Paxos paper, presented through a fictional parliament.
          </li>
          <li>
            Lamport (2001). &quot;Paxos Made Simple.&quot;{" "}
            <a href="https://lamport.azurewebsites.net/pubs/paxos-simple.pdf">
              Author’s PDF
            </a>
            . The plain-English rewrite. Read this first.
          </li>
          <li>
            Chandra, Griesemer, Redstone (2007). &quot;Paxos Made Live.&quot;{" "}
            <a href="https://dl.acm.org/doi/10.1145/1281100.1281103">
              PODC paper
            </a>
            . Google&apos;s account of engineering Multi-Paxos into
            Chubby, including the gaps between an algorithm and an operating service.
          </li>
          <li>
            Ongaro, Ousterhout (2014). &quot;In Search of an
            Understandable Consensus Algorithm.&quot;{" "}
            <a href="https://raft.github.io/raft.pdf">
              raft.github.io
            </a>
            . The Raft paper. Plus Ongaro&apos;s PhD thesis for the parts the
            paper could not fit.
          </li>
          <li>
            Dwork, Lynch, Stockmeyer (1988). &quot;Consensus in the Presence
            of Partial Synchrony.&quot;{" "}
            <a href="https://dl.acm.org/doi/10.1145/42283.42285">
              JACM paper
            </a>
            . Formal timing models for proving progress beyond full asynchrony.
          </li>
        </ol>
      </section>
    </article>
  )
}
