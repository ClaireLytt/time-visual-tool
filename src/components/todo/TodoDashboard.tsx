import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays } from 'date-fns'
import { useTodoEntries } from '../../hooks/useTodoEntries'
import DatePicker from '../dashboard/DatePicker'
import TodoForm from './TodoForm'
import CollapsibleForm from '../common/CollapsibleForm'
import TodoList from './TodoList'

type Filter = 'all' | 'active' | 'completed'

export default function TodoDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [filter, setFilter] = useState<Filter>('all')
  const { items, addItem, toggleItem, skipOccurrence, deleteItem, updateItem, getItemsForDate } = useTodoEntries()

  const handleToggle = useCallback((id: string) => toggleItem(id, selectedDate), [toggleItem, selectedDate])
  const handleSkip = useCallback((id: string) => skipOccurrence(id, selectedDate), [skipOccurrence, selectedDate])

  const dayItems = useMemo(() => getItemsForDate(selectedDate), [getItemsForDate, selectedDate])
  const doneCount = useMemo(() => dayItems.filter(t => t.done).length, [dayItems])

  // Overdue one-off tasks (only surfaced when viewing today)
  const today = format(new Date(), 'yyyy-MM-dd')
  const overdueItems = useMemo(() =>
    items.filter(t => (!t.repeat || t.repeat.type === 'none') && !t.done && t.date < today),
  [items, today])
  const moveOverdueToToday = useCallback(() => {
    overdueItems.forEach(t => updateItem(t.id, { date: today }))
  }, [overdueItems, updateItem, today])

  // Last-7-days completion stats
  const weekStats = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
      const dayList = getItemsForDate(d)
      return { date: d, done: dayList.filter(t => t.done).length, total: dayList.length }
    })
  }, [getItemsForDate])


  return (
    <div className="space-y-4">
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} viewMode="day" />

      {/* Summary */}
      <div className="panel p-4">
        <p className="font-pixel text-[8px] text-[#5b8def] mb-2">📋 QUEST LOG</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums tracking-display text-gray-900 dark:text-gray-100">
            {doneCount}/{dayItems.length}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('todo.completed')}</span>
        </div>
        {dayItems.length > 0 && (
          <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(doneCount / dayItems.length) * 100}%`, backgroundColor: '#5b8def' }}
            />
          </div>
        )}
        {/* 7-day completion mini chart */}
        <div className="mt-3 flex items-end gap-1.5" title={t('todo.weekStats')}>
          {weekStats.map(s => (
            <div key={s.date} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full h-8 flex items-end rounded bg-gray-100 dark:bg-gray-700/50 overflow-hidden">
                <div
                  className="w-full transition-all duration-300"
                  style={{
                    height: s.total > 0 ? `${(s.done / s.total) * 100}%` : '0%',
                    backgroundColor: '#5b8def',
                    opacity: s.date === selectedDate ? 1 : 0.55,
                  }}
                />
              </div>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 tabular-nums">
                {s.total > 0 ? `${s.done}/${s.total}` : '·'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue tasks banner */}
      {selectedDate === today && overdueItems.length > 0 && (
        <div className="panel p-3 flex items-center justify-between gap-2 border-l-4 border-orange-400">
          <span className="text-xs text-gray-600 dark:text-gray-300">
            ⚠ {t('todo.overdueCount', { count: overdueItems.length })}
          </span>
          <button
            onClick={moveOverdueToToday}
            className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
          >
            {t('todo.moveToToday')}
          </button>
        </div>
      )}

      {/* Add form */}
      <CollapsibleForm accentColor="#5b8def" addLabel={t('todo.addButton')}>
        <TodoForm selectedDate={selectedDate} onAdd={addItem} />
      </CollapsibleForm>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {(['all', 'active', 'completed'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === f
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t(`todo.filter.${f}`)}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="panel p-4">
        <TodoList items={dayItems} filter={filter} onToggle={handleToggle} onDelete={deleteItem} onUpdate={updateItem} onSkipOccurrence={handleSkip} />
      </div>
    </div>
  )
}
