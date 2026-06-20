type Node = { y: number; label: string; time: string }

type DiagramProps = {
  viewBox: string
  title?: string
  nodes?: Node[]
  datapath?: boolean
  compare?: boolean
  stack?: boolean
  raidhole?: boolean
  merkle?: boolean
  splitbrain?: boolean
  paxos?: boolean
  raft?: boolean
  storebuffer?: boolean
  reorderTable?: boolean
  litmusMP?: boolean
  byzCommander?: boolean
  threeFPlusOne?: boolean
  pbft?: boolean
  logPlusIndex?: boolean
  lsmTree?: boolean
  logSpine?: boolean
}

const ACCENT = "#ff6b35"
const TEXT = "#9ca3af"
const DIM = "#6b7280"
const LINE = "#262626"
const FILL = "#181818"
const WHITE = "#ffffff"

export function Diagram({ viewBox, title, nodes, datapath, compare, stack, raidhole, merkle, splitbrain, paxos, raft, storebuffer, reorderTable, litmusMP, byzCommander, threeFPlusOne, pbft, logPlusIndex, lsmTree, logSpine }: DiagramProps) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={title ?? "diagram"}>
      <DiagramHeader title={title} />
      {nodes && <Pipeline nodes={nodes} />}
      {datapath && <HornerDatapath />}
      {compare && <FiberVsMicrowave />}
      {stack && <StorageStack />}
      {raidhole && <RaidWriteHole />}
      {merkle && <MerkleTree />}
      {splitbrain && <SplitBrain />}
      {paxos && <Paxos />}
      {raft && <RaftTimeline />}
      {storebuffer && <StoreBuffer />}
      {reorderTable && <ReorderTable />}
      {litmusMP && <LitmusMP />}
      {byzCommander && <ByzCommander />}
      {threeFPlusOne && <ThreeFPlusOne />}
      {pbft && <Pbft />}
      {logPlusIndex && <LogPlusIndex />}
      {lsmTree && <LsmTree />}
      {logSpine && <LogSpine />}
    </svg>
  )
}

function DiagramHeader({ title }: { title?: string }) {
  if (!title) return null
  return (
    <g>
      <text
        x={0}
        y={18}
        fill={ACCENT}
        fontSize={12}
        fontFamily="var(--font-mono)"
        letterSpacing="0.04em"
      >
        {title}
      </text>
      <line x1={0} y1={26} x2={720} y2={26} stroke={LINE} strokeWidth={1} />
    </g>
  )
}

function Pipeline({ nodes }: { nodes: Node[] }) {
  const spineX = 240
  return (
    <g>
      <line
        x1={spineX}
        y1={nodes[0].y}
        x2={spineX}
        y2={nodes[nodes.length - 1].y}
        stroke={LINE}
        strokeWidth={1}
      />
      {nodes.map((n, i) => {
        const next = nodes[i + 1]
        return (
          <g key={i}>
            <circle cx={spineX} cy={n.y} r={4} fill={ACCENT} />
            {next && (
              <line
                x1={spineX}
                y1={n.y + 4}
                x2={spineX}
                y2={next.y - 4}
                stroke={ACCENT}
                strokeWidth={1}
                strokeDasharray="2 3"
                opacity={0.5}
              />
            )}
            <text
              x={spineX + 18}
              y={n.y + 4}
              fill={WHITE}
              fontSize={13}
              fontFamily="var(--font-mono)"
            >
              {n.label}
            </text>
            <text
              x={710}
              y={n.y + 4}
              fill={i === 0 || i === 1 ? DIM : ACCENT}
              fontSize={12}
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              {n.time}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function HornerDatapath() {
  const stages = ["a₃", "a₂", "a₁", "a₀"]
  const stageLabels = ["stage 1", "stage 2", "stage 3", "stage 4"]
  const y = 170
  const w = 120
  const gap = 36
  const startX = 70

  return (
    <g fontFamily="var(--font-mono)">
      {/* x bus along the bottom */}
      <text x={startX - 10} y={310} fill={ACCENT} fontSize={13}>
        x →
      </text>
      <line
        x1={startX + 20}
        y1={305}
        x2={startX + (w + gap) * 4 - gap}
        y2={305}
        stroke={ACCENT}
        strokeWidth={1.5}
      />
      {/* a4 seed input arrow into first stage */}
      <text x={20} y={y + 5} fill={WHITE} fontSize={13}>
        a₄
      </text>
      <line
        x1={40}
        y1={y}
        x2={startX}
        y2={y}
        stroke={DIM}
        strokeWidth={1.5}
        markerEnd="url(#arrow-dim)"
      />

      {stages.map((c, i) => {
        const x = startX + i * (w + gap)
        const isLast = i === 3
        return (
          <g key={i}>
            {/* x tap up into stage */}
            <line
              x1={x + 30}
              y1={305}
              x2={x + 30}
              y2={y + 35}
              stroke={ACCENT}
              strokeWidth={1}
              opacity={0.6}
            />
            {/* coefficient in from top */}
            <text x={x + 50} y={y - 22} fill={WHITE} fontSize={13} textAnchor="middle">
              {c}
            </text>
            <line
              x1={x + 50}
              y1={y - 14}
              x2={x + 50}
              y2={y - 2}
              stroke={DIM}
              strokeWidth={1}
            />
            {/* MAC box */}
            <rect
              x={x}
              y={y}
              width={w}
              height={40}
              rx={4}
              fill={FILL}
              stroke={LINE}
              strokeWidth={1}
            />
            <text x={x + w / 2} y={y + 17} fill={TEXT} fontSize={12} textAnchor="middle">
              × x
            </text>
            <text x={x + w / 2} y={y + 32} fill={TEXT} fontSize={12} textAnchor="middle">
              + c
            </text>
            {/* stage label */}
            <text x={x + w / 2} y={y + 60} fill={DIM} fontSize={10} textAnchor="middle">
              {stageLabels[i]}
            </text>
            {/* register between stages (not after last) */}
            {!isLast && (
              <g>
                <rect
                  x={x + w + 8}
                  y={y + 12}
                  width={20}
                  height={16}
                  rx={2}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth={1}
                />
                <text
                  x={x + w + 18}
                  y={y + 24}
                  fill={ACCENT}
                  fontSize={9}
                  textAnchor="middle"
                >
                  reg
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* output arrow */}
      <line
        x1={startX + (w + gap) * 4 - gap}
        y1={y}
        x2={startX + (w + gap) * 4 - gap + 30}
        y2={y}
        stroke={ACCENT}
        strokeWidth={1.5}
        markerEnd="url(#arrow-accent)"
      />
      <text
        x={startX + (w + gap) * 4 - gap + 36}
        y={y + 5}
        fill={ACCENT}
        fontSize={13}
      >
        p(x)
      </text>

      {/* legend note */}
      <text x={20} y={60} fill={DIM} fontSize={11}>
        4 MAC stages · 1 cycle each · 4-cycle deterministic latency
      </text>

      <defs>
        <marker
          id="arrow-accent"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L6,4 L0,8 z" fill={ACCENT} />
        </marker>
        <marker
          id="arrow-dim"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L6,4 L0,8 z" fill={DIM} />
        </marker>
      </defs>
    </g>
  )
}

function FiberVsMicrowave() {
  const start = 70
  const fiberEnd = 640
  const microEnd = 450
  const fiberY = 110
  const microY = 160
  const h = 26

  return (
    <g fontFamily="var(--font-mono)">
      {/* departure line */}
      <line x1={start} y1={90} x2={start} y2={210} stroke={LINE} strokeWidth={1} />
      <text x={start} y={82} fill={DIM} fontSize={11} textAnchor="middle">
        t = 0
      </text>

      {/* fiber bar */}
      <rect x={start} y={fiberY} width={fiberEnd - start} height={h} rx={3} fill="#262626" />
      <text x={fiberEnd + 10} y={fiberY + 18} fill={TEXT} fontSize={13}>
        fiber · ~5.5 ms
      </text>

      {/* microwave bar */}
      <rect x={start} y={microY} width={microEnd - start} height={h} rx={3} fill={ACCENT} opacity={0.85} />
      <text x={microEnd + 10} y={microY + 18} fill={ACCENT} fontSize={13}>
        microwave · ~3.8 ms
      </text>

      {/* gap bracket */}
      <line x1={microEnd} y1={fiberY} x2={microEnd} y2={microY + h} stroke={ACCENT} strokeWidth={1} strokeDasharray="3 3" />
      <line x1={fiberEnd} y1={fiberY} x2={fiberEnd} y2={microY + h} stroke={DIM} strokeWidth={1} strokeDasharray="3 3" />
      <line x1={microEnd} y1={microY + h + 14} x2={fiberEnd} y2={microY + h + 14} stroke={ACCENT} strokeWidth={1} />
      <line x1={microEnd} y1={microY + h + 9} x2={microEnd} y2={microY + h + 19} stroke={ACCENT} strokeWidth={1} />
      <line x1={fiberEnd} y1={microY + h + 9} x2={fiberEnd} y2={microY + h + 19} stroke={ACCENT} strokeWidth={1} />
      <text x={(microEnd + fiberEnd) / 2} y={microY + h + 36} fill={ACCENT} fontSize={12} textAnchor="middle">
        ≈ 1.7 ms
      </text>

      {/* route axis */}
      <line x1={start} y1={230} x2={fiberEnd} y2={230} stroke={LINE} strokeWidth={1} />
      <circle cx={start} cy={230} r={3} fill={DIM} />
      <circle cx={fiberEnd} cy={230} r={3} fill={DIM} />
      <text x={start} y={250} fill={DIM} fontSize={11}>
        Carteret, NJ
      </text>
      <text x={fiberEnd} y={250} fill={DIM} fontSize={11} textAnchor="end">
        Aurora, IL
      </text>
      <text x={(start + fiberEnd) / 2} y={250} fill={DIM} fontSize={11} textAnchor="middle">
        ~1,100 km
      </text>
    </g>
  )
}

function StorageStack() {
  const layers = [
    { label: "application", note: "write() returned", honest: false, lie: false },
    { label: "filesystem", note: "fsync(fd) issued", honest: false, lie: false },
    { label: "OS page cache", note: "kernel: \"flushed\"", honest: false, lie: true },
    { label: "block layer", note: "passed to device", honest: false, lie: false },
    { label: "device write cache", note: "drive: \"done\"", honest: false, lie: true },
    { label: "media · platter / NAND", note: "the only truth", honest: true, lie: false },
  ]
  const top = 50
  const h = 50
  const gap = 6
  const x0 = 40
  const w = 400

  return (
    <g fontFamily="var(--font-mono)">
      {layers.map((l, i) => {
        const y = top + i * (h + gap)
        const border = l.honest ? ACCENT : l.lie ? ACCENT : LINE
        const borderDash = l.lie ? "4 3" : undefined
        return (
          <g key={i}>
            <rect
              x={x0}
              y={y}
              width={w}
              height={h}
              rx={4}
              fill={FILL}
              stroke={border}
              strokeWidth={1}
              strokeDasharray={borderDash}
            />
            <text x={x0 + 14} y={y + 30} fill={l.honest ? WHITE : TEXT} fontSize={13}>
              {l.label}
            </text>
            <line x1={x0 + w} y1={y + h / 2} x2={x0 + w + 24} y2={y + h / 2} stroke={l.lie ? ACCENT : DIM} strokeWidth={1} />
            <text
              x={x0 + w + 34}
              y={y + 27}
              fill={l.lie ? ACCENT : l.honest ? WHITE : DIM}
              fontSize={12}
            >
              {l.lie ? "✗ " : l.honest ? "✓ " : "· "}
              {l.note}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function RaidWriteHole() {
  const cells = [
    { label: "D₁", x: 60 },
    { label: "D₂", x: 210 },
    { label: "D₃", x: 360 },
    { label: "P", x: 510 },
  ]
  const y = 90
  const w = 130
  const h = 60

  return (
    <g fontFamily="var(--font-mono)">
      <text x={60} y={70} fill={DIM} fontSize={11}>
        stripe · P = D₁ ⊕ D₂ ⊕ D₃
      </text>
      {cells.map((c, i) => {
        const isWrite = c.label === "D₂"
        const isParity = c.label === "P"
        return (
          <g key={i}>
            <rect
              x={c.x}
              y={y}
              width={w}
              height={h}
              rx={4}
              fill={FILL}
              stroke={isParity ? ACCENT : LINE}
              strokeWidth={1}
              strokeDasharray={isParity ? "5 3" : undefined}
            />
            <text x={c.x + w / 2} y={y + 35} fill={isParity ? ACCENT : WHITE} fontSize={15} textAnchor="middle">
              {c.label}
              {isParity && " (stale)"}
              {isWrite && "′"}
            </text>

            {isWrite && (
              <g>
                <line x1={c.x + w / 2} y1={y + h} x2={c.x + w / 2} y2={y + h + 36} stroke={ACCENT} strokeWidth={1.5} />
                <text x={c.x + w / 2} y={y + h + 56} fill={ACCENT} fontSize={12} textAnchor="middle">
                  write D₂′ ✓
                </text>
              </g>
            )}
            {isParity && (
              <g>
                <line
                  x1={c.x + w / 2}
                  y1={y + h}
                  x2={c.x + w / 2}
                  y2={y + h + 36}
                  stroke={ACCENT}
                  strokeWidth={1.5}
                  strokeDasharray="3 4"
                  opacity={0.5}
                />
                <text x={c.x + w / 2} y={y + h + 56} fill={ACCENT} fontSize={12} textAnchor="middle" opacity={0.8}>
                  write P′ ✗ ⚡
                </text>
              </g>
            )}
          </g>
        )
      })}
      <text x={360} y={240} fill={DIM} fontSize={11} textAnchor="middle">
        crash between the two writes → parity inconsistent → silent until rebuild
      </text>
    </g>
  )
}

function MerkleTree() {
  const leafY = 290
  const intY = 190
  const rootY = 80
  const leaves = [
    { label: "B₀", hash: "h₀", x: 70 },
    { label: "B₁", hash: "h₁", x: 230 },
    { label: "B₂", hash: "h₂", x: 390, corrupt: true },
    { label: "B₃", hash: "h₃", x: 550 },
  ]
  const internals = [
    { label: "H₀₁", x: 150, parentOf: [0, 1] },
    { label: "H₂₃", x: 470, parentOf: [2, 3], onPath: true },
  ]
  const root = { label: "root", x: 310, onPath: true }
  const w = 110
  const lh = 48
  const ih = 40
  const rh = 44

  return (
    <g fontFamily="var(--font-mono)">
      {/* edges leaves -> internals */}
      {internals.map((n, ni) =>
        n.parentOf.map((li) => {
          const leaf = leaves[li]
          const onPath = leaf.corrupt && n.onPath
          return (
            <line
              key={`e1-${ni}-${li}`}
              x1={leaf.x + w / 2}
              y1={leafY}
              x2={n.x + w / 2}
              y2={intY + ih}
              stroke={onPath ? ACCENT : LINE}
              strokeWidth={onPath ? 1.6 : 1}
            />
          )
        })
      )}
      {/* edges internals -> root */}
      {internals.map((n, ni) => (
        <line
          key={`e2-${ni}`}
          x1={n.x + w / 2}
          y1={intY}
          x2={root.x + w / 2}
          y2={rootY + rh}
          stroke={n.onPath ? ACCENT : LINE}
          strokeWidth={n.onPath ? 1.6 : 1}
        />
      ))}

      {/* leaves */}
      {leaves.map((l, i) => (
        <g key={`l-${i}`}>
          <rect
            x={l.x}
            y={leafY}
            width={w}
            height={lh}
            rx={4}
            fill={FILL}
            stroke={l.corrupt ? ACCENT : LINE}
            strokeWidth={1}
            strokeDasharray={l.corrupt ? "5 3" : undefined}
          />
          <text x={l.x + w / 2} y={leafY + 20} fill={l.corrupt ? ACCENT : WHITE} fontSize={13} textAnchor="middle">
            {l.label}
          </text>
          <text x={l.x + w / 2} y={leafY + 38} fill={l.corrupt ? ACCENT : DIM} fontSize={11} textAnchor="middle">
            {l.hash}
            {l.corrupt && " ✗"}
          </text>
        </g>
      ))}

      {/* internals */}
      {internals.map((n, i) => (
        <g key={`i-${i}`}>
          <rect
            x={n.x}
            y={intY}
            width={w}
            height={ih}
            rx={4}
            fill={n.onPath ? "rgba(255,107,53,0.10)" : FILL}
            stroke={n.onPath ? ACCENT : LINE}
            strokeWidth={1}
          />
          <text x={n.x + w / 2} y={intY + 26} fill={n.onPath ? ACCENT : TEXT} fontSize={12} textAnchor="middle">
            {n.label}
          </text>
        </g>
      ))}

      {/* root */}
      <rect x={root.x} y={rootY} width={w} height={rh} rx={4} fill="rgba(255,107,53,0.12)" stroke={ACCENT} strokeWidth={1.2} />
      <text x={root.x + w / 2} y={rootY + 28} fill={ACCENT} fontSize={13} textAnchor="middle">
        {root.label}
      </text>

      <text x={490} y={106} fill={DIM} fontSize={11}>
        ← one bad leaf flips the root
      </text>
    </g>
  )
}

function SplitBrain() {
  const nodes = [
    { label: "A", x: 130 },
    { label: "B", x: 250 },
    { label: "C", x: 370 },
    { label: "D", x: 490 },
    { label: "E", x: 610 },
  ]
  const y = 110
  const r = 22
  const partA = [0, 1, 2]
  return (
    <g fontFamily="var(--font-mono)">
      {/* partition line */}
      <line x1={430} y1={70} x2={430} y2={300} stroke={ACCENT} strokeWidth={1} strokeDasharray="4 4" opacity={0.6} />
      <text x={430} y={62} fill={ACCENT} fontSize={11} textAnchor="middle">
        network partition
      </text>
      {nodes.map((n, i) => {
        const inA = partA.includes(i)
        const leader = i === 0
        return (
          <g key={i}>
            <circle cx={n.x} cy={y} r={r} fill={FILL} stroke={leader ? ACCENT : LINE} strokeWidth={leader ? 1.5 : 1} />
            <text x={n.x} y={y + 5} fill={leader ? ACCENT : WHITE} fontSize={13} textAnchor="middle">
              {n.label}
            </text>
            <text x={n.x} y={y + r + 18} fill={DIM} fontSize={10} textAnchor="middle">
              {leader ? "leader 1" : inA ? "follower" : "stale"}
            </text>
          </g>
        )
      })}
      {/* second leader after partition: assume D becomes leader in partition B */}
      <g>
        <circle cx={nodes[3].x} cy={y} r={r} fill="none" stroke={ACCENT} strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={nodes[3].x} y={y + 5} fill={ACCENT} fontSize={13} textAnchor="middle">
          D
        </text>
        <text x={nodes[3].x} y={y + r + 18} fill={ACCENT} fontSize={10} textAnchor="middle">
          leader 2
        </text>
      </g>
      {/* quorum brackets */}
      <line x1={108} y1={y - r - 14} x2={392} y2={y - r - 14} stroke={DIM} strokeWidth={1} />
      <text x={250} y={y - r - 22} fill={DIM} fontSize={11} textAnchor="middle">
        majority of partition A · writes v1
      </text>
      <line x1={468} y1={y - r - 14} x2={632} y2={y - r - 14} stroke={ACCENT} strokeWidth={1} />
      <text x={550} y={y - r - 22} fill={ACCENT} fontSize={11} textAnchor="middle">
        majority of B · writes v2
      </text>
      {/* conflict */}
      <text x={360} y={200} fill={ACCENT} fontSize={12} textAnchor="middle">
        v1 ≠ v2 · both &quot;decided&quot; · no overlap
      </text>
      <text x={360} y={230} fill={DIM} fontSize={11} textAnchor="middle">
        5-node cluster partitions 3–2 · each side elects its own leader
      </text>
    </g>
  )
}

function Paxos() {
  const yP = 90
  const yA = [170, 210, 250]
  const yL = 320
  const px = 80
  const ax = [260, 360, 460]
  const lx = 620
  return (
    <g fontFamily="var(--font-mono)">
      {/* role labels */}
      <text x={px} y={60} fill={WHITE} fontSize={12}>Proposer</text>
      {ax.map((x, i) => (
        <text key={i} x={x} y={yA[i] - 18} fill={WHITE} fontSize={12} textAnchor="middle">Acceptor {i + 1}</text>
      ))}
      <text x={lx} y={yL - 18} fill={WHITE} fontSize={12} textAnchor="middle">Learner</text>

      {/* nodes */}
      <circle cx={px} cy={yP} r={20} fill={FILL} stroke={ACCENT} strokeWidth={1.4} />
      <text x={px} y={yP + 5} fill={ACCENT} fontSize={11} textAnchor="middle">P</text>
      {ax.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={yA[i]} r={18} fill={FILL} stroke={LINE} strokeWidth={1} />
          <text x={x} y={yA[i] + 5} fill={WHITE} fontSize={10} textAnchor="middle">A{i + 1}</text>
        </g>
      ))}
      <circle cx={lx} cy={yL} r={20} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={lx} y={yL + 5} fill={WHITE} fontSize={11} textAnchor="middle">L</text>

      {/* Phase 1 arrows: Prepare → Acceptors */}
      {ax.map((x, i) => (
        <g key={`p1-${i}`}>
          <line x1={px + 20} y1={yP + 4} x2={x - 18} y2={yA[i] - 4} stroke={ACCENT} strokeWidth={1} markerEnd="url(#arrow-accent)" />
        </g>
      ))}
      <text x={150} y={yP + 30} fill={ACCENT} fontSize={11}>Prepare(n)</text>

      {/* Promise arrows back */}
      {ax.map((x, i) => (
        <line key={`pr-${i}`} x1={x - 18} y1={yA[i] + 4} x2={px + 20} y2={yP + 14} stroke={DIM} strokeWidth={1} markerEnd="url(#arrow-dim)" strokeDasharray="3 3" />
      ))}
      <text x={150} y={yP + 60} fill={DIM} fontSize={11}>Promise(n, v_prev)</text>

      {/* Phase 2 arrows: Accept → Acceptors */}
      {ax.map((x, i) => (
        <line key={`p2-${i}`} x1={px + 20} y1={yP + 22} x2={x - 18} y2={yA[i] + 8} stroke={ACCENT} strokeWidth={1} markerEnd="url(#arrow-accent)" />
      ))}
      <text x={150} y={yP + 90} fill={ACCENT} fontSize={11}>Accept(n, v)</text>

      {/* Accepted → Learner */}
      {ax.map((x, i) => (
        <line key={`ac-${i}`} x1={x + 18} y1={yA[i]} x2={lx - 20} y2={yL} stroke={DIM} strokeWidth={1} markerEnd="url(#arrow-dim)" strokeDasharray="3 3" />
      ))}
      <text x={520} y={yL - 8} fill={DIM} fontSize={11}>Accepted(n)</text>

      {/* phase labels */}
      <text x={10} y={130} fill={ACCENT} fontSize={10} opacity={0.85}>phase 1</text>
      <text x={10} y={200} fill={ACCENT} fontSize={10} opacity={0.85}>phase 2</text>
    </g>
  )
}

function RaftTimeline() {
  const terms = [
    { x: 60, w: 160, label: "term 1", note: "S1 leader" },
    { x: 220, w: 140, label: "term 2", note: "S2 leader (split vote → S3 wins)" },
    { x: 360, w: 180, label: "term 3", note: "S5 leader (S2 down)" },
    { x: 540, w: 160, label: "term 4", note: "S2 re-elected" },
  ]
  const y = 120
  const h = 40
  return (
    <g fontFamily="var(--font-mono)">
      {/* time axis */}
      <line x1={40} y1={y - 30} x2={710} y2={y - 30} stroke={DIM} strokeWidth={1} />
      <text x={40} y={y - 38} fill={DIM} fontSize={11}>time →</text>

      {terms.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={y} width={t.w} height={h} rx={4} fill={FILL} stroke={i === 2 ? ACCENT : LINE} strokeWidth={1} />
          <text x={t.x + t.w / 2} y={y + 18} fill={i === 2 ? ACCENT : WHITE} fontSize={12} textAnchor="middle">
            {t.label}
          </text>
          <text x={t.x + t.w / 2} y={y + 33} fill={i === 2 ? ACCENT : DIM} fontSize={9} textAnchor="middle">
            {t.note.length > 22 ? t.note.slice(0, 22) + "…" : t.note}
          </text>
          {i < terms.length - 1 && (
            <line x1={t.x + t.w} y1={y - 6} x2={t.x + t.w} y2={y + h + 6} stroke={LINE} strokeWidth={1} />
          )}
        </g>
      ))}

      {/* log replication row under term 3 */}
      <text x={40} y={200} fill={WHITE} fontSize={11}>S5 log (term 3):</text>
      {["i=1 v=a", "i=2 v=b", "i=3 v=c"].map((cell, i) => {
        const cx = 200 + i * 110
        return (
          <g key={i}>
            <rect x={cx} y={186} width={100} height={28} rx={3} fill={FILL} stroke={ACCENT} strokeWidth={1} />
            <text x={cx + 50} y={204} fill={WHITE} fontSize={10} textAnchor="middle">{cell}</text>
          </g>
        )
      })}
      <text x={540} y={204} fill={ACCENT} fontSize={11}>↑ committed at idx 3</text>

      {/* safety callout */}
      <text x={40} y={260} fill={DIM} fontSize={11}>
        term 4&apos;s leader (S2) must already contain entries 1–3 from term 3
      </text>
      <text x={40} y={278} fill={DIM} fontSize={11}>
        before it can commit anything new — the election restriction guarantees this
      </text>
    </g>
  )
}

function StoreBuffer() {
  return (
    <g fontFamily="var(--font-mono)">
      {/* Core */}
      <rect x={40} y={60} width={110} height={50} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={95} y={90} fill={WHITE} fontSize={13} textAnchor="middle">core</text>

      {/* Store buffer */}
      <rect x={200} y={60} width={140} height={50} rx={4} fill="rgba(255,107,53,0.08)" stroke={ACCENT} strokeWidth={1.2} />
      <text x={270} y={84} fill={ACCENT} fontSize={12} textAnchor="middle">store buffer</text>
      <text x={270} y={100} fill={ACCENT} fontSize={10} textAnchor="middle">[ x ← 1 ]</text>

      {/* Cache / coherence */}
      <rect x={420} y={60} width={140} height={50} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={490} y={84} fill={WHITE} fontSize={12} textAnchor="middle">L1 / cache</text>
      <text x={490} y={100} fill={DIM} fontSize={10} textAnchor="middle">MESI coherence</text>

      {/* Memory */}
      <rect x={620} y={60} width={90} height={50} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={665} y={90} fill={WHITE} fontSize={12} textAnchor="middle">memory</text>

      {/* arrows core -> buffer -> cache -> memory */}
      <line x1={150} y1={85} x2={200} y2={85} stroke={ACCENT} strokeWidth={1.4} markerEnd="url(#arrow-accent)" />
      <line x1={340} y1={85} x2={420} y2={85} stroke={DIM} strokeWidth={1} strokeDasharray="4 4" markerEnd="url(#arrow-dim)" />
      <text x={380} y={78} fill={DIM} fontSize={10} textAnchor="middle">drain</text>
      <line x1={560} y1={85} x2={620} y2={85} stroke={DIM} strokeWidth={1} markerEnd="url(#arrow-dim)" />

      {/* load, bypassing */}
      <rect x={200} y={170} width={140} height={36} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={270} y={192} fill={WHITE} fontSize={11} textAnchor="middle">load y</text>
      <line x1={150} y1={150} x2={150} y2={188} stroke={ACCENT} strokeWidth={1.2} />
      <line x1={150} y1={188} x2={200} y2={188} stroke={ACCENT} strokeWidth={1.4} markerEnd="url(#arrow-accent)" />
      <text x={175} y={180} fill={ACCENT} fontSize={10}>runs now</text>

      {/* other core */}
      <rect x={420} y={170} width={140} height={36} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={490} y={192} fill={DIM} fontSize={11} textAnchor="middle">other core&apos;s view</text>
      <line x1={560} y1={188} x2={620} y2={110} stroke={DIM} strokeWidth={1} strokeDasharray="3 3" />
      <text x={590} y={150} fill={DIM} fontSize={10}>reads memory</text>

      <text x={40} y={250} fill={DIM} fontSize={11}>
        load y executes immediately — does NOT wait for &quot;x ← 1&quot; to drain.
      </text>
      <text x={40} y={268} fill={DIM} fontSize={11}>
        to the core itself, order is preserved (store-buffer forwarding). to
      </text>
      <text x={40} y={284} fill={DIM} fontSize={11}>
        the other core, the store is not visible yet. that is the gap.
      </text>
    </g>
  )
}

function ReorderTable() {
  const rows = ["Store → Store", "Load → Load", "Load → Store", "Store → Load*"]
  const x86 = [false, false, false, true]
  const arm = [true, true, true, true]
  const cellW = 130
  const labelW = 150
  const tableX = 60
  const tableY = 80
  const rowH = 44
  return (
    <g fontFamily="var(--font-mono)">
      {/* header */}
      <text x={tableX} y={tableY - 14} fill={DIM} fontSize={11}>first op → second op</text>
      <rect x={tableX + labelW} y={tableY} width={cellW} height={36} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={tableX + labelW + cellW / 2} y={tableY + 23} fill={WHITE} fontSize={12} textAnchor="middle">x86 (TSO)</text>
      <rect x={tableX + labelW + cellW} y={tableY} width={cellW} height={36} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={tableX + labelW + cellW + cellW / 2} y={tableY + 23} fill={WHITE} fontSize={12} textAnchor="middle">ARM (relaxed)</text>

      {rows.map((r, i) => {
        const y = tableY + 36 + i * rowH
        return (
          <g key={i}>
            <rect x={tableX} y={y} width={labelW} height={rowH} fill={FILL} stroke={LINE} strokeWidth={1} />
            <text x={tableX + 12} y={y + rowH / 2 + 4} fill={WHITE} fontSize={11}>{r}</text>

            <rect x={tableX + labelW} y={y} width={cellW} height={rowH} fill="rgba(255,107,53,0.06)" stroke={LINE} strokeWidth={1} />
            <text x={tableX + labelW + cellW / 2} y={y + rowH / 2 + 4} fill={x86[i] ? ACCENT : DIM} fontSize={13} textAnchor="middle">
              {x86[i] ? "✗ reorder" : "✓ ordered"}
            </text>

            <rect x={tableX + labelW + cellW} y={y} width={cellW} height={rowH} fill="rgba(255,107,53,0.06)" stroke={LINE} strokeWidth={1} />
            <text x={tableX + labelW + cellW + cellW / 2} y={y + rowH / 2 + 4} fill={arm[i] ? ACCENT : DIM} fontSize={13} textAnchor="middle">
              {arm[i] ? "✗ reorder" : "✓ ordered"}
            </text>
          </g>
        )
      })}
      <text x={tableX} y={tableY + 36 + rows.length * rowH + 22} fill={DIM} fontSize={10}>
        * Store → Load: a later load may pass an earlier store to a different address.
      </text>
    </g>
  )
}

function LitmusMP() {
  const colX = [80, 360]
  const storeY = 90
  const loadY = 200
  const rowH = 34

  return (
    <g fontFamily="var(--font-mono)">
      {/* Thread 0 column */}
      <text x={colX[0]} y={60} fill={WHITE} fontSize={12}>Thread 0 (producer)</text>
      <rect x={colX[0]} y={storeY} width={200} height={rowH} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={colX[0] + 12} y={storeY + 22} fill={WHITE} fontSize={12}>x = 1   (data)</text>
      <rect x={colX[0]} y={storeY + rowH + 6} width={200} height={rowH} fill="rgba(255,107,53,0.08)" stroke={ACCENT} strokeWidth={1.2} />
      <text x={colX[0] + 12} y={storeY + rowH + 28} fill={ACCENT} fontSize={12}>y = 1   (flag)</text>
      <text x={colX[0]} y={storeY + 2 * rowH + 60} fill={DIM} fontSize={10}>
        on ARM: these two stores may
      </text>
      <text x={colX[0]} y={storeY + 2 * rowH + 74} fill={DIM} fontSize={10}>
        appear reordered to Thread 1
      </text>

      {/* Thread 1 column */}
      <text x={colX[1]} y={60} fill={WHITE} fontSize={12}>Thread 1 (consumer)</text>
      <rect x={colX[1]} y={loadY} width={240} height={rowH} fill="rgba(255,107,53,0.08)" stroke={ACCENT} strokeWidth={1.2} />
      <text x={colX[1] + 12} y={loadY + 22} fill={ACCENT} fontSize={12}>r1 = y   → 1</text>
      <rect x={colX[1]} y={loadY + rowH + 6} width={240} height={rowH} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={colX[1] + 12} y={loadY + rowH + 28} fill={WHITE} fontSize={12}>r2 = x   → 0  ✗</text>

      {/* forbidden callout */}
      <rect x={80} y={285} width={520} height={32} rx={4} fill="none" stroke={ACCENT} strokeWidth={1} strokeDasharray="4 3" />
      <text x={340} y={306} fill={ACCENT} fontSize={12} textAnchor="middle">
        forbidden outcome: r1 = 1, r2 = 0 — saw the flag but not the data
      </text>
    </g>
  )
}

function ByzCommander() {
  const cx = 130
  const cy = 130
  const lx = [490, 490]
  const ly = [90, 190]
  return (
    <g fontFamily="var(--font-mono)">
      {/* commander (traitor) */}
      <circle cx={cx} cy={cy} r={26} fill="rgba(255,107,53,0.10)" stroke={ACCENT} strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={cx} y={cy + 5} fill={ACCENT} fontSize={13} textAnchor="middle">C</text>
      <text x={cx} y={cy + 46} fill={ACCENT} fontSize={10} textAnchor="middle">traitor</text>

      {/* lieutenants */}
      <circle cx={lx[0]} cy={ly[0]} r={22} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={lx[0]} y={ly[0] + 5} fill={WHITE} fontSize={12} textAnchor="middle">L1</text>
      <text x={lx[0]} y={ly[0] + 40} fill={DIM} fontSize={10} textAnchor="middle">honest</text>

      <circle cx={lx[1]} cy={ly[1]} r={22} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={lx[1]} y={ly[1] + 5} fill={WHITE} fontSize={12} textAnchor="middle">L2</text>
      <text x={lx[1]} y={ly[1] + 40} fill={DIM} fontSize={10} textAnchor="middle">honest</text>

      {/* contradictory messages */}
      <line x1={cx + 24} y1={cy - 10} x2={lx[0] - 22} y2={ly[0] + 4} stroke={ACCENT} strokeWidth={1.4} markerEnd="url(#arrow-accent)" />
      <text x={300} y={100} fill={ACCENT} fontSize={12}>&quot;attack&quot;</text>

      <line x1={cx + 24} y1={cy + 10} x2={lx[1] - 22} y2={ly[1] - 4} stroke={ACCENT} strokeWidth={1.4} markerEnd="url(#arrow-accent)" />
      <text x={300} y={180} fill={ACCENT} fontSize={12}>&quot;retreat&quot;</text>

      <text x={360} y={270} fill={DIM} fontSize={11} textAnchor="middle">
        same commander, two honest lieutenants, two different orders → no agreement
      </text>
    </g>
  )
}

function ThreeFPlusOne() {
  const cols = [
    { label: "N = 3f", x: 80, valid: false },
    { label: "N = 3f + 1", x: 420, valid: true },
  ]
  const y = 100
  const cellW = 60
  const cellH = 40
  return (
    <g fontFamily="var(--font-mono)">
      {cols.map((c, ci) => (
        <g key={ci}>
          <text x={c.x + 120} y={y - 20} fill={c.valid ? ACCENT : DIM} fontSize={13} textAnchor="middle">
            {c.label}{c.valid ? " ✓" : " ✗"}
          </text>
          {/* rows: liars (f), crashed (f), honest (rest) */}
          {[0, 1, 2].map((ri) => {
            const ry = y + ri * (cellH + 4)
            const kind = ri === 0 ? "liar" : ri === 1 ? "crashed" : "honest"
            const fillC = kind === "liar" ? "rgba(255,107,53,0.25)" : kind === "crashed" ? "#222" : "rgba(255,255,255,0.04)"
            const strokeC = kind === "liar" ? ACCENT : kind === "crashed" ? DIM : LINE
            const txtC = kind === "liar" ? ACCENT : kind === "crashed" ? DIM : WHITE
            const count = c.valid ? (ri === 0 ? "f" : ri === 1 ? "f" : "f+1") : (ri === 0 ? "f" : ri === 1 ? "f" : "f")
            return (
              <g key={ri}>
                <rect x={c.x} y={ry} width={cellW} height={cellH} fill={fillC} stroke={strokeC} strokeWidth={1} />
                <text x={c.x + cellW / 2} y={ry + cellH / 2 + 4} fill={txtC} fontSize={12} textAnchor="middle">{count}</text>
                <text x={c.x - 8} y={ry + cellH / 2 + 4} fill={DIM} fontSize={10} textAnchor="end">{kind}</text>
                {/* second cell to visualize overlap */}
                <rect x={c.x + cellW + 8} y={ry} width={cellW} height={cellH} fill={fillC} stroke={strokeC} strokeWidth={1} />
                <text x={c.x + cellW + 8 + cellW / 2} y={ry + cellH / 2 + 4} fill={txtC} fontSize={12} textAnchor="middle">{count}</text>
              </g>
            )
          })}
          <text x={c.x + 120} y={y + 3 * (cellH + 4) + 20} fill={c.valid ? ACCENT : DIM} fontSize={11} textAnchor="middle">
            {c.valid ? "honest f+1 > liars f among active 2f+1" : "honest f = liars f → tie, can't decide"}
          </text>
        </g>
      ))}
    </g>
  )
}

function Pbft() {
  const primary = { x: 100, y: 160, label: "primary" }
  const reps = [
    { x: 320, y: 90, label: "R1" },
    { x: 320, y: 160, label: "R2" },
    { x: 320, y: 230, label: "R3" },
  ]
  const r = 22
  return (
    <g fontFamily="var(--font-mono)">
      {/* primary */}
      <circle cx={primary.x} cy={primary.y} r={r} fill="rgba(255,107,53,0.10)" stroke={ACCENT} strokeWidth={1.4} />
      <text x={primary.x} y={primary.y + 5} fill={ACCENT} fontSize={11} textAnchor="middle">P</text>
      <text x={primary.x} y={primary.y + 40} fill={ACCENT} fontSize={10} textAnchor="middle">primary</text>

      {/* replicas */}
      {reps.map((rep, i) => (
        <g key={i}>
          <circle cx={rep.x} cy={rep.y} r={r} fill={FILL} stroke={LINE} strokeWidth={1} />
          <text x={rep.x} y={rep.y + 5} fill={WHITE} fontSize={10} textAnchor="middle">{rep.label}</text>
        </g>
      ))}
      <text x={reps[reps.length - 1].x} y={reps[reps.length - 1].y + 40} fill={DIM} fontSize={10} textAnchor="middle">replicas</text>

      {/* Phase 1: pre-prepare (primary → all) */}
      {reps.map((rep, i) => (
        <line key={`pp-${i}`} x1={primary.x + r} y1={primary.y} x2={rep.x - r} y2={rep.y} stroke={ACCENT} strokeWidth={1.2} markerEnd="url(#arrow-accent)" />
      ))}
      <text x={200} y={120} fill={ACCENT} fontSize={11}>pre-prepare</text>

      {/* Phase 2: prepare (all-to-all) */}
      {reps.map((a, i) =>
        reps.map((b, j) =>
          i < j ? (
            <line key={`pr-${i}-${j}`} x1={a.x + r} y1={a.y} x2={b.x + r} y2={b.y} stroke={DIM} strokeWidth={1} strokeDasharray="3 3" />
          ) : null
        )
      )}
      <text x={400} y={160} fill={DIM} fontSize={11}>prepare (all ↔ all)</text>

      {/* Phase 3: commit (all-to-all, draw as a cluster on the right) */}
      {reps.map((rep, i) => (
        <g key={`cm-${i}`}>
          <line x1={rep.x + r} y1={rep.y} x2={560} y2={rep.y} stroke={DIM} strokeWidth={1} strokeDasharray="2 4" />
          <circle cx={580} cy={rep.y} r={14} fill={FILL} stroke={ACCENT} strokeWidth={1} />
          <text x={580} y={rep.y + 4} fill={ACCENT} fontSize={9} textAnchor="middle">C{i + 1}</text>
        </g>
      ))}
      <text x={580} y={270} fill={ACCENT} fontSize={11} textAnchor="middle">commit</text>

      <text x={360} y={310} fill={DIM} fontSize={11} textAnchor="middle">
        O(n²) messages per request — the price of not trusting your peers
      </text>
    </g>
  )
}

function LogPlusIndex() {
  return (
    <g fontFamily="var(--font-mono)">
      {/* client write */}
      <text x={40} y={90} fill={WHITE} fontSize={12}>write</text>
      <line x1={80} y1={85} x2={160} y2={85} stroke={ACCENT} strokeWidth={1.4} markerEnd="url(#arrow-accent)" />

      {/* LOG */}
      <rect x={170} y={60} width={160} height={60} rx={4} fill="rgba(255,107,53,0.10)" stroke={ACCENT} strokeWidth={1.4} />
      <text x={250} y={84} fill={ACCENT} fontSize={13} textAnchor="middle">LOG (WAL)</text>
      <text x={250} y={104} fill={ACCENT} fontSize={10} textAnchor="middle">append-only · ordered</text>

      {/* fsync badge */}
      <text x={250} y={140} fill={DIM} fontSize={10} textAnchor="middle">↑ fsync here (durable)</text>

      {/* arrow to index */}
      <line x1={330} y1={90} x2={420} y2={90} stroke={DIM} strokeWidth={1} markerEnd="url(#arrow-dim)" />
      <text x={375} y={82} fill={DIM} fontSize={10} textAnchor="middle">replay</text>

      {/* INDEX */}
      <rect x={430} y={60} width={160} height={60} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={510} y={84} fill={WHITE} fontSize={13} textAnchor="middle">INDEX (b-tree)</text>
      <text x={510} y={104} fill={DIM} fontSize={10} textAnchor="middle">materialized view</text>

      {/* crash recovery row */}
      <text x={40} y={210} fill={WHITE} fontSize={12}>crash</text>
      <line x1={80} y1={205} x2={160} y2={205} stroke={DIM} strokeWidth={1} markerEnd="url(#arrow-dim)" />
      <rect x={170} y={180} width={160} height={50} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={250} y={210} fill={WHITE} fontSize={11} textAnchor="middle">replay log tail</text>
      <line x1={330} y1={205} x2={420} y2={205} stroke={ACCENT} strokeWidth={1.2} markerEnd="url(#arrow-accent)" />
      <text x={375} y={197} fill={ACCENT} fontSize={10} textAnchor="middle">rebuild</text>
      <rect x={430} y={180} width={160} height={50} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} strokeDasharray="4 3" />
      <text x={510} y={210} fill={WHITE} fontSize={11} textAnchor="middle">INDEX restored</text>

      {/* replication row */}
      <text x={40} y={290} fill={WHITE} fontSize={12}>replica</text>
      <line x1={90} y1={285} x2={170} y2={285} stroke={DIM} strokeWidth={1} markerEnd="url(#arrow-dim)" />
      <text x={250} y={290} fill={DIM} fontSize={10} textAnchor="middle">ships log → follower rebuilds same index</text>
    </g>
  )
}

function LsmTree() {
  const levels = [
    { label: "memtable", x: 60, w: 120, note: "in-memory", y: 90 },
    { label: "L0", x: 240, w: 90, note: "flushed", y: 90 },
    { label: "L1", x: 380, w: 130, note: "compacted", y: 90 },
    { label: "L2", x: 560, w: 150, note: "compacted", y: 90 },
  ]
  return (
    <g fontFamily="var(--font-mono)">
      {/* write arrow */}
      <text x={20} y={70} fill={ACCENT} fontSize={12}>write →</text>
      <line x1={20} y1={78} x2={60} y2={90} stroke={ACCENT} strokeWidth={1.2} markerEnd="url(#arrow-accent)" />

      {levels.map((l, i) => {
        const next = levels[i + 1]
        return (
          <g key={i}>
            <rect x={l.x} y={l.y} width={l.w} height={44} rx={4} fill={i === 0 ? "rgba(255,107,53,0.10)" : FILL} stroke={i === 0 ? ACCENT : LINE} strokeWidth={1} />
            <text x={l.x + l.w / 2} y={l.y + 19} fill={i === 0 ? ACCENT : WHITE} fontSize={12} textAnchor="middle">{l.label}</text>
            <text x={l.x + l.w / 2} y={l.y + 35} fill={DIM} fontSize={9} textAnchor="middle">{l.note}</text>
            {next && (
              <line x1={l.x + l.w} y1={l.y + 22} x2={next.x} y2={next.y + 22} stroke={DIM} strokeWidth={1} markerEnd="url(#arrow-dim)" />
            )}
          </g>
        )
      })}

      {/* compaction label */}
      <text x={400} y={160} fill={ACCENT} fontSize={11} textAnchor="middle">↑ background compaction merges + sorts</text>

      {/* read path */}
      <text x={20} y={220} fill={WHITE} fontSize={12}>read →</text>
      <line x1={20} y1={228} x2={60} y2={240} stroke={WHITE} strokeWidth={1} markerEnd="url(#arrow-dim)" />
      <rect x={60} y={226} width={120} height={36} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={120} y={249} fill={WHITE} fontSize={11} textAnchor="middle">memtable?</text>
      <line x1={180} y1={244} x2={240} y2={244} stroke={DIM} strokeWidth={1} markerEnd="url(#arrow-dim)" />
      <rect x={240} y={226} width={90} height={36} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={285} y={249} fill={WHITE} fontSize={11} textAnchor="middle">L0</text>
      <line x1={330} y1={244} x2={380} y2={244} stroke={DIM} strokeWidth={1} markerEnd="url(#arrow-dim)" />
      <rect x={380} y={226} width={130} height={36} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={445} y={249} fill={WHITE} fontSize={11} textAnchor="middle">L1 ...</text>
      <line x1={510} y1={244} x2={560} y2={244} stroke={DIM} strokeWidth={1} markerEnd="url(#arrow-dim)" />
      <rect x={560} y={226} width={150} height={36} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
      <text x={635} y={249} fill={WHITE} fontSize={11} textAnchor="middle">L2 (bloom skip)</text>

      <text x={360} y={300} fill={DIM} fontSize={11} textAnchor="middle">
        writes: one append · reads: check several (bloom filters skip empties)
      </text>
      <text x={360} y={318} fill={DIM} fontSize={11} textAnchor="middle">
        compaction rewrites files to discard overwritten / deleted keys
      </text>
    </g>
  )
}

function LogSpine() {
  const views = [
    { label: "Postgres table", x: 80 },
    { label: "Raft log (cluster)", x: 280 },
    { label: "Kafka topic (org)", x: 500 },
  ]
  const spineY = 200
  return (
    <g fontFamily="var(--font-mono)">
      <text x={40} y={60} fill={DIM} fontSize={11}>one committed history · different scopes</text>

      {views.map((v, i) => (
        <g key={i}>
          <rect x={v.x} y={90} width={160} height={44} rx={4} fill={FILL} stroke={LINE} strokeWidth={1} />
          <text x={v.x + 80} y={117} fill={WHITE} fontSize={11} textAnchor="middle">{v.label}</text>
          <line x1={v.x + 80} y1={134} x2={v.x + 80} y2={spineY - 20} stroke={DIM} strokeWidth={1} strokeDasharray="3 3" />
        </g>
      ))}

      {/* the spine */}
      <rect x={60} y={spineY - 16} width={600} height={32} rx={4} fill="rgba(255,107,53,0.10)" stroke={ACCENT} strokeWidth={1.4} />
      <text x={360} y={spineY + 5} fill={ACCENT} fontSize={13} textAnchor="middle">the log · append-only · totally ordered</text>

      <text x={160} y={250} fill={DIM} fontSize={10} textAnchor="middle">one machine&apos;s durability</text>
      <text x={360} y={250} fill={DIM} fontSize={10} textAnchor="middle">a cluster&apos;s agreement</text>
      <text x={580} y={250} fill={DIM} fontSize={10} textAnchor="middle">an org&apos;s event backbone</text>
    </g>
  )
}

export function Figure({ children }: { children: React.ReactNode }) {
  return <figure className="figure">{children}</figure>
}

export function Caption({ children }: { children: React.ReactNode }) {
  return <figcaption className="caption">{children}</figcaption>
}
