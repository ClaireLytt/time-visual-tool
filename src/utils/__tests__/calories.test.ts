import { describe, it, expect } from 'vitest'
import { parseCalorieInput } from '../calories'

describe('parseCalorieInput', () => {
  it('parses plain numbers', () => {
    expect(parseCalorieInput('300')).toBe(300)
    expect(parseCalorieInput('12.5')).toBe(13)
  })

  it('parses addition expressions', () => {
    expect(parseCalorieInput('200+150')).toBe(350)
    expect(parseCalorieInput('100+50+30')).toBe(180)
  })

  it('parses subtraction expressions', () => {
    expect(parseCalorieInput('500-100')).toBe(400)
    expect(parseCalorieInput('200+150-50')).toBe(300)
  })

  it('ignores whitespace', () => {
    expect(parseCalorieInput(' 200 + 100 ')).toBe(300)
  })

  it('rounds to integer', () => {
    expect(parseCalorieInput('100.4')).toBe(100)
    expect(parseCalorieInput('100.6')).toBe(101)
  })

  it('allows zero calories', () => {
    expect(parseCalorieInput('0')).toBe(0)
    expect(parseCalorieInput('5-5')).toBe(0)
  })

  it('rejects negative results', () => {
    expect(parseCalorieInput('3-10')).toBeNull()
  })

  it('rejects invalid input', () => {
    expect(parseCalorieInput('')).toBeNull()
    expect(parseCalorieInput('abc')).toBeNull()
    expect(parseCalorieInput('12+')).toBeNull()
    expect(parseCalorieInput('+12')).toBeNull()
    expect(parseCalorieInput('-12')).toBeNull()
    expect(parseCalorieInput('12*3')).toBeNull()
  })

  it('rejects calories over the max', () => {
    expect(parseCalorieInput('100001')).toBeNull()
  })
})
