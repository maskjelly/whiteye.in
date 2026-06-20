import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "the-consensus-problem-and-why-raft-exists",
  title: "the consensus problem, and why raft exists",
  date: "may 28, 2026",
  description:
    "From naive majority vote to FLP to Paxos to Raft. How distributed agreement got from impossible, to correct-but-unteachable, to the thing etcd actually runs.",
  readingTime: "12 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        Consensus is the problem that will not leave you alone. You solve it in
        a database, in a lock service, in a blockchain, every time two
        computers need to agree on one fact in the presence of failures. It
        also has the strangest history in computer science: a proof that it is
        impossible, an algorithm nobody could teach, and a rewrite that took
        over the industry.
      </p>

      <p>
        I tried to learn Paxos three times before it stuck. The third time was
        Ongaro&apos;s Raft thesis, which made me realize I had been confused
        not because the material was hard (it is, but not that hard) but
        because the Paxos paper was written in a way that actively resisted
        understanding. This post is the explanation I wish I had had the
        first time.
      </p>

      <h2>the problem</h2>
      <p>
        You have <code>N</code> nodes. They communicate by sending messages.
        Any node can crash at any time. Messages can be delayed, dropped,
        duplicated, and reordered. One process proposes a value. The group
        must agree on a single value such that:
      </p>
      <ul>
        <li>
          <strong>Agreement:</strong> no two correct nodes decide different
          values. Ever. This is a safety property. It must hold in every
          execution, including the ones that crash halfway through.
        </li>
        <li>
          <strong>Validity:</strong> the decided value was actually proposed
          by someone. The algorithm cannot just always decide{" "}
          <code>null</code> and call it a day.
        </li>
        <li>
          <strong>Termination:</strong> eventually, every non-faulty node
          decides. This is a liveness property. It has to happen eventually,
          not necessarily by any particular deadline.
        </li>
      </ul>
      <p>
        You cannot have all three at once. This is not a joke. It is a theorem.
      </p>

      <h2>why naive voting fails first</h2>
      <p>
        The first thing everyone tries is majority vote. Propose a value,
        count yes-votes, decide if &gt; <code>N/2</code>. This breaks in two
        ways.
      </p>
      <p>
        The first break is split brain. Suppose you have a leader. The network
        partitions. Now two partitions each think the other side is dead, and
        each elects its own leader. You now have two leaders accepting writes
        to the same logical object. When the partition heals, you have two
        histories and no honest way to merge them.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 340" title="split brain — two quorums that do not overlap" splitbrain />
        <Caption>
          A 5-node cluster partitions 3-2. Each side has a bare majority of
          its own partition and elects a leader. Both leaders accept
          conflicting writes. On heal, the system is inconsistent with no
          deterministic resolution. Majority-of-the-whole is not
          majority-of-a-partition.
        </Caption>
      </Figure>

      <p>
        The fix to split brain is quorum intersection: require a majority of
        the whole cluster, and force any two majorities to overlap in at least
        one node. With 5 nodes, any two 3-node majorities share at least one
        node. That shared node is the witness that prevents two conflicting
        decisions. Everything else in consensus is variations on this one
        counting argument.
      </p>
      <p>
        The second break is subtler, and it is the one that leads to the
        impossibility result. In an asynchronous system there is no bound on
        message delay. You cannot tell the difference between &quot;this node
        crashed&quot; and &quot;this node is very slow.&quot; A node that
        merely might have crashed can stall the algorithm forever, because you
        keep waiting for it, and if you give up and decide without it, you
        might violate agreement if it wakes up with a conflicting vote.
      </p>

      <h2>FLP</h2>
      <p>
        In 1985, Fischer, Lynch, and Paterson published a result that quietly
        ended a decade of optimism. The FLP impossibility theorem says: in a
        purely asynchronous system, no deterministic consensus algorithm can
        simultaneously guarantee termination and tolerate even a single crash
        failure.
      </p>
      <p>
        The proof is an adversarial argument. You have a system state that is
        bivalent, meaning it could still go to either of two decision values.
        The adversary shows it can always delay a message in just the right
        way to keep the system bivalent indefinitely. As long as there is one
        process whose messages you can delay, you can prevent any other
        process from ruling out either outcome. The system never decides, and
        termination fails.
      </p>
      <p>
        Read it carefully. FLP does not say consensus is impossible. It says
        deterministic consensus with guaranteed termination in a purely
        asynchronous model is impossible. Every real system escapes FLP by
        weakening one of those adjectives:
      </p>
      <ul>
        <li>
          Add randomness (Ben-Or&apos;s algorithm). The adversary cannot keep
          the system bivalent forever if a coin flip eventually breaks the
          tie.
        </li>
        <li>
          Assume partial synchrony (DLS, 1988): the system is asynchronous
          most of the time, but there are periods where messages arrive within
          some bound. You do not need to know the bound. You just need it to
          eventually exist. This is the assumption every production system
          makes.
        </li>
        <li>
          Give up on guaranteed termination and accept termination with
          probability 1. Paxos and Raft both do this. They terminate as long
          as the stable leader can talk to a majority for long enough, which
          in practice is almost always.
        </li>
      </ul>
      <p>
        The thing I kept getting wrong for years: safety is a property of
        every execution. Liveness is a property of executions that actually
        happen. You can guarantee the hard one (agreement) for free, in every
        model, with quorum intersection. You can only hope for the
        easy-looking one (termination) under extra assumptions. People get
        this backwards constantly. I did.
      </p>

      <h2>Paxos</h2>
      <p>
        Lamport published Paxos in 1989 (1998 in journal form). It is built on
        the quorum-intersection idea. It is correct. For about twenty years it
        was the only game in town, and almost nobody understood it.
      </p>
      <p>
        The cast: Proposers propose values, Acceptors vote on them, Learners
        find out what was decided. The mechanism is a two-phase dance that
        makes it impossible to choose two different values:
      </p>
      <ol>
        <li>
          <strong>Phase 1, Prepare/Promise.</strong> Proposer picks a unique,
          increasing ballot number <code>n</code> and sends{" "}
          <code>Prepare(n)</code> to a majority of acceptors. An acceptor
          promises not to accept any ballot smaller than <code>n</code>, and
          reports back any value it has already accepted in a previous ballot.
        </li>
        <li>
          <strong>Phase 2, Accept/Accepted.</strong> The proposer takes the
          highest-numbered value reported by any acceptor (or its own value if
          none reported) and sends <code>Accept(n, value)</code> to a
          majority. Acceptors accept it (unless they have promised something
          higher) and tell the learners.
        </li>
      </ol>

      <Figure>
        <Diagram viewBox="0 0 720 380" title="basic Paxos — the two-phase dance" paxos />
        <Caption>
          Two proposers can race, but the ballot numbering plus the rule
          &quot;use the highest already-accepted value&quot; guarantees that
          once a majority accepts a value, any later proposer picks up that
          same value. Any two majorities share an acceptor. That acceptor
          carries the chosen value forward. Agreement is structural.
        </Caption>
      </Figure>

      <p>
        The safety argument is one paragraph. Suppose value{" "}
        <code>v</code> is chosen in ballot <code>n</code>. Any proposer in a
        later ballot <code>n&apos; &gt; n</code> must reach a majority of
        acceptors, and that majority overlaps the one that accepted{" "}
        <code>v</code>. The overlapping acceptor either already promised not
        to accept below <code>n&apos;</code> (so it must have reported{" "}
        <code>v</code> in phase 1) or it hasn&apos;t, in which case{" "}
        <code>v</code> couldn&apos;t have been chosen yet. Either way, the
        proposer in <code>n&apos;</code> is forced to propose{" "}
        <code>v</code>. No conflicting value can ever be chosen.
      </p>
      <p>
        So why did everyone hate Paxos? Because the basic algorithm agrees on
        a single value. A database wants to agree on an ordered log of
        thousands of values. The extension to Multi-Paxos is
        &quot;obvious&quot;: make the proposer a stable leader and run phase 2
        repeatedly for each log slot. That obviousness hides roughly every
        engineering problem you will hit in production. Disk persistence of
        ballot numbers. Log catch-up for lagging followers. Snapshotting and
        log compaction. Membership changes. Leader election when the leader
        dies. Lamport&apos;s paper did not cover these. Google&apos;s{" "}
        <em>Paxos Made Live</em> (Chandra et al., 2007) is a 14-page
        confession of how much pain the &quot;obvious&quot; parts caused a
        very strong team.
      </p>
      <p>
        Lamport himself later wrote <em>Paxos Made Simple</em> (2001), a
        plain-English rewrite, because the original&apos;s fictional Greek
        island parliament made an already-hard algorithm harder to read. The
        rewrite is genuinely clear. It needed to exist.
      </p>

      <h2>Raft</h2>
      <p>
        In 2014, Ongaro and Ousterhout published Raft with one stated goal
        that no prior consensus paper had prioritized: understandability. They
        measured progress by how many students could answer questions about
        the algorithm after learning it. Raft is not more correct than Paxos.
        It is more learnable, and that turned out to matter more than anything
        else.
      </p>
      <p>
        The structural move: decompose consensus into three sub-problems that
        you can understand one at a time.
      </p>
      <ul>
        <li>
          <strong>Leader election.</strong> One node is the leader, the others
          are followers. Time is divided into terms, each with at most one
          leader. A candidate wins an election by getting a majority of votes
          for its term. If it doesn&apos;t, a randomized election timeout
          makes split votes unlikely on the next round.
        </li>
        <li>
          <strong>Log replication.</strong> The leader accepts writes,
          appends them to its log, replicates the entry to followers, and
          commits once a majority has replicated. Committed entries are
          durable and will not be lost.
        </li>
        <li>
          <strong>Safety.</strong> If any entry is committed in term{" "}
          <code>t</code>, no leader of a later term can overwrite it. The
          mechanism is the same quorum-overlap argument as Paxos, applied to
          log indices instead of bare values.
        </li>
      </ul>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="Raft — terms, elections, and log replication" raft />
        <Caption>
          Terms are logical time. Each term elects at most one leader. The
          leader&apos;s log is the source of truth. Followers replicate. A
          newer leader always has all committed entries from prior terms. The
          election restriction (a candidate must have an up-to-date log to
          win) guarantees this. Conflicting entries from a stale leader get
          overwritten once the new leader replicates past that index.
        </Caption>
      </Figure>

      <p>
        The thing Raft gets right that Multi-Paxos papers hand-wave is the
        election restriction. A candidate can only win if its log is at least
        as up-to-date as a majority of the cluster. So any elected leader is
        guaranteed to contain every committed entry, which means a new leader
        never has to fetch missing data to become safe. It just needs to
        overwrite the uncommitted junk. That single rule replaces an entire
        category of recovery edge cases in Paxos implementations.
      </p>

      <h2>the parts the papers skip</h2>
      <p>
        Three things separate a textbook Raft from a Raft you would run:
      </p>
      <ul>
        <li>
          <strong>Log compaction.</strong> You cannot keep every write in the
          log forever. Periodically you take a snapshot of the applied state,
          write it to disk, and truncate the log up to that point. A follower
          that is hopelessly behind gets the snapshot via{" "}
          <code>InstallSnapshot</code>, not a million log entries. This is
          where most homegrown Rafts break. I have seen it happen twice.
        </li>
        <li>
          <strong>Membership changes.</strong> Adding or removing a node
          changes the definition of &quot;majority.&quot; If you do it
          naively you can have two non-overlapping majorities active at once,
          which is split brain by construction. Raft&apos;s solution is joint
          consensus: a transitional configuration where a decision needs
          majorities of both the old and new cluster. Only once that
          stabilizes do you switch to the new configuration alone.
        </li>
        <li>
          <strong>Linearizability for reads.</strong> Raft gives you a totally
          ordered log. Reads served by the leader are linearizable only if the
          leader first confirms it is still the leader. Otherwise a stale
          leader from an old term can serve outdated reads.{" "}
          <code>ReadIndex</code> and <code>LeaseRead</code> are the two ways
          to make reads safe without writing to the log for every read. This
          is not optional. People have lost data by skipping it.
        </li>
      </ul>

      <h2>who runs what</h2>
      <ul>
        <li>
          <strong>etcd, Consul, TiKV, CockroachDB</strong> run Raft. The Raft
          ecosystem is where most new systems land, because the paper plus
          Ongaro&apos;s thesis tell you enough to actually ship.
        </li>
        <li>
          <strong>ZooKeeper</strong> runs Zab (Zookeeper Atomic Broadcast), a
          Paxos-family protocol with a stable leader. Pre-dates Raft, solves
          the same problems, harder to learn.
        </li>
        <li>
          <strong>Spanner</strong> runs Paxos per shard group. The paxos
          group elects a leader that serves writes. Reads use TrueTime and
          replica timestamps for external consistency. The engineering around
          it is where Google&apos;s investment lives.
        </li>
        <li>
          <strong>Cassandra</strong> uses Lightweight Transactions (LWT),
          which is an in-cluster Paxos per partition, for operations that need
          linearizability. Expensive (4 round trips worst case) and disabled
          by default. The fact that it is disabled by default tells you
          something about how expensive it is.
        </li>
      </ul>

      <p>
        Consensus is about making nodes agree while some of them are lying
        about whether they are alive. Safety is a proof. Liveness is a hope.
        You pay in latency for the proof and you accept that the hope
        sometimes fails. Paxos and Raft weaken termination and assume partial
        synchrony. CRDTs weaken safety and give you eventual consistency.
        Blockchain consensus weakens the fault model itself and assumes some
        nodes are actively malicious, which is a different and harder problem
        that I wrote about separately.
      </p>
      <p>
        The thing I find beautiful about this subject is that the safety
        argument is a counting argument. Two majorities overlap. That is it.
        The hardest problem in distributed systems reduces to the pigeonhole
        principle, and everything else is engineering. I did not appreciate
        that for a long time.
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
            <a href="https://lamport.org/publications/pubs.html#lamport98">
              lamport.org
            </a>
            . The original Paxos paper. The Greek island framing is the
            reason nobody understood it.
          </li>
          <li>
            Lamport (2001). &quot;Paxos Made Simple.&quot;{" "}
            <a href="https://lamport.org/publications/pubs.html#paxos-simple">
              lamport.org
            </a>
            . The plain-English rewrite. Read this first.
          </li>
          <li>
            Chandra, Griesemer, Redstone (2007). &quot;Paxos Made Live.&quot;{" "}
            <a href="https://dl.acm.org/doi/10.1145/1281100.1281103">
              PODC paper
            </a>
            . Google&apos;s account of engineering Multi-Paxos into
            Chubby. Painful.
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
            . The partial synchrony model that everything real assumes.
          </li>
        </ol>
      </section>
    </article>
  )
}
