import { describe, it, expect } from 'vitest'
import { computeDaySummary, computeWeekSummary, computeMonthSummary, computePeriodSummary } from '../summary'
import type { TimeEntry } from '../../types'

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: Math.random().toString(36).slice(2),
    date: '2024-06-15',
    activity: 'test',
    duration: 60,
    weight: 1,
    category: '工作',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('computeDaySummary', () => {
  it('returns zeros for empty entries', () => {
    const result = computeDaySummary([], '2024-06-15')
    expect(result.totalMinutes).toBe(0)
    expect(result.weightedMinutes).toBe(0)
    expect(result.entries).toHaveLength(0)
    expect(Object.keys(result.categoryBreakdown)).toHaveLength(0)
  })

  it('summarizes a single entry', () => {
    const entries = [makeEntry({ duration: 90, weight: 1.5 })]
    const result = computeDaySummary(entries, '2024-06-15')
    expect(result.totalMinutes).toBe(90)
    expect(result.weightedMinutes).toBe(135)
    expect(result.entries).toHaveLength(1)
  })

  it('filters by date', () => {
    const entries = [
      makeEntry({ date: '2024-06-15', duration: 60 }),
      makeEntry({ date: '2024-06-16', duration: 30 }),
    ]
    const result = computeDaySummary(entries, '2024-06-15')
    expect(result.totalMinutes).toBe(60)
    expect(result.entries).toHaveLength(1)
  })

  it('aggregates same category', () => {
    const entries = [
      makeEntry({ category: '工作', duration: 60 }),
      makeEntry({ category: '工作', duration: 30 }),
    ]
    const result = computeDaySummary(entries, '2024-06-15')
    expect(result.categoryBreakdown['工作'].totalMinutes).toBe(90)
    expect(result.categoryBreakdown['工作'].count).toBe(2)
    expect(result.categoryBreakdown['工作'].percentage).toBe(100)
  })

  it('calculates percentage across categories', () => {
    const entries = [
      makeEntry({ category: '工作', duration: 60 }),
      makeEntry({ category: '学习', duration: 60 }),
    ]
    const result = computeDaySummary(entries, '2024-06-15')
    expect(result.categoryBreakdown['工作'].percentage).toBe(50)
    expect(result.categoryBreakdown['学习'].percentage).toBe(50)
  })

  it('calculates weighted minutes correctly', () => {
    const entries = [
      makeEntry({ duration: 60, weight: 2 }),
      makeEntry({ duration: 30, weight: 0.5 }),
    ]
    const result = computeDaySummary(entries, '2024-06-15')
    expect(result.totalMinutes).toBe(90)
    expect(result.weightedMinutes).toBe(135)
  })
})

describe('computeWeekSummary', () => {
  it('returns 7 days in dailyBreakdown', () => {
    const result = computeWeekSummary([], '2024-06-15')
    expect(result.dailyBreakdown).toHaveLength(7)
  })

  it('has correct day labels (Monday start)', () => {
    const result = computeWeekSummary([], '2024-06-15')
    expect(result.dailyBreakdown[0].label).toBe('周一')
    expect(result.dailyBreakdown[6].label).toBe('周日')
  })

  it('aggregates entries across the week', () => {
    const entries = [
      makeEntry({ date: '2024-06-10', duration: 60 }),
      makeEntry({ date: '2024-06-12', duration: 30 }),
      makeEntry({ date: '2024-06-20', duration: 120 }),
    ]
    const result = computeWeekSummary(entries, '2024-06-12')
    expect(result.totalMinutes).toBe(90)
    expect(result.entryCount).toBe(2)
  })
})

describe('computeMonthSummary', () => {
  it('returns correct number of days for June', () => {
    const result = computeMonthSummary([], '2024-06-15')
    expect(result.dailyBreakdown).toHaveLength(30)
  })

  it('returns correct number of days for February (leap year)', () => {
    const result = computeMonthSummary([], '2024-02-15')
    expect(result.dailyBreakdown).toHaveLength(29)
  })

  it('labels days correctly', () => {
    const result = computeMonthSummary([], '2024-06-15')
    expect(result.dailyBreakdown[0].label).toBe('1日')
    expect(result.dailyBreakdown[29].label).toBe('30日')
  })
})

describe('computePeriodSummary', () => {
  it('delegates to day summary for day mode', () => {
    const entries = [makeEntry({ duration: 60 })]
    const result = computePeriodSummary(entries, '2024-06-15', 'day')
    expect(result.totalMinutes).toBe(60)
    expect(result.dailyBreakdown).toHaveLength(1)
  })

  it('delegates to week summary for week mode', () => {
    const result = computePeriodSummary([], '2024-06-15', 'week')
    expect(result.dailyBreakdown).toHaveLength(7)
  })

  it('delegates to month summary for month mode', () => {
    const result = computePeriodSummary([], '2024-06-15', 'month')
    expect(result.dailyBreakdown).toHaveLength(30)
  })
})
