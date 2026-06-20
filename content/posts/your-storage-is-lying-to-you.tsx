import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "your-storage-is-lying-to-you",
  title: "your storage is lying to you",
  date: "jun 07, 2026",
  description:
    "Bit rot, cosmic rays, the RAID write hole, and the fsync contract that isn't. A tour of the quiet ways data corrupts itself — and the principle behind every system that actually stays honest.",
  readingTime: "13 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        Disks flip bits and don&apos;t tell anyone. Controllers report writes
        that never reached the platter. RAID arrays rebuild from parity that
        was never consistent to begin with. The scary part is not the
        failure — it is the silence. Your data is wrong, and every layer
        between you and the rust swears it is fine.
      </p>

      <p>
        I spend a lot of time thinking about systems that are hard to corrupt.
        Storage is the canonical case study, because it is a stack of
        abstractions each of which is willing to lie to the one above it in
        order to feel fast. Let&apos;s walk the stack and name the lies.
      </p>

      <h2>the three liars</h2>
      <p>
        When you call <code>write()</code> and it returns, almost nothing has
        happened. Here is what actually stands between your bytes and the
        magnetic domains (or floating gates) that will outlive your process:
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 430" title="the storage stack, and who lies where" stack />
        <Caption>
          Each layer can report success before the layer below has done its
          job. Durability is the property of the bottom layer; every layer
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
          volatile RAM and reports <em>done</em>. A power loss here loses
          data the OS already thought was safe.
        </li>
        <li>
          <strong>The media itself.</strong> A sector that reads back wrong
          without an error code. This is the worst one, and it gets its own
          section.
        </li>
      </ul>

      <h2>bit rot: the slow, quiet flip</h2>
      <p>
        A platter degrades. A flash cell loses charge. A cosmic ray hits a
        cell and flips it. The drive&apos;s internal ECC corrects small
        errors transparently — you never see it — until one day the error
        exceeds the code&apos;s correction capacity. Two things can happen
        there, and only one of them is honest:
      </p>
      <ul>
        <li>
          The drive gives up and returns an <strong>unrecoverable read
          error</strong> (URE). Painful, but honest. You know the block is
          gone.
        </li>
        <li>
          The drive&apos;s ECC silently miscorrects and returns{" "}
          <strong>the wrong bytes</strong> with no error flag at all. This is{" "}
          <em>silent data corruption</em>. You will not find out until
          something downstream explodes.
        </li>
      </ul>
      <p>
        Consumer SATA drives quote a URE rate around{" "}
        <code>1 in 10¹⁴ bits read</code> — roughly one unrecoverable read per
        every 12 TB of reads. Enterprise drives quote <code>10¹⁵</code> or
        better. During a RAID rebuild you read the entire remaining array,
        and at <code>10¹⁴</code> a rebuild of a 12 TB array has a coin-flip
        chance of hitting a URE. This is why people who care do not run
        RAID5 at any meaningful scale.
      </p>

      <h2>cosmic rays and the case for ECC</h2>
      <p>
        DRAM is not durable either. A neutron from a cosmic ray shower can
        strike a memory cell and flip a bit. The often-quoted soft error rate
        for non-ECC DRAM at sea level is on the order of{" "}
        <strong>one bit flip per ~256 MB per month</strong> — with the
        caveat that it varies hugely with altitude (a data center in Denver
        sees several times the rate of one in Mumbai), altitude, and cell
        geometry. Most flips hit unused memory and never matter. A few hit a
        pointer. A handful hit a parity bit and corrupt a transfer you will
        never trace back.
      </p>
      <p>
        The fix is <strong>ECC memory</strong>: a Hamming-style code that
        stores a few parity bits per 64-bit word and does{" "}
        <strong>SEC-DED</strong> — single-error correction, double-error
        detection. One flipped bit gets corrected on the fly. Two flipped
        bits get detected and raise an error instead of silently returning
        wrong data. Three or more, you lose — but three independent flips in
        one word is vanishingly rare.
      </p>
      <p>
        The fact that consumer platforms spent years shipping{" "}
        <em>without</em> ECC, and marketing non-ECC as a &quot;gaming&quot;
        feature, is one of the quieter scandals in the industry. If you run
        anything that holds state that matters, you want ECC. The cost is
        trivial; the benefit is that an entire class of silent corruption
        becomes a correctable, logged event.
      </p>

      <h2>the RAID write hole</h2>
      <p>
        RAID4 and RAID5 compute a parity block <code>P</code> across a stripe
        of data blocks. To update one data block <code>D₂</code> without
        rewriting the whole stripe, you do the read-modify-write dance:
        read <code>D₂</code>, read <code>P</code>, compute{" "}
        <code>P&apos; = P ⊕ D₂ ⊕ D₂&apos;</code>, write <code>D₂&apos;</code>{" "}
        and <code>P&apos;</code>. Two writes.
      </p>
      <p>
        If power dies between those two writes, the stripe is left
        inconsistent: <code>P</code> no longer matches the data. The array
        will keep serving reads happily — parity is not checked on read,
        only on rebuild. So you sail along with a quietly broken stripe
        until a disk fails and you rebuild, at which point the rebuild
        &quot;corrects&quot; good data using bad parity, and you have
        corrupted a block that was never wrong.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="the RAID5 write hole" raidhole />
        <Caption>
          A stripe with data <code>D₁ D₂ D₃</code> and parity{" "}
          <code>P = D₁ ⊕ D₂ ⊕ D₃</code>. Updating <code>D₂</code> requires
          writing both <code>D₂&apos;</code> and <code>P&apos;</code>. A
          crash between the two leaves parity stale — undetected until a
          rebuild uses it to &quot;fix&quot; healthy blocks.
        </Caption>
      </Figure>

      <p>
        This is the <strong>RAID write hole</strong>. ZFS and Btrfs close it
        by never doing partial parity updates the way classic RAID does —
        they write whole new copies of a stripe (copy-on-write) and only
        flip the pointer once everything is consistent. The old stripe stays
        intact until the new one is committed.
      </p>

      <h2>the fsync contract is a lie</h2>
      <p>
        <code>fsync(fd)</code> is supposed to be the moment you can trust the
        bytes are on stable storage. The POSIX text says it forces the
        file&apos;s data and metadata to be flushed to the device, and does
        not return until the device says it is done. The catch is the last
        clause: <strong>until the device says it is done</strong>. If the
        device is lying about its write cache, <code>fsync</code> is a
        polite request, not a guarantee.
      </p>
      <p>
        This has bitten real systems in production. The canonical example:
        PostgreSQL on EXT4 in 2009. EXT4, with its default{" "}
        <code>data=ordered</code> mode, would delay allocating the data
        blocks of a newly created file, and on a crash could leave the file
        full of zeros — including the renamed WAL file Postgres was relying
        on for durability. Postgres lost data that, by its own accounting,
        had already been <code>fsync</code>&apos;d. The fix was a combination
        of filesystem behavior changes and database-side workarounds, and the
        broader lesson was that <code>fsync</code> alone is not a contract
        you can trust without knowing the storage stack underneath.
      </p>
      <p>
        How to actually get durability:
      </p>
      <ul>
        <li>
          <strong>FUA</strong> (Force Unit Access) — a write that bypasses
          the device&apos;s volatile cache and goes straight to media. The
          honest version of a write.
        </li>
        <li>
          <strong>CACHE FLUSH</strong> — a command that tells the drive to
          drain its volatile cache to media and only acknowledge once done.
          <code>fsync</code> should issue this; whether it actually does, and
          whether the drive actually honors it, is the question.
        </li>
        <li>
          <strong>Disable the drive write cache entirely.</strong> Slow,
          honest, and the only thing some drives actually respect.
        </li>
      </ul>
      <p>
        The cost is real: flushing serializes writes and kills throughput.
        That tension — durability wants synchronous, throughput wants
        batched — is the whole reason journals, group commit, and separate
        journal devices exist. You batch the slow operation so you can
        afford to do it honestly.
      </p>

      <h2>how honest systems work</h2>
      <p>
        The systems that actually stay honest — ZFS, Btrfs, the design of
        Ceph and GFS&apos;s checksumming — share one idea:{" "}
        <strong>checksums end-to-end, organized as a Merkle tree</strong>.
      </p>
      <p>
        Every block of data gets a cryptographic hash. Every group of blocks
        gets a hash of its children&apos;s hashes. Recurse to the root. The
        root hash commits to the entire tree: change one byte anywhere, and
        the root changes.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="Merkle tree — one root commits to every block" merkle />
        <Caption>
          Corrupting a single leaf changes its hash, which changes its
          parent, which changes the root. A read verifies the block against
          the root by walking one path. If the stored root is trusted, a
          single bad block cannot hide.
        </Caption>
      </Figure>

      <p>
        On every read, the filesystem recomputes the block&apos;s hash and
        walks it up to the root. If it does not match, the block is corrupt
        — and if there is redundancy (a mirror, or a parity copy that is
        itself checksummed), the system fetches a good copy, hands it to
        you, and heals the bad one in the background. This is{" "}
        <strong>self-healing</strong>, and it is the difference between a
        system that detects corruption and one that corrects it.
      </p>
      <p>
        There is an even more aggressive version: <strong>T10 DIF/DIX</strong>,
        which appends an 8-byte integrity field to every sector on the wire
        — a guard tag (CRC), an application tag, and a reference tag — so
        that a block arriving at the media is already self-describing and
        gets verified at every hop, not just by the filesystem on top. The
        principle is identical: verify at the boundary, never trust the
        layer below.
      </p>

      <h2>the principle: never trust the layer below</h2>
      <p>
        Strip out the storage specifics and the design rule is general and
        worth memorizing:
      </p>
      <blockquote>
        Every layer is an optimist. The only way to be sure a thing happened
        is to verify it yourself, at your own boundary, with a check the
        layer below cannot fake.
      </blockquote>
      <p>
        This is why checksums live at the top (the filesystem knows the
        device lies) and why end-to-end integrity beats hop-by-hop
        integrity (each hop can lie; only the endpoints know the full
        contract). It is why TLS verifies at the application boundary and
        not at the link layer. It is why a database does not trust the OS
        page cache, and why the OS does not trust the drive cache.
      </p>
      <p>
        It is also, more or less, the definition of a system that is hard to
        corrupt: one where no single layer&apos;s dishonesty can make the
        whole lie stick, because the layer above is checking.
      </p>
      <p>
        The disk will flip your bits. The controller will lie about flushes.
        The parity will go stale. The question is never{" "}
        <em>whether</em> the layers below will misbehave — it is whether the
        system above was built assuming they would.
      </p>
    </article>
  )
}
