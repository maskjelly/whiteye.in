"use client"

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
} from "react"
import { XpIcon } from "./xp-icons"
import type { OpenApp } from "./xp-apps"
import {
  MINE_COUNT,
  MINE_SIZE,
  newMineGame,
  revealMineCell,
  toggleMineFlag,
  SUITS,
  newSolitaireGame,
  drawSolitaireCard,
  moveSolitaireCards,
  selectedSolitaireCards,
  solitaireWon,
  isRedCard,
  findSolitaireHint,
  type CardSource,
  type CardTarget,
  type PlayingCard,
  type SolitaireGame,
} from "@/lib/xp-games"

export function GamesApp({ open }: { open: OpenApp }) {
  return (
    <div className="games-library">
      <div className="folder-heading">
        <XpIcon name="solitaire" size={48} />
        <div>
          <h1>The good old games.</h1>
          <p>No downloads. Just one more round.</p>
        </div>
      </div>
      <button className="game-launch" onClick={() => open("minesweeper")}>
        <XpIcon name="minesweeper" size={48} />
        <span>
          <strong>Minesweeper</strong>
          <small>9 × 9 squares. 10 mines. Trust the numbers.</small>
          <span className="game-launch-link">Play Minesweeper →</span>
        </span>
      </button>
      <button className="game-launch" onClick={() => open("solitaire")}>
        <XpIcon name="solitaire" size={48} />
        <span>
          <strong>Solitaire</strong>
          <small>The classic green table. Draw one, take your time.</small>
          <span className="game-launch-link">Deal me in →</span>
        </span>
      </button>
      <p className="games-library-note">
        Your game stays put when you minimize its window.
      </p>
    </div>
  )
}

function MineSymbol({ flag = false }: { flag?: boolean }) {
  return flag ? (
    <svg viewBox="0 0 20 20" width="19" height="19" aria-hidden="true">
      <path d="M10 2 3 6l7 3Z" fill="#e1272c" />
      <path d="M10 2v12H7v2H4v2h12v-2h-3v-2h-2V2Z" fill="#171717" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" width="19" height="19" aria-hidden="true">
      <path
        d="M9 0h2v20H9ZM0 9h20v2H0Zm2-6 1-1 15 15-1 1ZM2 17 17 2l1 1L3 18Z"
        fill="#111"
      />
      <circle cx="10" cy="10" r="6" fill="#111" />
      <rect x="6" y="5" width="3" height="3" fill="#fff" />
    </svg>
  )
}

function MineFace({ status }: { status: string }) {
  return (
    <svg viewBox="0 0 28 28" width="27" height="27" aria-hidden="true">
      <circle
        cx="14"
        cy="14"
        r="11"
        fill="#ffff00"
        stroke="#141414"
        strokeWidth="1.5"
      />
      {status === "lost" ? (
        <path
          d="m8 8 4 4m0-4-4 4m8-4 4 4m0-4-4 4m-7 7q5-5 10 0"
          fill="none"
          stroke="#111"
          strokeWidth="1.7"
        />
      ) : (
        <>
          {status === "won" ? (
            <path d="M5 9h18l-3 5h-4l-2-3-2 3H8Z" fill="#111" />
          ) : (
            <>
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="18" cy="10" r="1.5" />
            </>
          )}
          <path
            d="M8 17q6 7 12 0"
            fill="none"
            stroke="#111"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  )
}

export function MinesweeperApp() {
  const [game, setGame] = useState(newMineGame)
  const [flagMode, setFlagMode] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [help, setHelp] = useState(false)
  const startedAt = useRef<number | null>(null)
  const grid = useRef<HTMLDivElement>(null)
  const [focusedCell, setFocusedCell] = useState(0)
  const flags = game.cells.filter((cell) => cell.flagged).length

  useEffect(() => {
    if (game.status === "ready") {
      startedAt.current = null
      setSeconds(0)
      return
    }
    if (game.status !== "playing") return
    if (startedAt.current === null) startedAt.current = Date.now()
    const timer = setInterval(
      () =>
        setSeconds(
          Math.min(999, Math.floor((Date.now() - startedAt.current!) / 1000))
        ),
      1000
    )
    return () => clearInterval(timer)
  }, [game.status])

  function restart() {
    setGame(newMineGame())
    setFlagMode(false)
    setSeconds(0)
    startedAt.current = null
  }
  function reveal(index: number) {
    setGame((current) =>
      flagMode ? toggleMineFlag(current, index) : revealMineCell(current, index)
    )
  }
  function onGridKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -MINE_SIZE,
      ArrowDown: MINE_SIZE,
    }
    if (!(event.key in offsets)) return
    event.preventDefault()
    const next = Math.max(
      0,
      Math.min(MINE_SIZE ** 2 - 1, index + offsets[event.key])
    )
    setFocusedCell(next)
    grid.current
      ?.querySelector<HTMLButtonElement>(`[data-cell="${next}"]`)
      ?.focus()
  }

  const message =
    game.status === "won"
      ? "You cleared the field! Nicely done."
      : game.status === "lost"
        ? "Boom. One more round? Click the face to restart."
        : flagMode
          ? "Flag mode: click a covered square to mark a mine."
          : game.status === "ready"
            ? "Click any square to start. Your first click is safe."
            : "Clear every safe square. Right-click to place a flag."

  return (
    <div className="minesweeper-app">
      <div className="game-controls">
        <button className="xp-button" onClick={restart}>
          New game
        </button>
        <button
          className={`xp-button ${flagMode ? "game-button-selected" : ""}`}
          aria-pressed={flagMode}
          onClick={() => setFlagMode((value) => !value)}
        >
          Flag mode
        </button>
        <button
          className="game-help-button"
          aria-expanded={help}
          onClick={() => setHelp((value) => !value)}
        >
          How to play
        </button>
      </div>
      {help && (
        <div className="game-rules">
          <strong>Find the 10 mines.</strong> Numbers count nearby mines,
          including diagonals. Right-click to flag, or turn on Flag mode on a
          phone. Click a revealed number once its nearby mines are flagged to
          clear the surrounding squares. Use arrow keys to move and Enter to
          open.
        </div>
      )}
      <div className="mine-machine">
        <div className="mine-dashboard">
          <output
            className="mine-counter"
            aria-label={`${MINE_COUNT - flags} unflagged mines`}
          >
            {String(MINE_COUNT - flags).padStart(3, "0")}
          </output>
          <button
            className="mine-face"
            onClick={restart}
            aria-label="Restart Minesweeper"
          >
            <MineFace status={game.status} />
          </button>
          <output
            className="mine-counter"
            aria-label={`${seconds} seconds elapsed`}
          >
            {String(seconds).padStart(3, "0")}
          </output>
        </div>
        <div
          className="mine-grid"
          role="group"
          aria-label="Minesweeper board"
          ref={grid}
        >
          {game.cells.map((cell, index) => {
            const wrongFlag =
              game.status === "lost" && cell.flagged && !cell.mine
            const label = cell.flagged
              ? wrongFlag
                ? "incorrect flag"
                : "flagged"
              : cell.open
                ? cell.mine
                  ? "mine"
                  : cell.adjacent
                    ? `${cell.adjacent} adjacent mines`
                    : "empty"
                : "covered"
            return (
              <button
                key={index}
                data-cell={index}
                data-number={cell.adjacent}
                tabIndex={focusedCell === index ? 0 : -1}
                onFocus={() => setFocusedCell(index)}
                onKeyDown={(event) => onGridKey(event, index)}
                aria-label={`Row ${Math.floor(index / MINE_SIZE) + 1}, column ${(index % MINE_SIZE) + 1}: ${label}`}
                className={`mine-cell ${cell.open ? "is-open" : ""} ${index === game.exploded ? "is-exploded" : ""}`}
                onClick={() => reveal(index)}
                onContextMenu={(event) => {
                  event.preventDefault()
                  setGame((current) => toggleMineFlag(current, index))
                }}
              >
                {wrongFlag ? (
                  <span className="mine-wrong-flag">×</span>
                ) : cell.flagged ? (
                  <MineSymbol flag />
                ) : cell.open && cell.mine ? (
                  <MineSymbol />
                ) : cell.open && cell.adjacent ? (
                  cell.adjacent
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
      <p
        className={`mine-message ${game.status === "won" ? "game-won-message" : ""}`}
        role="status"
      >
        {message}
      </p>
      <p className="game-small-print">Beginner · 9 × 9 · 10 mines</p>
    </div>
  )
}

const suitSymbols = { clubs: "♣", diamonds: "♦", hearts: "♥", spades: "♠" }
function cardRank(rank: number) {
  return ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"][
    rank
  ]
}
function cardName(card: PlayingCard) {
  return `${({ 1: "Ace", 11: "Jack", 12: "Queen", 13: "King" } as Record<number, string>)[card.rank] ?? card.rank} of ${card.suit}`
}
function sameSource(a: CardSource | null, b: CardSource) {
  return (
    a?.pile === b.pile &&
    (a.pile === "waste" ||
      (b.pile !== "waste" &&
        a.column === b.column &&
        (a.pile !== "tableau" ||
          (b.pile === "tableau" && a.index === b.index))))
  )
}

function CardFace({ card }: { card: PlayingCard }) {
  return (
    <>
      <span className="card-corner">
        <strong>{cardRank(card.rank)}</strong>
        <span>{suitSymbols[card.suit]}</span>
      </span>
      <span className="card-center">{suitSymbols[card.suit]}</span>
      <span className="card-corner card-corner-bottom">
        <strong>{cardRank(card.rank)}</strong>
        <span>{suitSymbols[card.suit]}</span>
      </span>
    </>
  )
}

export function SolitaireApp() {
  const [game, setGame] = useState(() => newSolitaireGame())
  const [history, setHistory] = useState<SolitaireGame[]>([])
  const [selected, setSelected] = useState<CardSource | null>(null)
  const [hintTarget, setHintTarget] = useState<CardTarget | null>(null)
  const [help, setHelp] = useState(false)
  const [message, setMessage] = useState(
    "Build down in alternating colors. Aces go up top."
  )
  const dragSource = useRef<CardSource | null>(null)
  const won = solitaireWon(game)
  const homeCount = game.foundations.reduce((sum, pile) => sum + pile.length, 0)

  function record(next: SolitaireGame) {
    if (next === game) return
    setHistory((current) => [...current.slice(-99), game])
    setGame(next)
    setSelected(null)
    setHintTarget(null)
    setMessage(
      solitaireWon(next) ? "All 52 cards home. You won!" : "Nice. Keep going."
    )
  }
  function restart() {
    setGame(newSolitaireGame())
    setHistory([])
    setSelected(null)
    setHintTarget(null)
    setMessage("New deal. Good luck!")
  }
  function undo() {
    const previous = history[history.length - 1]
    if (!previous) return
    setGame(previous)
    setHistory((current) => current.slice(0, -1))
    setSelected(null)
    setHintTarget(null)
    setMessage("Move undone.")
  }
  function move(source: CardSource, target: CardTarget): boolean {
    const next = moveSolitaireCards(game, source, target)
    if (!next) return false
    record(next)
    return true
  }
  function selectCard(source: CardSource) {
    if (
      selected &&
      source.pile !== "waste" &&
      !sameSource(selected, source) &&
      move(selected, { pile: source.pile, column: source.column })
    )
      return
    if (sameSource(selected, source)) {
      setSelected(null)
      setHintTarget(null)
      setMessage("Selection cleared.")
      return
    }
    const card = selectedSolitaireCards(game, source)[0]
    if (!card) return
    setSelected(source)
    setHintTarget(null)
    setMessage(
      `${cardName(card)} selected. Click a destination, or double-click to send it home.`
    )
  }
  function targetClick(target: CardTarget) {
    if (selected && move(selected, target)) return
    setMessage(
      target.pile === "foundation"
        ? "Foundations start with an Ace and build up in the same suit."
        : "Empty columns need a King. Other columns build down in alternating colors."
    )
  }
  function sendHome(source: CardSource) {
    for (let column = 0; column < 4; column++)
      if (move(source, { pile: "foundation", column })) return
    setMessage("That card cannot go to a foundation yet.")
  }
  function hint() {
    const next = findSolitaireHint(game)
    if (next) {
      const card = selectedSolitaireCards(game, next.source)[0]
      setSelected(next.source)
      setHintTarget(next.target)
      setMessage(
        `Try ${cardName(card)} → ${next.target.pile === "foundation" ? "foundation" : "column"} ${next.target.column + 1}.`
      )
    } else {
      setSelected(null)
      setHintTarget(null)
      setMessage(
        game.stock.length
          ? "Draw another card from the deck."
          : game.waste.length
            ? "Click the empty deck to turn the waste pile over."
            : "No forward moves found. Try Undo or a new deal."
      )
    }
  }
  function beginDrag(event: DragEvent<HTMLButtonElement>, source: CardSource) {
    dragSource.current = source
    setSelected(source)
    setHintTarget(null)
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", "solitaire-card")
  }
  function drop(event: DragEvent, target: CardTarget) {
    event.preventDefault()
    event.stopPropagation()
    if (dragSource.current && !move(dragSource.current, target))
      setMessage(
        "That move does not fit. Try alternating colors, one rank lower."
      )
    dragSource.current = null
  }
  function dropProps(target: CardTarget) {
    return {
      onDragOver: (event: DragEvent) => {
        if (dragSource.current) {
          event.preventDefault()
          event.dataTransfer.dropEffect = "move"
        }
      },
      onDrop: (event: DragEvent) => drop(event, target),
    }
  }
  function cardButton(
    card: PlayingCard,
    source: CardSource,
    style?: CSSProperties
  ) {
    const inSelection =
      sameSource(selected, source) ||
      (selected?.pile === "tableau" &&
        source.pile === "tableau" &&
        selected.column === source.column &&
        source.index >= selected.index)
    return (
      <button
        key={card.id}
        className={`playing-card ${isRedCard(card) ? "red-card" : "black-card"} ${inSelection ? "card-selected" : ""}`}
        style={style}
        aria-label={cardName(card)}
        aria-pressed={inSelection}
        draggable
        onDragStart={(event) => beginDrag(event, source)}
        onDragEnd={() => {
          dragSource.current = null
        }}
        onClick={(event) => {
          event.stopPropagation()
          selectCard(source)
        }}
        onDoubleClick={(event) => {
          event.stopPropagation()
          sendHome(source)
        }}
      >
        <CardFace card={card} />
      </button>
    )
  }

  return (
    <div
      className="solitaire-app"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setSelected(null)
          setHintTarget(null)
        }
      }}
    >
      <div className="game-controls solitaire-controls">
        <button className="xp-button" onClick={restart}>
          New game
        </button>
        <button className="xp-button" onClick={undo} disabled={!history.length}>
          Undo
        </button>
        <button className="xp-button" onClick={hint} disabled={won}>
          Hint
        </button>
        <button
          className="game-help-button"
          onClick={() => setHelp((value) => !value)}
          aria-expanded={help}
        >
          How to play
        </button>
        <span className="solitaire-moves">Moves: {game.moves}</span>
      </div>
      {help && (
        <div className="game-rules">
          Click a card, then its destination; dragging works too. Stack cards
          from King down, alternating red and black. Move a whole visible run by
          selecting its first card. Empty columns take Kings. Build the four
          foundations from Ace to King in one suit. Double-click a card to send
          it home. Click the deck to draw one; an empty deck recycles the waste
          pile.
        </div>
      )}
      <div className="solitaire-table">
        <div className="solitaire-board">
          <div className="solitaire-top-row">
            <div className="solitaire-pile">
              <button
                className={`card-slot stock-pile ${game.stock.length ? "card-back" : ""}`}
                aria-label={
                  game.stock.length
                    ? `Draw a card (${game.stock.length} remaining)`
                    : game.waste.length
                      ? "Recycle waste pile"
                      : "Deck empty"
                }
                disabled={won || (!game.stock.length && !game.waste.length)}
                onClick={() => {
                  record(drawSolitaireCard(game))
                  setMessage(
                    game.stock.length
                      ? "Card drawn. Find its place on the table."
                      : "Deck recycled."
                  )
                }}
              >
                {game.stock.length ? (
                  <span className="card-back-emblem">✦</span>
                ) : (
                  <span className="recycle-stock">↻</span>
                )}
              </button>
              <span className="pile-label">{game.stock.length} in deck</span>
            </div>
            <div className="solitaire-pile waste-pile">
              {game.waste.length ? (
                cardButton(game.waste[game.waste.length - 1], { pile: "waste" })
              ) : (
                <div className="card-slot" aria-label="Waste pile empty" />
              )}
              <span className="pile-label">Waste</span>
            </div>
            <div className="solitaire-spacer" />
            {game.foundations.map((pile, column) => (
              <div
                key={column}
                className={`solitaire-pile ${hintTarget?.pile === "foundation" && hintTarget.column === column ? "hinted-pile" : ""}`}
                {...dropProps({ pile: "foundation", column })}
              >
                {pile.length ? (
                  cardButton(pile[pile.length - 1], {
                    pile: "foundation",
                    column,
                  })
                ) : (
                  <button
                    className="card-slot foundation-slot"
                    aria-label={`Empty foundation ${column + 1}`}
                    onClick={() => targetClick({ pile: "foundation", column })}
                  >
                    A
                  </button>
                )}
                <span className="pile-label">
                  {pile.length ? suitSymbols[pile[0].suit] : "Home"}
                </span>
              </div>
            ))}
          </div>
          <div className="solitaire-columns">
            {game.tableau.map((pile, column) => {
              let openBefore = 0,
                hiddenBefore = 0
              const cards = pile.map((card, index) => {
                const style: CSSProperties = {
                  top: `calc(var(--card-stack-step) * ${openBefore} + var(--card-hidden-step) * ${hiddenBefore})`,
                }
                if (card.faceUp) openBefore++
                else hiddenBefore++
                return card.faceUp ? (
                  cardButton(card, { pile: "tableau", column, index }, style)
                ) : (
                  <div
                    key={card.id}
                    className="playing-card card-back"
                    style={style}
                    aria-label="Face-down card"
                  >
                    <span className="card-back-emblem">✦</span>
                  </div>
                )
              })
              const last = pile[pile.length - 1]
              const height = `calc(var(--card-height) + var(--card-stack-step) * ${Math.max(0, openBefore - (last?.faceUp ? 1 : 0))} + var(--card-hidden-step) * ${Math.max(0, hiddenBefore - (last && !last.faceUp ? 1 : 0))})`
              return (
                <div
                  key={column}
                  className={`solitaire-column ${hintTarget?.pile === "tableau" && hintTarget.column === column ? "hinted-pile" : ""}`}
                  aria-label={`Tableau column ${column + 1}`}
                  style={{ minHeight: height }}
                  {...dropProps({ pile: "tableau", column })}
                >
                  <button
                    className="card-slot tableau-slot"
                    aria-label={`${pile.length ? "Move selected cards to" : "Empty"} column ${column + 1}`}
                    onClick={() => targetClick({ pile: "tableau", column })}
                  >
                    {!pile.length && "K"}
                  </button>
                  {cards}
                </div>
              )
            })}
          </div>
          {won && (
            <div className="solitaire-victory" role="status">
              <span>{SUITS.map((suit) => suitSymbols[suit]).join(" ")}</span>
              <h2>You won!</h2>
              <p>All 52 cards home in {game.moves} moves.</p>
              <button className="xp-button" onClick={restart}>
                Play again
              </button>
            </div>
          )}
        </div>
        <div className="solitaire-message">
          <p role="status">{message}</p>
          <span>{homeCount} / 52 home</span>
        </div>
      </div>
    </div>
  )
}
