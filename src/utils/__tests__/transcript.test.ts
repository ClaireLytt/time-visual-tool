import { describe, it, expect } from 'vitest'
import { findActiveIndex, formatClock, isUrl } from '../transcript'

describe('formatClock', () => {
  it('formats mm:ss and h:mm:ss', () => {
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(65.9)).toBe('01:05')
    expect(formatClock(3723)).toBe('1:02:03')
    expect(formatClock(-3)).toBe('00:00')
  })
})

describe('findActiveIndex', () => {
  const segs = [
    { start: 0, end: 3, text: 'a' },
    { start: 3, end: 8, text: 'b' },
    { start: 10, end: 12, text: 'c' },
  ]

  it('finds the segment containing the time', () => {
    expect(findActiveIndex(segs, 0)).toBe(0)
    expect(findActiveIndex(segs, 4)).toBe(1)
    expect(findActiveIndex(segs, 11)).toBe(2)
  })

  it('keeps the previous segment during gaps and after the end', () => {
    expect(findActiveIndex(segs, 9)).toBe(1)
    expect(findActiveIndex(segs, 100)).toBe(2)
  })

  it('returns -1 before the first segment or when empty', () => {
    expect(findActiveIndex([{ start: 2, end: 3, text: 'x' }], 1)).toBe(-1)
    expect(findActiveIndex([], 5)).toBe(-1)
  })
})

describe('isUrl', () => {
  it('detects http(s) urls', () => {
    expect(isUrl(' https://feeds.megaphone.fm/allearsenglish')).toBe(true)
    expect(isUrl('All Ears English')).toBe(false)
  })
})
