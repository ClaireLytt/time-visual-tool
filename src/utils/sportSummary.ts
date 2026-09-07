import { parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, format, getDay } from 'date-fns'
import i18n from '../i18n'
import type { SportEntry, SportCategoryBreakdown, SportPeriodSummary, SportDailyDataPoint, SportViewMode } from '../types/sport'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function buildBreakdown(entries: SportEntry[]): Record<string, SportCategoryBreakdown> {
  const breakdown: Record<string, { duration: number; calories: number; count: number }> = {}
  let totalDuration = 0
  for (const entry of entries) {
    totalDuration += entry.duration
    const existing = breakdown[entry.sportType]
    if (existing) {
      existing.duration += entry.duration
      existing.calories += entry.calories
      existing.count += 1
    } else {
      breakdown[entry.sportType] = { duration: entry.duration, calories: entry.calories, count: 1 }
    }
  }
  const result: Record<string, SportCategoryBreakdown> = {}
  for (const [key, cat] of Object.entries(breakdown)) {
    result[key] = {
      duration: round2(cat.duration),
      calories: round2(cat.calories),
      count: cat.count,
      percentage: totalDuration > 0 ? Math.round((cat.duration / totalDuration) * 100) : 0,
    }
  }
  return result
}

function computeSummaryFromEntries(entries: SportEntry[]) {
  const totalDuration = round2(entries.reduce((sum, e) => sum + e.duration, 0))
  const totalCalories = round2(entries.reduce((sum, e) => sum + e.calories, 0))
  const entryCount = entries.length
  return {
    totalDuration,
    totalCalories,
    entryCount,
    averageDurationPerEntry: entryCount > 0 ? round2(totalDuration / entryCount) : 0,
    categoryBreakdown: buildBreakdown(entries),
  }
}

function buildDailyBreakdown(filteredEntries: SportEntry[], days: Date[]): SportDailyDataPoint[] {
  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayEntries = filteredEntries.filter(e => e.date === dateStr)
    const duration = round2(dayEntries.reduce((sum, e) => sum + e.duration, 0))
    const calories = round2(dayEntries.reduce((sum, e) => sum + e.calories, 0))
    return { date: dateStr, label: '', duration, calories }
  })
}

export function computeSportWeekSummary(allEntries: SportEntry[], dateInWeek: string): SportPeriodSummary {
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

export function computeSportMonthSummary(allEntries: SportEntry[], dateInMonth: string): SportPeriodSummary {
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

export function computeSportYearSummary(allEntries: SportEntry[], dateInYear: string): SportPeriodSummary {
  const anchor = parseISO(dateInYear)
  const start = startOfYear(anchor)
  const end = endOfYear(anchor)
  const startStr = format(start, 'yyyy-MM-dd')
  const endStr = format(end, 'yyyy-MM-dd')

  const filtered = allEntries.filter(e => e.date >= startStr && e.date <= endStr)
  const summary = computeSummaryFromEntries(filtered)

  const monthLabels = i18n.t('date.monthLabels', { returnObjects: true }) as string[]
  const dailyBreakdown: SportDailyDataPoint[] = eachMonthOfInterval({ start, end }).map(monthStart => {
    const mStartStr = format(monthStart, 'yyyy-MM-dd')
    const mEndStr = format(endOfMonth(monthStart), 'yyyy-MM-dd')
    const monthEntries = filtered.filter(e => e.date >= mStartStr && e.date <= mEndStr)
    const duration = round2(monthEntries.reduce((sum, e) => sum + e.duration, 0))
    const calories = round2(monthEntries.reduce((sum, e) => sum + e.calories, 0))
    return { date: mStartStr, label: monthLabels[monthStart.getMonth()], duration, calories }
  })

  return { ...summary, dailyBreakdown }
}

export function computeSportPeriodSummary(allEntries: SportEntry[], anchorDate: string, viewMode: SportViewMode): SportPeriodSummary {
  if (viewMode === 'week') return computeSportWeekSummary(allEntries, anchorDate)
  if (viewMode === 'month') return computeSportMonthSummary(allEntries, anchorDate)
  if (viewMode === 'year') return computeSportYearSummary(allEntries, anchorDate)

  const dayEntries = allEntries.filter(e => e.date === anchorDate)
  const summary = computeSummaryFromEntries(dayEntries)
  return {
    ...summary,
    dailyBreakdown: [{
      date: anchorDate,
      label: anchorDate,
      duration: summary.totalDuration,
      calories: summary.totalCalories,
    }],
  }
}
