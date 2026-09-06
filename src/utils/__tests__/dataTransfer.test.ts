import { describe, it, expect } from 'vitest'
import { isValidEntry, isValidCategory, validateImportData } from '../dataTransfer'

describe('isValidEntry', () => {
  const validEntry = {
    id: '1',
    date: '2024-06-15',
    activity: 'coding',
    duration: 60,
    weight: 1,
    category: '工作',
    createdAt: '2024-06-15T10:00:00Z',
  }

  it('returns true for valid entry', () => {
    expect(isValidEntry(validEntry)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isValidEntry(null)).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isValidEntry('string')).toBe(false)
    expect(isValidEntry(42)).toBe(false)
  })

  it('returns false when id is missing', () => {
    expect(isValidEntry({ ...validEntry, id: undefined })).toBe(false)
  })

  it('returns false when duration is string', () => {
    expect(isValidEntry({ ...validEntry, duration: '60' })).toBe(false)
  })

  it('returns false when weight is string', () => {
    expect(isValidEntry({ ...validEntry, weight: '1' })).toBe(false)
  })
})

describe('isValidCategory', () => {
  it('returns true for valid category', () => {
    expect(isValidCategory({ name: '工作', color: '#3b82f6' })).toBe(true)
  })

  it('returns false for null', () => {
    expect(isValidCategory(null)).toBe(false)
  })

  it('returns false when name is missing', () => {
    expect(isValidCategory({ color: '#3b82f6' })).toBe(false)
  })

  it('returns false when color is number', () => {
    expect(isValidCategory({ name: '工作', color: 123 })).toBe(false)
  })
})

describe('validateImportData', () => {
  const validData = {
    version: 2,
    entries: [
      {
        id: '1',
        date: '2024-06-15',
        activity: 'coding',
        duration: 60,
        weight: 1,
        category: '工作',
        createdAt: '2024-06-15T10:00:00Z',
      },
    ],
    categories: [{ name: '工作', color: '#3b82f6' }],
  }

  it('returns validated data for valid input', () => {
    const result = validateImportData(validData)
    expect(result).not.toBeNull()
    expect(result!.version).toBe(2)
    expect(result!.entries).toHaveLength(1)
    expect(result!.categories).toHaveLength(1)
  })

  it('returns null for null input', () => {
    expect(validateImportData(null)).toBeNull()
  })

  it('returns null for non-object', () => {
    expect(validateImportData('string')).toBeNull()
  })

  it('returns null when entries is not an array', () => {
    expect(validateImportData({ entries: 'not array' })).toBeNull()
  })

  it('filters out invalid entries', () => {
    const data = {
      ...validData,
      entries: [validData.entries[0], { invalid: true }, null],
    }
    const result = validateImportData(data)
    expect(result!.entries).toHaveLength(1)
  })

  it('falls back to default categories when missing', () => {
    const result = validateImportData({ ...validData, categories: undefined })
    expect(result!.categories.length).toBeGreaterThan(0)
    expect(result!.categories[0].name).toBe('工作')
  })

  it('falls back to defaults when categories array is empty after filtering', () => {
    const data = { ...validData, categories: [{ invalid: true }] }
    const result = validateImportData(data)
    expect(result!.categories.length).toBeGreaterThan(0)
  })

  it('accepts empty entries array', () => {
    const data = { ...validData, entries: [] }
    const result = validateImportData(data)
    expect(result).not.toBeNull()
    expect(result!.entries).toHaveLength(0)
  })
})
