import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, parseISO, differenceInCalendarDays, subDays } from 'date-fns'
import type { SportEntry } from '../../types/sport'

interface SportStreaksProps {
  entries: SportEntry[]
  selectedDate: string
}

export default function SportStreaks({ entries, selectedDate }: SportStreaksProps) {
  const { t } = useTranslation()

  const { currentStreak, longestStreak, thisMonthDays } = useMemo(() => {
    // Get unique workout dates
    const dateSet = new Set(entries.map(e => e.date))
    const sortedDates = [...dateSet].sort().reverse() // newest first

    // Current streak: consecutive days ending at today or yesterday
    const today = format(parseISO(selectedDate), 'yyyy-MM-dd')
    let current = 0
    let checkDate = today
    // If today has no workout, start from yesterday
    if (!dateSet.has(today)) {
      checkDate = format(subDays(parseISO(today), 1), 'yyyy-MM-dd')
      if (!dateSet.has(checkDate)) {
        // No streak
        current = 0
      }
    }
    if (current === 0 && dateSet.has(checkDate)) {
      current = 1
      let d = parseISO(checkDate)
      while (true) {
        d = subDays(d, 1)
        const ds = format(d, 'yyyy-MM-dd')
        if (dateSet.has(ds)) {
          current++
        } else {
          break
        }
      }
    }

    // Longest streak ever
    let longest = 0
    if (sortedDates.length > 0) {
      const ascending = [...sortedDates].reverse()
      let streak = 1
      for (let i = 1; i < ascending.length; i++) {
        const diff = differenceInCalendarDays(parseISO(ascending[i]), parseISO(ascending[i - 1]))
        if (diff === 1) {
          streak++
        } else {
          longest = Math.max(longest, streak)
          streak = 1
        }
      }
      longest = Math.max(longest, streak)
    }

    // This month active days
    const monthPrefix = selectedDate.slice(0, 7) // yyyy-MM
    const monthDays = [...dateSet].filter(d => d.startsWith(monthPrefix)).length

    return { currentStreak: current, longestStreak: longest, thisMonthDays: monthDays }
  }, [entries, selectedDate])

  const stats = [
    { label: t('sport.currentStreak'), value: currentStreak, emoji: '🔥' },
    { label: t('sport.longestStreak'), value: longestStreak, emoji: '👑' },
    { label: t('sport.monthActiveDays'), value: thisMonthDays, emoji: '📅' },
  ]

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {stats.map(stat => (
        <div key={stat.label} className="panel p-3 text-center flex-1 min-w-[100px]">
          <p className="text-lg mb-0.5">{stat.emoji}</p>
          <p className="text-xl font-bold tabular-nums text-gray-800 dark:text-gray-100">
            {stat.value} {t('sport.dayUnit')}
          </p>
          <p className="text-xs tracking-wide text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
