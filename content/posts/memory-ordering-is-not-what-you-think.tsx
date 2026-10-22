import { Figure, Diagram, Caption } from "@/components/figure"
import { Code } from "@/components/code"

export const meta = {
  slug: "memory-ordering-is-not-what-you-think",
  title: "memory ordering is not what you think",
  date: "may 14, 2026",
  updated: "oct 23, 2026",
  description: "Why seeing a ready flag may not publish the data, with store-buffer traces and a one-shot release/acquire example.",
  readingTime: "12 min",
}

export default function Post() {
  return (
    <article className="prose-mono">
      <p className="lead">
        In the C++ example below, the payload is a plain <code>int</code>. Only the ready flag is atomic. That can be safe for one-shot publication, but the reader must observe a particular store to the flag. Reading true connects the payload write to its later use; reading false gives the consumer no such permission. The interesting part is explaining that connection.
      </p>

      <p>
        I ran into this with lock-free code that worked on x86 and lost messages on a Graviton instance. Finding the cause took a week. I had been mixing up what the CPU allows with what makes the source program valid. Store buffers helped me understand the hardware behavior. To fix the source, I needed the language&apos;s synchronization rules.
      </p>

      <h2>program order and what another core sees</h2>
      <p>
        A modern out-of-order CPU can execute independent instructions before earlier
        instructions have finished. It still has to preserve the architectural behavior
        promised to the running thread. Execution order inside the core is therefore
        different from the order another core can observe memory operations.
      </p>
      <p>
        A memory model puts limits on what a thread may observe, leaving room for different CPU designs. Coherence covers just one location at a time. All cores can agree about the writes to <code>x</code> and still lack a rule connecting <code>x</code> to a ready flag at another address.
      </p>
      <p>
        x86 gives ordinary cacheable memory relatively strong ordering. ARM allows more freedom unless an ordering operation or a dependency with the required architectural guarantees constrains it. That difference catches code moved to Graviton or Apple Silicon. But I have to check the source first: a C++ or Rust data race is undefined behavior even if the generated x86 instructions happen to do what I wanted.
      </p>

      <h2>the store buffer</h2>
      <p>
        A core needs ownership of a cache line before it can make a store visible
        through the cache-coherence system. Waiting for that ownership on every store
        would stall execution. A store buffer lets the core retain pending writes and
        continue. The writes become visible to other cores as the required cache lines
        and coherence permissions become available.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 360" title="the store buffer — stores defer, loads hurry" storebuffer />
        <Caption>
        A pending store and a later load to another address can coexist. Loading the stored address instead may forward the core&apos;s own buffered value, while other cores still see the old one.
      </Caption>
      </Figure>

      <p>
        Two behaviors follow from that arrangement:
      </p>
      <ul>
        <li>
          <strong>Forwarding to the same core.</strong> A load can read an earlier
          pending store to the same address from the buffer. The core need not wait for
          that store to become visible elsewhere.
        </li>
        <li>
          <strong>A load passing a store.</strong> A later load from a different address
          can finish while an earlier store is still buffered. This allows observations
          that a single global ordering of all operations would forbid.
        </li>
      </ul>

      <h2>x86 TSO</h2>
      <p>
        Owens, Sarkar, and Sewell&apos;s <a
        href="https://www.cl.cam.ac.uk/~pes20/weakmemory/x86tso-paper.tphols.pdf">2009
        x86-TSO model</a> accounts for ordinary aligned accesses to cacheable memory
        using a per-core FIFO store buffer. The ordering rules relevant here are:
      </p>
      <ul>
        <li>
          Stores from one core become visible in their program order. Another core does
          not observe the second store before the first.
        </li>
        <li>
          Loads preserve their order with other loads in the architectural observations
          the model permits.
        </li>
        <li>
          A load from an address sees the appropriate earlier store from its own core,
          including a store still in the buffer.
        </li>
        <li>
          A later load may pass an earlier store to a different address. The load can
          finish before the store becomes globally visible.
        </li>
      </ul>
      <p>
        That last rule permits the classic store-buffering test. Initially both
        locations are zero; each core writes one location, then reads the other:
      </p>
      <Code lang="c">{`// Hardware litmus pseudocode; x and y initially 0.
// Thread 0            // Thread 1
x = 1;                 y = 1;
r0 = y;                r1 = x;`}</Code>
      <p>
        Both reads can return zero on x86: each core buffers its own write and reads the other location before that write becomes visible. Try fitting this into one global interleaving that preserves program order. <code>r0 = 0</code> puts the load of y before the store to y; <code>r1 = 0</code> puts the load of x before the store to x. Add the program-order edges and you get a cycle: write x → read y → write y → read x → write x. No sequentially consistent interleaving can do that. The store buffers explain how the hardware can.
      </p>
      <p>
        This x86 model covers ordinary aligned cacheable accesses. Streaming stores and device memory have other rules. Applying the model to a program also requires checking what accesses the compiler actually emitted.
      </p>

      <h2>ARM</h2>
      <p>
        With ARM, even independent store-store or load-load pairs may be observed out of order. Dependencies rule out some outcomes, but only under their specific architectural rules. Adding a branch in the source does not give me a general acquire operation.
      </p>
      <p>
        Publication needs ordering on both sides. The producer writes the payload before releasing the flag; the consumer acquires the flag before using the payload. Express that pair in the source and the compiler can choose the machine instructions it needs.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 340" title="what may reorder — x86 TSO vs ARM relaxed" reorderTable />
        <Caption>
        A guide to the ordinary-access cases used here. Barriers and acquire/release operations add constraints; the table does not cover every instruction or memory type.
      </Caption>
      </Figure>

      <h2>the message-passing litmus test</h2>
      <p>
        Both locations start at zero. Read each line as a hardware access, in the displayed order. The C-like notation is a litmus-test sketch; using plain shared C variables this way would introduce a data race.
      </p>
      <Code lang="c">{`// Hardware litmus pseudocode, not unsynchronized C.
// x and y initially 0

// Thread 0            // Thread 1
x = 1;                 r1 = y;
y = 1;                 r2 = x;`}</Code>
      <p>
        Look for <code>r1 = 1, r2 = 0</code>. The reader has seen the flag in y and then obtained the old payload from x.
      </p>
      <ul>
        <li>
          <strong>x86 TSO forbids that outcome</strong> for these ordinary accesses. The
          writer&apos;s stores retain their order, as do the reader&apos;s loads.
          Seeing{" "} <code>y = 1</code> before loading <code>x</code> therefore
          requires seeing the earlier store to <code>x</code> too.
        </li>
        <li>
        <strong>ARM can allow it</strong> without extra ordering. A release store to the flag and an acquire load reading that store supply the publication relationship.
      </li>
      </ul>
      <p>
        An atomic pointer creates the same question. Its address can be loaded atomically while the object it points to still lacks a publication guarantee. The initialization writes must happen before the reader uses that object.
      </p>

      <Figure>
        <Diagram viewBox="0 0 720 320" title="message passing — the outcome that should not be possible" litmusMP />
        <Caption>
        An acquire load that reads the old flag value has not observed the producer&apos;s release. It cannot use that release to justify reading the payload.
      </Caption>
      </Figure>

      <h2>the source-language publication rule</h2>
      <p>
        This one-shot C++ example makes the relationship explicit. The two functions run
        on different threads after initialization, each at most once. There is no reset
        or reuse of the payload:
      </p>
      <Code lang="cpp">{`#include <atomic>
#include <cassert>

int payload = 0;
std::atomic<bool> ready{false};

void producer() {
  payload = 1;
  ready.store(true, std::memory_order_release);
}

void consumer() {
  if (ready.load(std::memory_order_acquire)) {
    assert(payload == 1);
  }
}`}</Code>
      <p>
        Suppose the load returns true. There is only one store of true, the producer&apos;s release, so that is the store it reads. The release synchronizes with the acquire. The payload write comes before the release and the payload read comes after the acquire, establishing a happens-before path between them. The plain <code>int</code> is safe. If the flag is false, the consumer simply skips the payload; this function contains no retry loop.
      </p>
      <p>
        Change both flag operations to relaxed and that path disappears. The flag remains atomic, but its value no longer justifies reading the plain payload. Reusing the payload needs another rule too: this example does not let the producer overwrite it while the consumer reads. Rust&apos;s <a href="https://doc.rust-lang.org/std/sync/atomic/enum.Ordering.html">atomic ordering documentation</a> describes the same release/acquire relationship, alongside the need to obey Rust&apos;s aliasing rules for shared non-atomic storage.
      </p>

      <h2>barriers and acquire/release</h2>
      <p>
        &quot;Drain the store buffer&quot; is an incomplete description of a barrier. On x86, <code>mfence</code>, <code>sfence</code>, and <code>lfence</code> have different guarantees. On ARM, <code>dmb</code> orders data-memory accesses, <code>dsb</code> adds completion requirements, and <code>isb</code> handles instruction synchronization. Substituting one for another requires checking the actual instruction rules.
      </p>
      <p>
        For publication, acquire/release can express the required direction without a full barrier. Ordinary x86 loads and stores often need no added fence for this, although the compiler still has to honor the ordering. Cost follows the generated code, contention, and architecture.
      </p>
      <ul>
        <li>
          <strong>A release store</strong> orders the preceding operations for a reader
          that synchronizes with it. A typical AArch64 mapping uses <code>stlr</code>;
          an ordinary x86 store can already supply the required hardware ordering.
        </li>
        <li>
          <strong>An acquire load</strong> constrains later operations. On AArch64 it
          can use <code>ldar</code>. To synchronize with a release, it must read from
          that release or the applicable release sequence, as defined by the language
          model.
        </li>
        <li>
        C++ names the pair <code>memory_order_release</code> and <code>memory_order_acquire</code> on <code>atomic&lt;T&gt;</code>; Rust uses <code>Ordering::Release</code> and <code>Ordering::Acquire</code>. The <a href="https://doc.rust-lang.org/std/sync/atomic/enum.Ordering.html">Rust documentation</a> states the language-level guarantees before any choice of machine instruction.
      </li>
      </ul>
      <p>
        I start with an ordering I can defend. Sequentially consistent atomics add a common order for those operations, which can make a first proof easier to follow. Then I look at the generated code and measure the cost. An independent counter may need only relaxed ordering because it publishes no other data. The ready flag above does carry that responsibility.
      </p>

      <h2>sequence counters</h2>
      <p>
        A sequence counter lets a reader detect whether a writer overlapped its read.
        Writers must be serialized. A writer marks the counter odd, updates the data,
        then makes the counter even again. This sketch shows the idea, with ordering and
        access primitives omitted:
      </p>
      <Code lang="c">{`// Sketch only: writer serialization and ordering omitted.
seq++;          // odd: write in progress
write(data);
seq++;          // even: write done`}</Code>
      <p>
        The reader samples the sequence number around its data reads and retries if the
        counter changed or was odd:
      </p>
      <Code lang="c">{`// Sketch only: platform-specific access/barrier rules omitted.
do {
  s1 = seq;
  read(data);
  s2 = seq;
} while (s1 != s2 || s1 & 1);`}</Code>
      <p>
        For a valid sequence-counter implementation, equal even values let the reader accept the snapshot, provided the counter did not wrap during the attempt. The data reads must stay between the checks. A final acquire load cannot hold earlier reads in place: acquire constrains what follows it. The source-language issue is more severe. Retrying cannot undo a C++ or Rust data race, so copying this sketch with plain shared variables would still be unsafe.
      </p>
      <p>
        In Linux, <code>read_seqcount_begin</code> and <code>read_seqcount_retry</code> provide the access and ordering rules for the kernel&apos;s model. The <a href="https://www.kernel.org/doc/html/latest/locking/seqlock.html">sequence-counter documentation</a> spells out writer serialization and preemption constraints. <code>READ_ONCE</code> and <code>WRITE_ONCE</code> constrain the compiler&apos;s treatment of individual accesses; ordering still needs its own argument. LKMM and <code>herd7</code> can check whether a proposed execution is allowed.
      </p>

      <p>
        For the one-shot example, I can point to the exact store the reader observes and follow the happens-before path to the payload. The sequence-counter sketch still needs those details supplied. That is what I look for in lock-free code now. A stress test samples what happened on one machine; the argument has to rule out the bad execution on every supported implementation.
      </p>

      <div className="correction">
        <strong>correction:</strong> an earlier version mixed up acquire/release
        instructions and barriers. This version distinguishes their roles and labels the
        sketches as pseudocode. The ARM Architecture Reference Manual has
        the full rules for each instruction and memory type.
      </div>

      <section className="references">
        <h2>references</h2>
        <ol>
          <li>
            Owens, Sarkar, Sewell (2009). &quot;A Better x86 Memory Model:
            x86-TSO.&quot;{" "}
            <a href="https://www.cl.cam.ac.uk/~pes20/weakmemory/x86tso-paper.tphols.pdf">
              PDF
            </a>
            . An operational model with store buffers and equivalent axiomatic rules.
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
            B2.9, &quot;The memory model&quot;). Instruction and memory-type rules
            for ARM ordering.
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
            Boehm, Demsky (2014). &quot;Outlawing Ghosts: Avoiding
            Out-of-Thin-Air Results.&quot;{" "}
            <a href="https://research.google/pubs/outlawing-ghosts-avoiding-out-of-thin-air-results/">
              Google Research
            </a>
            . The difficulty of ruling out circularly justified values in
            language memory models.
          </li>
        </ol>
      </section>
    </article>
  )
}
