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
        I spent a week finding out why lock-free code that worked on x86 lost messages
        on a Graviton instance. I kept looking at the processor before checking
        whether the language allowed what I had written.
      </p>
      <p>
        A ready flag is where that mistake is easiest to see. The reader checks
        one address, then uses data at another. How does the first load make the
        second safe?
      </p>

      <h2>the store that makes a payload readable</h2>
      <p>
        Here only <code>ready</code> is atomic; <code>payload</code> is a plain int. Start both threads after initialization and call each function once:
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
        There is only one true value for the consumer to find: the one the
        producer stored. If the load returns true, we can join that release store
        to this acquire load. C++ calls the edge synchronizes-with. Now trace the
        whole path from the payload write, through the flag, to the assertion.
        The write happens before the read, so a plain int works here.
      </p>
      <p>
        A false flag sends the consumer straight back out. It never touches the payload and never retries. The producer also gets no second turn with this payload. Another write would need separate coordination with the reader.
      </p>
      <p>
        Change both flag operations to relaxed and that path breaks. We still
        read and write the flag atomically; we have lost the ordering for the
        payload. I would ask the same question about an atomic pointer: what
        publishes the object at that address? Rust has the corresponding
        {" "}<a href="https://doc.rust-lang.org/std/sync/atomic/enum.Ordering.html">Ordering::Release
        and Ordering::Acquire</a> operations, though publishing an object also
        requires obeying Rust&apos;s aliasing rules for the non-atomic storage.
      </p>

      <h2>how a store can still be waiting</h2>
      <p>
        A core may have to wait to write a cache line. If another core owns the
        line, for example, the coherence protocol has work to do before this core
        can change it. Keeping the store in a buffer lets later instructions make
        progress during that wait. The buffer entry can drain once the core has
        the line and permission to write it. Until then, another core may still
        read the old value.
      </p>
      <Figure>
        <Diagram viewBox="0 0 720 360" title="the store buffer — stores defer, loads hurry" storebuffer />
        <Caption>
          The pending store can wait while a load from another address finishes.
          A load from the stored address may instead read the core&apos;s buffered
          value, ahead of the other cores.
        </Caption>
      </Figure>
      <p>
        That forwarding matters. A thread can read its own recent write even while
        everyone else still sees the old value. For a different address, there may
        be nothing in the buffer to wait for, so a later load can finish ahead of
        the earlier store. There goes the assumption that all accesses fit into one
        global order that respects every thread&apos;s source order.
      </p>
      <p>
        Out-of-order execution inside a core is a separate part of this story.
        Independent instructions can execute before earlier ones finish, provided
        the processor preserves the architectural behavior promised to its running
        thread. That promise does not tell us the order in which another core can
        observe memory accesses. A memory model supplies those constraints.
        Coherence alone covers one location: cores can agree about writes to
        {" "}<code>x</code> without any rule connecting them to writes at the ready
        flag&apos;s address.
      </p>

      <h2>both readers get zero</h2>
      <p>
        The <a
        href="https://www.cl.cam.ac.uk/~pes20/weakmemory/x86tso-paper.tphols.pdf">x86-TSO
        model by Owens, Sarkar, and Sewell</a> describes ordinary aligned accesses to
        cacheable memory with a FIFO store buffer for each core. Stores leave that
        buffer in program order. Loads keep their order relative to other loads, and
        a load sees the appropriate earlier store from its own core, including one
        still buffered. But a load may pass a pending store to a different address.
      </p>
      <p>
        Start both locations at zero and give each core one store followed by a load
        of the other location:
      </p>
      <Code lang="c">{`// Hardware litmus pseudocode; x and y initially 0.
// Thread 0            // Thread 1
x = 1;                 y = 1;
r0 = y;                r1 = x;`}</Code>
      <p>
        Zero in both registers is allowed on x86. Both stores can remain buffered
        while each core reads the other location and gets zero. Neither core needs
        to observe its own store late.
      </p>
      <p>
        Either zero fits into an SC schedule on its own. Asking for both causes trouble. For <code>r0 = 0</code>, read y has to come before write y. For <code>r1 = 0</code>, read x has to come before write x. Add the two threads&apos; program order and the arrows return to their starting point: write x → read y → write y → read x → write x. Those four events cannot fit along one forward timeline.
      </p>
      <p>
        The <a href="https://github.com/maskjelly/whiteye.in/blob/main/scripts/blog-models.py">enumerator</a> made that easy to check. Only six SC schedules respect the two thread orders. Between them they return (0, 1), (1, 0), and (1, 1). With independent store-buffer flushes, it finds one extra pair: (0, 0). The entire buffered search has 34 states, small enough to inspect. I ran it with <code>python3 scripts/blog-models.py</code>; the output is from that model, with no CPU litmus run involved.
      </p>

      <p>
        So far the accesses have all been ordinary aligned accesses to cacheable memory. I would consult the other architectural rules for streaming stores or device memory. There is also a check to make before looking at assembly: does the source contain a C++ or Rust data race? If so, favorable x86 instructions cannot make that program valid.
      </p>

      <h2>the flag arrives, the payload does not</h2>
      <p>
        Message passing has a different pair of dependencies. Here the writer stores
        x and then y; the reader loads y and then x. Again both locations start at
        zero. This is hardware litmus pseudocode, because running the same sketch
        with plain shared C variables would introduce a data race:
      </p>
      <Code lang="c">{`// Hardware litmus pseudocode, not unsynchronized C.
// x and y initially 0

// Thread 0            // Thread 1
x = 1;                 r1 = y;
y = 1;                 r2 = x;`}</Code>
      <p>
        Here the result to look for is <code>r1 = 1, r2 = 0</code>, a new flag followed by an old payload. Try putting that on x86&apos;s timeline. The write to x must leave before the write to y, and the reader must load y before x. Once y has become 1 for that reader, the earlier x store is already visible. Under the ordinary-access TSO rules, this pair of results has no valid execution.
      </p>
      <p>
        ARM permits more freedom. Even independent store-store and load-load pairs
        can be observed out of order, so this result can occur without added
        ordering. Certain dependencies constrain the possibilities under ARM&apos;s
        architectural rules. An extra source-level branch is no substitute for a
        general acquire operation. This difference matters when code moves to
        Graviton or Apple Silicon, even though source-language validity must be
        settled before reasoning about either machine.
      </p>
      <Figure>
        <Diagram viewBox="0 0 720 340" title="what may reorder — x86 TSO vs ARM relaxed" reorderTable />
        <Caption>
          Ordinary-access cases behind the two litmus tests. Acquire/release and
          barriers constrain the allowed observations; other instructions and memory
          types require more than this table.
        </Caption>
      </Figure>
      <p>
        Return to the C++ example. Release keeps the payload write on the producer&apos;s
        side of publication; acquire orders the consumer&apos;s later use. Both sides
        belong in the source so the compiler can select the required instructions.
        The load must actually read the release, or the applicable release sequence
        defined by the language model. Calling an unrelated load acquire creates no
        connection to our producer.
      </p>
      <Figure>
        <Diagram viewBox="0 0 720 320" title="message passing — the outcome that should not be possible" litmusMP />
        <Caption>
          A reader that gets the old flag value has missed the producer&apos;s release.
          That load does not establish that the payload is safe to read.
        </Caption>
      </Figure>

      <h2>which ordering do we need?</h2>
      <p>
        I find &quot;drain the store buffer&quot; too crude a description of a barrier.
        x86 has <code>mfence</code>, <code>sfence</code>, and <code>lfence</code>,
        with different guarantees. ARM&apos;s <code>dmb</code> orders data-memory
        accesses; <code>dsb</code> adds completion requirements. Instruction
        synchronization is the job of <code>isb</code>. Choosing among them requires
        the instruction rules for the memory being accessed.
      </p>
      <p>
        I compiled the <a href="https://github.com/maskjelly/whiteye.in/blob/main/scripts/blog-publication.cpp">same
        C++ example</a> with Apple clang 21.0.0 (clang-2100.3.34.2), C++20, and
        -O2. For x86_64-apple-macos, the flag store was movb and the load was movzbl,
        with no added fence. For arm64-apple-macos with -mcpu=generic, they were
        stlrb and ldarb. Those are byte operations because ready is a bool. The
        release still orders the producer&apos;s earlier work, and acquire the
        consumer&apos;s later work; the x86 listing simply needs no extra fence
        instruction for this example.
      </p>
      <p>
        The default arm64 target gave me a detail worth checking: its load was
        ldaprb, which my first search for ldarb missed. Adding -mcpu=generic changed
        it to ldarb. Arm&apos;s <a href="https://developer.arm.com/community/arm-community-blogs/b/tools-software-ides-blog/posts/enabling-rcpc-in-gcc-and-llvm">RCpc
        compiler note</a> explains why a supported target can use the LDAPR family
        for C++ acquire loads. So I cannot infer the source ordering from one
        expected mnemonic. The <a href="https://github.com/maskjelly/whiteye.in/blob/main/scripts/blog-publication-asm.sh">commands</a>{" "}
        save all three listings and the compiler version. This checks the generated
        code for those settings, without measuring its runtime cost.
      </p>

      <p>
        I start with an ordering I can defend. Sequentially consistent atomics add
        a common order for those operations, which can make the first proof easier.
        I only weaken an operation when I can explain why the proof still holds. Then
        I inspect the generated code and measure on the target architecture under
        the relevant contention.
        An independent counter might need only relaxed ordering. Our ready flag
        publishes other data, so its job includes more than keeping its own value
        atomic.
      </p>

      <h2>a retry does not erase a race</h2>
      <p>
        Sequence counters make this distinction harder to ignore. A writer marks a
        counter odd, changes the data, then makes it even. Writers must be serialized.
        Stripped of the ordering and access primitives, the writer looks like this:
      </p>
      <Code lang="c">{`// Sketch only: writer serialization and ordering omitted.
seq++;          // odd: write in progress
write(data);
seq++;          // even: write done`}</Code>
      <p>
        A reader brackets its data reads with counter samples and retries if it
        finds an odd value or a change:
      </p>
      <Code lang="c">{`// Sketch only: platform-specific access/barrier rules omitted.
do {
  s1 = seq;
  read(data);
  s2 = seq;
} while (s1 != s2 || s1 & 1);`}</Code>
      <p>
        Equal even values let a valid implementation accept the snapshot, assuming
        the counter did not wrap during the attempt. But the sketch leaves the hard
        parts open. What keeps the data reads between the two checks? A final acquire
        load cannot hold earlier reads in place; acquire constrains later operations.
        And what makes a data read legal while a writer could be changing that data?
        Once plain C++ or Rust reads race with a writer, we already have undefined
        behavior. Discovering a changed counter afterward does not repair those reads.
      </p>
      <p>
        I would start a kernel implementation with Linux&apos;s
        {" "}<a href="https://www.kernel.org/doc/html/latest/locking/seqlock.html">sequence-counter
        documentation</a>: use <code>read_seqcount_begin</code> and
        {" "}<code>read_seqcount_retry</code>, and meet the writer serialization and
        preemption requirements. Copying <code>READ_ONCE</code> and
        {" "}<code>WRITE_ONCE</code> into the sketch would constrain the compiler&apos;s
        treatment of those accesses, but would still leave us to establish their
        ordering. I can then ask LKMM and <code>herd7</code> whether the proposed
        rules allow a reader to accept a bad snapshot.
      </p>
      <p>
        In the one-shot publication example I can name the store the reader observed
        and trace a happens-before path to the payload. The sequence-counter sketch
        still owes us those details. That is what I look for in lock-free code now.
        I would still stress-test it. A quiet run, though, cannot tell me which
        execution the next compiler or processor might allow.
      </p>

      <div className="correction">
        <strong>correction:</strong> The earlier version treated acquire/release
        instructions as barriers. I have corrected that mistake. The litmus tests
        and sequence-counter sketches are pseudocode; the C++ publication example
        is valid source. ARM&apos;s Architecture Reference Manual gives the full rules
        for each instruction and memory type.
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
