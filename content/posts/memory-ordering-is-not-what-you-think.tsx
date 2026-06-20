import { Figure, Diagram, Caption } from "@/components/figure"

export const meta = {
  slug: "memory-ordering-is-not-what-you-think",
  title: "memory ordering is not what you think",
  date: "may 14, 2026",
  description:
    "Why your CPU reorders your instructions, what x86 TSO actually permits, why ARM breaks code that worked fine on Intel, and the one litmus test that will save you a week of debugging a lock-free queue.",
  readingTime: "12 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        Your compiler reorders your code. Your CPU reorders your code. Your
        cache reorders your code. The memory you think you wrote is, in
        various real senses, not there yet. And yet most programs work,
        because for decades the dominant CPU was unusually well-behaved. That
        is changing, and the cracks are where the interesting bugs live.
      </p>

      <h2>the myth, and the machine underneath it</h2>
      <p>
        The myth is that instructions execute in the order you wrote them.
        They do not. The machine underneath is a deeply pipelined,
        out-of-order, superscalar engine that will execute any two
        independent instructions in either order, in parallel, or both,
        whichever is faster — and it will only put them back in program order
        at the very end, for <em>your</em> thread, observed from{" "}
        <em>your</em> thread.
      </p>
      <p>
        The catch is that last clause. <strong>Program order is guaranteed
        for a single thread observing itself.</strong> It is{" "}
        <em>not</em> guaranteed for another thread watching the same memory.
        What thread B sees, when it reads the addresses thread A wrote, is
        defined by a <strong>memory model</strong> — a formal contract
        between the CPU and the programmer about which reorderings the
        hardware may perform, and which it may not.
      </p>
      <p>
        Every architecture has a different one. x86 has a strong model
        called TSO. ARM has a weak (relaxed) model. The difference is not
        theoretical: code that has been running correctly on Intel for a
        decade will sporadically lose messages on a Graviton or an M-series
        core, and the bug will not reproduce under a debugger because the
        reorderings only happen when the stars align.
      </p>

      <h2>the store buffer: why all of this exists</h2>
      <p>
        The root cause is a small piece of hardware called the{" "}
        <strong>store buffer</strong>. A store to memory is expensive: even
        an L1 hit is ~4 cycles, and a cache line that needs to be fetched
        before write is much worse. To avoid stalling the pipeline on every
        store, the CPU writes the store into a per-core buffer and moves on.
        The buffer drains to the cache asynchronously, when the cache line is
        available and coherence permits.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="the store buffer — stores defer, loads hurry" storebuffer />
        <Caption>
          A store goes into the buffer and the core continues. A subsequent
          load from the same core, to a different address, can execute
          immediately — it does not wait for the store to drain. From the
          core&apos;s own viewpoint, program order is preserved (store-buffer
          forwarding makes its own stores visible to its own loads). From
          another core, the store is not visible yet. That gap is the entire
          memory-ordering problem.
        </Caption>
      </Figure>

      <p>
        Two consequences fall out of this design, and both are load-bearing:
      </p>
      <ul>
        <li>
          <strong>Store-buffer forwarding.</strong> A core always sees its
          own most recent store, even if it hasn&apos;t drained to cache. So
          a single thread never observes its own stores out of order. The
          madness only starts when a second thread is involved.
        </li>
        <li>
          <strong>A later load can pass an earlier store</strong> (to a
          different address), because the load doesn&apos;t wait for the
          store&apos;s buffer to drain. This is the{" "}
          <em>only</em> reordering x86 permits, and it is the one that breaks
          code that assumed &quot;stores are visible immediately.&quot;
        </li>
      </ul>

      <h2>x86 TSO: the strong model that is not sequential</h2>
      <p>
        x86&apos;s model is <strong>TSO</strong> (Total Store Order),
        formalized by Owens, Sarkar, and Sewell in 2009. The name is three
        guarantees and one allowance:
      </p>
      <ul>
        <li>
          <strong>Total Store Order:</strong> stores from a single core
          become visible to other cores in the order they were issued. No
          store-store reordering.
        </li>
        <li>
          <strong>Loads do not reorder with loads.</strong> Load-load
          preserved.
        </li>
        <li>
          <strong>Loads do not reorder with earlier stores.</strong>{" "}
          Load-after-store (to any address) preserved — wait, this needs
          care; read on.
        </li>
        <li>
          <strong>The one allowance:</strong> a load may be reordered after
          an earlier store to a <em>different</em> address. This is the
          store-buffer effect: the load runs while the store is still in the
          buffer.
        </li>
      </ul>
      <p>
        The fourth bullet is the whole relaxivity of x86. Everything else is
        sequentially consistent. That makes x86 feel safe — and it is,
        mostly. The trap is that &quot;mostly&quot; is not a memory model.
      </p>

      <h2>ARM: relaxed, and honest about it</h2>
      <p>
        ARM permits much more. Store-Store, Load-Load, Load-Store, and
        Store-Load can all be reordered, subject to explicit dependency
        ordering (a load that depends on a prior load&apos;s address is
        ordered; a store that depends on a prior load&apos;s value is
        ordered; etc). The model is described as a long list of allowed
        reorderings plus a set of barrier and acquire/release instructions
        that restore ordering where you need it.
      </p>
      <p>
        The practical effect: on ARM, two consecutive stores to different
        addresses can be observed by another core in either order. On x86
        they cannot. If you wrote a flag-then-data pattern and relied on
        x86&apos;s store-store ordering, your code is correct on Intel and
        subtly broken on every ARM server in the cloud. This is why Apple
        Silicon and AWS Graviton have been a slow-motion reckoning for a lot
        of lock-free code.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 340" title="what may reorder — x86 TSO vs ARM relaxed" reorderTable />
        <Caption>
          Read the table as &quot;may the first op be reordered after the
          second?&quot; The single green cell in the x86 column is the
          entire difference between x86 and sequential consistency. The ARM
          column is almost all green — you get to choose what stays ordered,
          via barriers or acquire/release.
        </Caption>
      </Figure>

      <h2>the litmus test that pays the rent</h2>
      <p>
        Stop reading for a second and look at this. Two threads, two shared
        variables, both initialized to zero.
      </p>
      <pre>
        <code>{`// x and y initially 0

// Thread 0            // Thread 1
x = 1;                 r1 = y;
y = 1;                 r2 = x;`}</code>
      </pre>
      <p>
        Question: can <code>r1 = 1, r2 = 0</code> ever happen? That is, can
        Thread 1 see the write to <code>y</code> but miss the write to{" "}
        <code>x</code>, even though Thread 0 wrote <code>x</code> first?
      </p>
      <ul>
        <li>
          <strong>On x86 TSO:</strong> <em>No.</em> Thread 0&apos;s stores
          are ordered (store-store preserved). If Thread 1 sees{" "}
          <code>y = 1</code>, then <code>x = 1</code> must already be
          visible. So <code>r2</code> must read 1. The forbidden outcome is
          genuinely forbidden. No barrier needed.
        </li>
        <li>
          <strong>On ARM relaxed:</strong> <em>Yes.</em> The two stores can
          be observed in either order. Thread 1 can see <code>y = 1</code>{" "}
          while <code>x</code> is still 0 in its cache. The forbidden
          outcome is allowed. To forbid it you need a barrier between the
          two stores, or you write the second store with release semantics.
        </li>
      </ul>
      <p>
        This is the <strong>message-passing</strong> pattern, and it is the
        single most important litmus test in concurrent programming. It
        shows up everywhere: publishing a pointer and a ready flag,
        enqueueing an item and incrementing a count, writing a struct and
        setting its valid bit. The producer does the data store first and the
        flag store second. The consumer reads the flag first and the data
        second. On x86 it works for free. On ARM it is broken without a
        barrier, and the breakage is rare and non-reproducible.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="message passing — the outcome that shouldn't be possible" litmusMP />
        <Caption>
          The producer stores data then flag. The consumer loads flag then
          data. The forbidden outcome <code>r1=1, r2=0</code> (&quot;I saw
          the flag but not the data&quot;) is impossible on x86 and merely
          unlikely on ARM. A release store on the flag + an acquire load on
          the flag closes the window on every architecture.
        </Caption>
      </Figure>

      <h2>what a barrier actually does</h2>
      <p>
        A memory barrier is not magic. It is an instruction that tells the
        CPU &quot;drain whatever is in your store buffer before proceeding
        past this point&quot; (a store barrier), or &quot;don&apos;t let any
        load cross this point until earlier loads have completed&quot; (a
        load barrier), or both (a full barrier). On x86, that&apos;s{" "}
        <code>mfence</code>, <code>sfence</code>, <code>lfence</code>. On
        ARM, it&apos;s <code>dmb</code>, <code>dsb</code>, <code>isb</code>,
        and the lighter-weight <code>ldar</code> / <code>stlr</code>{" "}
        (acquire-load / release-store) that order only what they need to.
      </p>
      <p>
        The cost is real. A full barrier is tens of cycles on a modern core
        — it forces the store buffer to drain, which means waiting for the
        cache coherence protocol, which means waiting for the bus. This is
        why modern languages give you the lighter options:
      </p>
      <ul>
        <li>
          <strong>Release store</strong> (<code>stlr</code> on ARM,
          <code>mov</code> on x86 — release is free on TSO). All earlier
          loads and stores are visible to any core that does an acquire load
          of the same address.
        </li>
        <li>
          <strong>Acquire load</strong> (<code>ldar</code> on ARM, free on
          x86). No later load or store on this core moves before the acquire.
        </li>
        <li>
          Together, release + acquire on the same variable give you
          message-passing for free, on every architecture, without a full
          barrier. This is what <code>atomic&lt;T&gt;</code> with{" "}
          <code>memory_order_release</code> /{" "}
          <code>memory_order_acquire</code> gets you in C++, and what Rust&apos;s
          <code>Ordering::Release</code> / <code>Ordering::Acquire</code>{" "}
          gets you.
        </li>
      </ul>
      <p>
        The general principle: <strong>use the weakest ordering that is
        correct</strong>. Stronger than necessary costs cycles; weaker than
        necessary costs bugs. <code>memory_order_seq_cst</code> (the default
        in most languages) is correct and slow;{" "}
        <code>memory_order_relaxed</code> is fast and almost never what you
        want for cross-thread communication. Release/acquire is the sweet
        spot for almost every publish pattern.
      </p>

      <h2>seqlocks: the example that ties it together</h2>
      <p>
        A <strong>sequence lock</strong> is a reader-writer pattern for
        mostly-read data where readers don&apos;t want to take a lock. The
        writer does:
      </p>
      <pre>
        <code>{`seq++;          // odd: write in progress
write(data);
seq++;          // even: write done`}</code>
      </pre>
      <p>
        The reader does:
      </p>
      <pre>
        <code>{`do {
  s1 = seq;              // must be acquire-ish
  read(data);
  s2 = seq;              // must be acquire-ish
} while (s1 != s2 || s1 & 1);`}</code>
      </pre>
      <p>
        If <code>s1 == s2</code> and even, no write happened during the read,
        and the data is consistent. The subtlety: on x86, this works as
        written, because loads are ordered and you don&apos;t need anything
        special. On ARM, the reads of <code>data</code> can be reordered
        around the reads of <code>seq</code>, so you can see a torn write
        with an even sequence number. To make it correct on ARM, the seq
        loads must be acquire and the data loads must not cross them —
        typically via <code>smp_load_acquire</code> on the seq reads, or by
        placing a barrier after the second seq read and re-checking.
      </p>
      <p>
        The Linux kernel&apos;s <code>read_seqcount_begin</code> /{" "}
        <code>read_seqcount_retry</code> are exactly this, written portably.
        The whole <code>READ_ONCE</code> / <code>WRITE_ONCE</code> /
        <code>smp_store_release</code> / <code>smp_load_acquire</code>{" "}
        vocabulary in the kernel exists to express these orderings without
        pulling in the full (and slow) <code>smp_mb()</code> where it
        isn&apos;t needed. Paul McKenney&apos;s formalization of this into
        the Linux Kernel Memory Model (LKMM), checked by the{" "}
        <code>herd7</code> tool, is one of the great underappreciated
        engineering-precision efforts of the last decade.
      </p>

      <h2>the lesson, stated without the hardware</h2>
      <p>
        You can memorize the table and the litmus tests, but the deeper
        lesson is structural and it applies to more than memory:
      </p>
      <blockquote>
        The order you write is not the order that executes, and the order
        that executes is not the order that is observed. Correctness is a
        claim about <em>observed</em> order. Anything in between is an
        optimization that the hardware is allowed to perform as long as the
        observed order is one the model permits.
      </blockquote>
      <p>
        This is why memory models are contracts and not descriptions. The
        CPU is not telling you what it does; it is telling you what you are
        allowed to assume. Anything you assume beyond the contract is a
        bug that hasn&apos;t happened yet — and &quot;hasn&apos;t happened
        yet&quot; across a few billion cycles per second is a much shorter
        time than it sounds.
      </p>
      <p>
        The same shape shows up everywhere: TCP reorders your packets and
        reassembles them; the filesystem reorders your writes and journals
        them; the CPU reorders your instructions and fences them. In every
        case the rule is the same — <strong>verify at the boundary, in a
        language the layer below cannot fake</strong>. The memory barrier is
        the boundary. The litmus test is the proof. The bug is what happens
        when you trust the order you wrote instead of the order you
        specified.
      </p>
    </article>
  )
}
