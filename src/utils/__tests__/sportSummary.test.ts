import { describe, it, expect } from 'vitest'
import { computeSportPeriodSummary, computeSportWeekSummary, computeSportMonthSummary, computeSportYearSummary } from '../sportSummary'
import type { SportEntry } from '../../types/sport'

function makeEntry(overrides: Partial<SportEntry> = {}): SportEntry {
  return {
    id: Math.random().toString(36).slice(2),
    date: '2024-06-15',
    sportType: '跑步',
    content: 'test workout',
    duration: 30,
    calories: 200,
    note: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('computeSportPeriodSummary (day)', () => {
  it('returns zeros for empty entries', () => {
    const result = computeSportPeriodSummary([], '2024-06-15', 'day')
    expect(result.totalDuration).toBe(0)
    expect(result.totalCalories).toBe(0)
    expect(result.entryCount).toBe(0)
    expect(result.averageDurationPerEntry).toBe(0)
  })

  it('computes totals and average', () => {
    const entries = [
      makeEntry({ duration: 30, calories: 200 }),
      makeEntry({ duration: 60, calories: 400 }),
      makeEntry({ duration: 45, calories: 300 }),
    ]
    const result = computeSportPeriodSummary(entries, '2024-06-15', 'day')
    expect(result.totalDuration).toBe(135)
    expect(result.totalCalories).toBe(900)
    expect(result.entryCount).toBe(3)
    expect(result.averageDurationPerEntry).toBe(45)
  })

  it('filters by date', () => {
    const entries = [
      makeEntry({ date: '2024-06-15', duration: 40 }),
      makeEntry({ date: '2024-06-16', duration: 30 }),
    ]
    const result = computeSportPeriodSummary(entries, '2024-06-15', 'day')
    expect(result.totalDuration).toBe(40)
    expect(result.entryCount).toBe(1)
  })

  it('builds category breakdown by duration', () => {
    const entries = [
      makeEntry({ duration: 30, calories: 200, sportType: '跑步' }),
      makeEntry({ duration: 60, calories: 300, sportType: '游泳' }),
      makeEntry({ duration: 30, calories: 150, sportType: '跑步' }),
    ]
    const result = computeSportPeriodSummary(entries, '2024-06-15', 'day')
    expect(result.categoryBreakdown['跑步'].duration).toBe(60)
    expect(result.categoryBreakdown['跑步'].calories).toBe(350)
    expect(result.categoryBreakdown['跑步'].count).toBe(2)
    expect(result.categoryBreakdown['游泳'].duration).toBe(60)
    expect(result.categoryBreakdown['游泳'].count).toBe(1)
    expect(result.categoryBreakdown['跑步'].percentage).toBe(50)
    expect(result.categoryBreakdown['游泳'].percentage).toBe(50)
  })
})

describe('computeSportWeekSummary', () => {
  it('includes entries from Monday to Sunday', () => {
    const entries = [
      makeEntry({ date: '2024-06-10', duration: 30 }),
      makeEntry({ date: '2024-06-16', duration: 45 }),
      makeEntry({ date: '2024-06-09', duration: 999 }),
      makeEntry({ date: '2024-06-17', duration: 999 }),
    ]
    const result = computeSportWeekSummary(entries, '2024-06-15')
    expect(result.totalDuration).toBe(75)
    expect(result.dailyBreakdown).toHaveLength(7)
  })
})

describe('computeSportMonthSummary', () => {
  it('includes all days of the month', () => {
    const entries = [
      makeEntry({ date: '2024-06-01', duration: 30 }),
      makeEntry({ date: '2024-06-30', duration: 45 }),
      makeEntry({ date: '2024-05-31', duration: 999 }),
      makeEntry({ date: '2024-07-01', duration: 999 }),
    ]
    const result = computeSportMonthSummary(entries, '2024-06-15')
    expect(result.totalDuration).toBe(75)
    expect(result.dailyBreakdown).toHaveLength(30)
  })
})

describe('computeSportYearSummary', () => {
  it('includes only entries within the year, grouped into 12 months', () => {
    const entries = [
      makeEntry({ date: '2024-01-01', duration: 30 }),
      makeEntry({ date: '2024-12-31', duration: 45 }),
      makeEntry({ date: '2023-12-31', duration: 999 }),
      makeEntry({ date: '2025-01-01', duration: 999 }),
    ]
    const result = computeSportYearSummary(entries, '2024-06-15')
    expect(result.totalDuration).toBe(75)
    expect(result.dailyBreakdown).toHaveLength(12)
  })

  it('aggregates duration per month', () => {
    const entries = [
      makeEntry({ date: '2024-03-05', duration: 30 }),
      makeEntry({ date: '2024-03-20', duration: 45 }),
    ]
    const result = computeSportYearSummary(entries, '2024-06-15')
    const march = result.dailyBreakdown[2]
    expect(march.duration).toBe(75)
    expect(result.dailyBreakdown[0].duration).toBe(0)
  })
})
