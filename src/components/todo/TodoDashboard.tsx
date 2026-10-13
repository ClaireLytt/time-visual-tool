import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays } from 'date-fns'
import { useTodoEntries } from '../../hooks/useTodoEntries'
import { TODO_ACCENT } from '../../constants/todo'
import DatePicker from '../dashboard/DatePicker'
import TodoForm from './TodoForm'
import CollapsibleForm from '../common/CollapsibleForm'
import ConfirmDialog from '../common/ConfirmDialog'
import TodoList from './TodoList'

type Filter = 'all' | 'active' | 'completed'

export default function TodoDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [filter, setFilter] = useState<Filter>('all')
  const [showStats, setShowStats] = useState(false)
  const { items, categories, addCategory, deleteCategory, addItem, toggleItem, skipOccurrence, deleteItem, updateItem, getItemsForDate } = useTodoEntries()
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null)

  const handleAddCategory = () => {
    const name = newCategoryName.trim()
    if (!name) return
    addCategory(name)
    setNewCategoryName('')
    setAddingCategory(false)
  }

  const handleToggle = useCallback((id: string) => toggleItem(id, selectedDate), [toggleItem, selectedDate])
  const handleSkip = useCallback((id: string) => skipOccurrence(id, selectedDate), [skipOccurrence, selectedDate])

  const allDayItems = useMemo(() => getItemsForDate(selectedDate), [getItemsForDate, selectedDate])
  const dayItems = useMemo(
    () => categoryFilter === 'all' ? allDayItems : allDayItems.filter(t => t.categoryId === categoryFilter),
    [allDayItems, categoryFilter]
  )
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
    <div id="main-content" className="space-y-4">
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} viewMode="day" />

      {/* Category chips */}
      <div className="flex gap-1.5 flex-wrap items-center">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            categoryFilter === 'all' ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          {t('todo.categoryAll')}
        </button>
        {categories.map(c => {
          const isDefault = ['life', 'work', 'study'].includes(c.id)
          const active = categoryFilter === c.id
          return (
            <span key={c.id} className="inline-flex items-stretch">
              <button
                onClick={() => setCategoryFilter(active ? 'all' : c.id)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${isDefault || !active ? 'rounded-lg' : 'rounded-l-lg'} ${
                  active ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                style={active ? { backgroundColor: c.color } : undefined}
              >
                {c.name}
              </button>
              {!isDefault && active && (
                <button
                  onClick={() => setConfirmDeleteCat(c.id)}
                  className="px-2 rounded-r-lg text-white/80 hover:text-white text-xs"
                  style={{ backgroundColor: c.color }}
                  aria-label={t('todo.deleteCategoryTitle')}
                >
                  ✕
                </button>
              )}
            </span>
          )
        })}
        {addingCategory ? (
          <span className="inline-flex items-center gap-1.5">
            <input
              autoFocus
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') setAddingCategory(false) }}
              placeholder={t('todo.categoryNamePlaceholder')}
              maxLength={12}
              className="input-base w-28 text-xs py-1.5 px-2"
            />
            <button onClick={handleAddCategory} className="px-2.5 py-1.5 text-xs rounded-lg text-white" style={{ backgroundColor: TODO_ACCENT }}>
              {t('todo.addButton')}
            </button>
            <button onClick={() => { setAddingCategory(false); setNewCategoryName('') }} className="px-1.5 py-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              {t('confirm.cancel')}
            </button>
          </span>
        ) : (
          <button
            onClick={() => setAddingCategory(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-400 transition-colors"
          >
            + {t('todo.addCategory')}
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteCat !== null}
        title={t('todo.deleteCategoryTitle')}
        message={t('todo.deleteCategoryMessage')}
        confirmVariant="danger"
        onConfirm={() => {
          if (confirmDeleteCat) {
            deleteCategory(confirmDeleteCat)
            if (categoryFilter === confirmDeleteCat) setCategoryFilter('all')
          }
          setConfirmDeleteCat(null)
        }}
        onCancel={() => setConfirmDeleteCat(null)}
      />

      {/* Summary */}
      <div className="panel p-4">
        <p className="font-pixel text-[8px] mb-2" style={{ color: TODO_ACCENT }}>📋 QUEST LOG</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums tracking-display text-gray-900 dark:text-gray-100">
            {doneCount}/{dayItems.length}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('todo.completed')}</span>
        </div>
        {dayItems.length > 0 && (
          <div className="mt-2 hp-bar" role="progressbar" aria-valuenow={doneCount} aria-valuemax={dayItems.length}>
            <div style={{ width: `${(doneCount / dayItems.length) * 100}%`, '--hp-color': TODO_ACCENT } as React.CSSProperties} />
          </div>
        )}
        {/* 7-day completion mini chart (collapsed by default) */}
        <button
          onClick={() => setShowStats(s => !s)}
          className="mt-3 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors no-press"
          aria-expanded={showStats}
        >
          {t('todo.weekStats')} {showStats ? '▴' : '▾'}
        </button>
        {showStats && (
          <div className="mt-2 flex items-end gap-1.5">
            {weekStats.map(s => {
              const weekday = new Date(s.date + 'T00:00:00').getDay()
              const isToday = s.date === today
              return (
                <div key={s.date} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full h-8 flex items-end rounded bg-gray-100 dark:bg-gray-700/50 overflow-hidden">
                    <div
                      className="w-full transition-all duration-300"
                      style={{
                        height: s.total > 0 ? `${(s.done / s.total) * 100}%` : '0%',
                        backgroundColor: TODO_ACCENT,
                        opacity: isToday ? 1 : 0.55,
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 tabular-nums">
                    {s.total > 0 ? `${s.done}/${s.total}` : '·'}
                  </span>
                  <span className={`text-[9px] ${isToday ? 'font-semibold text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                    {t(`todo.weekday.${weekday}`)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Overdue tasks banner — neutral surface, warm color only on the signal */}
      {selectedDate === today && overdueItems.length > 0 && (
        <div className="panel p-3 flex items-center justify-between gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-300">
            <span className="text-orange-500">⚠ {overdueItems.length}</span> {t('todo.overdueLabel')}
          </span>
          <button
            onClick={moveOverdueToToday}
            className="shrink-0 px-3 py-2 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t('todo.moveToToday')}
          </button>
        </div>
      )}

      {/* Add form */}
      <CollapsibleForm accentColor={TODO_ACCENT} addLabel={t('todo.addButton')}>
        <TodoForm
          selectedDate={selectedDate}
          onAdd={addItem}
          categories={categories}
          defaultCategoryId={categoryFilter !== 'all' ? categoryFilter : 'life'}
        />
      </CollapsibleForm>

      {/* Filter tabs */}
      <div className="brutal-track flex gap-1 p-1">
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
        <TodoList items={dayItems} filter={filter} categories={categories} onToggle={handleToggle} onDelete={deleteItem} onUpdate={updateItem} onSkipOccurrence={handleSkip} />
      </div>
    </div>
  )
}
