import { useTranslation } from 'react-i18next'
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isToday, isSameWeek, isSameMonth, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import type { ViewMode } from '../../types'

interface DatePickerProps {
  selectedDate: string
  onDateChange: (date: string) => void
  viewMode: ViewMode
}

function DatePicker({ selectedDate, onDateChange, viewMode }: DatePickerProps) {
  const { t, i18n } = useTranslation()
  const dateObj = parseISO(selectedDate)
  const locale = i18n.language === 'zh' ? zhCN : enUS

  const goBack = () => {
    let newDate: Date
    if (viewMode === 'week') newDate = subWeeks(dateObj, 1)
    else if (viewMode === 'month') newDate = subMonths(dateObj, 1)
    else newDate = subDays(dateObj, 1)
    onDateChange(format(newDate, 'yyyy-MM-dd'))
  }

  const goForward = () => {
    let newDate: Date
    if (viewMode === 'week') newDate = addWeeks(dateObj, 1)
    else if (viewMode === 'month') newDate = addMonths(dateObj, 1)
    else newDate = addDays(dateObj, 1)
    onDateChange(format(newDate, 'yyyy-MM-dd'))
  }

  const goToNow = () => {
    onDateChange(format(new Date(), 'yyyy-MM-dd'))
  }

  const getLabel = () => {
    if (viewMode === 'week') {
      const start = startOfWeek(dateObj, { weekStartsOn: 1 })
      const end = endOfWeek(dateObj, { weekStartsOn: 1 })
      const fmt = t('date.weekRangeFormat')
      const sep = t('date.weekRangeSeparator')
      return `${format(start, fmt, { locale })}${sep}${format(end, fmt, { locale })}`
    }
    if (viewMode === 'month') {
      return format(dateObj, t('date.monthFormat'), { locale })
    }
    return format(dateObj, t('date.dayFormat'), { locale })
  }

  const isCurrent = () => {
    if (viewMode === 'week') return isSameWeek(dateObj, new Date(), { weekStartsOn: 1 })
    if (viewMode === 'month') return isSameMonth(dateObj, new Date())
    return isToday(dateObj)
  }

  const navLabels = {
    day: { back: t('nav.prevDay'), forward: t('nav.nextDay'), today: t('nav.today') },
    week: { back: t('nav.prevWeek'), forward: t('nav.nextWeek'), today: t('nav.thisWeek') },
    month: { back: t('nav.prevMonth'), forward: t('nav.nextMonth'), today: t('nav.thisMonth') },
  }

  const labels = navLabels[viewMode]

  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-6">
      <button
        onClick={goBack}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        aria-label={labels.back}
        title={labels.back}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
        {getLabel()}
      </h2>

      <button
        onClick={goForward}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        aria-label={labels.forward}
        title={labels.forward}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {!isCurrent() && (
        <button
          onClick={goToNow}
          className="ml-2 px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
        >
          {labels.today}
        </button>
      )}
    </div>
  )
}

export default DatePicker
