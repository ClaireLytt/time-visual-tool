import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isToday, isSameWeek, isSameMonth, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { ViewMode } from '../../types'

interface DatePickerProps {
  selectedDate: string
  onDateChange: (date: string) => void
  viewMode: ViewMode
}

function DatePicker({ selectedDate, onDateChange, viewMode }: DatePickerProps) {
  const dateObj = parseISO(selectedDate)

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
      return `${format(start, 'M月d日', { locale: zhCN })} ~ ${format(end, 'M月d日', { locale: zhCN })}`
    }
    if (viewMode === 'month') {
      return format(dateObj, 'yyyy年M月', { locale: zhCN })
    }
    return format(dateObj, 'yyyy年M月d日 EEEE', { locale: zhCN })
  }

  const isCurrent = () => {
    if (viewMode === 'week') return isSameWeek(dateObj, new Date(), { weekStartsOn: 1 })
    if (viewMode === 'month') return isSameMonth(dateObj, new Date())
    return isToday(dateObj)
  }

  const navLabels = {
    day: { back: '前一天', forward: '后一天', today: '今天' },
    week: { back: '前一周', forward: '后一周', today: '本周' },
    month: { back: '前一月', forward: '后一月', today: '本月' },
  }

  const labels = navLabels[viewMode]

  return (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={goBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title={labels.back}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h2 className="text-lg font-semibold text-gray-800">
        {getLabel()}
      </h2>

      <button onClick={goForward} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title={labels.forward}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {!isCurrent() && (
        <button onClick={goToNow} className="ml-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
          {labels.today}
        </button>
      )}
    </div>
  )
}

export default DatePicker
