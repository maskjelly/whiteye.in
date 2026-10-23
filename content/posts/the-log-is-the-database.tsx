import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "the-log-is-the-database",
  title: "the log is the database",
  date: "may 03, 2026",
  updated: "oct 23, 2026",
  description: "What survived a SQLite writer exit, then following recovery state through Postgres, an LSM tree, and Kafka.",
  readingTime: "13 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        I committed one row, then made the SQLite writer exit without closing its connection. Copying just the main database afterward gave me an empty table. Copying the same file with its WAL gave me the committed row. These were two copies of one stopped writer&apos;s files, after one successful commit.
      </p>

      <p>
        I wanted the empty table in the base file and the new row in WAL. The <a href="https://github.com/maskjelly/whiteye.in/blob/main/scripts/blog-sqlite-wal.py">reproduction</a> printed Python 3.14.5 and SQLite 3.53.1 for this run. I chose WAL mode with 4,096-byte pages. For sync I used FULL; for wal_autocheckpoint I used 0, keeping automatic checkpointing out of the commit. The child checkpoints its newly created table before it inserts anything. To leave the next change in WAL, I put os._exit(0) immediately after the insert&apos;s commit, before a connection close could checkpoint it. I get 8,192 bytes of main database and 4,152 bytes of WAL. The writer is gone before I start copying, so neither file can change underneath me.
      </p>
      <p>
        Neither copy got the -shm file. That omission was harmless here: SQLite could rebuild its index. The main-file-only copy had no such way to reconstruct the row I had left in WAL. The <a href="https://www.sqlite.org/wal.html">SQLite explanation</a> treats WAL as part of the saved database until a checkpoint moves the changes into the base file. That&apos;s what these two copies let me observe. I tested an abrupt process exit, with the machine still running. A power cut or a device ignoring sync would require another experiment.
      </p>
      <p>
        In the smaller <a href="https://github.com/maskjelly/whiteye.in/blob/main/scripts/blog-models.py">replay check</a>, the whole update is two assignments: A=1 and B=1. I keep changing what was already on the pages before replay. The (0, 0) run has both pages to update. With either mixed pair, (1, 0) or (0, 1), one assignment repeats a write that was already there. At (1, 1), both assignments do that. Replay still assigns 1 to both and finishes at (1, 1) in every run. Repeating either assignment causes no harm. This loop gets valid, complete records and whole page values as inputs. Validating WAL or repairing a torn page would take work it doesn&apos;t attempt.
      </p>
      <p>
        There is another input hiding in plain sight: those starting pages. For a
        real database, replay needs a suitable starting state and the records after
        it. Keeping only the current WAL directory would throw away part of what
        recovery needs. I find this a useful limit on the title of this post.
      </p>
      <p>
        Kreps&apos;s <a href="https://www.linkedin.com/blog/engineering/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying">essay on the log</a> helped me connect the logs I kept finding in storage and distributed systems. Several views can be built from the same ordered records. The SQLite copy makes me ask what else I have to save, and when I may throw an old record away. For Postgres that includes the data files. For a Kafka projection it might be a snapshot and retained events. Those surviving inputs determine whether the next replay can work.
      </p>

      <h2>what the two-page loop leaves out</h2>
      <p>
        Give A the role of a changed row and B its index entry on another page. If commit waits for both page writes, the client waits with it. WAL gives the database another route: put the recovery records into a sequential stream and persist them along with the commit record. It can then acknowledge the durable commit and let background writers catch up with the dirty pages. Several transactions may even share the flush through group commit. All of this still relies on storage doing what a successful flush promises.
      </p>
      <p>
        In Postgres I&apos;d draw the persistence arrows separately from the changes in RAM. A page may already be dirty in the buffer pool while its WAL isn&apos;t yet durable. Sending that page to disk has to wait for the corresponding WAL. Otherwise I could keep a change and lose the record needed to recover it. Sending an acknowledgment for a durable synchronous commit has to wait for the commit record&apos;s flush as well. Those are the two dependencies I take from the <a href="https://www.postgresql.org/docs/17/wal-intro.html">WAL documentation</a>.
      </p>
      <p>
        Suppose the heap page reached disk and the index page didn&apos;t. That&apos;s our (1, 0) case: redo can supply the missing index change from durable WAL. Reverse the persistence rule and we could instead save a changed page while losing its only recovery record with RAM. That&apos;s the case the write-ahead rule prevents. Postgres starts redo at the required recovery point and handles uncommitted work through transaction visibility. There is no general WAL undo pass to describe here.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="WAL-based recovery: data files and a log tail" logPlusIndex />
        <Caption>
          The data files supply a starting state and the retained WAL tail supplies
          the changes to replay. A replica needs a suitable starting copy too.
        </Caption>
      </Figure>

      <p>
        Restart already has the table and index files to work from. Redo begins at the required point in WAL and brings those pages forward; revisiting the database&apos;s first transaction would be needless. Now remove the data files entirely and keep only a recent WAL tail. There is no suitable starting database left for that tail to update. That&apos;s why I&apos;d keep a base copy in the backup plan. The buffered table and index files are also what ordinary reads use.
      </p>
      <p>
        After a checkpoint, replay need not start as far back: the files have made recorded progress. An older WAL segment can become unnecessary for recovery. That doesn&apos;t by itself authorize recycling it; replication or archiving may still need it. I&apos;d want to point to the saved state that makes each old segment disposable before trying to shrink the WAL directory.
      </p>
      <p>
        Moving checkpoints closer together means less replay after a crash and more page-writing work before it. There is a WAL cost too. With full-page writes enabled, the first modification of a page after a checkpoint saves an image of the whole page in WAL. A partially written page can then be repaired during recovery, a failure the two-value model never attempts. The <a href="https://www.postgresql.org/docs/17/wal-configuration.html">checkpoint documentation</a> describes this trade-off.
      </p>
      <p>
        Switch engines and I have to start this reconstruction again. Postgres leaves heap and index pages beside its WAL. With InnoDB I&apos;d inspect redo separately from MySQL&apos;s binary log used for replication. SQLite&apos;s choice of WAL mode or rollback journal changes the recovery path. RocksDB puts WAL beside sorted files. I need the record format and the files each procedure expects, not just a directory named log. A copy-on-write engine preserves its committed state through a different protocol again.
      </p>

      <h2>when the saved state is sorted files</h2>
      <p>
        The first RocksDB option I&apos;d check is <code>WriteOptions::sync</code>. Its <a href="https://github.com/facebook/rocksdb/wiki/basic-operations">basic operations guide</a> says a default write can return after handing the data to the OS; asking for sync makes it wait for the persistence step. So the file set alone isn&apos;t enough to interpret an acknowledgment. The default <a href="https://github.com/facebook/rocksdb/wiki/RocksDB-Overview">write path</a> has already put the change in WAL and in a memtable ordered by key. Let that in-memory table fill and a flush can save its records as an immutable SSTable, usually placed in level 0. Recovery needs WAL while those writes are not yet safe in the sorted files. The sorting is by key, whereas WAL keeps change order. That arrangement lets the engine write a sorted batch at a time.
      </p>
      <p>
        I added a small lookup to the model to see the deletion problem directly. The older run contains k=old. The newer one contains an unrelated key, so looking for k still returns old. Put a tombstone for k in the newer run and the result becomes absent. Remove just that tombstone and the lookup returns old again. The output is old, null, old. Maps stand in for the sorted runs here, with the newer map checked first; this is a point-lookup model, not a RocksDB run.
      </p>
      <p>
        The tombstone had been hiding a value that still existed. Before <a href="https://github.com/facebook/rocksdb/wiki/Compaction">compaction</a> discards it, the engine has to account for old files and snapshots that may still need those versions. Updates can leave old versions under the same constraints. I need to follow every still-reachable version before treating one record as garbage. A definite negative from a file&apos;s Bloom filter can let a lookup skip that file, but missing the key in a newer file is still no evidence of deletion.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="LSM tree — append, flush, compact" lsmTree />
        <Caption>
          Follow one write beyond the foreground operation. It can enter a flushed
          file and be rewritten through several compactions, even though the initial
          write avoided changing a disk block in place.
        </Caption>
      </Figure>

      <p>
        One application write may be finished while the storage engine still has a lot of writing ahead of it. First WAL, then a flushed SSTable, then whichever compactions rewrite that record: I&apos;d count the bytes at every step. That total gives write amplification relative to the logical write. Sequential I/O can improve throughput, but every rewrite still enters the byte count. The B-tree comparison needs its workload and configuration too, since a small change can require a whole-page write there.
      </p>
      <p>
        For read amplification I&apos;d follow a lookup, through whatever sorted runs an LSM needs or down the B-tree&apos;s path to a leaf. Counting those steps alone would miss what caching can save. The LSM might also get a definite negative from a Bloom filter and avoid a file entirely, which helps when the key is absent. For space amplification I&apos;d count more than live payload. The old versions and tombstones still take disk space while they wait for compaction to make them disposable. For the B-tree, I would count partly empty pages and fragmentation too. Those costs belong beside the write count.
      </p>
      <p>
        This makes a short ingestion run a poor basis for my comparison of RocksDB
        or Cassandra with Postgres or InnoDB. It can finish while compaction falls
        further behind each second. I&apos;d measure foreground latency alongside the
        background I/O over a run long enough to show whether that work keeps up.
        These are benchmark requirements, not measurements from the redo script.
      </p>

      <h2>how much input does a new search index need?</h2>
      <p>
        Kafka exposes retained records to independent applications. Search can build
        an index while analytics maintains its state, and a database or cache can
        hold another queryable projection. This is the log and its materialized views
        in Kreps&apos;s essay. For me, the useful check is whether the records can
        rebuild a view after its current representation is gone.
      </p>
      <p>
        The earliest retained offset is where a new search consumer can begin. I would list what the index needs and ask whether any required record has already expired. If nothing is missing, replaying the retained history can build it. Otherwise it needs a suitable snapshot plus the events after that snapshot. Calling the stream authoritative doesn&apos;t put an expired event back. A topic that lacks input needed for reconstruction is an incomplete backup.
      </p>
      <p>
        Ordering has a boundary here too. Producers append to partitions, and
        consumers record progress as offsets. A partition has an order; separate
        partitions provide no global sequence. Search and analytics also make their
        updates independently. Search may already reflect a change that analytics
        hasn&apos;t reached. An offset records that consumer&apos;s progress, without
        making both views advance atomically.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="the log as spine — one history, many views" logSpine />
        <Caption>
          Before rebuilding a view, account for its starting state and retained input.
          Search and analytics can be at different offsets in that input.
        </Caption>
      </Figure>

      <h2>the cancellation arrives twice</h2>
      <p>
        The script has one more loop. Begin with an open order and a zero counter, then deliver its cancellation twice. After both deliveries, the status is cancelled and the counter is 2. Repeating the assignment did no harm. Repeating the increment did. The record survived; that was never enough to decide what a second delivery should do.
      </p>
      <p>
        Before the consumer can make that mistake, the application has to get the cancellation out of Postgres. Try committing the order update and then publishing to Kafka. Stop the application between those calls: the order is cancelled, and nobody received the event. Try the reverse order and a consumer might act before a database transaction that later fails. Neither order joins the two writes into one transaction.
      </p>
      <p>
        A CDC connector can take over publication by following committed database changes. In Postgres, logical decoding turns WAL into row-level changes that Debezium can send to Kafka. The crash window then moves. Debezium&apos;s <a href="https://debezium.io/documentation/reference/stable/connectors/postgresql.html">Postgres connector documentation</a> includes the case where a connector emits an event but crashes before saving the source offset. It resumes from the offset it did save, and may therefore publish that event a second time. The cancellation consumer still has a job to do. For an end-to-end exactly-once claim, I&apos;d have to follow its effect as well as delivery, and keep the partition boundaries attached to any claim about order.
      </p>
      <p>
        For the counter, one possible fix is to store the applied event ID atomically with its effect. On retry, finding the ID would tell the consumer to skip the increment. That adds state and a requirement on the consumer&apos;s write. Assigning <code>cancelled</code> to the status had no such problem in the toy loop; it was already idempotent. I can&apos;t settle exactly-once effects by choosing connector settings alone.
      </p>
      <p>
        A row update also leaves me asking why it changed. CDC can only pass on what was recorded. For event sourcing, I would save the cancellation itself as a domain event, including the context its consumer needs. With an outbox, I can put an explicit event row in the same transaction as the order update. CDC can carry that row onward through Debezium&apos;s <a href="https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html">outbox event router</a>. The transaction has tied the order update to creation of its event. Delivery of that event may still repeat, which the consumer has to handle.
      </p>
      <p>
        Before replaying anything, I still need to know which records were allowed to become committed. Local WAL can recover changes after a crash. A Raft leader also needs agreement from replicas; its own append cannot establish commitment. PBFT has to carry evidence past replicas that send contradictory messages. CPU memory ordering concerns order at another boundary again. Cache coherence leaves nothing durable to replay after power loss.
      </p>
      <p>
        The SQLite main-file copy opened and returned zero rows. Supplying WAL brought the row back. For a recovery drill, I&apos;d start with a file list: the Postgres base copy and required WAL, or a Kafka projection&apos;s retained events and any compatible snapshot. Then rebuild using only that material. The two-page model was given its starting state and committed records, which is why it always reached (1, 1). Finding and retaining those inputs is work the model never had to do.
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
