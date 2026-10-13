import { describe, it, expect } from 'vitest'
import { todoOccursOn } from '../todoRepeat'
import type { TodoItem, TodoRepeat } from '../../types/todo'

function make(date: string, repeat?: TodoRepeat, extra?: Partial<TodoItem>): TodoItem {
  return {
    id: 't1',
    text: 'x',
    done: false,
    priority: 'medium',
    date,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...(repeat ? { repeat } : {}),
    ...extra,
  }
}

describe('todoOccursOn', () => {
  it('one-off item occurs only on its date', () => {
    const item = make('2026-10-13')
    expect(todoOccursOn(item, '2026-10-13')).toBe(true)
    expect(todoOccursOn(item, '2026-10-14')).toBe(false)
  })

  it('daily occurs every day from start, never before', () => {
    const item = make('2026-10-13', { type: 'daily' })
    expect(todoOccursOn(item, '2026-10-12')).toBe(false)
    expect(todoOccursOn(item, '2026-10-13')).toBe(true)
    expect(todoOccursOn(item, '2027-01-01')).toBe(true)
  })

  it('respects the until end date', () => {
    const item = make('2026-10-13', { type: 'daily', until: '2026-10-15' })
    expect(todoOccursOn(item, '2026-10-15')).toBe(true)
    expect(todoOccursOn(item, '2026-10-16')).toBe(false)
  })

  it('skippedDates removes single occurrences', () => {
    const item = make('2026-10-13', { type: 'daily' }, { skippedDates: ['2026-10-14'] })
    expect(todoOccursOn(item, '2026-10-14')).toBe(false)
    expect(todoOccursOn(item, '2026-10-15')).toBe(true)
  })

  it('weekly uses selected weekdays', () => {
    // 2026-10-13 is a Tuesday (2); repeat on Mon(1) & Fri(5)
    const item = make('2026-10-13', { type: 'weekly', weekdays: [1, 5] })
    expect(todoOccursOn(item, '2026-10-16')).toBe(true) // Friday
    expect(todoOccursOn(item, '2026-10-19')).toBe(true) // Monday
    expect(todoOccursOn(item, '2026-10-20')).toBe(false) // Tuesday not selected
  })

  it('weekly defaults to the start weekday when none selected', () => {
    const item = make('2026-10-13', { type: 'weekly' }) // Tuesday
    expect(todoOccursOn(item, '2026-10-20')).toBe(true)
    expect(todoOccursOn(item, '2026-10-21')).toBe(false)
  })

  it('monthly occurs on the anchor day of month', () => {
    const item = make('2026-10-05', { type: 'monthly' })
    expect(todoOccursOn(item, '2026-11-05')).toBe(true)
    expect(todoOccursOn(item, '2026-11-06')).toBe(false)
  })

  it('monthly anchored on the 31st clamps to shorter month ends', () => {
    const item = make('2026-01-31', { type: 'monthly' })
    expect(todoOccursOn(item, '2026-02-28')).toBe(true) // Feb 2026 has 28 days
    expect(todoOccursOn(item, '2026-04-30')).toBe(true) // April has 30
    expect(todoOccursOn(item, '2026-03-31')).toBe(true) // normal month
    expect(todoOccursOn(item, '2026-03-30')).toBe(false)
  })

  it('monthly anchored on the 30th occurs on Feb 28/29', () => {
    const item = make('2026-01-30', { type: 'monthly' })
    expect(todoOccursOn(item, '2026-02-28')).toBe(true)
    expect(todoOccursOn(item, '2028-02-29')).toBe(true) // leap year
    expect(todoOccursOn(item, '2028-02-28')).toBe(false)
  })

  it('custom repeats every N days', () => {
    const item = make('2026-10-13', { type: 'custom', interval: 3 })
    expect(todoOccursOn(item, '2026-10-13')).toBe(true)
    expect(todoOccursOn(item, '2026-10-16')).toBe(true)
    expect(todoOccursOn(item, '2026-10-15')).toBe(false)
  })
})
