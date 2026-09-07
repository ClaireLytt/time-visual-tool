import { describe, it, expect } from 'vitest'
import { getPeriodKey, periodKeyToAnchorDate, isValidPeriodKey } from '../diaryPeriod'

describe('getPeriodKey', () => {
  it('formats day key', () => {
    expect(getPeriodKey('2026-09-07', 'day')).toBe('2026-09-07')
  })

  it('formats week key with ISO week', () => {
    expect(getPeriodKey('2026-09-07', 'week')).toBe('2026-W37')
  })

  it('formats month key', () => {
    expect(getPeriodKey('2026-09-07', 'month')).toBe('2026-09')
  })

  it('formats year key', () => {
    expect(getPeriodKey('2026-09-07', 'year')).toBe('2026')
  })

  it('handles ISO week year boundary (Dec belongs to next ISO year)', () => {
    expect(getPeriodKey('2024-12-30', 'week')).toBe('2025-W01')
  })

  it('handles ISO week year boundary (Jan belongs to previous ISO year)', () => {
    expect(getPeriodKey('2027-01-01', 'week')).toBe('2026-W53')
  })
})

describe('periodKeyToAnchorDate', () => {
  it('day is identity', () => {
    expect(periodKeyToAnchorDate('day', '2026-09-07')).toBe('2026-09-07')
  })

  it('week resolves to Monday of that ISO week', () => {
    expect(periodKeyToAnchorDate('week', '2026-W37')).toBe('2026-09-07')
  })

  it('week handles year boundary', () => {
    expect(periodKeyToAnchorDate('week', '2025-W01')).toBe('2024-12-30')
  })

  it('month resolves to first day', () => {
    expect(periodKeyToAnchorDate('month', '2026-09')).toBe('2026-09-01')
  })

  it('year resolves to Jan 1', () => {
    expect(periodKeyToAnchorDate('year', '2026')).toBe('2026-01-01')
  })

  it('round-trips: anchor from key produces the same key', () => {
    const types = ['day', 'week', 'month', 'year'] as const
    const dates = ['2026-09-07', '2024-12-30', '2027-01-01', '2025-06-15']
    for (const type of types) {
      for (const date of dates) {
        const key = getPeriodKey(date, type)
        expect(getPeriodKey(periodKeyToAnchorDate(type, key), type)).toBe(key)
      }
    }
  })
})

describe('isValidPeriodKey', () => {
  it('accepts valid keys', () => {
    expect(isValidPeriodKey('day', '2026-09-07')).toBe(true)
    expect(isValidPeriodKey('week', '2026-W37')).toBe(true)
    expect(isValidPeriodKey('month', '2026-09')).toBe(true)
    expect(isValidPeriodKey('year', '2026')).toBe(true)
  })

  it('rejects mismatched formats', () => {
    expect(isValidPeriodKey('day', '2026-09')).toBe(false)
    expect(isValidPeriodKey('week', '2026-09-07')).toBe(false)
    expect(isValidPeriodKey('month', '2026')).toBe(false)
    expect(isValidPeriodKey('year', '2026-09')).toBe(false)
    expect(isValidPeriodKey('week', '2026-w37')).toBe(false)
  })
})
