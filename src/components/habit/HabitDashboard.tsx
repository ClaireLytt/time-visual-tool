import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays } from 'date-fns'
import { useHabitEntries } from '../../hooks/useHabitEntries'
import DatePicker from '../dashboard/DatePicker'
import HabitItem from './HabitItem'
import HabitGrid from './HabitGrid'
import HabitForm from './HabitForm'
import CollapsibleForm from '../common/CollapsibleForm'

export default function HabitDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const {
    habits, loading,
    addHabit, deleteHabit, toggleCheck, isChecked, getCheckedDatesForHabit, getCheckedCountForDate,
  } = useHabitEntries()

  const checkedCount = useMemo(() => getCheckedCountForDate(selectedDate), [getCheckedCountForDate, selectedDate])
  const totalCount = habits.length

  const { weekChecks, weekTotal, monthChecks, monthTotal } = useMemo(() => {
    if (habits.length === 0) return { weekChecks: 0, weekTotal: 0, monthChecks: 0, monthTotal: 0 }
    const today = new Date(selectedDate)
    let wc = 0, mc = 0
    for (let i = 0; i < 30; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd')
      const cnt = getCheckedCountForDate(d)
      mc += cnt
      if (i < 7) wc += cnt
    }
    return { weekChecks: wc, weekTotal: 7 * habits.length, monthChecks: mc, monthTotal: 30 * habits.length }
  }, [selectedDate, habits.length, getCheckedCountForDate])


  return (
    <div id="main-content" className="space-y-4">
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} viewMode="day" />

      {/* Summary */}
      <div className="panel p-4">
        <p className="font-pixel text-[8px] text-[#e8a838] mb-2">🏰 CASTLE</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums tracking-display text-gray-900 dark:text-gray-100">
            {checkedCount}/{totalCount}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('habit.completed')}</span>
        </div>
        {totalCount > 0 && (
          <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / totalCount) * 100}%`, backgroundColor: '#e8a838' }}
            />
          </div>
        )}
      </div>

      {/* Habit list */}
      <div className="panel p-4">
        {habits.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">{t('habit.emptyTitle')}</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {habits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                checked={isChecked(habit.id, selectedDate)}
                streakDates={getCheckedDatesForHabit(habit.id)}
                onToggle={() => toggleCheck(habit.id, selectedDate)}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* 7-day grid */}
      <HabitGrid habits={habits} isChecked={isChecked} anchorDate={selectedDate} />

      {/* Completion rate stats */}
      {habits.length > 0 && (
        <div className="panel p-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('habit.weekRate')}</p>
            <p className="text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {weekChecks}/{weekTotal} <span className="text-sm font-normal text-gray-400">({weekTotal > 0 ? Math.round((weekChecks / weekTotal) * 100) : 0}%)</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('habit.monthRate')}</p>
            <p className="text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {monthChecks}/{monthTotal} <span className="text-sm font-normal text-gray-400">({monthTotal > 0 ? Math.round((monthChecks / monthTotal) * 100) : 0}%)</span>
            </p>
          </div>
        </div>
      )}

      {/* Add form */}
      <CollapsibleForm accentColor="#e8a838" addLabel={t('habit.addButton')}>
        <HabitForm onAdd={addHabit} />
      </CollapsibleForm>
    </div>
  )
}
