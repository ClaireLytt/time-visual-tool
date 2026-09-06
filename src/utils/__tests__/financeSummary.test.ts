import { describe, it, expect } from 'vitest'
import { computeFinancePeriodSummary, computeFinanceWeekSummary, computeFinanceMonthSummary, computeFinanceYearSummary } from '../financeSummary'
import type { FinanceEntry } from '../../types/finance'

function makeEntry(overrides: Partial<FinanceEntry> = {}): FinanceEntry {
  return {
    id: Math.random().toString(36).slice(2),
    date: '2024-06-15',
    description: 'test',
    amount: 100,
    type: 'expense',
    category: '餐饮',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('computeFinancePeriodSummary (day)', () => {
  it('returns zeros for empty entries', () => {
    const result = computeFinancePeriodSummary([], '2024-06-15', 'day')
    expect(result.income).toBe(0)
    expect(result.expense).toBe(0)
    expect(result.balance).toBe(0)
    expect(result.entryCount).toBe(0)
  })

  it('computes income, expense and balance', () => {
    const entries = [
      makeEntry({ type: 'income', amount: 500, category: '工资' }),
      makeEntry({ type: 'expense', amount: 120 }),
      makeEntry({ type: 'expense', amount: 30.5, category: '交通' }),
    ]
    const result = computeFinancePeriodSummary(entries, '2024-06-15', 'day')
    expect(result.income).toBe(500)
    expect(result.expense).toBe(150.5)
    expect(result.balance).toBe(349.5)
    expect(result.entryCount).toBe(3)
  })

  it('supports negative balance', () => {
    const entries = [
      makeEntry({ type: 'income', amount: 100, category: '工资' }),
      makeEntry({ type: 'expense', amount: 250 }),
    ]
    const result = computeFinancePeriodSummary(entries, '2024-06-15', 'day')
    expect(result.balance).toBe(-150)
  })

  it('filters by date', () => {
    const entries = [
      makeEntry({ date: '2024-06-15', amount: 60 }),
      makeEntry({ date: '2024-06-16', amount: 30 }),
    ]
    const result = computeFinancePeriodSummary(entries, '2024-06-15', 'day')
    expect(result.expense).toBe(60)
    expect(result.entryCount).toBe(1)
  })

  it('separates income and expense breakdowns', () => {
    const entries = [
      makeEntry({ type: 'income', amount: 500, category: '工资' }),
      makeEntry({ type: 'expense', amount: 100, category: '餐饮' }),
      makeEntry({ type: 'expense', amount: 100, category: '交通' }),
    ]
    const result = computeFinancePeriodSummary(entries, '2024-06-15', 'day')
    expect(result.incomeBreakdown['工资'].amount).toBe(500)
    expect(result.incomeBreakdown['工资'].percentage).toBe(100)
    expect(result.expenseBreakdown['餐饮'].percentage).toBe(50)
    expect(result.expenseBreakdown['交通'].percentage).toBe(50)
    expect(result.expenseBreakdown['工资']).toBeUndefined()
  })

  it('aggregates same category', () => {
    const entries = [
      makeEntry({ amount: 60, category: '餐饮' }),
      makeEntry({ amount: 40, category: '餐饮' }),
    ]
    const result = computeFinancePeriodSummary(entries, '2024-06-15', 'day')
    expect(result.expenseBreakdown['餐饮'].amount).toBe(100)
    expect(result.expenseBreakdown['餐饮'].count).toBe(2)
  })

  it('avoids floating point drift', () => {
    const entries = [
      makeEntry({ amount: 0.1 }),
      makeEntry({ amount: 0.2 }),
    ]
    const result = computeFinancePeriodSummary(entries, '2024-06-15', 'day')
    expect(result.expense).toBe(0.3)
  })
})

describe('computeFinanceWeekSummary', () => {
  it('includes entries from Monday to Sunday', () => {
    // 2024-06-15 is a Saturday; week is 06-10 (Mon) to 06-16 (Sun)
    const entries = [
      makeEntry({ date: '2024-06-10', amount: 10 }),
      makeEntry({ date: '2024-06-16', amount: 20 }),
      makeEntry({ date: '2024-06-09', amount: 99 }),
      makeEntry({ date: '2024-06-17', amount: 99 }),
    ]
    const result = computeFinanceWeekSummary(entries, '2024-06-15')
    expect(result.expense).toBe(30)
    expect(result.dailyBreakdown).toHaveLength(7)
  })

  it('builds daily income/expense points', () => {
    const entries = [
      makeEntry({ date: '2024-06-12', amount: 50, type: 'expense' }),
      makeEntry({ date: '2024-06-12', amount: 80, type: 'income', category: '工资' }),
    ]
    const result = computeFinanceWeekSummary(entries, '2024-06-15')
    const point = result.dailyBreakdown.find(p => p.date === '2024-06-12')
    expect(point?.expense).toBe(50)
    expect(point?.income).toBe(80)
  })
})

describe('computeFinanceMonthSummary', () => {
  it('includes all days of the month', () => {
    const entries = [
      makeEntry({ date: '2024-06-01', amount: 10 }),
      makeEntry({ date: '2024-06-30', amount: 20 }),
      makeEntry({ date: '2024-05-31', amount: 99 }),
      makeEntry({ date: '2024-07-01', amount: 99 }),
    ]
    const result = computeFinanceMonthSummary(entries, '2024-06-15')
    expect(result.expense).toBe(30)
    expect(result.dailyBreakdown).toHaveLength(30)
  })
})

describe('computeFinanceYearSummary', () => {
  it('includes only entries within the year, grouped into 12 months', () => {
    const entries = [
      makeEntry({ date: '2024-01-01', amount: 10 }),
      makeEntry({ date: '2024-12-31', amount: 20 }),
      makeEntry({ date: '2023-12-31', amount: 99 }),
      makeEntry({ date: '2025-01-01', amount: 99 }),
    ]
    const result = computeFinanceYearSummary(entries, '2024-06-15')
    expect(result.expense).toBe(30)
    expect(result.dailyBreakdown).toHaveLength(12)
  })

  it('aggregates income and expense per month', () => {
    const entries = [
      makeEntry({ date: '2024-03-05', amount: 50, type: 'expense' }),
      makeEntry({ date: '2024-03-20', amount: 30, type: 'expense' }),
      makeEntry({ date: '2024-03-10', amount: 200, type: 'income', category: '工资' }),
    ]
    const result = computeFinanceYearSummary(entries, '2024-06-15')
    const march = result.dailyBreakdown[2]
    expect(march.expense).toBe(80)
    expect(march.income).toBe(200)
    expect(result.dailyBreakdown[0].expense).toBe(0)
  })
})
