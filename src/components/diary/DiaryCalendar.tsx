import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, addMonths, isSameMonth } from 'date-fns'

interface DiaryCalendarProps {
  selectedDate: string
  /** yyyy-MM-dd dates that have a day entry */
  entryDates: Set<string>
  /** click on a day — opens the day's entry popup */
  onPickDate: (date: string) => void
}

/** Minimal month calendar: thin lines, soft dots on days with entries */
function DiaryCalendar({ selectedDate, entryDates, onPickDate }: DiaryCalendarProps) {
  const { t } = useTranslation()
  const [monthAnchor, setMonthAnchor] = useState(() => format(new Date(), 'yyyy-MM-01'))
  const today = format(new Date(), 'yyyy-MM-dd')

  const weeks = useMemo(() => {
    const first = startOfMonth(new Date(monthAnchor + 'T00:00:00'))
    const last = endOfMonth(first)
    const cursor0 = startOfWeek(first, { weekStartsOn: 1 })
    const out: string[][] = []
    let cursor = cursor0
    while (cursor <= last) {
      const week: string[] = []
      for (let i = 0; i < 7; i++) {
        week.push(format(cursor, 'yyyy-MM-dd'))
        cursor = addDays(cursor, 1)
      }
      out.push(week)
    }
    return { first, rows: out }
  }, [monthAnchor])

  const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

  return (
    <div className="panel p-4">
      {/* month switcher */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMonthAnchor(format(addMonths(new Date(monthAnchor + 'T00:00:00'), -1), 'yyyy-MM-01'))}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors no-press"
          aria-label={t('diary.prevMonth')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 tabular-nums">
          {format(weeks.first, 'yyyy / MM')}
        </span>
        <button
          onClick={() => setMonthAnchor(format(addMonths(new Date(monthAnchor + 'T00:00:00'), 1), 'yyyy-MM-01'))}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors no-press"
          aria-label={t('diary.nextMonth')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>

      {/* weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_ORDER.map(d => (
          <span key={d} className="text-center text-xs text-gray-500 dark:text-gray-400">
            {t(`todo.weekday.${d}`)}
          </span>
        ))}
      </div>

      {/* day grid */}
      <div className="space-y-0.5">
        {weeks.rows.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map(d => {
              const inMonth = isSameMonth(new Date(d + 'T00:00:00'), weeks.first)
              const hasEntry = entryDates.has(d)
              const isSelected = d === selectedDate
              const isToday = d === today
              return (
                <button
                  key={d}
                  onClick={() => onPickDate(d)}
                  className={`relative mx-auto w-9 h-9 rounded-full text-[13px] tabular-nums transition-colors no-press flex items-center justify-center
                    ${!inMonth ? 'text-gray-300 dark:text-gray-600' : isSelected ? 'bg-mode-diary text-white font-semibold' : isToday ? 'text-mode-diary font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  aria-label={d}
                >
                  {Number(d.slice(8, 10))}
                  {hasEntry && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-mode-diary" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">{t('diary.calendarHint')}</p>
    </div>
  )
}

export default DiaryCalendar
