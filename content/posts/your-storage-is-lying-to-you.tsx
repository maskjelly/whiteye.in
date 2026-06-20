import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "your-storage-is-lying-to-you",
  title: "your storage is lying to you",
  date: "jun 07, 2026",
  description:
    "On bit rot, cosmic rays, the RAID5 write hole, the fsync contract that is not as airtight as you think, and how ZFS and Btrfs actually stay honest.",
  readingTime: "13 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        Disks flip bits and do not tell anyone. Controllers report writes that
        never reached the platter. RAID arrays rebuild from parity that was
        never consistent to begin with. The scary part is not the failure. It
        is the silence. Your data is wrong, and every layer between you and the
        rust swears it is fine.
      </p>

      <p>
        I started caring about this when I was 17 and found a SQL injection in
        rice.edu. That was a different kind of corruption, but it got me
        reading about trust boundaries, and storage is the deepest one. A
        storage stack is a pile of abstractions, each of which is willing to
        lie to the one above it in order to feel fast. This post is me
        walking that stack and naming the lies.
      </p>

      <h2>the three liars</h2>
      <p>
        When you call <code>write()</code> and it returns, almost nothing has
        happened. What actually stands between your bytes and the magnetic
        domains (or floating gates) that will outlive your process:
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 430" title="the storage stack, and who lies where" stack />
        <Caption>
          Each layer can report success before the layer below has done its
          job. Durability is the property of the bottom layer. Every layer
          above is a cache that is willing to pretend otherwise.
        </Caption>
      </Figure>

      <p>
        The three places that habitually lie:
      </p>
      <ul>
        <li>
          <strong>The OS page cache.</strong> Your <code>write()</code> often
          just copies bytes into RAM and returns. The kernel will flush it
          later, maybe. A power loss between &quot;write returned&quot; and
          &quot;kernel flushed&quot; loses the data.
        </li>
        <li>
          <strong>The device write cache.</strong> Even after the kernel
          flushes, the drive frequently accepts the bytes into its own
          volatile RAM and reports done. A power loss here loses data the OS
          already thought was safe.
        </li>
        <li>
          <strong>The media itself.</strong> A sector that reads back wrong
          without an error code. This is the worst one, and it gets its own
          section.
        </li>
      </ul>

      <h2>bit rot</h2>
      <p>
        A platter degrades. A flash cell loses charge. A cosmic ray hits a
        cell and flips it. The drive&apos;s internal ECC corrects small errors
        transparently (you never see it) until one day the error exceeds the
        code&apos;s correction capacity. Two things can happen, and only one
        of them is honest:
      </p>
      <ul>
        <li>
          The drive gives up and returns an unrecoverable read error (URE).
          Painful, but honest. You know the block is gone.
        </li>
        <li>
          The drive&apos;s ECC silently miscorrects and returns the wrong
          bytes with no error flag at all. This is silent data corruption.
          You will not find out until something downstream explodes.
        </li>
      </ul>
      <p>
        Consumer SATA drives quote a URE rate around{" "}
        <code>1 in 10^14 bits read</code>, roughly one unrecoverable read per
        every 12 TB of reads. Enterprise drives quote <code>10^15</code> or
        better. During a RAID rebuild you read the entire remaining array,
        and at <code>10^14</code> a rebuild of a 12 TB array has a coin-flip
        chance of hitting a URE. This is why people who care do not run RAID5
        at any meaningful scale.
      </p>

      <h2>cosmic rays and the case for ECC</h2>
      <p>
        DRAM is not durable either. A neutron from a cosmic ray shower can
        strike a memory cell and flip a bit. The often-quoted soft error rate
        for non-ECC DRAM at sea level is on the order of one bit flip per 256
        MB per month. This varies hugely with altitude (a data center in Denver
        sees several times the rate of one in Mumbai) and cell geometry. Most
        flips hit unused memory and never matter. A few hit a pointer. A
        handful hit a parity bit and corrupt a transfer you will never trace
        back.
      </p>
      <p>
        The fix is ECC memory: a Hamming-style code that stores a few parity
        bits per 64-bit word and does SEC-DED, single-error correction,
        double-error detection. One flipped bit gets corrected on the fly.
        Two flipped bits get detected and raise an error instead of silently
        returning wrong data. Three or more, you lose, but three independent
        flips in one word is vanishingly rare.
      </p>
      <p>
        The fact that consumer platforms spent years shipping without ECC, and
        marketing non-ECC as a &quot;gaming&quot; feature, is one of the
        quieter scandals in the industry. If you run anything that holds state
        that matters, you want ECC. The cost is trivial. The benefit is that
        an entire class of silent corruption becomes a correctable, logged
        event. Linus Torvalds went on a rant about this on LKML in 2012 and he
        was right.
      </p>

      <h2>the RAID write hole</h2>
      <p>
        RAID4 and RAID5 compute a parity block <code>P</code> across a stripe
        of data blocks. To update one data block <code>D₂</code> without
        rewriting the whole stripe, you do the read-modify-write dance: read
        <code>D₂</code>, read <code>P</code>, compute{" "}
        <code>P&apos; = P ⊕ D₂ ⊕ D₂&apos;</code>, write{" "}
        <code>D₂&apos;</code> and <code>P&apos;</code>. Two writes.
      </p>
      <p>
        If power dies between those two writes, the stripe is left
        inconsistent: <code>P</code> no longer matches the data. The array
        will keep serving reads happily. Parity is not checked on read, only
        on rebuild. So you sail along with a quietly broken stripe until a
        disk fails and you rebuild, at which point the rebuild
        &quot;corrects&quot; good data using bad parity, and you have
        corrupted a block that was never wrong.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="the RAID5 write hole" raidhole />
        <Caption>
          A stripe with data <code>D₁ D₂ D₃</code> and parity{" "}
          <code>P = D₁ ⊕ D₂ ⊕ D₃</code>. Updating <code>D₂</code> requires
          writing both <code>D₂&apos;</code> and <code>P&apos;</code>. A
          crash between the two leaves parity stale. Undetected until a
          rebuild uses it to &quot;fix&quot; healthy blocks.
        </Caption>
      </Figure>

      <p>
        ZFS and Btrfs close this by never doing partial parity updates the way
        classic RAID does. They write whole new copies of a stripe
        (copy-on-write) and only flip the pointer once everything is
        consistent. The old stripe stays intact until the new one is committed.
      </p>

      <h2>the fsync contract is not airtight</h2>
      <p>
        <code>fsync(fd)</code> is supposed to be the moment you can trust the
        bytes are on stable storage. The POSIX text says it forces the
        file&apos;s data and metadata to be flushed to the device, and does not
        return until the device says it is done. The catch is the last clause:
        until the device says it is done. If the device is lying about its
        write cache, <code>fsync</code> is a polite request, not a guarantee.
      </p>
      <p>
        This has bitten real systems in production. The canonical example is
        PostgreSQL on EXT4 in 2009. EXT4, with its default{" "}
        <code>data=ordered</code> mode, would delay allocating the data blocks
        of a newly created file. On a crash it could leave the file full of
        zeros, including the renamed WAL file Postgres was relying on for
        durability. Postgres lost data that, by its own accounting, had
        already been <code>fsync</code>&apos;d. The fix was a combination of
        filesystem behavior changes and database-side workarounds. The broader
        lesson is that <code>fsync</code> alone is not a contract you can
        trust without knowing the storage stack underneath.
      </p>
      <p>
        How to actually get durability:
      </p>
      <ul>
        <li>
          <strong>FUA</strong> (Force Unit Access). A write that bypasses the
          device&apos;s volatile cache and goes straight to media. The honest
          version of a write.
        </li>
        <li>
          <strong>CACHE FLUSH.</strong> A command that tells the drive to
          drain its volatile cache to media and only acknowledge once done.
          <code>fsync</code> should issue this. Whether it actually does, and
          whether the drive actually honors it, is the question.
        </li>
        <li>
          <strong>Disable the drive write cache entirely.</strong> Slow,
          honest, and the only thing some drives actually respect.
        </li>
      </ul>
      <p>
        The cost is real. Flushing serializes writes and kills throughput.
        That tension, durability wants synchronous and throughput wants
        batched, is the reason journals, group commit, and separate journal
        devices exist. You batch the slow operation so you can afford to do it
        honestly.
      </p>

      <h2>how honest systems work</h2>
      <p>
        The systems that actually stay honest, ZFS, Btrfs, Ceph and GFS&apos;s
        checksumming, share one idea: checksums end-to-end, organized as a
        Merkle tree.
      </p>
      <p>
        Every block of data gets a cryptographic hash. Every group of blocks
        gets a hash of its children&apos;s hashes. Recurse to the root. The
        root hash commits to the entire tree. Change one byte anywhere and the
        root changes.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="Merkle tree — one root commits to every block" merkle />
        <Caption>
          Corrupting a single leaf changes its hash, which changes its parent,
          which changes the root. A read verifies the block against the root
          by walking one path. If the stored root is trusted, a single bad
          block cannot hide.
        </Caption>
      </Figure>

      <p>
        On every read, the filesystem recomputes the block&apos;s hash and
        walks it up to the root. If it does not match, the block is corrupt.
        If there is redundancy (a mirror, or a parity copy that is itself
        checksummed), the system fetches a good copy, hands it to you, and
        heals the bad one in the background. This is self-healing, and it is
        the difference between a system that detects corruption and one that
        corrects it.
      </p>
      <p>
        There is an even more aggressive version: T10 DIF/DIX, which appends
        an 8-byte integrity field to every sector on the wire (a guard tag,
        an application tag, and a reference tag) so that a block arriving at
        the media is already self-describing and gets verified at every hop,
        not just by the filesystem on top. The principle is the same: verify
        at the boundary, do not trust the layer below.
      </p>

      <h2>the pattern I keep seeing</h2>
      <p>
        I did not plan for this post to connect to the others, but it does.
        Checksums live at the top because the filesystem knows the device
        lies. End-to-end integrity beats hop-by-hop because each hop can lie,
        and only the endpoints know the full contract. A database does not
        trust the OS page cache. The OS does not trust the drive cache. TLS
        verifies at the application boundary, not the link layer. Every
        system that is hard to corrupt does the same thing: it assumes the
        layer below is dishonest and checks at its own boundary with
        something the layer below cannot fake.
      </p>
      <p>
        I think this is the only design pattern that actually works for
        integrity. Every alternative I have seen is a slower version of the
        same idea or a faster version that does not work.
      </p>

      <div className="correction">
        <strong>thanks:</strong> to <a href="https://twitter.com/aaryantwt">people who read drafts</a> of
        this and pointed out I was conflating T10 DIF and DIX, which are
        related but not the same thing. DIF puts the integrity field in the
        sector on the wire. DIX separates it into a separate memory buffer
        that the HBA verifies. The distinction matters if you are implementing
        it. I have collapsed them here for readability.
      </div>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Bonwick, J. et al. &quot;ZFS: The Last Word in File Systems&quot;
            (2007).{" "}
            <a href="https://www.usenix.org/legacy/events/lisa07/tech/full_papers/bonwick/bonwick.pdf">
              PDF
            </a>
            . Still the best explanation of end-to-end checksumming in a real
            filesystem.
          </li>
          <li>
            PostgreSQL wiki. &quot;Corrupt data after power failure on
            ext4.&quot;{" "}
            <a href="https://wiki.postgresql.org/wiki/Corrupt_data_after_power_failure_on_ext4">
              wiki.postgresql.org
            </a>
            . The 2009 incident, documented by the people it happened to.
          </li>
          <li>
            Torvalds, L. &quot;ECC memory and Intel&quot; (LKML thread, Jan
            2012).{" "}
            <a href="https://yarchive.net/comp/linux/ecc.html">
              yarchive.net archive
            </a>
            . The rant about consumer platforms dropping ECC.
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
            Prabhakaran, V. et al. &quot;IRON File Systems&quot; (SIGOS
            2005).{" "}
            <a href="https://research.cs.wisc.edu/adsl/Publications/iron-sosp05.pdf">
              PDF
            </a>
            . The paper that systematically studied what filesystems do when
            the disk lies. Worth reading if this post was interesting.
          </li>
        </ol>
      </section>
    </article>
  )
}
