import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import type { Habit } from '../../types/habit'

interface HabitGridProps {
  habits: Habit[]
  isChecked: (habitId: string, date: string) => boolean
  anchorDate: string
}

export default function HabitGrid({ habits, isChecked, anchorDate }: HabitGridProps) {
  const days = useMemo(() => {
    const anchor = new Date(anchorDate)
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(anchor, 6 - i)
      return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE').charAt(0), day: format(d, 'd') }
    })
  }, [anchorDate])

  if (habits.length === 0) return null

  return (
    <div className="panel p-4 overflow-x-auto">
      <table className="w-full text-center text-xs">
        <thead>
          <tr>
            <th className="text-left pr-3 pb-2 text-gray-500 dark:text-gray-400 font-normal" />
            {days.map(d => (
              <th key={d.date} className="pb-2 text-gray-400 dark:text-gray-500 font-normal w-8">
                <div>{d.label}</div>
                <div className="text-[10px]">{d.day}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habits.map(habit => (
            <tr key={habit.id}>
              <td className="text-left pr-3 py-1.5 whitespace-nowrap">
                <span className="text-sm">{habit.icon} {habit.name}</span>
              </td>
              {days.map(d => {
                const done = isChecked(habit.id, d.date)
                return (
                  <td key={d.date} className="py-1.5">
                    <div
                      className={`w-6 h-6 mx-auto rounded-md flex items-center justify-center text-xs transition-colors ${
                        done ? 'text-white' : 'bg-gray-100 dark:bg-gray-700/40 text-gray-300 dark:text-gray-600'
                      }`}
                      style={done ? { backgroundColor: habit.color } : undefined}
                    >
                      {done ? '✓' : '·'}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
