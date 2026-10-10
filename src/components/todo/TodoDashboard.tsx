import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
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
  const { addItem, toggleItem, deleteItem, updateItem, getItemsForDate } = useTodoEntries()

  const dayItems = useMemo(() => getItemsForDate(selectedDate), [getItemsForDate, selectedDate])
  const doneCount = useMemo(() => dayItems.filter(t => t.done).length, [dayItems])


  return (
    <div id="main-content" className="space-y-4">
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
      </div>

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
        <TodoList items={dayItems} filter={filter} onToggle={toggleItem} onDelete={deleteItem} onUpdate={updateItem} />
      </div>
    </div>
  )
}
