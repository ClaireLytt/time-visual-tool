import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns'
import { formatDuration } from '../../utils/time'
import type { SportEntry } from '../../types/sport'

interface SportWeeklyGoalProps {
  entries: SportEntry[]
  selectedDate: string
  weeklyGoal: number
  onWeeklyGoalChange: (goal: number) => void
}

export default function SportWeeklyGoal({ entries, selectedDate, weeklyGoal, onWeeklyGoalChange }: SportWeeklyGoalProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)

  const { weekCount, weekDuration, weekCalories } = useMemo(() => {
    const anchor = parseISO(selectedDate)
    const weekStart = startOfWeek(anchor, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 })
    const startStr = format(weekStart, 'yyyy-MM-dd')
    const endStr = format(weekEnd, 'yyyy-MM-dd')
    const weekEntries = entries.filter(e => e.date >= startStr && e.date <= endStr)
    return {
      weekCount: weekEntries.length,
      weekDuration: weekEntries.reduce((sum, e) => sum + e.duration, 0),
      weekCalories: Math.round(weekEntries.reduce((sum, e) => sum + e.calories, 0)),
    }
  }, [entries, selectedDate])

  const progress = Math.min(weekCount / weeklyGoal, 1)
  const isComplete = weekCount >= weeklyGoal

  return (
    <div className="panel p-4 mb-4">
      {/* Session count goal */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400">
          {t('sport.weeklyGoal')}
        </span>
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onWeeklyGoalChange(weeklyGoal - 1); }}
                disabled={weeklyGoal <= 1}
                className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors"
                aria-label={t('sport.decreaseGoal')}
              >
                −
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-5 text-center tabular-nums">
                {weeklyGoal}
              </span>
              <button
                onClick={() => { onWeeklyGoalChange(weeklyGoal + 1); }}
                disabled={weeklyGoal >= 14}
                className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors"
                aria-label={t('sport.increaseGoal')}
              >
                +
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs text-mode-sport ml-1"
              >
                ✓
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className={`text-sm font-medium ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'} hover:underline`}
            >
              {isComplete
                ? t('sport.weeklyGoalComplete')
                : t('sport.weeklyGoalProgress', { done: weekCount, goal: weeklyGoal })}
            </button>
          )}
        </div>
      </div>
      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-green-500' : 'bg-mode-sport'
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Weekly stats summary */}
      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span>⏱ {formatDuration(weekDuration)}</span>
        {weekCalories > 0 && <span>🔥 {weekCalories.toLocaleString()} {t('sport.calorieUnit')}</span>}
      </div>
    </div>
  )
}
