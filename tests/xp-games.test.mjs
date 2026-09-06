import { test } from "bun:test"
import assert from "node:assert/strict"
import {
  MINE_COUNT,
  newMineGame,
  mineNeighbors,
  revealMineCell,
  toggleMineFlag,
  SUITS,
  newSolitaireGame,
  drawSolitaireCard,
  moveSolitaireCards,
  solitaireWon,
  findSolitaireHint,
} from "../lib/xp-games.ts"

function seeded(seed = 42) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}
const card = (suit, rank, faceUp = true) => ({
  id: `${suit}-${rank}`,
  suit,
  rank,
  faceUp,
})
const emptySolitaire = () => ({
  stock: [],
  waste: [],
  tableau: Array.from({ length: 7 }, () => []),
  foundations: Array.from({ length: 4 }, () => []),
  moves: 0,
})
const allCards = (game) => [
  ...game.stock,
  ...game.waste,
  ...game.tableau.flat(),
  ...game.foundations.flat(),
]

test("Minesweeper guarantees a clear first click at corners and center, with exactly ten mines", () => {
  for (const location of [0, 8, 40, 72, 80]) {
    const initial = newMineGame()
    const game = revealMineCell(initial, location, seeded(location + 1))
    assert.equal(game.cells.filter((cell) => cell.mine).length, MINE_COUNT)
    assert.equal(game.cells[location].adjacent, 0)
    assert.ok(
      [location, ...mineNeighbors(location)].every((i) => !game.cells[i].mine)
    )
    assert.ok(game.cells.filter((cell) => cell.open).length > 1)
    assert.ok(initial.cells.every((cell) => !cell.open && !cell.mine))
  }
})

test("Minesweeper flags are reversible, capped, and prevent accidental reveal", () => {
  let game = newMineGame()
  for (let i = 0; i <= MINE_COUNT; i++) game = toggleMineFlag(game, i)
  assert.equal(game.cells.filter((cell) => cell.flagged).length, MINE_COUNT)
  assert.equal(revealMineCell(game, 0), game)
  game = toggleMineFlag(game, 0)
  assert.equal(game.cells[0].flagged, false)
  game = revealMineCell(game, 0, seeded())
  assert.equal(toggleMineFlag(game, 0), game)
})

test("Minesweeper records an explosion, reveals mines, and freezes a finished game", () => {
  const playing = revealMineCell(newMineGame(), 40, seeded())
  const mine = playing.cells.findIndex((cell) => cell.mine)
  const lost = revealMineCell(playing, mine)
  assert.equal(lost.status, "lost")
  assert.equal(lost.exploded, mine)
  assert.ok(lost.cells.filter((cell) => cell.mine).every((cell) => cell.open))
  assert.equal(toggleMineFlag(lost, 0), lost)
  assert.equal(revealMineCell(lost, 0), lost)
})

test("Minesweeper wins only when all safe cells are open", () => {
  let game = revealMineCell(newMineGame(), 40, seeded())
  const safe = game.cells.flatMap((cell, i) => (cell.mine ? [] : [i]))
  for (const location of safe) game = revealMineCell(game, location)
  assert.equal(game.status, "won")
  assert.equal(game.cells.filter((cell) => cell.flagged).length, MINE_COUNT)
  assert.equal(game.cells.filter((cell) => cell.open).length, 81 - MINE_COUNT)
})

test("Minesweeper chording respects flags and punishes incorrect flags", () => {
  const game = newMineGame()
  game.status = "playing"
  game.cells[0].mine = true
  game.cells.forEach((cell, i) => {
    cell.adjacent = mineNeighbors(i).filter((j) => game.cells[j].mine).length
  })
  game.cells[10].open = true
  assert.equal(revealMineCell(game, 10), game)
  const incorrect = toggleMineFlag(game, 9)
  assert.equal(revealMineCell(incorrect, 10).status, "lost")
  const correct = revealMineCell(toggleMineFlag(game, 0), 10)
  assert.notEqual(correct.status, "lost")
  assert.ok(correct.cells[9].open)
})

test("Solitaire deals all 52 unique cards into the correct seven columns", () => {
  const game = newSolitaireGame(seeded())
  assert.equal(game.stock.length, 24)
  assert.deepEqual(
    game.tableau.map((pile) => pile.length),
    [1, 2, 3, 4, 5, 6, 7]
  )
  assert.equal(new Set(allCards(game).map((card) => card.id)).size, 52)
  for (const pile of game.tableau) {
    assert.ok(pile.at(-1).faceUp)
    assert.ok(pile.slice(0, -1).every((card) => !card.faceUp))
  }
})

test("Solitaire draws one card and recycles in the original order without losing cards", () => {
  let game = newSolitaireGame(seeded())
  const firstCard = game.stock.at(-1).id
  for (let i = 0; i < 24; i++) game = drawSolitaireCard(game)
  assert.equal(game.stock.length, 0)
  assert.equal(game.waste.length, 24)
  assert.ok(game.waste.every((card) => card.faceUp))
  game = drawSolitaireCard(game)
  assert.equal(game.waste.length, 0)
  assert.ok(game.stock.every((card) => !card.faceUp))
  game = drawSolitaireCard(game)
  assert.equal(game.waste.at(-1).id, firstCard)
  assert.equal(new Set(allCards(game).map((card) => card.id)).size, 52)
})

test("Solitaire moves legal alternating runs and turns over newly exposed cards immutably", () => {
  const game = emptySolitaire()
  game.tableau[0] = [
    card("hearts", 10, false),
    card("spades", 7),
    card("hearts", 6),
  ]
  game.tableau[1] = [card("diamonds", 8)]
  const snapshot = JSON.stringify(game)
  const moved = moveSolitaireCards(
    game,
    { pile: "tableau", column: 0, index: 1 },
    { pile: "tableau", column: 1 }
  )
  assert.ok(moved)
  assert.equal(moved.tableau[0].length, 1)
  assert.ok(moved.tableau[0][0].faceUp)
  assert.deepEqual(
    moved.tableau[1].map((card) => card.rank),
    [8, 7, 6]
  )
  assert.equal(moved.moves, 1)
  assert.equal(JSON.stringify(game), snapshot)
})

test("Solitaire rejects same-color runs, face-down cards, invalid ranks, and non-Kings in empty columns", () => {
  const game = emptySolitaire()
  game.waste = [card("hearts", 7)]
  game.tableau[0] = [card("diamonds", 8)]
  game.tableau[1] = [card("clubs", 10)]
  game.tableau[2] = [card("spades", 13, false)]
  game.tableau[3] = [card("hearts", 8), card("diamonds", 7)]
  game.tableau[4] = [card("spades", 9)]
  assert.equal(
    moveSolitaireCards(game, { pile: "waste" }, { pile: "tableau", column: 0 }),
    null
  )
  assert.equal(
    moveSolitaireCards(game, { pile: "waste" }, { pile: "tableau", column: 1 }),
    null
  )
  assert.equal(
    moveSolitaireCards(game, { pile: "waste" }, { pile: "tableau", column: 5 }),
    null
  )
  assert.equal(
    moveSolitaireCards(
      game,
      { pile: "tableau", column: 2, index: 0 },
      { pile: "tableau", column: 5 }
    ),
    null
  )
  assert.equal(
    moveSolitaireCards(
      game,
      { pile: "tableau", column: 3, index: 0 },
      { pile: "tableau", column: 4 }
    ),
    null
  )
  game.waste = [card("hearts", 13)]
  assert.ok(
    moveSolitaireCards(game, { pile: "waste" }, { pile: "tableau", column: 5 })
  )
})

test("Solitaire foundations start with Aces and require ascending ranks in the same suit", () => {
  let game = emptySolitaire()
  game.waste = [card("hearts", 2)]
  assert.equal(
    moveSolitaireCards(
      game,
      { pile: "waste" },
      { pile: "foundation", column: 0 }
    ),
    null
  )
  game.waste = [card("hearts", 1)]
  game = moveSolitaireCards(
    game,
    { pile: "waste" },
    { pile: "foundation", column: 0 }
  )
  assert.equal(game.foundations[0][0].rank, 1)
  game.waste = [card("spades", 2)]
  assert.equal(
    moveSolitaireCards(
      game,
      { pile: "waste" },
      { pile: "foundation", column: 0 }
    ),
    null
  )
  game.waste = [card("hearts", 2)]
  assert.ok(
    moveSolitaireCards(
      game,
      { pile: "waste" },
      { pile: "foundation", column: 0 }
    )
  )
  assert.ok(
    moveSolitaireCards(
      game,
      { pile: "foundation", column: 0 },
      { pile: "tableau", column: 0 }
    ) === null
  )
})

test("Solitaire hints suggest legal moves and prefer foundations", () => {
  const game = emptySolitaire()
  game.waste = [card("clubs", 1)]
  const hint = findSolitaireHint(game)
  assert.equal(hint.target.pile, "foundation")
  assert.ok(moveSolitaireCards(game, hint.source, hint.target))
  assert.equal(findSolitaireHint(emptySolitaire()), null)
})

test("Solitaire recognizes a win only after the last King reaches its foundation", () => {
  const game = emptySolitaire()
  game.foundations = SUITS.map((suit) =>
    Array.from({ length: suit === "spades" ? 12 : 13 }, (_, index) =>
      card(suit, index + 1)
    )
  )
  game.tableau[0] = [card("spades", 13)]
  assert.equal(solitaireWon(game), false)
  const won = moveSolitaireCards(
    game,
    { pile: "tableau", column: 0, index: 0 },
    { pile: "foundation", column: 3 }
  )
  assert.ok(solitaireWon(won))
  assert.equal(allCards(won).length, 52)
})
