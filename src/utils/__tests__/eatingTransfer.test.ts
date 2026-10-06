import { describe, it, expect } from 'vitest'
import { isValidEatingEntry, isValidEatingCategory, validateEatingData } from '../eatingTransfer'
import { DEFAULT_EATING_CATEGORY_LIST } from '../../constants/eating'

const validEntry = {
  id: 'e1',
  date: '2026-01-15',
  food: 'Rice',
  calories: 300,
  mealTime: '12:30',
  category: '午餐',
  note: 'Tasty',
  createdAt: '2026-01-15T12:30:00Z',
}

describe('isValidEatingEntry', () => {
  it('accepts a valid entry', () => {
    expect(isValidEatingEntry(validEntry)).toBe(true)
  })

  it('accepts zero calories', () => {
    expect(isValidEatingEntry({ ...validEntry, calories: 0 })).toBe(true)
  })

  it('accepts max calories', () => {
    expect(isValidEatingEntry({ ...validEntry, calories: 100000 })).toBe(true)
  })

  it('rejects negative calories', () => {
    expect(isValidEatingEntry({ ...validEntry, calories: -1 })).toBe(false)
  })

  it('rejects calories over 100000', () => {
    expect(isValidEatingEntry({ ...validEntry, calories: 100001 })).toBe(false)
  })

  it('rejects NaN calories', () => {
    expect(isValidEatingEntry({ ...validEntry, calories: NaN })).toBe(false)
  })

  it('rejects food name over 100 chars', () => {
    expect(isValidEatingEntry({ ...validEntry, food: 'x'.repeat(101) })).toBe(false)
  })

  it('rejects missing fields', () => {
    expect(isValidEatingEntry({ id: 'e1', date: '2026-01-15' })).toBe(false)
  })

  it('rejects null', () => {
    expect(isValidEatingEntry(null)).toBe(false)
  })

  it('rejects non-object', () => {
    expect(isValidEatingEntry('string')).toBe(false)
  })
})

describe('isValidEatingCategory', () => {
  it('accepts valid category', () => {
    expect(isValidEatingCategory({ name: '早餐', color: '#c4a36b' })).toBe(true)
  })

  it('rejects missing color', () => {
    expect(isValidEatingCategory({ name: '早餐' })).toBe(false)
  })

  it('rejects null', () => {
    expect(isValidEatingCategory(null)).toBe(false)
  })
})

describe('validateEatingData', () => {
  it('returns null for non-object', () => {
    expect(validateEatingData(null)).toBe(null)
    expect(validateEatingData('string')).toBe(null)
    expect(validateEatingData(42)).toBe(null)
  })

  it('returns null when entries is not array', () => {
    expect(validateEatingData({ entries: 'bad' })).toBe(null)
  })

  it('filters invalid entries and keeps valid ones', () => {
    const result = validateEatingData({
      entries: [validEntry, { bad: true }, { ...validEntry, id: 'e2', calories: -5 }],
      categories: DEFAULT_EATING_CATEGORY_LIST,
    })
    expect(result).not.toBe(null)
    expect(result!.entries).toHaveLength(1)
    expect(result!.entries[0].id).toBe('e1')
  })

  it('falls back to default categories when none provided', () => {
    const result = validateEatingData({ entries: [] })
    expect(result!.categories).toEqual(DEFAULT_EATING_CATEGORY_LIST)
  })

  it('falls back to default categories when all invalid', () => {
    const result = validateEatingData({ entries: [], categories: [{ bad: true }] })
    expect(result!.categories).toEqual(DEFAULT_EATING_CATEGORY_LIST)
  })

  it('keeps valid categories', () => {
    const cats = [{ name: 'Custom', color: '#ff0000' }]
    const result = validateEatingData({ entries: [], categories: cats })
    expect(result!.categories).toEqual(cats)
  })

  it('preserves dailyCalorieGoal within range', () => {
    const result = validateEatingData({ entries: [], dailyCalorieGoal: 1800 })
    expect(result!.dailyCalorieGoal).toBe(1800)
  })

  it('rounds dailyCalorieGoal', () => {
    const result = validateEatingData({ entries: [], dailyCalorieGoal: 1850.7 })
    expect(result!.dailyCalorieGoal).toBe(1851)
  })

  it('omits dailyCalorieGoal below 100', () => {
    const result = validateEatingData({ entries: [], dailyCalorieGoal: 50 })
    expect(result!.dailyCalorieGoal).toBeUndefined()
  })

  it('omits dailyCalorieGoal above 10000', () => {
    const result = validateEatingData({ entries: [], dailyCalorieGoal: 20000 })
    expect(result!.dailyCalorieGoal).toBeUndefined()
  })

  it('omits dailyCalorieGoal when not a number', () => {
    const result = validateEatingData({ entries: [], dailyCalorieGoal: 'bad' })
    expect(result!.dailyCalorieGoal).toBeUndefined()
  })
})
