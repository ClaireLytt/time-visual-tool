import { describe, it, expect } from 'vitest'
import { isValidSportEntry, isValidSportCategory, isValidSportReflection, validateSportData } from '../sportTransfer'
import type { SportEntry } from '../../types/sport'

function makeEntry(overrides: Partial<SportEntry> = {}): SportEntry {
  return {
    id: 'test-id',
    date: '2024-06-15',
    sportType: '跑步',
    content: '5km run',
    duration: 30,
    calories: 200,
    note: '',
    createdAt: '2024-06-15T12:00:00.000Z',
    ...overrides,
  }
}

describe('isValidSportEntry', () => {
  it('accepts a valid entry', () => {
    expect(isValidSportEntry(makeEntry())).toBe(true)
  })

  it('rejects non-objects', () => {
    expect(isValidSportEntry(null)).toBe(false)
    expect(isValidSportEntry('string')).toBe(false)
    expect(isValidSportEntry(42)).toBe(false)
  })

  it('rejects entries with missing fields', () => {
    const entry: Record<string, unknown> = { ...makeEntry() }
    delete entry.duration
    expect(isValidSportEntry(entry)).toBe(false)
  })

  it('rejects entries with wrong field types', () => {
    expect(isValidSportEntry({ ...makeEntry(), duration: '30' })).toBe(false)
    expect(isValidSportEntry({ ...makeEntry(), calories: '200' })).toBe(false)
  })

  it('rejects NaN and Infinity', () => {
    expect(isValidSportEntry({ ...makeEntry(), duration: NaN })).toBe(false)
    expect(isValidSportEntry({ ...makeEntry(), calories: Infinity })).toBe(false)
    expect(isValidSportEntry({ ...makeEntry(), duration: -Infinity })).toBe(false)
  })

  it('rejects negative values', () => {
    expect(isValidSportEntry({ ...makeEntry(), duration: -10 })).toBe(false)
    expect(isValidSportEntry({ ...makeEntry(), calories: -5 })).toBe(false)
  })

  it('rejects empty required strings', () => {
    expect(isValidSportEntry({ ...makeEntry(), id: '' })).toBe(false)
    expect(isValidSportEntry({ ...makeEntry(), sportType: '' })).toBe(false)
    expect(isValidSportEntry({ ...makeEntry(), date: '' })).toBe(false)
  })
})

describe('isValidSportCategory', () => {
  it('accepts a valid category', () => {
    expect(isValidSportCategory({ name: '跑步', color: '#ef4444' })).toBe(true)
  })

  it('rejects invalid values', () => {
    expect(isValidSportCategory(null)).toBe(false)
    expect(isValidSportCategory({ name: '跑步' })).toBe(false)
    expect(isValidSportCategory({ color: '#ef4444' })).toBe(false)
  })

  it('rejects empty strings', () => {
    expect(isValidSportCategory({ name: '', color: '#ef4444' })).toBe(false)
    expect(isValidSportCategory({ name: '跑步', color: '' })).toBe(false)
  })
})

describe('isValidSportReflection', () => {
  const validReflection = {
    id: 'r1',
    periodType: 'week',
    periodKey: '2024-W25',
    text: 'Great week',
    createdAt: '2024-06-15T12:00:00.000Z',
    updatedAt: '2024-06-15T12:00:00.000Z',
  }

  it('accepts a valid reflection', () => {
    expect(isValidSportReflection(validReflection)).toBe(true)
  })

  it('accepts all valid period types', () => {
    expect(isValidSportReflection({ ...validReflection, periodType: 'month' })).toBe(true)
    expect(isValidSportReflection({ ...validReflection, periodType: 'year' })).toBe(true)
  })

  it('rejects invalid period types', () => {
    expect(isValidSportReflection({ ...validReflection, periodType: 'day' })).toBe(false)
    expect(isValidSportReflection({ ...validReflection, periodType: '' })).toBe(false)
  })

  it('rejects non-objects', () => {
    expect(isValidSportReflection(null)).toBe(false)
    expect(isValidSportReflection('string')).toBe(false)
  })

  it('rejects missing fields', () => {
    const partial: Record<string, unknown> = { ...validReflection }
    delete partial.text
    expect(isValidSportReflection(partial)).toBe(false)
  })
})

describe('validateSportData', () => {
  it('rejects non-objects', () => {
    expect(validateSportData(null)).toBe(null)
    expect(validateSportData('string')).toBe(null)
  })

  it('rejects data without entries array', () => {
    expect(validateSportData({ entries: 'not-array' })).toBe(null)
  })

  it('filters out invalid entries', () => {
    const result = validateSportData({
      entries: [makeEntry(), { bad: true }, makeEntry({ id: 'second' })],
      categories: [{ name: '跑步', color: '#ef4444' }],
    })
    expect(result).not.toBeNull()
    expect(result!.entries).toHaveLength(2)
  })

  it('uses default categories when none provided', () => {
    const result = validateSportData({ entries: [] })
    expect(result).not.toBeNull()
    expect(result!.categories.length).toBeGreaterThan(0)
  })

  it('filters invalid categories', () => {
    const result = validateSportData({
      entries: [],
      categories: [{ name: '跑步', color: '#ef4444' }, { invalid: true }],
    })
    expect(result).not.toBeNull()
    expect(result!.categories).toHaveLength(1)
  })

  it('falls back to defaults when all categories invalid', () => {
    const result = validateSportData({
      entries: [],
      categories: [{ invalid: true }],
    })
    expect(result).not.toBeNull()
    expect(result!.categories.length).toBeGreaterThan(0)
  })

  it('parses reflections and filters invalid ones', () => {
    const result = validateSportData({
      entries: [],
      reflections: [
        { id: 'r1', periodType: 'week', periodKey: '2024-W25', text: 'ok', createdAt: '2024-06-15T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
        { invalid: true },
        { id: 'r2', periodType: 'day', periodKey: '2024-06-15', text: 'bad type', createdAt: '2024-06-15T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
      ],
    })
    expect(result).not.toBeNull()
    expect(result!.reflections).toHaveLength(1)
    expect(result!.reflections[0].id).toBe('r1')
  })

  it('defaults reflections to empty array when missing', () => {
    const result = validateSportData({ entries: [] })
    expect(result).not.toBeNull()
    expect(result!.reflections).toEqual([])
  })
})
