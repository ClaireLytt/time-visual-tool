import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns'
import type { SportEntry } from '../../types/sport'

const WEEKLY_GOAL = 3

interface SportWeeklyGoalProps {
  entries: SportEntry[]
  selectedDate: string
}

export default function SportWeeklyGoal({ entries, selectedDate }: SportWeeklyGoalProps) {
  const { t } = useTranslation()

  const weekCount = useMemo(() => {
    const anchor = parseISO(selectedDate)
    const weekStart = startOfWeek(anchor, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 })
    const startStr = format(weekStart, 'yyyy-MM-dd')
    const endStr = format(weekEnd, 'yyyy-MM-dd')
    return entries.filter(e => e.date >= startStr && e.date <= endStr).length
  }, [entries, selectedDate])

  const progress = Math.min(weekCount / WEEKLY_GOAL, 1)
  const isComplete = weekCount >= WEEKLY_GOAL

  return (
    <div className="panel p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400">
          {t('sport.weeklyGoal')}
        </span>
        <span className={`text-sm font-medium ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
          {isComplete
            ? t('sport.weeklyGoalComplete')
            : t('sport.weeklyGoalProgress', { done: weekCount, goal: WEEKLY_GOAL })}
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-green-500' : 'bg-mode-sport'
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}
