export const MINE_SIZE = 9
export const MINE_COUNT = 10
export type MineCell = {
  mine: boolean
  adjacent: number
  open: boolean
  flagged: boolean
}
export type MineGame = {
  cells: MineCell[]
  status: "ready" | "playing" | "won" | "lost"
  exploded: number | null
}

export function newMineGame(): MineGame {
  return {
    cells: Array.from({ length: MINE_SIZE ** 2 }, () => ({
      mine: false,
      adjacent: 0,
      open: false,
      flagged: false,
    })),
    status: "ready",
    exploded: null,
  }
}

export function mineNeighbors(index: number): number[] {
  const row = Math.floor(index / MINE_SIZE)
  const column = index % MINE_SIZE
  const neighbors: number[] = []
  for (let y = -1; y <= 1; y++)
    for (let x = -1; x <= 1; x++) {
      if (
        (!x && !y) ||
        row + y < 0 ||
        row + y >= MINE_SIZE ||
        column + x < 0 ||
        column + x >= MINE_SIZE
      )
        continue
      neighbors.push((row + y) * MINE_SIZE + column + x)
    }
  return neighbors
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function toggleMineFlag(game: MineGame, index: number): MineGame {
  const cell = game.cells[index]
  if (!cell || cell.open || game.status === "won" || game.status === "lost")
    return game
  if (
    !cell.flagged &&
    game.cells.filter((item) => item.flagged).length >= MINE_COUNT
  )
    return game
  return {
    ...game,
    cells: game.cells.map((item, i) =>
      i === index ? { ...item, flagged: !item.flagged } : item
    ),
  }
}

export function revealMineCell(
  game: MineGame,
  index: number,
  random = Math.random
): MineGame {
  if (
    !game.cells[index] ||
    game.cells[index].flagged ||
    game.status === "won" ||
    game.status === "lost"
  )
    return game
  const cells = game.cells.map((cell) => ({ ...cell }))
  if (game.status === "ready") {
    const safe = new Set([index, ...mineNeighbors(index)])
    const candidates = shuffle(
      cells.map((_, i) => i).filter((i) => !safe.has(i)),
      random
    )
    for (const location of candidates.slice(0, MINE_COUNT))
      cells[location].mine = true
    cells.forEach((cell, i) => {
      cell.adjacent = mineNeighbors(i).filter((j) => cells[j].mine).length
    })
  }
  let queue = [index]
  if (cells[index].open) {
    const neighbors = mineNeighbors(index)
    if (
      !cells[index].adjacent ||
      neighbors.filter((i) => cells[i].flagged).length !== cells[index].adjacent
    )
      return game
    queue = neighbors.filter((i) => !cells[i].flagged && !cells[i].open)
  }
  while (queue.length) {
    const location = queue.pop()!
    const cell = cells[location]
    if (cell.open || cell.flagged) continue
    cell.open = true
    if (cell.mine) {
      cells.forEach((item) => {
        if (item.mine) item.open = true
      })
      return { cells, status: "lost", exploded: location }
    }
    if (cell.adjacent === 0)
      queue.push(
        ...mineNeighbors(location).filter(
          (i) => !cells[i].open && !cells[i].flagged
        )
      )
  }
  const won = cells.every((cell) => cell.mine || cell.open)
  if (won)
    cells.forEach((cell) => {
      if (cell.mine) cell.flagged = true
    })
  return { cells, status: won ? "won" : "playing", exploded: null }
}

export const SUITS = ["clubs", "diamonds", "hearts", "spades"] as const
export type Suit = (typeof SUITS)[number]
export type PlayingCard = {
  id: string
  suit: Suit
  rank: number
  faceUp: boolean
}
export type CardSource =
  | { pile: "waste" }
  | { pile: "tableau"; column: number; index: number }
  | { pile: "foundation"; column: number }
export type CardTarget = { pile: "tableau" | "foundation"; column: number }
export type SolitaireGame = {
  stock: PlayingCard[]
  waste: PlayingCard[]
  tableau: PlayingCard[][]
  foundations: PlayingCard[][]
  moves: number
}

export function isRedCard(card: PlayingCard): boolean {
  return card.suit === "hearts" || card.suit === "diamonds"
}

export function newSolitaireGame(random = Math.random): SolitaireGame {
  const deck = shuffle(
    SUITS.flatMap((suit) =>
      Array.from({ length: 13 }, (_, i) => ({
        id: `${suit}-${i + 1}`,
        suit,
        rank: i + 1,
        faceUp: false,
      }))
    ),
    random
  )
  const tableau = Array.from({ length: 7 }, (_, column) =>
    Array.from({ length: column + 1 }, (_, index) => ({
      ...deck.pop()!,
      faceUp: index === column,
    }))
  )
  return {
    stock: deck,
    waste: [],
    tableau,
    foundations: SUITS.map(() => []),
    moves: 0,
  }
}

export function drawSolitaireCard(game: SolitaireGame): SolitaireGame {
  if (!game.stock.length) {
    if (!game.waste.length) return game
    return {
      ...game,
      stock: [...game.waste]
        .reverse()
        .map((card) => ({ ...card, faceUp: false })),
      waste: [],
      moves: game.moves + 1,
    }
  }
  return {
    ...game,
    stock: game.stock.slice(0, -1),
    waste: [
      ...game.waste,
      { ...game.stock[game.stock.length - 1], faceUp: true },
    ],
    moves: game.moves + 1,
  }
}

export function selectedSolitaireCards(
  game: SolitaireGame,
  source: CardSource
): PlayingCard[] {
  if (source.pile === "waste") return game.waste.slice(-1)
  if (source.pile === "foundation")
    return (game.foundations[source.column] ?? []).slice(-1)
  if (source.column < 0 || source.column > 6 || source.index < 0) return []
  return game.tableau[source.column].slice(source.index)
}

export function moveSolitaireCards(
  game: SolitaireGame,
  source: CardSource,
  target: CardTarget
): SolitaireGame | null {
  if (target.column < 0 || target.column >= (target.pile === "tableau" ? 7 : 4))
    return null
  if (source.pile === target.pile && source.column === target.column)
    return null
  const cards = selectedSolitaireCards(game, source)
  if (!cards.length || cards.some((card) => !card.faceUp)) return null
  // Only correctly ordered, alternating-color runs can move together.
  if (
    cards.some(
      (card, i) =>
        i > 0 &&
        (cards[i - 1].rank !== card.rank + 1 ||
          isRedCard(cards[i - 1]) === isRedCard(card))
    )
  )
    return null
  const first = cards[0]
  const destination =
    target.pile === "tableau"
      ? game.tableau[target.column]
      : game.foundations[target.column]
  const top = destination[destination.length - 1]
  if (target.pile === "foundation") {
    if (
      cards.length !== 1 ||
      (top
        ? first.suit !== top.suit || first.rank !== top.rank + 1
        : first.rank !== 1)
    )
      return null
  } else if (
    top
      ? !top.faceUp ||
        top.rank !== first.rank + 1 ||
        isRedCard(top) === isRedCard(first)
      : first.rank !== 13
  )
    return null
  const next: SolitaireGame = {
    ...game,
    stock: [...game.stock],
    waste: [...game.waste],
    tableau: game.tableau.map((pile) => [...pile]),
    foundations: game.foundations.map((pile) => [...pile]),
    moves: game.moves + 1,
  }
  if (source.pile === "waste") next.waste.pop()
  else if (source.pile === "foundation") next.foundations[source.column].pop()
  else {
    next.tableau[source.column] = next.tableau[source.column].slice(
      0,
      source.index
    )
    const exposed = next.tableau[source.column].at(-1)
    if (exposed && !exposed.faceUp)
      next.tableau[source.column][next.tableau[source.column].length - 1] = {
        ...exposed,
        faceUp: true,
      }
  }
  if (target.pile === "tableau") next.tableau[target.column].push(...cards)
  else next.foundations[target.column].push(...cards)
  return next
}

export function solitaireWon(game: SolitaireGame): boolean {
  return game.foundations.every((pile) => pile.length === 13)
}

export function findSolitaireHint(
  game: SolitaireGame
): { source: CardSource; target: CardTarget } | null {
  const sources: CardSource[] = []
  if (game.waste.length) sources.push({ pile: "waste" })
  game.tableau.forEach((pile, column) => {
    pile.forEach((card, index) => {
      if (card.faceUp) sources.push({ pile: "tableau", column, index })
    })
  })
  for (const source of sources)
    for (let column = 0; column < 4; column++) {
      const target: CardTarget = { pile: "foundation", column }
      if (moveSolitaireCards(game, source, target)) return { source, target }
    }
  for (const source of sources)
    for (let column = 0; column < 7; column++) {
      // Moving a whole column to another empty column makes no progress.
      if (
        source.pile === "tableau" &&
        source.index === 0 &&
        !game.tableau[column].length
      )
        continue
      const target: CardTarget = { pile: "tableau", column }
      if (moveSolitaireCards(game, source, target)) return { source, target }
    }
  return null
}
