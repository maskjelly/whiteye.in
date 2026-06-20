import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "the-log-is-the-database",
  title: "the log is the database",
  date: "may 03, 2026",
  description:
    "On the write-ahead log, the LSM tree, Kafka, and CDC. The one abstraction that ties storage, consensus, and streaming together.",
  readingTime: "11 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        Every database you have ever used is, at its core, a log. The tables
        you query are a convenience, a materialized view of that log, kept up
        to date so you do not have to replay history on every read. The
        write-ahead log, the Raft log, the Kafka topic, the event-sourcing
        journal: all the same shape, serving the same purpose, at different
        scales.
      </p>

      <p>
        I did not write this post to make a grand point. I wrote it because I
        kept noticing the same data structure showing up in every system I
        read about, and writing it down helped me understand why.
      </p>

      <h2>the claim</h2>
      <p>
        A database is two things: an append-only log that records every state
        change, and a set of indexes that materialize the current state for
        fast reads. The log is the truth. The indexes are a cache. On every
        write, you append to the log and update the indexes. On every crash,
        you replay the log to reconstruct the indexes. On every replication,
        you ship the log to a follower.
      </p>
      <p>
        This is not a metaphor. It is the literal architecture of Postgres
        (WAL + heap), MySQL (redo log + binlog + buffer pool), SQLite (WAL +
        b-tree), RocksDB (WAL + LSM), and every other durable storage engine
        you can name. The differences are in the shape of the index and the
        strategy for keeping it consistent with the log.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="a database is a log plus indexes" logPlusIndex />
        <Caption>
          A write lands in the log first (durable, append-only, fast). The
          index updates from the log. On crash, the index is rebuilt by
          replaying the log tail. On replication, the follower consumes the
          same log. The log is the source of truth. Everything else is
          derivable.
        </Caption>
      </Figure>

      <h2>why the log comes first</h2>
      <p>
        The log solves two problems at once that are hard to solve any other
        way. The first is durability. Appending to a log is a single
        sequential write, which is the cheapest durable operation on any
        medium. Updating a b-tree in place is many random writes and a lot of
        bookkeeping. Doing it durably on every transaction would be slow. So
        you write the log first (one fsync), tell the client &quot;committed,&quot;
        and update the b-tree lazily in memory. If you crash before the b-tree
        is flushed, you replay the log and rebuild.
      </p>
      <p>
        The second is order. A log is a total order on events. In a
        single-node database that total order is trivial, it is the append
        order. In a distributed system, the total order is the whole point. It
        is what makes a group of machines agree on a single history. This is
        why Raft&apos;s log and Postgres&apos;s WAL are the same data structure
        wearing different hats. Raft uses the log to make multiple machines
        agree. Postgres uses it to make one machine survive a crash. The
        mechanism, an append-only, totally ordered sequence of records, is
        identical.
      </p>

      <h2>the WAL</h2>
      <p>
        Postgres calls it the WAL. MySQL calls it the redo log (and
        separately, the binlog for replication). SQLite calls it the WAL too.
        The pattern is universal:
      </p>
      <ol>
        <li>
          A transaction modifies pages in an in-memory buffer pool. The pages
          are dirty but not yet written to disk.
        </li>
        <li>
          Before the transaction commits, its changes are appended to the log
          and the log is flushed. This is the fsync from the storage post.
          This is where that contract matters.
        </li>
        <li>
          The commit returns. The dirty pages may not be on disk yet. They
          will be written later by a background process (the checkpointer).
        </li>
        <li>
          On crash recovery, the database reads the log, redoes any
          transactions whose changes did not make it to the data files, and
          undoes any that were not committed. The index is consistent with the
          log again.
        </li>
      </ol>
      <p>
        The optimization this enables, group commit, is the reason databases
        can be both durable and fast. Many transactions append their records
        to the log in a batch, and a single fsync commits all of them. The
        cost of the honest flush is amortized across the group. Same principle
        as journaling in filesystems: batch the slow, honest operation so you
        can afford to do it honestly.
      </p>

      <h2>the LSM tree</h2>
      <p>
        A b-tree database has a log (the WAL) and an index (the b-tree). The
        LSM tree asks a different question: what if the index is a log? What
        if we never update in place at all, and instead make the whole storage
        engine append-only?
      </p>
      <p>
        An LSM (Log-Structured Merge) tree writes everything into an in-memory
        memtable (a sorted structure). When the memtable fills, it is flushed
        to disk as an immutable SSTable (Sorted String Table) at level 0. As
        SSTables accumulate, a background compaction process merges them into
        larger, sorted files at deeper levels, discarding overwritten and
        deleted keys. Reads check the memtable, then the SSTables from
        shallowest to deepest, using bloom filters to skip files that
        definitely do not contain the key.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="LSM tree — append, flush, compact" lsmTree />
        <Caption>
          Writes are always sequential appends. Never a random in-place
          update. The cost moves from the write path to the read path (you may
          check several files) and to the background compaction (which
          rewrites files as they merge). This is the write-optimized extreme.
          A b-tree is the read-optimized extreme.
        </Caption>
      </Figure>

      <p>
        The tradeoff has three names:
      </p>
      <ul>
        <li>
          <strong>Write amplification:</strong> how many bytes get written to
          disk per byte of logical write. LSM is low (one append). A b-tree is
          high (page reads, page writes, split propagation).
        </li>
        <li>
          <strong>Read amplification:</strong> how many I/Os per read. A
          b-tree is low (a root-to-leaf traversal). LSM is higher (memtable +
          several SSTables, mitigated by bloom filters).
        </li>
        <li>
          <strong>Space amplification:</strong> how much extra space is used.
          LSM has stale copies of overwritten keys until compaction. A b-tree
          is compact (in-place updates). Compaction is the tax you pay for the
          cheap writes.
        </li>
      </ul>
      <p>
        Pick your engine by your workload. Write-heavy, append-mostly, or
        time-series: LSM (RocksDB, Cassandra, InfluxDB). Read-heavy,
        point-lookup-heavy, with a working set that fits in RAM: B-tree
        (Postgres, MySQL/InnoDB). Most OLTP workloads are the second, which is
        why Postgres is the default and RocksDB is the specialization.
      </p>

      <h2>Kafka</h2>
      <p>
        If the log is the source of truth and the tables are materialized
        views, there is no reason the log has to live inside the database. You
        can externalize it. A dedicated log system that other systems
        subscribe to. That is Kafka.
      </p>
      <p>
        Kafka is a log, partitioned for scale, replicated for durability, with
        a consumer protocol for reading it back in order. Producers append.
        Consumers read at their own pace. The log retains history for as long
        as you configure. Once you have it, the architecture shifts:
      </p>
      <ul>
        <li>
          Your database becomes a materialized view of a Kafka topic, not the
          other way around.
        </li>
        <li>
          Multiple downstream systems (search index, cache, analytics
          warehouse, ML feature store) can all consume the same log and build
          their own projections, all consistent because they share the source.
        </li>
        <li>
          You can replay history: spin up a new consumer at offset zero and
          rebuild a view from scratch. The log is the backup. The views are
          disposable.
        </li>
      </ul>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="the log as spine — one history, many views" logSpine />
        <Caption>
          The log is the committed history. Every downstream system is a
          projection. A Postgres table, a Raft log, and a Kafka topic are all
          logs at different scopes: one machine&apos;s durability, a
          cluster&apos;s agreement, and an organization&apos;s event backbone.
        </Caption>
      </Figure>

      <h2>CDC</h2>
      <p>
        Change Data Capture is the technique that connects the in-database
        log to the external log. Instead of application code writing to both
        Postgres and Kafka (the &quot;dual write&quot; bug factory, you will
        eventually write to one and not the other and silently diverge), CDC
        reads the database&apos;s own WAL and publishes every committed change
        to Kafka. The database is the source of truth. Kafka is the fan-out.
      </p>
      <p>
        Postgres has logical replication (decoding the WAL into a row-level
        change stream). Debezium is the standard connector that turns that
        stream into Kafka events. The guarantee you get is meaningful: every
        change that committed in the database arrives in Kafka, in commit
        order, exactly once. No dual writes, no divergence, no &quot;the
        cache is stale and I do not know why.&quot;
      </p>
      <p>
        This is also the honest way to do event sourcing if you must. The
        event log is the truth. The read models are projections. The database
        is an event log that happens to also serve as a queryable store. The
        architecture is the same. The framing is different.
      </p>

      <p>
        I keep coming back to the log because it is the one data structure
        that shows up unchanged across every layer of the stack. The storage
        post&apos;s durability is implemented by a WAL. The consensus
        post&apos;s agreement is implemented by a replicated log. The
        memory-ordering post&apos;s publish pattern is, at the hardware level,
        a log of coherence events. The BFT post&apos;s PBFT is a log agreed on
        by nodes that do not trust each other.
      </p>
      <p>
        A log is an append-only, totally ordered sequence of records. That is
        the whole definition. Everything else (durability, replication,
        consensus, streaming, event sourcing) is what you build on top of it.
        The reason it keeps appearing is that a log is the simplest structure
        that gives you both an order and a history. Order lets multiple things
        agree. History lets you recover and replay.
      </p>
      <p>
        When I look at a new system now, the first question I ask is: where is
        the log? If the answer is &quot;there isn&apos;t one,&quot; I ask how
        it survives a crash. If the answer involves anything other than
        replaying a committed history, I get nervous. I am not sure this
        heuristic has ever been wrong.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Ousterhout (2015). &quot;A Technical Overview of RocksDB.&quot;{" "}
            <a href="https://github.com/facebook/rocksdb/wiki/RocksDB-Talks">
              GitHub wiki
            </a>
            . The LSM tradeoffs (write/read/space amplification) are
            explained well here.
          </li>
          <li>
            Kreps, Narkhede, Rao (2011). &quot;Kafka: a Distributed Messaging
            System for Log Processing.&quot;{" "}
            <a href="http://notes.stephenholiday.com/Kafka.pdf">
              PDF
            </a>
            . The original Kafka paper. Short. The log-as-backbone idea is
            explicit.
          </li>
          <li>
            Kreps (2014). &quot;The Log: What every software engineer should
            know about real-time data&apos;s unifying abstraction.&quot;{" "}
            <a href="https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying">
              LinkedIn Engineering Blog
            </a>
            . The post that made me start thinking this way.
          </li>
          <li>
            Debezium documentation.{" "}
            <a href="https://debezium.io/documentation/">
              debezium.io
            </a>
            . The standard CDC connector for Postgres/MySQL/etc.
          </li>
          <li>
            Ongaro. &quot;Consensus: Bridging Theory and Practice&quot; (Raft
            thesis), Chapter 5 on log compaction.{" "}
            <a href="https://raft.github.io/raft.pdf">
              raft.github.io
            </a>
            . The log management chapter that most Raft papers skip.
          </li>
        </ol>
      </section>
    </article>
  )
}
