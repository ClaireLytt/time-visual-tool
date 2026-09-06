import { describe, it, expect } from 'vitest'
import { formatDuration, parseDurationInput } from '../time'

describe('formatDuration', () => {
  it('formats zero minutes', () => {
    expect(formatDuration(0)).toBe('0分钟')
  })

  it('formats minutes only', () => {
    expect(formatDuration(30)).toBe('30分钟')
  })

  it('formats full hours', () => {
    expect(formatDuration(60)).toBe('1小时')
    expect(formatDuration(120)).toBe('2小时')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1小时30分钟')
    expect(formatDuration(125)).toBe('2小时5分钟')
  })
})

describe('parseDurationInput', () => {
  it('parses plain minutes', () => {
    expect(parseDurationInput('90')).toBe(90)
    expect(parseDurationInput('30')).toBe(30)
  })

  it('parses colon format', () => {
    expect(parseDurationInput('1:30')).toBe(90)
    expect(parseDurationInput('2:00')).toBe(120)
    expect(parseDurationInput('1:59')).toBe(119)
    expect(parseDurationInput('0:45')).toBe(45)
  })

  it('rejects minutes >= 60 in colon format', () => {
    expect(parseDurationInput('1:60')).toBeNull()
    expect(parseDurationInput('1:99')).toBeNull()
  })

  it('parses hour format with h', () => {
    expect(parseDurationInput('1.5h')).toBe(90)
    expect(parseDurationInput('2h')).toBe(120)
    expect(parseDurationInput('0.5H')).toBe(30)
  })

  it('parses hour format with 小时', () => {
    expect(parseDurationInput('1.5小时')).toBe(90)
    expect(parseDurationInput('2小时')).toBe(120)
  })

  it('returns null for empty input', () => {
    expect(parseDurationInput('')).toBeNull()
    expect(parseDurationInput('  ')).toBeNull()
  })

  it('returns null for invalid input', () => {
    expect(parseDurationInput('abc')).toBeNull()
    expect(parseDurationInput('--5')).toBeNull()
  })

  it('returns null for negative numbers', () => {
    expect(parseDurationInput('-10')).toBeNull()
  })

  it('rounds decimal minutes', () => {
    expect(parseDurationInput('30.7')).toBe(31)
  })

  it('trims whitespace', () => {
    expect(parseDurationInput('  90  ')).toBe(90)
    expect(parseDurationInput(' 1:30 ')).toBe(90)
  })
})
