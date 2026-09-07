import { describe, it, expect } from 'vitest'
import { isValidDiaryEntry, validateDiaryData, dedupeDiaryEntries } from '../diaryTransfer'
import type { DiaryEntry } from '../../types/diary'

function makeEntry(overrides: Partial<DiaryEntry> = {}): DiaryEntry {
  return {
    id: Math.random().toString(36).slice(2),
    periodType: 'day',
    periodKey: '2026-09-07',
    gratitude: '感谢今天的好天气',
    feelings: '心情不错',
    motivation: '继续加油',
    goals: [],
    createdAt: '2026-09-07T10:00:00.000Z',
    updatedAt: '2026-09-07T10:00:00.000Z',
    ...overrides,
  }
}

describe('isValidDiaryEntry', () => {
  it('accepts a valid entry', () => {
    expect(isValidDiaryEntry(makeEntry())).toBe(true)
    expect(isValidDiaryEntry(makeEntry({ periodType: 'week', periodKey: '2026-W37' }))).toBe(true)
    expect(isValidDiaryEntry(makeEntry({ periodType: 'year', periodKey: '2026' }))).toBe(true)
  })

  it('rejects non-objects', () => {
    expect(isValidDiaryEntry(null)).toBe(false)
    expect(isValidDiaryEntry('string')).toBe(false)
    expect(isValidDiaryEntry(42)).toBe(false)
  })

  it('rejects unknown periodType', () => {
    expect(isValidDiaryEntry(makeEntry({ periodType: 'decade' as never }))).toBe(false)
  })

  it('rejects periodKey not matching periodType format', () => {
    expect(isValidDiaryEntry(makeEntry({ periodType: 'week', periodKey: '2026-09-07' }))).toBe(false)
    expect(isValidDiaryEntry(makeEntry({ periodType: 'day', periodKey: '2026' }))).toBe(false)
  })

  it('rejects missing fields', () => {
    const entry: Record<string, unknown> = { ...makeEntry() }
    delete entry.gratitude
    expect(isValidDiaryEntry(entry)).toBe(false)
  })

  it('accepts valid goals and missing goals', () => {
    expect(isValidDiaryEntry(makeEntry({ goals: [{ id: 'g1', text: '完成日记功能', done: true }] }))).toBe(true)
    const entry: Record<string, unknown> = { ...makeEntry() }
    delete entry.goals
    expect(isValidDiaryEntry(entry)).toBe(true)
  })

  it('rejects malformed goals', () => {
    expect(isValidDiaryEntry(makeEntry({ goals: [{ id: 'g1', text: 'x' }] as never }))).toBe(false)
    expect(isValidDiaryEntry(makeEntry({ goals: 'not-array' as never }))).toBe(false)
  })
})

describe('dedupeDiaryEntries', () => {
  it('keeps the entry with newer updatedAt on collision', () => {
    const older = makeEntry({ id: 'a', updatedAt: '2026-09-07T10:00:00.000Z' })
    const newer = makeEntry({ id: 'b', updatedAt: '2026-09-08T10:00:00.000Z' })
    const result = dedupeDiaryEntries([older, newer])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('b')
  })

  it('keeps entries of different periods', () => {
    const result = dedupeDiaryEntries([
      makeEntry({ periodKey: '2026-09-07' }),
      makeEntry({ periodKey: '2026-09-08' }),
      makeEntry({ periodType: 'week', periodKey: '2026-W37' }),
    ])
    expect(result).toHaveLength(3)
  })
})

describe('validateDiaryData', () => {
  it('rejects non-objects and missing entries array', () => {
    expect(validateDiaryData(null)).toBeNull()
    expect(validateDiaryData('x')).toBeNull()
    expect(validateDiaryData({})).toBeNull()
    expect(validateDiaryData({ entries: 'not-array' })).toBeNull()
  })

  it('filters malformed entries and returns version 1', () => {
    const valid = makeEntry()
    const result = validateDiaryData({ entries: [valid, { bad: true }, null] })
    expect(result).not.toBeNull()
    expect(result!.version).toBe(1)
    expect(result!.entries).toHaveLength(1)
    expect(result!.entries[0].id).toBe(valid.id)
  })

  it('normalizes missing goals to empty array', () => {
    const entry: Record<string, unknown> = { ...makeEntry() }
    delete entry.goals
    const result = validateDiaryData({ entries: [entry] })
    expect(result!.entries[0].goals).toEqual([])
  })

  it('dedupes duplicate periods keeping newer', () => {
    const older = makeEntry({ id: 'a', updatedAt: '2026-01-01T00:00:00.000Z' })
    const newer = makeEntry({ id: 'b', updatedAt: '2026-02-01T00:00:00.000Z' })
    const result = validateDiaryData({ entries: [newer, older] })
    expect(result!.entries).toHaveLength(1)
    expect(result!.entries[0].id).toBe('b')
  })
})
