import { parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } from 'date-fns'
import i18n from '../i18n'
import type { TimeEntry, DaySummary, CategoryBreakdown, ViewMode, PeriodSummary, DailyDataPoint } from '../types'

function computeSummaryFromEntries(entries: TimeEntry[]) {
  const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0)
  const weightedMinutes = entries.reduce((sum, e) => sum + e.duration * e.weight, 0)

  const categoryBreakdown: Record<string, CategoryBreakdown> = {}
  for (const entry of entries) {
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

  return { totalMinutes, weightedMinutes, categoryBreakdown, entryCount: entries.length }
}

export function computeDaySummary(entries: TimeEntry[], date: string): DaySummary {
  const dayEntries = entries.filter(e => e.date === date)
  const { totalMinutes, weightedMinutes, categoryBreakdown } = computeSummaryFromEntries(dayEntries)
  return { date, totalMinutes, weightedMinutes, entries: dayEntries, categoryBreakdown }
}

function buildDailyBreakdown(filteredEntries: TimeEntry[], days: Date[]): DailyDataPoint[] {
  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayEntries = filteredEntries.filter(e => e.date === dateStr)
    const totalMinutes = dayEntries.reduce((sum, e) => sum + e.duration, 0)
    const weightedMinutes = dayEntries.reduce((sum, e) => sum + e.duration * e.weight, 0)
    return { date: dateStr, label: '', totalMinutes, weightedMinutes }
  })
}

export function computeWeekSummary(allEntries: TimeEntry[], dateInWeek: string): PeriodSummary {
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

export function computeMonthSummary(allEntries: TimeEntry[], dateInMonth: string): PeriodSummary {
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

export function computePeriodSummary(allEntries: TimeEntry[], anchorDate: string, viewMode: ViewMode): PeriodSummary {
  if (viewMode === 'week') return computeWeekSummary(allEntries, anchorDate)
  if (viewMode === 'month') return computeMonthSummary(allEntries, anchorDate)

  const daySummary = computeDaySummary(allEntries, anchorDate)
  return {
    totalMinutes: daySummary.totalMinutes,
    weightedMinutes: daySummary.weightedMinutes,
    entryCount: daySummary.entries.length,
    categoryBreakdown: daySummary.categoryBreakdown,
    dailyBreakdown: [{
      date: anchorDate,
      label: anchorDate,
      totalMinutes: daySummary.totalMinutes,
      weightedMinutes: daySummary.weightedMinutes,
    }],
  }
}
