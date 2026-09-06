import { describe, it, expect } from 'vitest'
import { formatAmount, parseAmountInput } from '../money'

describe('formatAmount', () => {
  it('formats a plain amount with 2 decimals', () => {
    expect(formatAmount(12)).toBe('¥12.00')
    expect(formatAmount(12.5)).toBe('¥12.50')
  })

  it('adds thousand separators', () => {
    expect(formatAmount(1234567.89)).toBe('¥1,234,567.89')
  })

  it('handles negative amounts', () => {
    expect(formatAmount(-50)).toBe('-¥50.00')
  })

  it('handles zero and invalid values', () => {
    expect(formatAmount(0)).toBe('¥0.00')
    expect(formatAmount(NaN)).toBe('¥0.00')
    expect(formatAmount(Infinity)).toBe('¥0.00')
  })
})

describe('parseAmountInput', () => {
  it('parses plain numbers', () => {
    expect(parseAmountInput('12')).toBe(12)
    expect(parseAmountInput('12.5')).toBe(12.5)
    expect(parseAmountInput('0.01')).toBe(0.01)
  })

  it('parses addition expressions', () => {
    expect(parseAmountInput('12+8')).toBe(20)
    expect(parseAmountInput('1.5+2.5+3')).toBe(7)
  })

  it('parses subtraction expressions', () => {
    expect(parseAmountInput('20-8')).toBe(12)
    expect(parseAmountInput('12+8-3')).toBe(17)
  })

  it('ignores whitespace', () => {
    expect(parseAmountInput(' 12 + 8 - 3 ')).toBe(17)
  })

  it('rounds to 2 decimals', () => {
    expect(parseAmountInput('0.1+0.2')).toBe(0.3)
  })

  it('rejects non-positive results', () => {
    expect(parseAmountInput('5-5')).toBeNull()
    expect(parseAmountInput('3-10')).toBeNull()
  })

  it('rejects invalid input', () => {
    expect(parseAmountInput('')).toBeNull()
    expect(parseAmountInput('abc')).toBeNull()
    expect(parseAmountInput('12+')).toBeNull()
    expect(parseAmountInput('+12')).toBeNull()
    expect(parseAmountInput('-12')).toBeNull()
    expect(parseAmountInput('12*3')).toBeNull()
    expect(parseAmountInput('12..5')).toBeNull()
  })

  it('rejects amounts over the max', () => {
    expect(parseAmountInput('1000000001')).toBeNull()
  })
})
