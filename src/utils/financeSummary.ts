import { parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, format, getDay } from 'date-fns'
import i18n from '../i18n'
import type { FinanceEntry, FinanceCategoryBreakdown, FinancePeriodSummary, FinanceDailyDataPoint, FinanceViewMode } from '../types/finance'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function buildBreakdown(entries: FinanceEntry[]): Record<string, FinanceCategoryBreakdown> {
  const breakdown: Record<string, FinanceCategoryBreakdown> = {}
  let total = 0
  for (const entry of entries) {
    total += entry.amount
    const existing = breakdown[entry.category]
    if (existing) {
      existing.amount = round2(existing.amount + entry.amount)
      existing.count += 1
    } else {
      breakdown[entry.category] = { amount: round2(entry.amount), percentage: 0, count: 1 }
    }
  }
  if (total > 0) {
    for (const cat of Object.values(breakdown)) {
      cat.percentage = Math.round((cat.amount / total) * 100)
    }
  }
  return breakdown
}

function computeSummaryFromEntries(entries: FinanceEntry[]) {
  const incomeEntries = entries.filter(e => e.type === 'income')
  const expenseEntries = entries.filter(e => e.type === 'expense')
  const income = round2(incomeEntries.reduce((sum, e) => sum + e.amount, 0))
  const expense = round2(expenseEntries.reduce((sum, e) => sum + e.amount, 0))
  return {
    income,
    expense,
    balance: round2(income - expense),
    entryCount: entries.length,
    incomeBreakdown: buildBreakdown(incomeEntries),
    expenseBreakdown: buildBreakdown(expenseEntries),
  }
}

function buildDailyBreakdown(filteredEntries: FinanceEntry[], days: Date[]): FinanceDailyDataPoint[] {
  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayEntries = filteredEntries.filter(e => e.date === dateStr)
    const income = round2(dayEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0))
    const expense = round2(dayEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0))
    return { date: dateStr, label: '', income, expense }
  })
}

export function computeFinanceWeekSummary(allEntries: FinanceEntry[], dateInWeek: string): FinancePeriodSummary {
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

export function computeFinanceMonthSummary(allEntries: FinanceEntry[], dateInMonth: string): FinancePeriodSummary {
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

export function computeFinanceYearSummary(allEntries: FinanceEntry[], dateInYear: string): FinancePeriodSummary {
  const anchor = parseISO(dateInYear)
  const start = startOfYear(anchor)
  const end = endOfYear(anchor)
  const startStr = format(start, 'yyyy-MM-dd')
  const endStr = format(end, 'yyyy-MM-dd')

  const filtered = allEntries.filter(e => e.date >= startStr && e.date <= endStr)
  const summary = computeSummaryFromEntries(filtered)

  const monthLabels = i18n.t('date.monthLabels', { returnObjects: true }) as string[]
  const dailyBreakdown: FinanceDailyDataPoint[] = eachMonthOfInterval({ start, end }).map(monthStart => {
    const mStartStr = format(monthStart, 'yyyy-MM-dd')
    const mEndStr = format(endOfMonth(monthStart), 'yyyy-MM-dd')
    const monthEntries = filtered.filter(e => e.date >= mStartStr && e.date <= mEndStr)
    const income = round2(monthEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0))
    const expense = round2(monthEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0))
    return { date: mStartStr, label: monthLabels[monthStart.getMonth()], income, expense }
  })

  return { ...summary, dailyBreakdown }
}

export function computeFinancePeriodSummary(allEntries: FinanceEntry[], anchorDate: string, viewMode: FinanceViewMode): FinancePeriodSummary {
  if (viewMode === 'week') return computeFinanceWeekSummary(allEntries, anchorDate)
  if (viewMode === 'month') return computeFinanceMonthSummary(allEntries, anchorDate)
  if (viewMode === 'year') return computeFinanceYearSummary(allEntries, anchorDate)

  const dayEntries = allEntries.filter(e => e.date === anchorDate)
  const summary = computeSummaryFromEntries(dayEntries)
  return {
    ...summary,
    dailyBreakdown: [{
      date: anchorDate,
      label: anchorDate,
      income: summary.income,
      expense: summary.expense,
    }],
  }
}
