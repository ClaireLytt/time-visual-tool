import { describe, it, expect } from 'vitest'
import { getWeekRange, getMonthRange, getYearRange, filterByRange } from '../dateRanges'

describe('getWeekRange', () => {
  it('returns Monday-to-Sunday for a Wednesday', () => {
    // 2026-01-14 is a Wednesday
    const range = getWeekRange('2026-01-14')
    expect(range.startStr).toBe('2026-01-12') // Monday
    expect(range.endStr).toBe('2026-01-18')   // Sunday
  })

  it('returns same week for Monday', () => {
    const range = getWeekRange('2026-01-12')
    expect(range.startStr).toBe('2026-01-12')
    expect(range.endStr).toBe('2026-01-18')
  })

  it('returns same week for Sunday', () => {
    const range = getWeekRange('2026-01-18')
    expect(range.startStr).toBe('2026-01-12')
    expect(range.endStr).toBe('2026-01-18')
  })
})

describe('getMonthRange', () => {
  it('returns full month for January', () => {
    const range = getMonthRange('2026-01-15')
    expect(range.startStr).toBe('2026-01-01')
    expect(range.endStr).toBe('2026-01-31')
  })

  it('handles February non-leap year', () => {
    const range = getMonthRange('2026-02-10')
    expect(range.startStr).toBe('2026-02-01')
    expect(range.endStr).toBe('2026-02-28')
  })

  it('handles February leap year', () => {
    const range = getMonthRange('2024-02-10')
    expect(range.startStr).toBe('2024-02-01')
    expect(range.endStr).toBe('2024-02-29')
  })
})

describe('getYearRange', () => {
  it('returns Jan 1 to Dec 31', () => {
    const range = getYearRange('2026-06-15')
    expect(range.startStr).toBe('2026-01-01')
    expect(range.endStr).toBe('2026-12-31')
  })
})

describe('filterByRange', () => {
  const entries = [
    { date: '2026-01-10', value: 1 },
    { date: '2026-01-12', value: 2 },
    { date: '2026-01-15', value: 3 },
    { date: '2026-01-18', value: 4 },
    { date: '2026-01-20', value: 5 },
  ]

  it('filters entries within the range', () => {
    const range = getWeekRange('2026-01-14') // Mon 12 – Sun 18
    const filtered = filterByRange(entries, range)
    expect(filtered).toHaveLength(3)
    expect(filtered.map(e => e.date)).toEqual(['2026-01-12', '2026-01-15', '2026-01-18'])
  })

  it('returns empty for range with no entries', () => {
    const range = getWeekRange('2026-03-01')
    expect(filterByRange(entries, range)).toHaveLength(0)
  })
})
