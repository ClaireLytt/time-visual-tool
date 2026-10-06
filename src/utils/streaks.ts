import { format, subDays } from 'date-fns'

/**
 * Compute the current streak: the number of consecutive days ending at today
 * (or yesterday, if today has no entry yet) that have at least one entry.
 */
export function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const uniqueDates = new Set(dates)
  const today = format(new Date(), 'yyyy-MM-dd')

  // Start from today if it has an entry, otherwise from yesterday
  let current = uniqueDates.has(today) ? new Date() : subDays(new Date(), 1)
  let streak = 0

  while (uniqueDates.has(format(current, 'yyyy-MM-dd'))) {
    streak++
    current = subDays(current, 1)
  }

  return streak
}
