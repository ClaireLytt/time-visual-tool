import { parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, format, getDay } from 'date-fns'
import i18n from '../i18n'
import type { EatingEntry, EatingCategoryBreakdown, EatingPeriodSummary, EatingDailyDataPoint, EatingViewMode } from '../types/eating'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function buildBreakdown(entries: EatingEntry[]): Record<string, EatingCategoryBreakdown> {
  const breakdown: Record<string, EatingCategoryBreakdown> = {}
  let total = 0
  for (const entry of entries) {
    total += entry.calories
    const existing = breakdown[entry.category]
    if (existing) {
      existing.calories = round2(existing.calories + entry.calories)
      existing.count += 1
    } else {
      breakdown[entry.category] = { calories: round2(entry.calories), percentage: 0, count: 1 }
    }
  }
  if (total > 0) {
    for (const cat of Object.values(breakdown)) {
      cat.percentage = Math.round((cat.calories / total) * 100)
    }
  }
  return breakdown
}

function computeSummaryFromEntries(entries: EatingEntry[]) {
  const totalCalories = round2(entries.reduce((sum, e) => sum + e.calories, 0))
  const entryCount = entries.length
  return {
    totalCalories,
    entryCount,
    averageCaloriesPerEntry: entryCount > 0 ? round2(totalCalories / entryCount) : 0,
    categoryBreakdown: buildBreakdown(entries),
  }
}

function buildDailyBreakdown(filteredEntries: EatingEntry[], days: Date[]): EatingDailyDataPoint[] {
  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayEntries = filteredEntries.filter(e => e.date === dateStr)
    const calories = round2(dayEntries.reduce((sum, e) => sum + e.calories, 0))
    return { date: dateStr, label: '', calories }
  })
}

export function computeEatingWeekSummary(allEntries: EatingEntry[], dateInWeek: string): EatingPeriodSummary {
  const anchor = parseISO(dateInWeek)
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  const end = endOfWeek(anchor, { weekStartsOn: 1 })
  const startStr = format(start, 'yyyy-MM-dd')
  const endStr = format(end, 'yyyy-MM-dd')

  const filtered = allEntries.filter(e => e.date >= startStr && e.date <= endStr)
  const summary = computeSummaryFromEntries(filtered)

  const dayLabels = i18n.t('date.dayLabels', { returnObjects: true }) as string[]
  const days = eachDayOfInterval({ start, end })
  const dailyBreakdown = buildDailyBreakdown(filtered, days)
  dailyBreakdown.forEach((point) => {
    const dayOfWeek = getDay(parseISO(point.date))
    point.label = dayLabels[dayOfWeek]
  })

  return { ...summary, dailyBreakdown }
}

export function computeEatingMonthSummary(allEntries: EatingEntry[], dateInMonth: string): EatingPeriodSummary {
  const anchor = parseISO(dateInMonth)
  const start = startOfMonth(anchor)
  const end = endOfMonth(anchor)
  const startStr = format(start, 'yyyy-MM-dd')
  const endStr = format(end, 'yyyy-MM-dd')

  const filtered = allEntries.filter(e => e.date >= startStr && e.date <= endStr)
  const summary = computeSummaryFromEntries(filtered)

  const days = eachDayOfInterval({ start, end })
  const dailyBreakdown = buildDailyBreakdown(filtered, days)
  dailyBreakdown.forEach((point) => {
    const dayOfMonth = parseISO(point.date).getDate()
    point.label = i18n.t('date.daySuffix', { day: dayOfMonth })
  })

  return { ...summary, dailyBreakdown }
}

export function computeEatingYearSummary(allEntries: EatingEntry[], dateInYear: string): EatingPeriodSummary {
  const anchor = parseISO(dateInYear)
  const start = startOfYear(anchor)
  const end = endOfYear(anchor)
  const startStr = format(start, 'yyyy-MM-dd')
  const endStr = format(end, 'yyyy-MM-dd')

  const filtered = allEntries.filter(e => e.date >= startStr && e.date <= endStr)
  const summary = computeSummaryFromEntries(filtered)

  const monthLabels = i18n.t('date.monthLabels', { returnObjects: true }) as string[]
  const dailyBreakdown: EatingDailyDataPoint[] = eachMonthOfInterval({ start, end }).map(monthStart => {
    const mStartStr = format(monthStart, 'yyyy-MM-dd')
    const mEndStr = format(endOfMonth(monthStart), 'yyyy-MM-dd')
    const monthEntries = filtered.filter(e => e.date >= mStartStr && e.date <= mEndStr)
    const calories = round2(monthEntries.reduce((sum, e) => sum + e.calories, 0))
    return { date: mStartStr, label: monthLabels[monthStart.getMonth()], calories }
  })

  return { ...summary, dailyBreakdown }
}

export function computeEatingPeriodSummary(allEntries: EatingEntry[], anchorDate: string, viewMode: EatingViewMode): EatingPeriodSummary {
  if (viewMode === 'week') return computeEatingWeekSummary(allEntries, anchorDate)
  if (viewMode === 'month') return computeEatingMonthSummary(allEntries, anchorDate)
  if (viewMode === 'year') return computeEatingYearSummary(allEntries, anchorDate)

  const dayEntries = allEntries.filter(e => e.date === anchorDate)
  const summary = computeSummaryFromEntries(dayEntries)
  return {
    ...summary,
    dailyBreakdown: [{
      date: anchorDate,
      label: anchorDate,
      calories: summary.totalCalories,
    }],
  }
}
