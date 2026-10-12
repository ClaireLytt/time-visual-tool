import { describe, it, expect } from 'vitest'
import { format, subDays } from 'date-fns'
import type { SportEntry } from '../../types/sport'

// Extract streak logic into a testable function (mirrors SportStreaks component logic)
function computeStreaks(entries: SportEntry[], selectedDate: string) {
  const dateSet = new Set(entries.map(e => e.date))
  const sortedDates = [...dateSet].sort().reverse()

  const today = selectedDate
  let currentStreak = 0
  let checkDate = today
  if (!dateSet.has(today)) {
    checkDate = format(subDays(new Date(today), 1), 'yyyy-MM-dd')
  }
  if (dateSet.has(checkDate)) {
    currentStreak = 1
    let d = new Date(checkDate)
    while (true) {
      d = subDays(d, 1)
      const ds = format(d, 'yyyy-MM-dd')
      if (dateSet.has(ds)) {
        currentStreak++
      } else {
        break
      }
    }
  }

  let longestStreak = 0
  if (sortedDates.length > 0) {
    const ascending = [...sortedDates].reverse()
    let streak = 1
    for (let i = 1; i < ascending.length; i++) {
      const diff = Math.round((new Date(ascending[i]).getTime() - new Date(ascending[i - 1]).getTime()) / 86400000)
      if (diff === 1) {
        streak++
      } else {
        longestStreak = Math.max(longestStreak, streak)
        streak = 1
      }
    }
    longestStreak = Math.max(longestStreak, streak)
  }

  const monthPrefix = selectedDate.slice(0, 7)
  const thisMonthDays = [...dateSet].filter(d => d.startsWith(monthPrefix)).length

  return { currentStreak, longestStreak, thisMonthDays }
}

function makeEntry(date: string): SportEntry {
  return { id: date, date, sportType: 'running', content: 'run', duration: 30, calories: 200, note: '', createdAt: date + 'T00:00:00Z' }
}

describe('sportStreaks', () => {
  it('returns 0 for empty entries', () => {
    const result = computeStreaks([], '2024-06-15')
    expect(result).toEqual({ currentStreak: 0, longestStreak: 0, thisMonthDays: 0 })
  })

  it('counts current streak correctly', () => {
    const today = '2024-06-15'
    const entries = [
      makeEntry('2024-06-15'),
      makeEntry('2024-06-14'),
      makeEntry('2024-06-13'),
    ]
    const result = computeStreaks(entries, today)
    expect(result.currentStreak).toBe(3)
  })

  it('counts streak from yesterday when today has no entry', () => {
    const today = '2024-06-15'
    const entries = [
      makeEntry('2024-06-14'),
      makeEntry('2024-06-13'),
    ]
    const result = computeStreaks(entries, today)
    expect(result.currentStreak).toBe(2)
  })

  it('returns 0 streak when gap > 1 day from today', () => {
    const today = '2024-06-15'
    const entries = [makeEntry('2024-06-12')]
    const result = computeStreaks(entries, today)
    expect(result.currentStreak).toBe(0)
  })

  it('computes longest streak across all history', () => {
    const entries = [
      makeEntry('2024-01-01'),
      makeEntry('2024-01-02'),
      makeEntry('2024-01-03'),
      makeEntry('2024-01-04'),
      makeEntry('2024-01-05'),
      // gap
      makeEntry('2024-06-10'),
      makeEntry('2024-06-11'),
    ]
    const result = computeStreaks(entries, '2024-06-15')
    expect(result.longestStreak).toBe(5)
  })

  it('counts this month active days', () => {
    const entries = [
      makeEntry('2024-06-01'),
      makeEntry('2024-06-05'),
      makeEntry('2024-06-10'),
      makeEntry('2024-05-30'), // different month
    ]
    const result = computeStreaks(entries, '2024-06-15')
    expect(result.thisMonthDays).toBe(3)
  })

  it('handles multiple entries on same date', () => {
    const entries = [
      makeEntry('2024-06-15'),
      { ...makeEntry('2024-06-15'), id: 'dup', content: 'swim' },
      makeEntry('2024-06-14'),
    ]
    const result = computeStreaks(entries, '2024-06-15')
    expect(result.currentStreak).toBe(2)
    expect(result.thisMonthDays).toBe(2)
  })
})
