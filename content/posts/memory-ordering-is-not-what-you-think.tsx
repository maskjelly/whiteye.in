import { Figure, Diagram, Caption } from "@/components/figure"
import { Code } from "@/components/code"

export const meta = {
  slug: "memory-ordering-is-not-what-you-think",
  title: "memory ordering is not what you think",
  date: "may 14, 2026",
  description:
    "On store buffers, x86 TSO vs ARM relaxed, the message-passing litmus test, and why code that worked fine on Intel for a decade breaks on Graviton.",
  readingTime: "12 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        Your compiler reorders your code. Your CPU reorders your code. Your
        cache reorders your code. The memory you think you wrote is, in various
        real senses, not there yet. And yet most programs work, because for
        decades the dominant CPU was unusually well-behaved. That is changing,
        and the cracks are where the interesting bugs live.
      </p>

      <p>
        I first ran into this when some lock-free code that had been running
        fine on x86 started losing messages on a Graviton instance. It took me
        a week to figure out why. This post is the explanation I needed then.
      </p>

      <h2>the myth</h2>
      <p>
        The myth is that instructions execute in the order you wrote them.
        They do not. The machine underneath is a deeply pipelined,
        out-of-order, superscalar engine that will execute any two independent
        instructions in either order, in parallel, or both, whichever is
        faster. It puts them back in program order at the very end, for your
        thread, observed from your thread.
      </p>
      <p>
        The catch is that last clause. Program order is guaranteed for a
        single thread observing itself. It is not guaranteed for another
        thread watching the same memory. What thread B sees, when it reads
        the addresses thread A wrote, is defined by a memory model, a formal
        contract between the CPU and the programmer about which reorderings
        the hardware may perform, and which it may not.
      </p>
      <p>
        Every architecture has a different one. x86 has a strong model called
        TSO. ARM has a weak (relaxed) model. The difference is not theoretical.
        Code that has been running correctly on Intel for a decade will
        sporadically lose messages on a Graviton or an M-series core, and the
        bug will not reproduce under a debugger because the reorderings only
        happen when the stars align.
      </p>

      <h2>the store buffer</h2>
      <p>
        The root cause is a small piece of hardware called the store buffer.
        A store to memory is expensive: even an L1 hit is about 4 cycles, and
        a cache line that needs to be fetched before write is much worse. To
        avoid stalling the pipeline on every store, the CPU writes the store
        into a per-core buffer and moves on. The buffer drains to the cache
        asynchronously, when the cache line is available and coherence
        permits.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="the store buffer — stores defer, loads hurry" storebuffer />
        <Caption>
          A store goes into the buffer and the core continues. A subsequent
          load from the same core, to a different address, can execute
          immediately. It does not wait for the store to drain. From the
          core&apos;s own viewpoint, program order is preserved (store-buffer
          forwarding makes its own stores visible to its own loads). From
          another core, the store is not visible yet. That gap is the entire
          memory-ordering problem.
        </Caption>
      </Figure>

      <p>
        Two consequences fall out of this design:
      </p>
      <ul>
        <li>
          <strong>Store-buffer forwarding.</strong> A core always sees its own
          most recent store, even if it has not drained to cache. So a single
          thread never observes its own stores out of order. The madness only
          starts when a second thread is involved.
        </li>
        <li>
          <strong>A later load can pass an earlier store</strong> to a
          different address, because the load does not wait for the
          store&apos;s buffer to drain. This is the only reordering x86
          permits, and it is the one that breaks code that assumed &quot;stores
          are visible immediately.&quot;
        </li>
      </ul>

      <h2>x86 TSO</h2>
      <p>
        x86&apos;s model is TSO (Total Store Order), formalized by Owens,
        Sarkar, and Sewell in 2009. The name gives you three guarantees and
        one allowance:
      </p>
      <ul>
        <li>
          Stores from a single core become visible to other cores in the order
          they were issued. No store-store reordering.
        </li>
        <li>
          Loads do not reorder with loads. Load-load preserved.
        </li>
        <li>
          Loads do not reorder with earlier stores to the same address.
          Load-after-store preserved.
        </li>
        <li>
          The one allowance: a load may be reordered after an earlier store to
          a different address. This is the store-buffer effect. The load runs
          while the store is still in the buffer.
        </li>
      </ul>
      <p>
        The fourth bullet is the entire relaxivity of x86. Everything else is
        sequentially consistent. That makes x86 feel safe, and it is, mostly.
        &quot;Mostly&quot; is not a memory model.
      </p>

      <h2>ARM</h2>
      <p>
        ARM permits much more. Store-Store, Load-Load, Load-Store, and
        Store-Load can all be reordered, subject to explicit dependency
        ordering (a load that depends on a prior load&apos;s address is
        ordered, a store that depends on a prior load&apos;s value is ordered,
        etc). The model is described as a long list of allowed reorderings
        plus a set of barrier and acquire/release instructions that restore
        ordering where you need it.
      </p>
      <p>
        The practical effect: on ARM, two consecutive stores to different
        addresses can be observed by another core in either order. On x86 they
        cannot. If you wrote a flag-then-data pattern and relied on x86&apos;s
        store-store ordering, your code is correct on Intel and subtly broken
        on every ARM server in the cloud. This is why Apple Silicon and AWS
        Graviton have been a slow-motion reckoning for a lot of lock-free
        code.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 340" title="what may reorder — x86 TSO vs ARM relaxed" reorderTable />
        <Caption>
          Read the table as &quot;may the first op be reordered after the
          second?&quot; The single reorder cell in the x86 column is the entire
          difference between x86 and sequential consistency. The ARM column is
          almost all reorder. You get to choose what stays ordered, via
          barriers or acquire/release.
        </Caption>
      </Figure>

      <h2>the litmus test</h2>
      <p>
        Two threads, two shared variables, both initialized to zero.
      </p>
      <Code lang="c">{`// x and y initially 0

// Thread 0            // Thread 1
x = 1;                 r1 = y;
y = 1;                 r2 = x;`}</Code>
      <p>
        Can <code>r1 = 1, r2 = 0</code> ever happen? Can Thread 1 see the
        write to <code>y</code> but miss the write to <code>x</code>, even
        though Thread 0 wrote <code>x</code> first?
      </p>
      <ul>
        <li>
          On x86 TSO: no. Thread 0&apos;s stores are ordered (store-store
          preserved). If Thread 1 sees <code>y = 1</code>, then{" "}
          <code>x = 1</code> must already be visible. So <code>r2</code> must
          read 1. No barrier needed.
        </li>
        <li>
          On ARM relaxed: yes. The two stores can be observed in either order.
          Thread 1 can see <code>y = 1</code> while <code>x</code> is still 0
          in its cache. To forbid it you need a barrier between the two
          stores, or you write the second store with release semantics.
        </li>
      </ul>
      <p>
        This is the message-passing pattern. It shows up everywhere:
        publishing a pointer and a ready flag, enqueueing an item and
        incrementing a count, writing a struct and setting its valid bit. The
        producer does the data store first and the flag store second. The
        consumer reads the flag first and the data second. On x86 it works for
        free. On ARM it is broken without a barrier, and the breakage is rare
        and non-reproducible. I spent a week on this once. I do not recommend
        it.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="message passing — the outcome that should not be possible" litmusMP />
        <Caption>
          The producer stores data then flag. The consumer loads flag then
          data. The forbidden outcome <code>r1=1, r2=0</code> (&quot;I saw the
          flag but not the data&quot;) is impossible on x86 and merely unlikely
          on ARM. A release store on the flag plus an acquire load on the flag
          closes the window on every architecture.
        </Caption>
      </Figure>

      <h2>barriers</h2>
      <p>
        A memory barrier is an instruction that tells the CPU to drain
        whatever is in its store buffer before proceeding past this point (a
        store barrier), or to not let any load cross this point until earlier
        loads have completed (a load barrier), or both (a full barrier). On
        x86 that is <code>mfence</code>, <code>sfence</code>,{" "}
        <code>lfence</code>. On ARM it is <code>dmb</code>,{" "}
        <code>dsb</code>, <code>isb</code>, and the lighter-weight{" "}
        <code>ldar</code> / <code>stlr</code> (acquire-load / release-store)
        that order only what they need to.
      </p>
      <p>
        The cost is real. A full barrier is tens of cycles on a modern core.
        It forces the store buffer to drain, which means waiting for the cache
        coherence protocol, which means waiting for the bus. This is why
        modern languages give you the lighter options:
      </p>
      <ul>
        <li>
          <strong>Release store</strong> (<code>stlr</code> on ARM,{" "}
          <code>mov</code> on x86, release is free on TSO). All earlier loads
          and stores are visible to any core that does an acquire load of the
          same address.
        </li>
        <li>
          <strong>Acquire load</strong> (<code>ldar</code> on ARM, free on
          x86). No later load or store on this core moves before the acquire.
        </li>
        <li>
          Together, release + acquire on the same variable give you
          message-passing on every architecture without a full barrier. This
          is what <code>atomic&lt;T&gt;</code> with{" "}
          <code>memory_order_release</code> /{" "}
          <code>memory_order_acquire</code> gets you in C++, and what
          Rust&apos;s <code>Ordering::Release</code> /{" "}
          <code>Ordering::Acquire</code> gets you.
        </li>
      </ul>
      <p>
        Use the weakest ordering that is correct. Stronger than necessary
        costs cycles. Weaker than necessary costs bugs.{" "}
        <code>memory_order_seq_cst</code> (the default in most languages) is
        correct and slow. <code>memory_order_relaxed</code> is fast and almost
        never what you want for cross-thread communication. Release/acquire is
        the sweet spot for almost every publish pattern.
      </p>

      <h2>seqlocks</h2>
      <p>
        A sequence lock is a reader-writer pattern for mostly-read data where
        readers do not want to take a lock. The writer does:
      </p>
      <Code lang="c">{`seq++;          // odd: write in progress
write(data);
seq++;          // even: write done`}</Code>
      <p>The reader does:</p>
      <Code lang="c">{`do {
  s1 = seq;              // must be acquire-ish
  read(data);
  s2 = seq;              // must be acquire-ish
} while (s1 != s2 || s1 & 1);`}</Code>
      <p>
        If <code>s1 == s2</code> and even, no write happened during the read,
        and the data is consistent. On x86 this works as written, because
        loads are ordered and you do not need anything special. On ARM, the
        reads of <code>data</code> can be reordered around the reads of{" "}
        <code>seq</code>, so you can see a torn write with an even sequence
        number. To make it correct on ARM, the seq loads must be acquire and
        the data loads must not cross them. Typically via{" "}
        <code>smp_load_acquire</code> on the seq reads, or by placing a
        barrier after the second seq read and re-checking.
      </p>
      <p>
        The Linux kernel&apos;s <code>read_seqcount_begin</code> /{" "}
        <code>read_seqcount_retry</code> are exactly this, written portably.
        The whole <code>READ_ONCE</code> / <code>WRITE_ONCE</code> /{" "}
        <code>smp_store_release</code> / <code>smp_load_acquire</code>{" "}
        vocabulary in the kernel exists to express these orderings without
        pulling in the full (and slow) <code>smp_mb()</code> where it is not
        needed. Paul McKenney&apos;s formalization of this into the Linux
        Kernel Memory Model (LKMM), checked by the <code>herd7</code> tool, is
        one of the great underappreciated engineering-precision efforts of the
        last decade. If you want to go deeper than this post, start with his
        book and the herd7 documentation.
      </p>

      <p>
        Memory models are contracts, not descriptions. The CPU is not telling
        you what it does. It is telling you what you are allowed to assume.
        Anything you assume beyond the contract is a bug that has not happened
        yet, and &quot;has not happened yet&quot; across a few billion cycles
        per second is a much shorter time than it sounds.
      </p>

      <div className="correction">
        <strong>thanks:</strong> to everyone who pointed out on Twitter that
        the original version of this post conflated <code>ldar</code>/<code>stlr</code>
        ordering semantics with the older <code>dmb</code> barriers. They are
        related but not identical. The acquire/release semantics of{" "}
        <code>ldar</code>/<code>stlr</code> are actually stronger than
        <code>dmb ish</code> in some subtle cases involving RCpc vs RCsc. I
        have simplified here. See the ARMv8 ARM (Section B2.9) for the
        authoritative version.
      </div>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Owens, Sarkar, Sewell (2009). &quot;A Better x86 Memory Model:
            x86-TSO.&quot;{" "}
            <a href="https://www.cl.cam.ac.uk/~pes20/papers/tso-to-tr.pdf">
              PDF
            </a>
            . The formalization of x86 that compiler writers actually use.
          </li>
          <li>
            McKenney, et al. &quot;A (Rare) Depth Tour of the Linux
            Kernel Memory Model&quot; (LPC 2018).{" "}
            <a href="https://lpc.events/event/lpc2018/contributions/370/">
              lpc.events
            </a>
            . Plus the{" "}
            <a href="https://github.com/herd/herdtools7">herd7 tool</a> for
            checking litmus tests.
          </li>
          <li>
            ARM. &quot;ARM Architecture Reference Manual&quot; (ARMv8, Section
            B2.9, &quot;The memory model&quot;). The authoritative source for
            ARM ordering. Not light reading.
          </li>
          <li>
            Maranget, Sarkar, Sewell (2012). &quot;A Tutorial Introduction to
            the ARM and POWER Relaxed Memory Models.&quot;{" "}
            <a href="http://www.cl.cam.ac.uk/~pes20/ppc-supplemental/test7.pdf">
              PDF
            </a>
            . The best primer on relaxed models I have read.
          </li>
          <li>
            Boehm, Demsky (2014). &quot;Outlining the C++ Memory Model.&quot;{" "}
            <a href="https://dl.acm.org/doi/10.1145/2618128">
              ACM
            </a>
            . Why <code>memory_order_consume</code> was a mistake.
          </li>
        </ol>
      </section>
    </article>
  )
}
