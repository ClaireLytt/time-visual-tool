import { describe, it, expect } from 'vitest'
import { isValidFinanceEntry, isValidFinanceCategory, validateFinanceData } from '../financeTransfer'
import { DEFAULT_FINANCE_CATEGORY_LIST } from '../../constants/finance'

const validEntry = {
  id: 'f1',
  date: '2026-01-15',
  description: 'Lunch',
  amount: 35,
  type: 'expense' as const,
  category: '餐饮',
  createdAt: '2026-01-15T12:00:00Z',
}

describe('isValidFinanceEntry', () => {
  it('accepts a valid expense entry', () => {
    expect(isValidFinanceEntry(validEntry)).toBe(true)
  })

  it('accepts a valid income entry', () => {
    expect(isValidFinanceEntry({ ...validEntry, type: 'income' })).toBe(true)
  })

  it('rejects invalid type', () => {
    expect(isValidFinanceEntry({ ...validEntry, type: 'refund' })).toBe(false)
  })

  it('rejects zero amount', () => {
    expect(isValidFinanceEntry({ ...validEntry, amount: 0 })).toBe(false)
  })

  it('rejects negative amount', () => {
    expect(isValidFinanceEntry({ ...validEntry, amount: -100 })).toBe(false)
  })

  it('rejects amount over 1 billion', () => {
    expect(isValidFinanceEntry({ ...validEntry, amount: 1000000001 })).toBe(false)
  })

  it('rejects NaN amount', () => {
    expect(isValidFinanceEntry({ ...validEntry, amount: NaN })).toBe(false)
  })

  it('rejects description over 100 chars', () => {
    expect(isValidFinanceEntry({ ...validEntry, description: 'x'.repeat(101) })).toBe(false)
  })

  it('rejects missing fields', () => {
    expect(isValidFinanceEntry({ id: 'f1' })).toBe(false)
  })

  it('rejects null', () => {
    expect(isValidFinanceEntry(null)).toBe(false)
  })
})

describe('isValidFinanceCategory', () => {
  it('accepts valid expense category', () => {
    expect(isValidFinanceCategory({ name: '餐饮', color: '#f00', kind: 'expense' })).toBe(true)
  })

  it('accepts valid income category', () => {
    expect(isValidFinanceCategory({ name: '工资', color: '#0f0', kind: 'income' })).toBe(true)
  })

  it('rejects missing kind', () => {
    expect(isValidFinanceCategory({ name: 'Test', color: '#f00' })).toBe(false)
  })

  it('rejects invalid kind', () => {
    expect(isValidFinanceCategory({ name: 'Test', color: '#f00', kind: 'other' })).toBe(false)
  })

  it('rejects null', () => {
    expect(isValidFinanceCategory(null)).toBe(false)
  })
})

describe('validateFinanceData', () => {
  it('returns null for non-object', () => {
    expect(validateFinanceData(null)).toBe(null)
    expect(validateFinanceData(42)).toBe(null)
  })

  it('returns null when entries is not array', () => {
    expect(validateFinanceData({ entries: 'bad' })).toBe(null)
  })

  it('filters invalid entries and keeps valid ones', () => {
    const result = validateFinanceData({
      entries: [validEntry, { bad: true }, { ...validEntry, id: 'f2', amount: -1 }],
      categories: DEFAULT_FINANCE_CATEGORY_LIST,
    })
    expect(result).not.toBe(null)
    expect(result!.entries).toHaveLength(1)
    expect(result!.entries[0].id).toBe('f1')
  })

  it('falls back to default categories when none provided', () => {
    const result = validateFinanceData({ entries: [] })
    expect(result!.categories).toEqual(DEFAULT_FINANCE_CATEGORY_LIST)
  })

  it('falls back to default categories when all invalid', () => {
    const result = validateFinanceData({ entries: [], categories: [{ name: 'No kind' }] })
    expect(result!.categories).toEqual(DEFAULT_FINANCE_CATEGORY_LIST)
  })

  it('keeps valid categories', () => {
    const cats = [{ name: 'Custom', color: '#f00', kind: 'expense' as const }]
    const result = validateFinanceData({ entries: [], categories: cats })
    expect(result!.categories).toEqual(cats)
  })

  it('preserves monthlyBudget within range', () => {
    const result = validateFinanceData({ entries: [], monthlyBudget: 5000 })
    expect(result!.monthlyBudget).toBe(5000)
  })

  it('rounds monthlyBudget', () => {
    const result = validateFinanceData({ entries: [], monthlyBudget: 3000.7 })
    expect(result!.monthlyBudget).toBe(3001)
  })

  it('omits monthlyBudget below 100', () => {
    const result = validateFinanceData({ entries: [], monthlyBudget: 50 })
    expect(result!.monthlyBudget).toBeUndefined()
  })

  it('omits monthlyBudget above 1000000', () => {
    const result = validateFinanceData({ entries: [], monthlyBudget: 2000000 })
    expect(result!.monthlyBudget).toBeUndefined()
  })

  it('omits monthlyBudget when not a number', () => {
    const result = validateFinanceData({ entries: [], monthlyBudget: 'bad' })
    expect(result!.monthlyBudget).toBeUndefined()
  })
})
