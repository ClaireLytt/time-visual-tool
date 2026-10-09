import { describe, it, expect, vi, afterEach } from 'vitest'
import { computeStreak } from '../streaks'
import { format, subDays } from 'date-fns'

function daysAgo(n: number): string {
  return format(subDays(new Date(), n), 'yyyy-MM-dd')
}

describe('computeStreak', () => {
  it('returns 0 for empty dates', () => {
    expect(computeStreak([])).toBe(0)
  })

  it('returns 1 when only today has an entry', () => {
    expect(computeStreak([daysAgo(0)])).toBe(1)
  })

  it('returns 1 when only yesterday has an entry', () => {
    expect(computeStreak([daysAgo(1)])).toBe(1)
  })

  it('returns consecutive count from today', () => {
    expect(computeStreak([daysAgo(0), daysAgo(1), daysAgo(2)])).toBe(3)
  })

  it('returns consecutive count from yesterday when today missing', () => {
    expect(computeStreak([daysAgo(1), daysAgo(2), daysAgo(3)])).toBe(3)
  })

  it('stops at a gap', () => {
    // today, yesterday, skip day 2, day 3
    expect(computeStreak([daysAgo(0), daysAgo(1), daysAgo(3)])).toBe(2)
  })

  it('returns 0 when most recent entry is 2+ days ago', () => {
    expect(computeStreak([daysAgo(3), daysAgo(4)])).toBe(0)
  })

  it('handles duplicate dates', () => {
    expect(computeStreak([daysAgo(0), daysAgo(0), daysAgo(1), daysAgo(1)])).toBe(2)
  })

  it('handles unsorted dates', () => {
    expect(computeStreak([daysAgo(2), daysAgo(0), daysAgo(1)])).toBe(3)
  })
})
