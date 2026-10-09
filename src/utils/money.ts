import i18n from '../i18n'

const MAX_AMOUNT = 1_000_000_000

export function formatAmount(amount: number): string {
  const symbol = i18n.t('currency.symbol')
  if (!Number.isFinite(amount)) return `${symbol}0.00`
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(amount)
  return `${sign}${symbol}${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Parses an amount input that may be a plain number or a +/- arithmetic
 * expression like "12+8.5-3". Returns the result rounded to 2 decimals,
 * or null if invalid or non-positive.
 */
export function parseAmountInput(input: string): number | null {
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

  const result = Math.round(total * 100) / 100
  if (result <= 0 || result > MAX_AMOUNT) return null
  return result
}
