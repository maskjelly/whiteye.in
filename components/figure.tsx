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
}

const ACCENT = "#ff6b35"
const TEXT = "#9ca3af"
const DIM = "#6b7280"
const LINE = "#262626"
const FILL = "#181818"
const WHITE = "#ffffff"

export function Diagram({ viewBox, title, nodes, datapath, compare, stack, raidhole, merkle }: DiagramProps) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={title ?? "diagram"}>
      <DiagramHeader title={title} />
      {nodes && <Pipeline nodes={nodes} />}
      {datapath && <HornerDatapath />}
      {compare && <FiberVsMicrowave />}
      {stack && <StorageStack />}
      {raidhole && <RaidWriteHole />}
      {merkle && <MerkleTree />}
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

export function Figure({ children }: { children: React.ReactNode }) {
  return <figure className="figure">{children}</figure>
}

export function Caption({ children }: { children: React.ReactNode }) {
  return <figcaption className="caption">{children}</figcaption>
}
