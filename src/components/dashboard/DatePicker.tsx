import { format, addDays, subDays, isToday, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DatePickerProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const dateObj = parseISO(selectedDate)

  const goBack = () => {
    onDateChange(format(subDays(dateObj, 1), 'yyyy-MM-dd'))
  }

  const goForward = () => {
    onDateChange(format(addDays(dateObj, 1), 'yyyy-MM-dd'))
  }

  const goToday = () => {
    onDateChange(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={goBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="前一天">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h2 className="text-lg font-semibold text-gray-800">
        {format(dateObj, 'yyyy年M月d日 EEEE', { locale: zhCN })}
      </h2>

      <button onClick={goForward} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="后一天">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {!isToday(dateObj) && (
        <button onClick={goToday} className="ml-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
          今天
        </button>
      )}
    </div>
  )
}

export default DatePicker
