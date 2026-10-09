import { parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, format, getDay } from 'date-fns'
import i18n from '../i18n'

export interface DateRange {
  start: Date
  end: Date
  startStr: string
  endStr: string
}

export interface LabeledDate {
  date: string
  label: string
}

/** Monday-start week range for the given anchor date string */
export function getWeekRange(anchor: string): DateRange {
  const d = parseISO(anchor)
  const start = startOfWeek(d, { weekStartsOn: 1 })
  const end = endOfWeek(d, { weekStartsOn: 1 })
  return { start, end, startStr: format(start, 'yyyy-MM-dd'), endStr: format(end, 'yyyy-MM-dd') }
}

/** Calendar month range for the given anchor date string */
export function getMonthRange(anchor: string): DateRange {
  const d = parseISO(anchor)
  const start = startOfMonth(d)
  const end = endOfMonth(d)
  return { start, end, startStr: format(start, 'yyyy-MM-dd'), endStr: format(end, 'yyyy-MM-dd') }
}

/** Calendar year range for the given anchor date string */
export function getYearRange(anchor: string): DateRange {
  const d = parseISO(anchor)
  const start = startOfYear(d)
  const end = endOfYear(d)
  return { start, end, startStr: format(start, 'yyyy-MM-dd'), endStr: format(end, 'yyyy-MM-dd') }
}

/** Each day in a range with a weekday label (from i18n) */
export function getWeekDays(range: DateRange): LabeledDate[] {
  const dayLabels = i18n.t('date.dayLabels', { returnObjects: true }) as string[]
  return eachDayOfInterval({ start: range.start, end: range.end }).map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return { date: dateStr, label: dayLabels[getDay(day)] }
  })
}

/** Each day in a month with a day-number label */
export function getMonthDays(range: DateRange): LabeledDate[] {
  return eachDayOfInterval({ start: range.start, end: range.end }).map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return { date: dateStr, label: i18n.t('date.daySuffix', { day: day.getDate() }) }
  })
}

/** Each month in a year with a month label */
export function getYearMonths(range: DateRange): { date: string; endDate: string; label: string }[] {
  const monthLabels = i18n.t('date.monthLabels', { returnObjects: true }) as string[]
  return eachMonthOfInterval({ start: range.start, end: range.end }).map(monthStart => ({
    date: format(monthStart, 'yyyy-MM-dd'),
    endDate: format(endOfMonth(monthStart), 'yyyy-MM-dd'),
    label: monthLabels[monthStart.getMonth()],
  }))
}

/** Filter entries by date range string comparison */
export function filterByRange<T extends { date: string }>(entries: T[], range: DateRange): T[] {
  return entries.filter(e => e.date >= range.startStr && e.date <= range.endStr)
}
