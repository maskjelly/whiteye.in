import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "your-storage-is-lying-to-you",
  title: "your storage is lying to you",
  date: "jun 07, 2026",
  updated: "oct 23, 2026",
  description: "Follow an acknowledged write through volatile caches, a broken RAID stripe, and a checksummed read to see what durability actually requires.",
  readingTime: "12 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        A program writes a record and gets a success response. Power fails; the record
        disappears. The drive may be healthy and the filesystem correct: an ordinary
        buffered write can succeed while the bytes are still in RAM. When can the
        application promise that the record will survive?
      </p>

      <p>
        Finding a SQL injection in rice.edu at 17 got me thinking about trust
        boundaries. Storage puts a similar question below the application: what does
        the next layer promise? Durability means an update acknowledged as durable
        survives a specified failure. Integrity means the bytes read back are the bytes
        that should be there. Neither guarantees the other.
      </p>

      <h2>what a successful write means</h2>
      <p>
        For a buffered file write, <code>write()</code> can return once the kernel has
        copied bytes into its page cache. Read the file back immediately and you may
        get that cached copy. The read-back can succeed without testing the drive at
        all.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 430" title="the storage stack, and who lies where" stack />
        <Caption>
          Page cache and volatile device cache can both hold acknowledged writes. A
          protected write cache survives power loss; ordinary RAM does not. The
          persistence boundary depends on the failure the system must survive.
        </Caption>
      </Figure>

      <p>
        Flushing the page cache may only move the bytes into a drive&apos;s volatile
        write cache. The OS still needs a flush or force-unit-access operation the
        device honors. A controller with protected cache can acknowledge persistence
        sooner because it can retain the bytes through power loss.
      </p>
      <p>
        None of those acknowledgments verifies a read next month. That needs an
        integrity check.
      </p>

      <h2>when a read returns the wrong bytes</h2>
      <p>
        Magnetic media and flash develop errors. Devices use error-correcting codes to
        recover from many of them; when correction fails, a drive may report an
        unrecoverable read error. At least the caller knows which read failed. A
        redundant array can then try to reconstruct the missing block.
      </p>
      <p>
        Silent corruption returns wrong bytes with a success status. An ECC
        miscorrection, a firmware defect, or damage elsewhere in the I/O path can cause
        it. Retrying failed reads won&apos;t catch it. To recognize the wrong block,
        the caller needs a reference such as a checksum kept outside the failing
        component.
      </p>
      <p>
        In <a
        href="https://research.cs.wisc.edu/adsl/Publications/iron-sosp05.pdf">IRON File
        Systems</a> (2005), Prabhakaran and colleagues injected partial disk failures
        beneath ext3, ReiserFS, JFS, and NTFS. The tested implementations had inconsistent
        failure policies and bugs in some recovery paths. A drive that mostly works
        still needs a defined path for a single bad block.
      </p>
      <p>
        Some drive specifications quote an unrecoverable-error limit of <code>1 in 10^14
        bits read</code>; others quote <code>10^15</code> or better. For scale, 10^14
        bits is about 12.5 TB. Neither figure predicts when a drive will fail or supplies
        independent error probabilities for a rebuild. After one RAID5 disk fails, an
        unreadable block on a surviving disk may prevent reconstruction of the affected
        data.
      </p>

      <h2>RAM needs error detection too</h2>
      <p>
        Data can be damaged before it reaches the drive. DRAM errors come from
        radiation-induced upsets as well as persistent hardware faults, with rates that
        depend on the hardware and environment. A flipped pointer can crash a process. A
        flipped value is harder to catch: the program can write it out with a freshly
        computed checksum that correctly describes the wrong value.
      </p>
      <p>
        A common ECC scheme, SEC-DED, provides single-error correction and double-error
        detection within a protected word. Larger error patterns can exceed that
        guarantee and require stronger protection.
      </p>
      <p>
        I want ECC on a server holding data I care about, along with monitoring for the
        errors it reports. PostgreSQL&apos;s <a
        href="https://www.postgresql.org/docs/18/wal-reliability.html">reliability
        documentation</a> assumes ECC RAM or better protection. Disk checksums cannot
        recover a value that was already wrong when it was checksummed.
      </p>

      <h2>the RAID write hole</h2>
      <p>
        In RAID4 or RAID5, a parity block <code>P</code> covers several data blocks.
        To update <code>D₂</code>, read-modify-write reads the old data and parity,
        calculates <code>P&apos; = P ⊕ D₂ ⊕ D₂&apos;</code>, then writes both{" "}
        <code>D₂&apos;</code> and <code>P&apos;</code>. A crash can separate those
        two writes.
      </p>
      <p>
        If only one reaches stable storage, parity no longer describes the stripe.
        Ordinary reads can hide the mismatch because they read data blocks directly. A
        later degraded read or rebuild may use stale parity and reconstruct incorrect
        contents for a missing block. A scrub or consistency check can catch the
        mismatch earlier.
      </p>
      <p>
        In the illustrated stripe, suppose <code>D₂&apos;</code> survives but <code>P&apos;</code> does
        not. If the disk containing <code>D₁</code> later fails, reconstruction computes
        {" "}<code> D₁* = P ⊕ D₂&apos; ⊕ D₃</code>. Substituting the old parity gives <code>
        D₁* = D₁ ⊕ D₂ ⊕ D₂&apos;</code>. The update to the second block has changed
        the reconstructed contents of the first.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="the RAID5 write hole" raidhole />
        <Caption>
          The stripe starts with <code>P = D₁ ⊕ D₂ ⊕ D₃</code>. Changing{" "}
          <code>D₂</code> requires changing <code>P</code> as well. An interrupted
          update can leave data and parity from different versions of the stripe.
        </Caption>
      </Figure>

      <p>
        A protected controller cache can retain unfinished writes; a RAID journal can
        preserve the information needed to finish or recover them. RAID-Z writes each
        new logical block as a full stripe with parity. ZFS retains the old committed
        state through copy-on-write while writing new blocks, avoiding the classic write
        hole from overwriting a live stripe in separate steps. Copy-on-write alone does
        not settle crash safety: the <a
        href="https://btrfs.readthedocs.io/en/latest/btrfs-man5.html#raid56-status-and-recommended-practices">Btrfs
        RAID56 documentation</a> describes its write-hole limitations. ZFS and Btrfs use
        different parity update protocols, which determine what a crash can leave behind.
      </p>

      <h2>what fsync depends on</h2>
      <p>
        On Linux, <a
        href="https://man7.org/linux/man-pages/man2/fsync.2.html"><code>fsync(fd)</code></a>{" "}
        flushes a file&apos;s data and metadata and waits for the device to report
        completion. Check its return value: an earlier successful write can still fail
        during writeback. The filesystem and block layer arrange the writes and cache
        operations, but a controller can falsely acknowledge the flush. If its only copy
        is in unprotected RAM, power loss can erase the update even when the filesystem
        followed its protocol.
      </p>
      <p>
        A common Linux file-replacement sequence writes and syncs a temporary file,
        renames it over the destination, then syncs the parent directory. The first sync
        protects file contents; the second protects the name change. Atomic rename alone
        does not make the replacement durable across power loss.
      </p>
      <p>
        The PostgreSQL wiki&apos;s <a
        href="https://wiki.postgresql.org/wiki/Corruption">corruption guide</a> lists
        disabled file syncing and storage that ignores write barriers among its causes.
        Delayed allocation and filesystem ordering are separate from a controller&apos;s
        cache policy. Tracing a lost write requires knowing what the application synced
        and what the hardware acknowledged. Corruption after a crash does not identify
        the broken promise by itself.
      </p>
      <p>
        At the device boundary, the relevant commands have different scopes:
      </p>
      <ul>
        <li>
          <strong>FUA, or Force Unit Access.</strong> The write must reach nonvolatile
          storage before completion. A suitably protected cache can satisfy this without
          a physical cache bypass.
        </li>
        <li>
          <strong>Cache flush.</strong> The device makes the relevant cached writes
          persistent before acknowledging the command. Whether the OS needs a flush
          during file sync depends on the device and its write-cache properties.
        </li>
        <li>
          <strong>Disabling a volatile write cache.</strong> On supported hardware, this
          removes one source of risk and may cost performance. It cannot fix a faulty
          controller or faults elsewhere in the stack.
        </li>
      </ul>
      <p>
        Waiting for persistence adds latency. Journals and group commit can let several
        updates share one flush; a separate journal device can change the cost too.
        Batching reduces the cost per transaction while still putting each acknowledged
        transaction&apos;s recovery records on stable storage.
      </p>

      <h2>checksums and repair</h2>
      <p>
        <a
        href="https://www.filibeto.org/aduritz/truetrue/solaris10/zfs_last.pdf">ZFS</a>{" "}
        and Btrfs use checksums to detect corruption, as do Ceph and GFS. Each checks
        returned bytes against expected contents and can seek a valid copy where its
        redundancy permits. Their layouts and repair paths differ; calling them all
        cryptographic Merkle trees obscures that.
      </p>
      <p>
        A Merkle tree puts hashes of data blocks at the leaves, then hashes children at
        each parent. One trusted root commits to the contents below it; changing a block
        breaks the check along its path to that root. Noncryptographic checksums can
        suffice for accidental corruption. Deliberate replacement requires a suitable
        hash and a root the attacker cannot replace too.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="Merkle tree — one root commits to every block" merkle />
        <Caption>
          A trusted root lets the reader verify a leaf by checking the hashes along its
          path. Repair still requires a good copy of the bytes.
        </Caption>
      </Figure>

      <p>
        A mirror alone cannot settle which of two disagreeing copies is right. An
        independently stored checksum lets the reader test both, return a verifying
        copy, and use it to repair the other. If neither verifies, the mirror has no
        good copy for recovery. A scrub checks blocks ordinary reads have not touched
        recently as well, to find damage while a good copy still exists.
      </p>
      <p>
        T10 protection information checks integrity closer to the block I/O path. The <a
        href="https://www.kernel.org/doc/html/latest/block/data-integrity.html">Linux
        data-integrity documentation</a> describes the familiar 8-byte field with a guard
        tag, an application tag, and a reference tag. DIF carries protection information
        with the block; DIX allows it to be represented separately in host memory.
        Components that support it can verify it during transfer. This complements
        filesystem checksums.
      </p>

      <h2>where to put the check</h2>
      <p>
        A filesystem checksum can catch incorrect bytes returned by a device; a database
        can add page checks. TLS protects the connection between its endpoints but
        cannot vouch for what a disk stores afterwards. End-to-end checks can cover
        failures a per-hop check misses. The reference value&apos;s origin determines
        what each check can catch.
      </p>
      <p>
        That gives me two checks for a storage design. After power loss, compare
        recovered records with the writes acknowledged as durable: every one must be
        present. Then exercise the read path with damaged bytes and check that it
        reports an error or recovers data that verifies. A successful restart alone
        proves neither.
      </p>

      <div className="correction">
        <strong>thanks:</strong> to the <a href="https://twitter.com/aaryantwt">draft readers</a> who
        caught the earlier conflation of DIF and DIX. The text now separates
        protection information carried with a block from its representation
        in host memory.
      </div>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Bonwick, J. &quot;ZFS: The Last Word in File Systems.&quot;
            Presentation slides.{" "}
            <a href="https://www.filibeto.org/aduritz/truetrue/solaris10/zfs_last.pdf">
              Archived PDF
            </a>
            . The checksum hierarchy, copy-on-write, and RAID-Z design.
          </li>
          <li>
            PostgreSQL wiki. &quot;Corruption.&quot;{" "}
            <a href="https://wiki.postgresql.org/wiki/Corruption">
              wiki.postgresql.org
            </a>
            . Hardware faults, unsafe sync settings, and storage that ignores barriers.
          </li>
          <li>
            PostgreSQL 18 documentation. &quot;Reliability.&quot;{" "}
            <a href="https://www.postgresql.org/docs/18/wal-reliability.html">
              postgresql.org
            </a>
            . Volatile caches, write integrity, and the assumption of ECC memory.
          </li>
          <li>
            SNIA. &quot;T10 Protection Information (DIF/DIX)&quot; technical
            note.{" "}
            <a href="https://www.snia.org/education_sites/storage_networking_primer/protect_info">
              snia.org
            </a>
            .
          </li>
          <li>
            Prabhakaran, V. et al. &quot;IRON File Systems&quot; (SOSP
            2005).{" "}
            <a href="https://research.cs.wisc.edu/adsl/Publications/iron-sosp05.pdf">
              PDF
            </a>
            . Fault injection and recovery policies in the filesystems tested in 2005.
          </li>
          <li>
            Linux man-pages. <a href="https://man7.org/linux/man-pages/man2/fsync.2.html">fsync(2)</a>.
            File synchronization, directory entries, and writeback errors.
          </li>
          <li>
            Linux kernel documentation. <a href="https://www.kernel.org/doc/html/latest/block/data-integrity.html">Data
            Integrity</a>. Protection information and its representation in the host I/O
            path.
          </li>
        </ol>
      </section>
    </article>
  )
}
