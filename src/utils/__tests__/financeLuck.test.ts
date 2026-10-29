import { describe, it, expect } from 'vitest'
import { drawLuck, computeLuckStats, SAVINGS_SCORE_BASE } from '../financeLuck'
import type { FinanceEntry, FinanceLuck } from '../../types/finance'

function entry(luck: FinanceLuck | undefined, type: 'income' | 'expense' = 'expense'): FinanceEntry {
  return {
    id: crypto.randomUUID(),
    date: '2026-10-14',
    description: '',
    amount: 10,
    type,
    category: '购物',
    createdAt: '2026-10-14T12:00:00Z',
    ...(luck != null && { luck }),
  }
}

describe('drawLuck', () => {
  it('maps random ranges to luck tiers', () => {
    expect(drawLuck(() => 0)).toBe('good')
    expect(drawLuck(() => 0.29)).toBe('good')
    expect(drawLuck(() => 0.3)).toBe('normal')
    expect(drawLuck(() => 0.79)).toBe('normal')
    expect(drawLuck(() => 0.8)).toBe('bad')
    expect(drawLuck(() => 0.99)).toBe('bad')
  })
})

describe('computeLuckStats', () => {
  it('returns base score with no draws', () => {
    const stats = computeLuckStats([entry(undefined)])
    expect(stats).toEqual({ draws: 0, good: 0, normal: 0, bad: 0, score: SAVINGS_SCORE_BASE })
  })

  it('tallies counts and score deltas', () => {
    const stats = computeLuckStats([entry('good'), entry('normal'), entry('bad'), entry('bad')])
    expect(stats.draws).toBe(4)
    expect(stats.good).toBe(1)
    expect(stats.normal).toBe(1)
    expect(stats.bad).toBe(2)
    expect(stats.score).toBe(SAVINGS_SCORE_BASE - 1 - 3 - 3)
  })

  it('ignores income entries even if luck is somehow set', () => {
    const stats = computeLuckStats([entry('bad', 'income')])
    expect(stats.draws).toBe(0)
  })

  it('floors score at zero', () => {
    const many = Array.from({ length: 50 }, () => entry('bad'))
    expect(computeLuckStats(many).score).toBe(0)
  })
})
