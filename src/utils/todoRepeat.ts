import type { TodoItem } from '../types/todo'

/** Whether a (possibly recurring) item occurs on the given date */
export function todoOccursOn(item: TodoItem, date: string): boolean {
  const repeat = item.repeat
  if (!repeat || repeat.type === 'none') return item.date === date
  if (date < item.date) return false
  if (repeat.until && date > repeat.until) return false
  if (item.skippedDates?.includes(date)) return false
  switch (repeat.type) {
    case 'daily':
      return true
    case 'weekly': {
      const weekday = new Date(date + 'T00:00:00').getDay()
      const weekdays = repeat.weekdays && repeat.weekdays.length > 0
        ? repeat.weekdays
        : [new Date(item.date + 'T00:00:00').getDay()]
      return weekdays.includes(weekday)
    }
    case 'monthly': {
      const anchorDay = Number(item.date.slice(8, 10))
      const day = Number(date.slice(8, 10))
      if (day === anchorDay) return true
      // anchor day doesn't exist in this month (29-31) -> occur on its last day
      const d = new Date(date + 'T00:00:00')
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      return anchorDay > lastDay && day === lastDay
    }
    case 'custom': {
      const interval = Math.max(1, Math.floor(repeat.interval ?? 1))
      const start = new Date(item.date + 'T00:00:00').getTime()
      const cur = new Date(date + 'T00:00:00').getTime()
      const diffDays = Math.round((cur - start) / 86400000)
      return diffDays % interval === 0
    }
  }
}
