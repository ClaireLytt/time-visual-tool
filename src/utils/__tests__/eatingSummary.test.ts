import { describe, it, expect } from 'vitest'
import { computeEatingPeriodSummary, computeEatingWeekSummary, computeEatingMonthSummary, computeEatingYearSummary } from '../eatingSummary'
import type { EatingEntry } from '../../types/eating'

function makeEntry(overrides: Partial<EatingEntry> = {}): EatingEntry {
  return {
    id: Math.random().toString(36).slice(2),
    date: '2024-06-15',
    food: 'test food',
    calories: 300,
    mealTime: '12:00',
    category: '午餐',
    note: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('computeEatingPeriodSummary (day)', () => {
  it('returns zeros for empty entries', () => {
    const result = computeEatingPeriodSummary([], '2024-06-15', 'day')
    expect(result.totalCalories).toBe(0)
    expect(result.entryCount).toBe(0)
    expect(result.averageCaloriesPerEntry).toBe(0)
  })

  it('computes totals and average', () => {
    const entries = [
      makeEntry({ calories: 300 }),
      makeEntry({ calories: 200 }),
      makeEntry({ calories: 500 }),
    ]
    const result = computeEatingPeriodSummary(entries, '2024-06-15', 'day')
    expect(result.totalCalories).toBe(1000)
    expect(result.entryCount).toBe(3)
    expect(result.averageCaloriesPerEntry).toBeCloseTo(333.33, 1)
  })

  it('filters by date', () => {
    const entries = [
      makeEntry({ date: '2024-06-15', calories: 400 }),
      makeEntry({ date: '2024-06-16', calories: 300 }),
    ]
    const result = computeEatingPeriodSummary(entries, '2024-06-15', 'day')
    expect(result.totalCalories).toBe(400)
    expect(result.entryCount).toBe(1)
  })

  it('builds category breakdown', () => {
    const entries = [
      makeEntry({ calories: 300, category: '早餐' }),
      makeEntry({ calories: 500, category: '午餐' }),
      makeEntry({ calories: 200, category: '早餐' }),
    ]
    const result = computeEatingPeriodSummary(entries, '2024-06-15', 'day')
    expect(result.categoryBreakdown['早餐'].calories).toBe(500)
    expect(result.categoryBreakdown['早餐'].count).toBe(2)
    expect(result.categoryBreakdown['午餐'].calories).toBe(500)
    expect(result.categoryBreakdown['午餐'].count).toBe(1)
    expect(result.categoryBreakdown['早餐'].percentage).toBe(50)
    expect(result.categoryBreakdown['午餐'].percentage).toBe(50)
  })
})

describe('computeEatingWeekSummary', () => {
  it('includes entries from Monday to Sunday', () => {
    const entries = [
      makeEntry({ date: '2024-06-10', calories: 100 }),
      makeEntry({ date: '2024-06-16', calories: 200 }),
      makeEntry({ date: '2024-06-09', calories: 999 }),
      makeEntry({ date: '2024-06-17', calories: 999 }),
    ]
    const result = computeEatingWeekSummary(entries, '2024-06-15')
    expect(result.totalCalories).toBe(300)
    expect(result.dailyBreakdown).toHaveLength(7)
  })
})

describe('computeEatingMonthSummary', () => {
  it('includes all days of the month', () => {
    const entries = [
      makeEntry({ date: '2024-06-01', calories: 100 }),
      makeEntry({ date: '2024-06-30', calories: 200 }),
      makeEntry({ date: '2024-05-31', calories: 999 }),
      makeEntry({ date: '2024-07-01', calories: 999 }),
    ]
    const result = computeEatingMonthSummary(entries, '2024-06-15')
    expect(result.totalCalories).toBe(300)
    expect(result.dailyBreakdown).toHaveLength(30)
  })
})

describe('computeEatingYearSummary', () => {
  it('includes only entries within the year, grouped into 12 months', () => {
    const entries = [
      makeEntry({ date: '2024-01-01', calories: 100 }),
      makeEntry({ date: '2024-12-31', calories: 200 }),
      makeEntry({ date: '2023-12-31', calories: 999 }),
      makeEntry({ date: '2025-01-01', calories: 999 }),
    ]
    const result = computeEatingYearSummary(entries, '2024-06-15')
    expect(result.totalCalories).toBe(300)
    expect(result.dailyBreakdown).toHaveLength(12)
  })

  it('aggregates calories per month', () => {
    const entries = [
      makeEntry({ date: '2024-03-05', calories: 300 }),
      makeEntry({ date: '2024-03-20', calories: 200 }),
    ]
    const result = computeEatingYearSummary(entries, '2024-06-15')
    const march = result.dailyBreakdown[2]
    expect(march.calories).toBe(500)
    expect(result.dailyBreakdown[0].calories).toBe(0)
  })
})
