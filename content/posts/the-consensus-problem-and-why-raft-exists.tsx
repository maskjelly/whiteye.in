import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "the-consensus-problem-and-why-raft-exists",
  title: "the consensus problem, and why raft exists",
  date: "may 28, 2026",
  description:
    "From naive majority vote to FLP to Paxos to Raft — how distributed agreement got from impossible, to correct-but-unteachable, to the thing etcd actually runs. With the diagrams I wish I'd had the first time.",
  readingTime: "12 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        Consensus is the problem that will not leave you alone. You solve it
        in a database, you solve it in a lock service, you solve it in a
        blockchain, you solve it every time two computers need to agree on
        one fact in the presence of failures. It is also the problem with the
        strangest history in computer science: a proof that it is impossible,
        an algorithm nobody could teach, and a rewrite that took over the
        industry. This is that story, with the parts people skip.
      </p>

      <h2>the problem, stated honestly</h2>
      <p>
        You have <code>N</code> nodes. They communicate by sending messages.
        Any node can crash at any time; messages can be delayed, dropped,
        duplicated, and reordered. One process proposes a value. The group
        must agree on a single value, such that:
      </p>
      <ul>
        <li>
          <strong>Agreement:</strong> no two correct nodes decide different
          values. Ever. This is a safety property — it must hold in every
          execution, including the ones that crash halfway through.
        </li>
        <li>
          <strong>Validity:</strong> the decided value was actually proposed
          by someone. The algorithm can&apos;t just always decide{" "}
          <code>null</code> and call it a day.
        </li>
        <li>
          <strong>Termination:</strong> eventually, every non-faulty node
          decides. This is a liveness property — it has to happen{" "}
          <em>eventually</em>, not necessarily by any particular deadline.
        </li>
      </ul>
      <p>
        That trinity is where all the trouble lives, because — as it turns
        out — you cannot have all three at once.
      </p>

      <h2>why naive voting fails first</h2>
      <p>
        The first thing everyone tries is majority vote. Propose a value,
        count yes-votes, decide if &gt; <code>N/2</code>. This breaks in two
        ways that are worth seeing before we go further.
      </p>
      <p>
        The first break is <strong>split brain</strong>. Suppose you have a
        leader. The network partitions. Now two partitions each think the
        other side is dead, and each elects its own leader. You now have two
        leaders accepting writes to the same logical object. When the
        partition heals, you have two histories and no honest way to merge
        them.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 340" title="split brain — two quorums that do not overlap" splitbrain />
        <Caption>
          A 6-node cluster partitions 3–3. Each side has a bare majority of
          its own partition and elects a leader. Both leaders accept
          conflicting writes. On heal, the system is in an inconsistent state
          with no deterministic resolution. Majority-of-the-whole is not
          majority-of-a-partition.
        </Caption>
      </Figure>

      <p>
        The fix to split brain is the <strong>quorum intersection</strong>{" "}
        idea: require a majority of the <em>whole</em> cluster, and force any
        two majorities to overlap in at least one node. With 5 nodes, any two
        3-node majorities share at least one node. That shared node is the
        witness that prevents two conflicting decisions. This is the single
        most important idea in the whole subject, and everything else is
        variations on it.
      </p>
      <p>
        The second break is subtler, and it is the one that leads to the
        impossibility result. In an <strong>asynchronous</strong> system,
        there is no bound on message delay. You cannot tell the difference
        between &quot;this node crashed&quot; and &quot;this node is very
        slow.&quot; A node that merely <em>might</em> have crashed can stall
        the algorithm forever, because you keep waiting for it, and if you
        give up and decide without it, you might violate agreement if it
        wakes up with a conflicting vote.
      </p>

      <h2>FLP: the proof that ruins the party</h2>
      <p>
        In 1985, Fischer, Lynch, and Paterson published a result that
        quietly ended a decade of optimism. The{" "}
        <strong>FLP impossibility</strong> says: in a purely asynchronous
        system, no deterministic consensus algorithm can simultaneously
        guarantee termination and tolerate even a single crash failure.
      </p>
      <p>
        The proof is a beautiful adversarial argument. You have a system
        state that is &quot;bivalent&quot; — it could still go to either of
        two decision values. The adversary shows it can always delay a
        message in just the right way to keep the system bivalent
        indefinitely. As long as there is one process whose messages you can
        delay, you can prevent any other process from ruling out either
        outcome. So the system never decides, and termination fails.
      </p>
      <p>
        Read it carefully: FLP does <em>not</em> say consensus is impossible.
        It says <strong>deterministic</strong> consensus with{" "}
        <strong>guaranteed termination</strong> in a{" "}
        <strong>purely asynchronous</strong> model is impossible. Every real
        system escapes FLP by weakening one of those adjectives:
      </p>
      <ul>
        <li>
          Add <strong>randomness</strong> (Ben-Or&apos;s algorithm). The
          adversary can&apos;t keep the system bivalent forever if a coin
          flip eventually breaks the tie.
        </li>
        <li>
          Assume <strong>partial synchrony</strong> (DLS, 1988): the system
          is asynchronous most of the time, but there are periods where
          messages arrive within some bound <code>Δ</code>. You don&apos;t
          need to know <code>Δ</code>; you just need it to eventually exist.
          This is the assumption every production system makes.
        </li>
        <li>
          Give up on <strong>guaranteed</strong> termination and accept
          termination with probability 1. Paxos and Raft both do this:
          they terminate as long as the stable leader can talk to a majority
          for long enough, which in practice is almost always.
        </li>
      </ul>
      <p>
        The deep takeaway: <strong>safety is a property of every
        execution; liveness is a property of executions that actually
        happen.</strong> You can guarantee the hard one (agreement) for free,
        in every model, with quorum intersection. You can only hope for the
        easy-looking one (termination) under extra assumptions. People get
        this backwards constantly.
      </p>

      <h2>Paxos: the algorithm nobody could teach</h2>
      <p>
        Lamport published Paxos in 1989 (1998 in journal form). It is built
        on the quorum-intersection idea, and it is correct, and for about
        twenty years it was the only game in town — and almost nobody
        understood it.
      </p>
      <p>
        The cast: <strong>Proposers</strong> propose values,{" "}
        <strong>Acceptors</strong> vote on them, <strong>Learners</strong>{" "}
        find out what was decided. The trick is a two-phase dance that makes
        it impossible to choose two different values:
      </p>
      <ol>
        <li>
          <strong>Phase 1 — Prepare/Promise.</strong> Proposer picks a
          unique, increasing ballot number <code>n</code> and sends{" "}
          <code>Prepare(n)</code> to a majority of acceptors. An acceptor
          promises not to accept any ballot smaller than <code>n</code>, and
          reports back any value it has already accepted in a previous
          ballot.
        </li>
        <li>
          <strong>Phase 2 — Accept/Accepted.</strong> The proposer takes the
          highest-numbered value reported by any acceptor (or its own value
          if none reported) and sends <code>Accept(n, value)</code> to a
          majority. Acceptors accept it (unless they&apos;ve promised
          something higher) and tell the learners.
        </li>
      </ol>

      <Figure>
        <Diagram viewBox="0 0 720 380" title="basic Paxos — the two-phase dance" paxos />
        <Caption>
          Two proposers can race, but the ballot numbering + the rule
          &quot;use the highest already-accepted value&quot; guarantees that
          once a majority accepts a value, any later proposer picks up that
          same value. Any two majorities share an acceptor; that acceptor
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
        <code>v</code>. So no conflicting value can ever be chosen. That is
        the whole proof.
      </p>
      <p>
        So why did everyone hate Paxos? Because the basic algorithm agrees
        on <em>a single value</em>. A database wants to agree on an ordered
        <em>log</em> of thousands of values. The extension to{" "}
        <strong>Multi-Paxos</strong> is &quot;obvious&quot; — make the
        proposer a stable leader and run phase 2 repeatedly for each log
        slot — and that obviousness hides roughly every engineering problem
        you will hit in production. Disk persistence of ballot numbers. Log
        catch-up for lagging followers. Snapshotting and log compaction.
        Membership changes. Leader election when the leader dies. Lamport&apos;s
        paper did not cover these. Google&apos;s{" "}
        <em>Paxos Made Live</em> (2007) is a 14-page confession of how much
        pain the &quot;obvious&quot; parts caused a very strong team.
      </p>
      <p>
        Lamport himself later wrote <em>Paxos Made Simple</em> (2001), a
        plain-English rewrite, because the original&apos;s fictional Greek
        island parliament made an already-hard algorithm{" "}
        <em>harder</em> to read. The rewrite is genuinely clear. The fact
        that it needed to exist is the indictment.
      </p>

      <h2>Raft: understandability as a design goal</h2>
      <p>
        In 2014, Ongaro and Ousterhout published Raft with one stated goal
        that no prior consensus paper had prioritized:{" "}
        <strong>understandability</strong>. They measured progress by how
        many students could answer questions about the algorithm after
        learning it. Raft is not more correct than Paxos. It is more
        learnable, and that turned out to matter more than anything else.
      </p>
      <p>
        The structural insight: decompose consensus into three sub-problems
        that you can understand one at a time.
      </p>
      <ul>
        <li>
          <strong>Leader election.</strong> One node is the leader; the
          others are followers. Time is divided into{" "}
          <strong>terms</strong>, each with at most one leader. A candidate
          wins an election by getting a majority of votes for its term. If
          it doesn&apos;t, a randomized election timeout makes split votes
          unlikely on the next round.
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
          mechanism is the same quorum-overlap argument as Paxos, just
          applied to log indices instead of bare values.
        </li>
      </ul>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="Raft — terms, elections, and log replication" raft />
        <Caption>
          Terms are logical time. Each term elects at most one leader. The
          leader&apos;s log is the source of truth; followers replicate. A
          newer leader always has all committed entries from prior terms —
          the election restriction (a candidate must have an up-to-date log
          to win) guarantees this. Conflicting entries from a stale leader
          get overwritten once the new leader replicates past that index.
        </Caption>
      </Figure>

      <p>
        The thing Raft gets right that Multi-Paxos papers hand-wave is the{" "}
        <strong>election restriction</strong>. A candidate can only win if
        its log is at least as up-to-date as a majority of the cluster. So
        any elected leader is guaranteed to contain every committed entry,
        which means a new leader never has to fetch missing data to become
        safe — it just needs to overwrite the uncommitted junk. That single
        rule replaces an entire category of recovery edge cases in Paxos
        implementations.
      </p>

      <h2>the parts the papers skip, that production cannot</h2>
      <p>
        Three things separate a textbook Raft from a Raft you would run:
      </p>
      <ul>
        <li>
          <strong>Log compaction / snapshots.</strong> You cannot keep every
          write in the log forever. Periodically, you take a snapshot of the
          applied state, write it to disk, and truncate the log up to that
          point. A follower that is hopelessly behind gets the snapshot via
          <code>InstallSnapshot</code>, not a million log entries. This is
          where most homegrown Rafts break.
        </li>
        <li>
          <strong>Membership changes.</strong> Adding or removing a node
          changes the definition of &quot;majority,&quot; and if you do it
          naively you can have two non-overlapping majorities active at
          once — i.e., split brain by construction. Raft&apos;s solution is{" "}
          <strong>joint consensus</strong>: a transitional configuration
          where a decision needs majorities of <em>both</em> the old and new
          cluster. Only once that stabilizes do you switch to the new
          configuration alone.
        </li>
        <li>
          <strong>Linearizability, and why you probably want it.</strong>{" "}
          Raft gives you a totally ordered log. Reads served by the leader
          are linearizable only if the leader first confirms it is still the
          leader (otherwise a stale leader from an old term can serve
          outdated reads). <code>ReadIndex</code> and{" "}
          <code>LeaseRead</code> are the two ways to make reads safe without
          writing to the log for every read.
        </li>
      </ul>

      <h2>the real world</h2>
      <p>
        A tour of who runs what:
      </p>
      <ul>
        <li>
          <strong>etcd / Consul / TiKV / CockroachDB</strong> — Raft. The
         Raft ecosystem is where most new systems land, because the paper
          plus Ongaro&apos;s thesis tell you enough to actually ship.
        </li>
        <li>
          <strong>ZooKeeper</strong> — Zab (Zookeeper Atomic Broadcast), a
          Paxos-family atomic broadcast protocol with a stable leader.
          Pre-dates Raft, solves the same problems, harder to learn.
        </li>
        <li>
          <strong>Spanner</strong> — Paxos per shard group. The paxos group
          elects a leader that serves writes; reads use TrueTime and
          replica timestamps for external consistency. The engineering
          around it is where Google&apos;s investment lives.
        </li>
        <li>
          <strong>Cassandra</strong> — Lightweight Transactions (LWT) =
          an in-cluster Paxos per partition, used for operations that need
          linearizability. Expensive (4 round trips in the worst case) and
          disabled by default, which tells you something.
        </li>
      </ul>

      <h2>what I wish someone had told me first</h2>
      <p>
        Two sentences that took me years to internalize:
      </p>
      <blockquote>
        Consensus is not about making nodes agree. It is about making them
        agree <em>while some of them are lying about whether they are
        alive</em>.
      </blockquote>
      <blockquote>
        Safety is a proof. Liveness is a hope. You pay in latency for the
        proof; you accept that the hope sometimes fails. Never the other way
        around.
      </blockquote>
      <p>
        Every distributed system I have liked working on has been an
        exercise in deciding which of the three FLP adjectives I am willing
        to weaken, and being honest with myself about which one it is. Paxos
        and Raft weaken termination and assume partial synchrony. CRDTs
        weaken safety and give you eventual consistency. Blockchain consensus
        weakens the fault model itself and assumes some nodes are actively
        malicious (Byzantine), which is why BFT consensus is a different,
        harder subject that needs its own post.
      </p>
      <p>
        The version of &quot;hard to corrupt&quot; that consensus buys you
        is the strongest one: a guarantee that holds across machine failures
        and network partitions, derived from a counting argument about
        overlapping majorities. It is one of the few places in engineering
        where a mathematical proof becomes a reliability number you can put
        on a dashboard. That is worth the price of admission.
      </p>
    </article>
  )
}
