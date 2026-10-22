import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "the-log-is-the-database",
  title: "the log is the database",
  date: "may 03, 2026",
  updated: "oct 23, 2026",
  description: "What a log lets you rebuild, what must survive beside it, and how recovery changes between Postgres, an LSM tree, and Kafka.",
  readingTime: "12 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        A transaction can commit while its changed table pages are still in RAM. The
        database first makes their recovery records durable in a write-ahead log.
        After a crash, it can redo the changes, but how much state can that retained
        log recover?
      </p>

      <p>
        I kept running into logs while reading about storage and distributed systems.
        Kreps&apos;s <a
        href="https://www.linkedin.com/blog/engineering/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying">essay
        on the log</a> gave me a way to connect them: save ordered records, then build
        the state you need from those records. Recovery puts limits on that idea:
        Postgres still needs its data files, and a Kafka consumer needs enough retained
        input. A log cannot replay records that have been discarded.
      </p>

      <h2>a log and the state it protects</h2>
      <p>
        A WAL-based engine serves reads from table and index files. Recovery starts at
        a known point and replays the required WAL tail over those files. Earlier work
        is already in the checkpointed state; replay need not start at the database&apos;s
        first transaction. Today&apos;s WAL files alone cannot restore a lost database.
        The state they build on must survive too.
      </p>
      <p>
        Postgres pairs a WAL with heap and index pages. InnoDB has a redo log, alongside
        MySQL&apos;s separate binary log for replication. SQLite offers WAL mode or a
        rollback journal, and RocksDB combines a WAL with sorted files. The record
        formats and recovery requirements differ. Copy-on-write engines use another
        commit protocol to preserve durable state.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="WAL-based recovery: data files and a log tail" logPlusIndex />
        <Caption>
          Log records reach durable storage before the data pages they protect.
          Recovery needs those data files and the required log tail. Replication can
          reuse the records if the follower has a suitable starting copy.
        </Caption>
      </Figure>

      <h2>why write the log first</h2>
      <p>
        A transaction changes a row and an index entry on another page. Waiting for both
        pages to reach disk before commit puts both writes on the client&apos;s
        critical path. The WAL collects recovery records into a sequential stream.
        Once those and the commit record are durable, the database can acknowledge the
        transaction and write the dirty pages later.
      </p>
      <p>
        <a
        href="https://www.postgresql.org/docs/17/wal-intro.html">PostgreSQL&apos;s WAL
        documentation</a> requires recovery records to be flushed before the data pages
        they protect. Pages can already be changed in RAM; &quot;write ahead&quot;
        refers to persistence. Raft also uses an ordered log, but a leader&apos;s local
        append is insufficient to establish cluster agreement on committed commands.
      </p>

      <h2>what the WAL saves you from</h2>
      <p>
        With Postgres configured for durable commits:
      </p>
      <ol>
        <li>
          The transaction changes pages in the buffer pool and generates WAL. Those
          pages are now dirty.
        </li>
        <li>
          Before a dirty page can be written to disk, its WAL records must be durable.
          Before acknowledging a synchronous commit, the database also flushes the
          transaction&apos;s commit record.
        </li>
        <li>
          The client receives the acknowledgment; background writers and checkpoints
          can finish writing the data pages afterwards.
        </li>
        <li>
          After a crash, recovery redoes records from the required recovery point.
          Postgres handles uncommitted work through transaction visibility rules rather
          than a general WAL undo pass.
        </li>
      </ol>
      <p>
        Suppose the changed heap page survives a crash but the index page still has its
        old contents. Recovery can redo the missing index change because its records
        were durable before either page was written. Allowing pages to reach disk first
        would leave a window for a change to survive while its recovery record vanished
        with RAM.
      </p>
      <p>
        Group commit can make several transactions&apos; queued commit records durable
        with one flush. It reduces the cost per transaction, provided storage honors the
        flush; the data pages can still be written later.
      </p>
      <p>
        A checkpoint establishes how far the data files have caught up and records where
        replay must begin. Postgres can recycle older WAL once recovery and consumers
        such as replication or archiving no longer need it. Its <a
        href="https://www.postgresql.org/docs/17/wal-configuration.html">checkpoint
        documentation</a> describes the tradeoff: more frequent checkpoints mean less
        replay work and more page writes. They also increase WAL traffic when full-page
        writes are enabled: the first page change after a checkpoint logs a full-page
        image to protect against partial page writes.
      </p>

      <h2>the LSM tree</h2>
      <p>
        A log-structured merge tree batches writes in memory, then flushes sorted,
        immutable SSTables. The WAL protects writes until they reach those files. An
        SSTable&apos;s key order supports lookups; the WAL records changes in
        chronological order.
      </p>
      <p>
        By default, a <a
        href="https://github.com/facebook/rocksdb/wiki/RocksDB-Overview">RocksDB</a>{" "}
        write enters the WAL and a sorted memtable; durability depends on the WAL sync
        settings. A full memtable flushes to an SSTable, usually at level 0. Reads may
        search both memory and several files, with Bloom filters ruling out files that
        cannot contain the key.
      </p>
      <p>
        Updates leave multiple versions of a key until <a
        href="https://github.com/facebook/rocksdb/wiki/Compaction">compaction</a> can
        remove the old ones. Deletion writes a tombstone because an older file may
        still contain the value. Drop the tombstone too soon and that value can reappear
        on a lookup. Compaction merges sorted files and removes obsolete records only
        when snapshots and the remaining files no longer need them.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="LSM tree — append, flush, compact" lsmTree />
        <Caption>
          Each write avoids an in-place disk update, but compaction later reads and
          rewrites the records, sometimes repeatedly. Sequential writes improve
          throughput while leaving background I/O to pay for.
        </Caption>
      </Figure>

      <p>
        The postponed work shows up in three kinds of amplification:
      </p>
      <ul>
        <li>
          <strong>Write amplification.</strong> One logical write can enter the WAL, an
          SSTable flush, and several compaction rewrites. B-trees also write whole pages
          for smaller changes. The workload and configuration decide which engine
          writes fewer bytes.
        </li>
        <li>
          <strong>Read amplification.</strong> A B-tree follows a path to a leaf. An LSM
          lookup may search several sorted runs. Caches and Bloom filters can avoid much
          of that I/O, especially for keys that are absent.
        </li>
        <li>
          <strong>Space amplification.</strong> LSMs retain old values and tombstones
          until compaction can remove them. B-trees lose space to fragmentation and
          partially filled pages. Both store more than the live payload.
        </li>
      </ul>
      <p>
        RocksDB and Cassandra are useful LSM implementations to study alongside
        page-based designs such as Postgres and InnoDB. A fair comparison has to measure
        foreground latency and the background I/O needed to sustain it. A short ingestion
        test can finish with a backlog of compaction still growing.
      </p>

      <h2>Kafka</h2>
      <p>
        Kafka exposes the retained stream as a service. A search index and an analytics
        pipeline can read the same records, keep their own state, and advance at
        different rates. Kreps describes this as a log and its materialized views:
        records can outlive a particular representation.
      </p>
      <p>
        Producers append to partitions; consumers track offsets. Records are ordered
        within a partition. Separate partitions provide no global sequence, and
        retention limits how far back replay can go. If the stream is an
        application&apos;s authoritative input, its views depend on what remains:
      </p>
      <ul>
        <li>
          A database can hold a queryable projection of a topic and rebuild it from
          retained events, provided they contain everything the projection needs.
        </li>
        <li>
          Other consumers can build a cache or analytics view from the same input.
          Offsets show each consumer&apos;s progress. Search may reflect an event that
          analytics has not consumed yet; sharing a topic does not make their updates
          atomic.
        </li>
        <li>
          A new consumer can replay from the earliest retained offset. Rebuilding from
          the beginning needs enough history or a starting snapshot. If earlier records
          have expired, the topic alone is an incomplete backup.
        </li>
      </ul>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="the log as spine — one history, many views" logSpine />
        <Caption>
          Each view advances through the same retained stream independently. Its
          recoverability depends on the scope of ordering and how much history remains.
        </Caption>
      </Figure>

      <h2>getting database changes into the stream</h2>
      <p>
        An application commits an order cancellation in Postgres, then publishes it to
        Kafka. A crash between the two leaves a cancelled order and no event for other
        services. Reverse the order and consumers may act on a transaction that never
        commits. Change data capture (CDC) follows committed database changes to avoid
        this application-level dual write.
      </p>
      <p>
        Postgres logical decoding exposes row-level changes from the WAL; Debezium can
        publish them to Kafka. Its <a
        href="https://debezium.io/documentation/reference/stable/connectors/postgresql.html">Postgres
        connector documentation</a> describes the retry window: events may be emitted
        before the connector saves its source offset. After a crash, it can emit those
        events again when it resumes from the saved offset. CDC alone does not guarantee
        exactly-once delivery, and partitioning still decides which events stay ordered.
      </p>
      <p>
        Setting the order&apos;s state to <code>cancelled</code> again can be harmless.
        Incrementing a cancellation counter again counts a second effect. The consumer
        needs an idempotent update, or it must record each applied event atomically with
        its effect. An end-to-end exactly-once claim has to cover that write as well as
        the connector&apos;s delivery settings.
      </p>
      <p>
        CDC history also differs from event sourcing. A row update records a storage
        change; a domain event records an action, such as an order cancellation, and the
        context consumers need. Write that event into an outbox table in the same
        transaction as the order update, then let CDC publish it. Debezium&apos;s <a
        href="https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html">outbox
        event router</a> supports this pattern. The transaction ties state to event;
        consumers still need retry handling. Watching arbitrary row changes cannot
        recover business intent the application never recorded.
      </p>

      <p>
        The failure model sets the promise. A WAL protects changes a local crash might
        lose. Raft helps replicas agree on commands; PBFT must also tolerate replicas
        sending conflicting messages. CPU memory ordering is concerned with order too,
        but coherence leaves no durable history after power loss.
      </p>
      <p>
        I still look for the log early when reading a design. Then I follow what happens
        when old records are deleted. Postgres needs a suitable base copy and the
        required WAL. A Kafka projection needs enough retained events, or a compatible
        snapshot and the events after it. Identify the checkpoint, snapshot, or retained
        starting state before removing history, then test recovery using only that state
        and the records the system promises to keep.
      </p>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            PostgreSQL documentation. <a href="https://www.postgresql.org/docs/17/wal-intro.html">Write-Ahead
            Logging</a> and <a href="https://www.postgresql.org/docs/17/wal-configuration.html">WAL
            Configuration</a>. The page-write rule, group commit, and checkpoints.
          </li>
          <li>
            RocksDB project. Overview and technical presentations.{" "}
            <a href="https://github.com/facebook/rocksdb/wiki/RocksDB-Overview">Overview</a>{" "}
            and <a href="https://github.com/facebook/rocksdb/wiki/RocksDB-Talks">
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
            . Partitioned logs and independent consumers in the original Kafka design.
          </li>
          <li>
            Kreps (2013). &quot;The Log: What every software engineer should
            know about real-time data&apos;s unifying abstraction.&quot;{" "}
            <a href="https://www.linkedin.com/blog/engineering/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying">
              LinkedIn Engineering Blog
            </a>
            . The post that made me start thinking this way.
          </li>
          <li>
            Debezium documentation.{" "}
            <a href="https://debezium.io/documentation/reference/stable/connectors/postgresql.html">
              PostgreSQL connector
            </a>{" "}
            and <a href="https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html">Outbox
            Event Router</a>. Saved offsets, duplicate events after a crash, and
            publishing application events from an outbox table.
          </li>
          <li>
            Ongaro, Ousterhout (2014). &quot;In Search of an Understandable
            Consensus Algorithm&quot; (extended version), Section 7 on log
            compaction.{" "}
            <a href="https://raft.github.io/raft.pdf">
              raft.github.io
            </a>
            . Snapshotting and bringing lagging followers up to date.
          </li>
        </ol>
      </section>
    </article>
  )
}
