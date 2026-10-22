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
        A database leader acknowledges a write, then disappears. Its replacement has to
        preserve that write even if the acknowledgment was the last message the old
        leader sent. How can it tell which history is safe to continue? That question is
        where consensus became concrete for me: an election has to preserve earlier
        decisions.
      </p>

      <p>
        I tried to learn Paxos three times. Reading Ongaro&apos;s Raft thesis finally
        helped me connect the voting rules to the log a database needs. Quorum overlap,
        timeouts, and Raft&apos;s election and commit rules each explain part of how a
        replacement leader recovers that log.
      </p>

      <h2>what the nodes need to agree on</h2>
      <p>
        Take <code>N</code> nodes that communicate by messages. A node can crash; the
        network can delay, lose, or reorder a message. In a single consensus instance,
        processes propose values, and the decision must satisfy three requirements:
      </p>
      <ul>
        <li>
          <strong>Agreement.</strong> Two correct nodes cannot decide different values.
          This safety property must hold through failures and retries.
        </li>
        <li>
          <strong>Validity.</strong> The decided value must be a proposed value. Always
          returning <code>null</code> would avoid disagreement but would not solve the
          problem.
        </li>
        <li>
          <strong>Termination.</strong> Every correct node eventually decides. This is a
          liveness property; promising it requires assumptions about message delivery.
        </li>
      </ul>
      <p>
        With unbounded message delays and even one possible crash, a deterministic
        algorithm cannot guarantee all three in every admissible execution. The <a
        href="https://dl.acm.org/doi/10.1145/3149.214121">FLP result</a> makes that
        limit precise: guaranteeing eventual progress requires stronger assumptions.
      </p>

      <h2>why counting votes is not enough</h2>
      <p>
        A majority sounds like a good start: accept a proposal once more than{" "}
        <code>N/2</code> nodes vote for it. But the count needs rules. Which membership
        defines N? Can a node vote again after a restart? What must a new leader learn
        about earlier votes?
      </p>
      <p>
        Split a five-node cluster into groups of three and two. If each side counts
        only the nodes it can reach, both can elect a leader and accept writes. Each has
        silently redefined the membership. By the time communication resumes and the
        conflicting histories meet, the application may have acted on both sets of
        acknowledgments.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 340" title="split brain — two quorums that do not overlap" splitbrain />
        <Caption>
          The broken rule counts a majority of each reachable partition. A fixed
          five-node membership requires three votes, so the two-node side cannot commit
          a new write on its own. Failure detection must not redefine the voting
          population.
        </Caption>
      </Figure>

      <p>
        Label the five nodes A through E. A write stored on A, B, and C has at least one
        witness in any future three-node voting group; even C, D, and E must include C.
        But C needs something useful to remember. If it loses its state on restart, or
        the protocol lets it approve a conflicting history, the overlap hasn&apos;t
        protected the write. C must persist its state and use it to refuse the
        conflicting vote.
      </p>
      <p>
        Even careful voting cannot tell a crashed node from a slow one in an
        asynchronous network. A protocol may wait indefinitely for enough information
        to decide while preserving agreement. A timeout lets it try another leader;
        it proves nothing about whether the old leader is dead.
      </p>

      <h2>what FLP rules out</h2>
      <p>
        Fischer, Lynch, and Paterson&apos;s 1985 result considers deterministic
        consensus in a fully asynchronous system with a possible crash. It constructs an
        admissible execution in which the protocol never decides. Agreement can hold
        throughout. Termination is the guarantee that fails.
      </p>
      <p>
        The proof starts from a bivalent state, one from which either decision is still
        possible. Delaying selected steps or messages keeps the system bivalent.
        Non-faulty processes keep running and messages are eventually delivered, yet
        the schedule prevents a decision forever.
      </p>
      <p>
        To prove progress, a protocol has to change the assumptions:
      </p>
      <ul>
        <li>
          Use randomness. Ben-Or&apos;s randomized protocol changes FLP&apos;s
          deterministic premise, making probabilistic progress claims under its fault
          and scheduling assumptions.
        </li>
        <li>
          Assume partial synchrony. In one common formulation, after some unknown time,
          processing and message delays remain bounded. A protocol can then eventually
          keep a leader stable long enough to finish. The Dwork, Lynch, and Stockmeyer{" "} <a href="https://dl.acm.org/doi/10.1145/42283.42285">paper</a> formalizes
          this family of assumptions.
        </li>
        <li>
          Require enough functioning nodes and sufficiently favorable communication.
          Paxos and Raft preserve safety through late messages; they need those
          conditions to progress. Raft&apos;s randomized election timeouts reduce
          repeated split votes without guaranteeing termination under arbitrary delays.
        </li>
      </ul>
      <p>
        I used to blur the distinction between those claims. During a partition, a
        correct protocol may stop accepting writes to preserve agreement. Restoring
        communication lets it try again. Quorum intersection says nothing about when
        enough replies will arrive.
      </p>

      <h2>Paxos</h2>
      <p>
        Lamport wrote the original Paxos work in 1989; the journal paper appeared in
        1998. Basic Paxos chooses one value. In <a
        href="https://lamport.azurewebsites.net/pubs/paxos-simple.pdf">Paxos Made
        Simple</a>, later proposals must preserve any value already chosen by a
        majority.
      </p>
      <p>
        Proposers put values forward, acceptors record promises and accepted proposals,
        and learners discover what was chosen. Each instance has two phases:
      </p>
      <ol>
        <li>
          <strong>Prepare and promise.</strong> A proposer chooses a unique ballot
          number <code>n</code> and sends <code>Prepare(n)</code>. Acceptors that
          promise not to accept lower ballots return their highest previously accepted
          proposal, if any. The proposer waits for a quorum of promises.
        </li>
        <li>
          <strong>Accept.</strong> From those replies, the proposer uses the value
          attached to the highest accepted ballot. If no acceptor reported an accepted
          proposal, it can use its own value. It sends <code>Accept(n, value)</code>;
          acceptors accept unless they have promised a higher ballot. A value is chosen
          when a quorum accepts it.
        </li>
      </ol>

      <Figure>
        <Diagram viewBox="0 0 720 380" title="basic Paxos — the two-phase dance" paxos />
        <Caption>
          Overlapping quorums and the rule for selecting a previously accepted value
          work together. Ballot numbers alone would not preserve a decision. Acceptors
          must retain their promises and accepted proposals through recovery.
        </Caption>
      </Figure>

      <p>
        Suppose <code>v</code> was chosen in ballot <code>n</code>. A later prepare
        quorum overlaps the accepting quorum. Replies carry accepted ballot numbers, and
        the proposer must select the value from the highest one it sees. The full proof
        uses induction over ballots to show that any intervening higher accepted
        proposal also carries <code>v</code>. The shared acceptor may report a later
        ballot, provided it preserves the chosen value.
      </p>
      <p>
        A database needs a sequence of decisions. Multi-Paxos uses separate instances
        for log slots and lets a stable leader avoid repeating the full prepare phase
        for every entry. An implementation must also persist ballots,
        fill gaps, catch up followers, compact the log, and replace a leader. Chandra,
        Griesemer, and Redstone&apos;s <a
        href="https://dl.acm.org/doi/10.1145/1281100.1281103">Paxos Made Live</a>{" "}
        describes that work in Google&apos;s Chubby service.
      </p>
      <p>
        <em>Paxos Made Simple</em>, Lamport&apos;s 2001 explanation, is a more direct
        starting point than the fictional parliament in the original paper. I find it
        easier to read once the distinction between accepting a proposal and choosing a
        value is clear.
      </p>

      <h2>Raft</h2>
      <p>
        Ongaro and Ousterhout&apos;s <a href="https://raft.github.io/raft.pdf">2014 Raft
        paper</a> puts leader election and log recovery in the main explanation. The
        authors also compared student understanding of Raft and Paxos. My reason for
        finding it easier is that I can follow a command from append through
        commitment, then ask what happens to that same command after a leader fails.
      </p>
      <p>
        Raft separates election, replication, and safety:
      </p>
      <ul>
        <li>
          <strong>Leader election.</strong> Terms label election attempts. A node votes
          at most once per term, and a candidate needs a majority. A term can have no
          leader, but cannot have two elected leaders. Randomized timeouts help
          candidates avoid repeatedly splitting the vote.
        </li>
        <li>
          <strong>Log replication.</strong> The leader appends commands and sends them
          to followers. It can directly commit an entry from its current term once a
          majority has stored it. Entries from older terms need the additional
          current-term commitment rule; counting replicas alone is insufficient for
          them.
        </li>
        <li>
          <strong>Safety.</strong> A future elected leader must contain every committed
          entry. The election restriction and log-matching rules preserve that property.
          Nodes must persist the required state before replying.
        </li>
      </ul>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="Raft — terms, elections, and log replication" raft />
        <Caption>
          A new term can replace a leader, but committed entries survive. Followers
          reject stale terms and reconcile conflicting uncommitted suffixes with the
          elected leader. A leader&apos;s mere possession of an entry does not make that
          entry committed.
        </Caption>
      </Figure>

      <p>
        The log comparison has an exact order: compare the last entry&apos;s term first,
        then its index if the terms match. A longer log can therefore lose to a shorter
        log ending in a later term. Together with Raft&apos;s commit rules, this
        restriction ensures that every elected leader contains the committed history.
        Reconciliation still has work to do on the uncommitted suffix.
      </p>

      <h2>why an old entry on a majority can still be unsafe</h2>
      <p>
        The current-term rule is easy to overlook because &quot;stored on a
        majority&quot; sounds sufficient. The following is an illustrative trace of the
        problem in Figure 8 of the Raft paper. All five nodes begin with a common
        prefix. Each event after that concerns the next log position:
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
        The trace above shows the counterexample that the current-term rule excludes.
      </p>

      <h2>what an implementation still has to handle</h2>
      <p>
        Storage, membership, and reads can break the guarantee even when election and
        replication work:
      </p>
      <ul>
        <li>
          <strong>Log compaction.</strong> A snapshot captures applied state together
          with the log position it represents. Only then can covered entries be
          discarded safely. A far-behind follower may receive that state through{" "}
          <code>InstallSnapshot</code>. Snapshot persistence, installation, and
          interrupted recovery all need to agree about the boundary.
        </li>
        <li>
          <strong>Membership changes.</strong> Changing the voting population can create
          disjoint quorums if done carelessly. Raft&apos;s joint-consensus approach
          temporarily requires majorities of both the old and new configurations before
          completing the transition. Some implementations use constrained single-node
          changes with their own safety rules.
        </li>
        <li>
          <strong>Linearizable reads.</strong> An isolated old leader can still believe
          it is in charge. Before answering a linearizable read, a leader needs evidence
          of current authority and must have applied the required committed state.{" "}
          <code>ReadIndex</code> uses quorum confirmation; <code>LeaseRead</code> relies
          on additional timing and clock assumptions.
        </li>
      </ul>

      <h2>where these protocols show up</h2>
      <ul>
        <li>
          <strong>etcd, Consul, TiKV, and CockroachDB</strong> use Raft for replicated
          state, with their own storage and read-path choices.
        </li>
        <li>
          <strong>ZooKeeper</strong> uses Zab, an atomic-broadcast protocol with a
          leader. It predates Raft and also preserves committed order through leader
          changes.
        </li>
        <li>
          <strong>Spanner</strong> uses Paxos groups to replicate data. Its externally
          consistent transactions combine that replication with timestamp rules and
          TrueTime.
        </li>
        <li>
          <strong>Cassandra</strong> uses Paxos for lightweight transactions. Clients
          request those conditional operations explicitly. The classic protocol adds
          several network phases compared with an ordinary write, so the consistency
          requirement comes with a different latency cost.
        </li>
      </ul>

      <p>
        Consensus is useful when operations need one agreed order. Some applications can
        instead merge concurrent updates with a CRDT, under a different consistency
        contract. Byzantine protocols handle a broader fault model in which a replica
        can send contradictory messages. Each choice changes the guarantees an
        application can rely on.
      </p>
      <p>
        For me, the revealing test of a consensus explanation is to stop it just after
        an acknowledgment and replace the leader. Which node carries the evidence
        forward? What has it persisted, and which vote must it refuse? In the Raft
        trace, a majority of old copies fails that test. The current-term commit
        supplies the missing link between the write and every future election.
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
