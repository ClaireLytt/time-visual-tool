import i18n from '../i18n'

const MAX_CALORIES = 100_000

export function formatCalories(calories: number): string {
  if (!Number.isFinite(calories)) return `0 ${i18n.t('eating.calorieUnit')}`
  return `${Math.round(calories)} ${i18n.t('eating.calorieUnit')}`
}

export function parseCalorieInput(input: string): number | null {
  const trimmed = input.replace(/\s+/g, '')
  if (!trimmed) return null

  if (!/^\d+(\.\d+)?([+-]\d+(\.\d+)?)*$/.test(trimmed)) return null

  const tokens = trimmed.match(/[+-]?\d+(\.\d+)?/g)
  if (!tokens) return null

  let total = 0
  for (const token of tokens) {
    const value = parseFloat(token)
    if (!Number.isFinite(value)) return null
    total += value
  }

  const result = Math.round(total)
  if (result < 0 || result > MAX_CALORIES) return null
  return result
}
