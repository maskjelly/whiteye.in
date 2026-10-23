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
        A four-state RAID model rebuilt an untouched block as 0xeb instead of its
        original 0x35. Two combinations of old or new data and old or new parity gave
        that wrong answer. The script used no drive and injected no physical faults.
      </p>

      <p>
        I wanted to pin down what goes wrong between two writes that belong to one
        update. The <a href="https://github.com/maskjelly/whiteye.in/blob/main/scripts/blog-models.py">model
        script</a> uses D₁=0x35, D₂=0x9c, and D₃=0xa7. Their XOR parity is 0x0e.
        Changing D₂ to 0x42 requires new parity of 0xd0. Let each of those two writes
        persist or stay old, then reconstruct D₁ from the surviving blocks. Old data
        with old parity returns 0x35. New data with new parity also returns 0x35.
        Either mixed pair returns 0xeb.
      </p>
      <p>
        The script says nothing about crash likelihood: it works with whole blocks
        and has no device timing or physical power-cut test. Even within those limits,
        preserving each completed write is too weak a promise for an array: recovery
        can need several writes to agree with one another. D₁ was never part of the
        update, yet its reconstruction depends on how that update finished.
      </p>

      <h2>rebuilding the block we never changed</h2>
      <p>
        Updating one block in a RAID4 or RAID5 stripe also means updating the parity{" "}
        <code>P</code> shared by its data blocks. The read-modify-write starts by
        reading the old <code>D₂</code> and <code>P</code>. Calculate{" "}
        <code>P&apos; = P ⊕ D₂ ⊕ D₂&apos;</code>, then write <code>D₂&apos;</code> and{" "}
        <code>P&apos;</code>. The new data and its parity reach storage in separate writes.
        A power failure can leave either one unfinished.
      </p>
      <p>
        Suppose the new <code>D₂&apos;</code> survives and the old <code>P</code> remains.
        All the data blocks can still read back successfully. Without a scrub or
        consistency check, the parity mismatch can stay hidden until a degraded read
        or rebuild uses it.
      </p>
      <p>
        Now lose the disk holding <code>D₁</code>. The rebuild calculates{" "}
        <code>D₁* = P ⊕ D₂&apos; ⊕ D₃</code>. Substituting the old parity gives{" "}
        <code>D₁* = D₁ ⊕ D₂ ⊕ D₂&apos;</code>. The old and new second blocks don&apos;t
        cancel out. Their difference gets folded into the reconstructed first block.
        That is the RAID write hole, and it is exactly what the two mixed cases in the
        script expose.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="the RAID5 write hole" raidhole />
        <Caption>
          Start with <code>P = D₁ ⊕ D₂ ⊕ D₃</code>. The interrupted update leaves{" "}
          <code>D₂&apos;</code> beside the old parity. Readability of the individual blocks
          doesn&apos;t tell us whether their versions belong together.
        </Caption>
      </Figure>

      <p>
        What can recovery use to finish the update in those two bad states? Protected
        controller cache can retain unfinished writes, or a RAID journal can save the
        information needed to complete them. RAID-Z writes a new logical block as a
        full stripe with parity. ZFS copy-on-write leaves the old committed state
        available until the new blocks are committed, so it avoids overwriting a live
        stripe a piece at a time.
      </p>
      <p>
        The phrase &quot;copy-on-write&quot; alone leaves this question unanswered.
        The <a href="https://btrfs.readthedocs.io/en/latest/btrfs-man5.html#raid56-status-and-recommended-practices">Btrfs
        RAID56 documentation</a> records write-hole limitations. I would read the parity
        update protocol before trusting either design. Btrfs and ZFS differ there, and
        those steps decide which old/new combinations a crash can leave behind.
      </p>

      <h2>what did the write acknowledge?</h2>
      <p>
        The four-state model assumes that a write marked persistent really survives.
        An application has to establish that through the
        stack. An ordinary buffered <code>write()</code> can return after copying bytes
        into the kernel&apos;s page cache. Reading them back may use that same RAM. A
        byte-for-byte comparison can pass before the drive has received anything, so
        it cannot by itself distinguish a cached write from a persistent one.
      </p>
      <p>
        Finding a SQL injection in rice.edu at 17 got me thinking about trust
        boundaries. The question I find useful here is what the next layer actually
        agreed to do. Which failures will an acknowledged update survive? That is
        durability. Will a later read return the right bytes? That is integrity.
        Neither follows from a successful call to write.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 430" title="the storage stack, and who lies where" stack />
        <Caption>
          The page cache and the device cache can each hold the only volatile copy.
          Protected cache changes the power-loss boundary because it can retain that
          copy when power goes out.
        </Caption>
      </Figure>

      <p>
        A healthy drive and a correctly implemented filesystem can still lose bytes
        held only in the page cache. Sending them to the drive may leave them in its
        volatile write cache instead. To get past that cache, the OS needs a flush or
        force-unit-access operation that the device honors. A controller with protected
        cache can acknowledge persistence while the bytes are still cached: keeping
        them through power loss already fulfills that promise. Ordinary RAM cannot.
      </p>

      <h2>syncing the contents leaves the name to do</h2>
      <p>
        On Linux, the application normally asks for persistence with <a
        href="https://man7.org/linux/man-pages/man2/fsync.2.html"><code>fsync(fd)</code></a>.
        It sends the file&apos;s data and metadata through to storage and waits for the
        device to report completion. A successful write earlier doesn&apos;t spare us
        checking this return value. The failure may only turn up during writeback,
        when the cached bytes finally have to leave RAM.
      </p>
      <p>
        For a file replacement I would follow both objects that change. Write a
        temporary file, sync it, rename it over the destination, then sync the parent
        directory. At the file sync, the contents are covered but the later rename
        hasn&apos;t happened yet. Syncing the directory makes that name change durable.
        An atomic rename makes the name change indivisible for readers; it leaves the
        power-loss question to the sync protocol.
      </p>
      <p>
        Follow that request below the filesystem and it still ends at a device&apos;s
        completion report. The filesystem and block layer have to arrange their
        writes and cache operations correctly. If a controller acknowledges a flush
        while its only copy sits in unprotected RAM, their correct ordering cannot
        save the update after power loss.
      </p>
      <p>
        PostgreSQL&apos;s <a
        href="https://wiki.postgresql.org/wiki/Corruption">corruption guide</a> lists
        disabled syncing and storage that ignores write barriers among the causes of
        corruption. That is why I would trace the sync calls and acknowledgments
        before deciding where a lost write went wrong. Delayed allocation and write
        ordering are filesystem questions. Whether the controller kept its promise
        depends on its cache policy. The damaged file alone doesn&apos;t identify the
        culprit.
      </p>
      <p>
        FUA (Force Unit Access) attaches the persistence requirement to a particular
        write. Its completion must wait for that write to reach nonvolatile storage,
        which may include suitably protected cache. &quot;Bypass every cache&quot; would be
        the wrong requirement. A flush covers the relevant writes already cached and
        makes them persistent before acknowledging the command. A device&apos;s
        write-cache properties determine whether syncing a file needs that command.
      </p>
      <p>
        If the hardware supports disabling its volatile write cache, that removes one
        place bytes can disappear and may cost performance. Faulty controllers and
        faults elsewhere remain possible. Waiting for persistence takes time; journals
        and group commit let updates share a flush, and a separate journal device can
        change the cost. I would check which recovery records the batch has persisted
        before counting any transaction in it as durably acknowledged.
      </p>

      <h2>0xeb is a perfectly readable byte</h2>
      <p>
        The script can call 0xeb wrong because it keeps 0x35 as the expected value.
        An actual reader needs its own evidence. A read can succeed with wrong bytes
        after a firmware defect, an ECC miscorrection, or damage elsewhere in the I/O
        path. Retrying only calls that report errors won&apos;t catch this silent
        corruption. A checksum stored outside the component that failed gives the
        reader something to compare against.
      </p>
      <p>
        Magnetic media and flash develop errors, many of which the device&apos;s
        error-correcting codes recover. An unrecoverable read error at least tells the
        caller to seek another copy or reconstruct from the array. Silent corruption
        removes that warning. I care about the distinction because a recovery path
        that only runs after a reported error leaves successful-but-wrong reads alone.
      </p>
      <p>
        Prabhakaran and colleagues tested partial failures in <a
        href="https://research.cs.wisc.edu/adsl/Publications/iron-sosp05.pdf">IRON File
        Systems</a> (2005), injecting them beneath ext3, ReiserFS, JFS, and NTFS. The
        implementations they tested had inconsistent failure policies and bugs in
        some recovery paths. Those are findings about those tested implementations,
        but the question carries over: what happens to one bad block while the rest
        of the drive keeps working?
      </p>
      <p>
        A drive specification won&apos;t answer that recovery question. Some quote an
        unrecoverable-error figure of <code>1 in 10^14 bits read</code>, others{" "}
        <code>10^15</code> or better. I can convert <code>10^14</code> bits to about
        12.5 TB to get a sense of scale. What I cannot get from that figure is a
        failure date, or the independent error probabilities I would need to calculate
        rebuild risk. If a RAID5 disk is already gone, a surviving disk that cannot
        read a needed block may leave the array unable to reconstruct the affected data.
      </p>

      <h2>where did the expected value come from?</h2>
      <p>
        For a checksum to expose the wrong value, it has to be computed while the
        value is still right. Flip a value in RAM first and storage can preserve a
        matching pair of damaged data and checksum. A flipped pointer might crash
        the program; an ordinary data value could just look plausible. Computing
        another checksum on disk afterward won&apos;t recover what was lost in RAM.
      </p>
      <p>
        That puts RAM inside the integrity problem. The fault could be a
        radiation-induced upset or a persistent hardware problem; the rates depend
        on the hardware and environment. With common SEC-DED ECC, a single error
        within a protected word can be corrected and a double error detected. Larger
        patterns can exceed those guarantees and need stronger protection. I want
        ECC on a server holding data I care about, with monitoring for the errors it
        reports. PostgreSQL&apos;s <a
        href="https://www.postgresql.org/docs/18/wal-reliability.html">reliability
        documentation</a> assumes ECC RAM or better protection.
      </p>
      <p>
        Before relying on repair in <a href="https://www.filibeto.org/aduritz/truetrue/solaris10/zfs_last.pdf">ZFS</a>,
        Btrfs, Ceph, or GFS, I would ask where the checksum lives and how the system
        finds a good copy. All four check returned data and can seek a valid copy
        where their redundancy permits. Calling them all cryptographic Merkle trees
        skips the differences in their checksum layouts and repair paths.
      </p>
      <p>
        Even a Merkle tree leaves me with one value to trust: its root. The leaves
        hash data blocks, each parent hashes its children, and the root commits to
        everything below it. Change a block and verification along that path fails
        against the trusted root. A noncryptographic checksum may be enough for
        accidental corruption. To check deliberate replacement, I also need a
        suitable hash and a root the attacker cannot replace along with the data.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="Merkle tree — one root commits to every block" merkle />
        <Caption>
          Follow a block&apos;s hashes back to the trusted root to check it.
          Repair still needs a source of good bytes.
        </Caption>
      </Figure>

      <p>
        Suppose two mirrored copies disagree. With just those copies, which one
        should a reader trust? An independently stored checksum lets it test both,
        return a copy that verifies, and use that copy to repair the other. If neither
        verifies, the mirror cannot recover the block. Scrubbing does this checking
        for blocks that ordinary reads haven&apos;t touched recently, while there may
        still be a good copy to repair from.
      </p>
      <p>
        Some checks happen during the block transfer itself. T10 protection
        information, described in the <a
        href="https://www.kernel.org/doc/html/latest/block/data-integrity.html">Linux
        data-integrity documentation</a>, has an 8-byte field with a guard tag, an
        application tag, and a reference tag. DIF carries protection information with
        the block; DIX allows a separate representation in host memory. Supporting
        components can check it along that path. Filesystem checksums cover another
        part of the journey.
      </p>
      <p>
        I would follow any expected value back to where it was computed. A filesystem
        checksum can catch wrong bytes returned by a device, and a database can add
        page checks. TLS checks the transfer between its endpoints, leaving later
        disk storage outside that check. Checking end to end can expose faults missed
        by checks at individual hops, provided the expected value was right when the
        check began.
      </p>
      <p>
        The four-state RAID calculation settles one small question: mixed versions
        can corrupt reconstruction of an untouched block. It leaves the storage
        promises to test separately. For durability, I would cut power and compare
        recovered records with the writes acknowledged as durable. For integrity,
        I would damage bytes on the read path and check that the system reports an
        error or recovers a copy that verifies. Starting up again would tell me too
        little about either one.
      </p>

      <div className="correction">
        <strong>thanks:</strong> to the <a href="https://twitter.com/aaryantwt">draft readers</a> who
        caught my earlier conflation of DIF and DIX. I have separated protection
        information carried with the block from its representation in host memory.
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
