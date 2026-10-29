import { describe, it, expect } from 'vitest'

// Extract and test the pure puzzle logic
function generatePuzzle(seed: number): number[] {
  const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = ((seed + 1) * (i + 3) * 17 + i * 7) % (i + 1)
    const tmp = tiles[i]; tiles[i] = tiles[j]; tiles[j] = tmp
  }
  let inversions = 0
  for (let i = 0; i < 9; i++) {
    for (let j = i + 1; j < 9; j++) {
      if (tiles[i] !== 8 && tiles[j] !== 8 && tiles[i] > tiles[j]) inversions++
    }
  }
  if (inversions % 2 !== 0) {
    const a = tiles.findIndex(t => t !== 8)
    const b = tiles.findIndex((t, idx) => idx > a && t !== 8)
    if (b >= 0) { const tmp = tiles[a]; tiles[a] = tiles[b]; tiles[b] = tmp }
  }
  return tiles
}

function isSolved(tiles: number[]): boolean {
  return tiles.every((t, i) => t === i)
}

function countInversions(tiles: number[]): number {
  let inv = 0
  for (let i = 0; i < 9; i++) {
    for (let j = i + 1; j < 9; j++) {
      if (tiles[i] !== 8 && tiles[j] !== 8 && tiles[i] > tiles[j]) inv++
    }
  }
  return inv
}

describe('Puzzle Game Logic', () => {
  it('generatePuzzle returns 9 tiles', () => {
    const tiles = generatePuzzle(0)
    expect(tiles).toHaveLength(9)
  })

  it('generatePuzzle contains all numbers 0-8', () => {
    const tiles = generatePuzzle(42)
    expect([...tiles].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('generatePuzzle is always solvable (even inversions)', () => {
    for (let seed = 0; seed < 50; seed++) {
      const tiles = generatePuzzle(seed)
      const inv = countInversions(tiles)
      expect(inv % 2).toBe(0)
    }
  })

  it('generatePuzzle produces different puzzles for different seeds', () => {
    const a = generatePuzzle(0).join(',')
    const b = generatePuzzle(1).join(',')
    expect(a).not.toBe(b)
  })

  it('isSolved returns true for solved state', () => {
    expect(isSolved([0, 1, 2, 3, 4, 5, 6, 7, 8])).toBe(true)
  })

  it('isSolved returns false for unsolved state', () => {
    expect(isSolved([1, 0, 2, 3, 4, 5, 6, 7, 8])).toBe(false)
  })

  it('generatePuzzle is not already solved', () => {
    // At least some seeds should produce unsolved puzzles
    let unsolvedCount = 0
    for (let seed = 0; seed < 20; seed++) {
      if (!isSolved(generatePuzzle(seed))) unsolvedCount++
    }
    expect(unsolvedCount).toBeGreaterThan(10)
  })
})
