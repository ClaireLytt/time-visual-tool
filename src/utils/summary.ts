import type { TimeEntry, DaySummary, CategoryBreakdown } from '../types'

export function computeDaySummary(entries: TimeEntry[], date: string): DaySummary {
  const dayEntries = entries.filter(e => e.date === date)
  const totalMinutes = dayEntries.reduce((sum, e) => sum + e.duration, 0)
  const weightedMinutes = dayEntries.reduce((sum, e) => sum + e.duration * e.weight, 0)

  const categoryBreakdown: Record<string, CategoryBreakdown> = {}
  for (const entry of dayEntries) {
    const existing = categoryBreakdown[entry.category]
    if (existing) {
      existing.totalMinutes += entry.duration
      existing.weightedMinutes += entry.duration * entry.weight
      existing.count += 1
    } else {
      categoryBreakdown[entry.category] = {
        totalMinutes: entry.duration,
        weightedMinutes: entry.duration * entry.weight,
        percentage: 0,
        count: 1,
      }
    }
  }

  if (totalMinutes > 0) {
    for (const cat of Object.values(categoryBreakdown)) {
      cat.percentage = Math.round((cat.totalMinutes / totalMinutes) * 100)
    }
  }

  return { date, totalMinutes, weightedMinutes, entries: dayEntries, categoryBreakdown }
}
