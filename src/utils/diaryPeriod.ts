import { format, parse, parseISO, startOfISOWeek } from 'date-fns'
import type { DiaryPeriodType } from '../types/diary'

export function getPeriodKey(anchorDate: string, periodType: DiaryPeriodType): string {
  const date = parseISO(anchorDate)
  switch (periodType) {
    case 'day':
      return format(date, 'yyyy-MM-dd')
    case 'week':
      return format(date, "RRRR-'W'II")
    case 'month':
      return format(date, 'yyyy-MM')
    case 'year':
      return format(date, 'yyyy')
  }
}

export function periodKeyToAnchorDate(periodType: DiaryPeriodType, periodKey: string): string {
  switch (periodType) {
    case 'day':
      return periodKey
    case 'week': {
      const parsed = parse(periodKey, "RRRR-'W'II", new Date())
      return format(startOfISOWeek(parsed), 'yyyy-MM-dd')
    }
    case 'month':
      return `${periodKey}-01`
    case 'year':
      return `${periodKey}-01-01`
  }
}

const PERIOD_KEY_PATTERNS: Record<DiaryPeriodType, RegExp> = {
  day: /^\d{4}-\d{2}-\d{2}$/,
  week: /^\d{4}-W\d{2}$/,
  month: /^\d{4}-\d{2}$/,
  year: /^\d{4}$/,
}

export function isValidPeriodKey(periodType: DiaryPeriodType, periodKey: string): boolean {
  return PERIOD_KEY_PATTERNS[periodType].test(periodKey)
}
