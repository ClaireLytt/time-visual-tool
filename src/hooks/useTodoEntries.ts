import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFirestore } from './useFirestore'
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from '../constants/todo'
import type { TodoCategory, TodoItem, TodoStorageData } from '../types/todo'

function validate(raw: unknown): TodoStorageData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.items)) return null
  return {
    version: 1,
    items: obj.items as TodoItem[],
    categories: Array.isArray(obj.categories) ? obj.categories as TodoCategory[] : [],
  }
}

const INITIAL: TodoStorageData = { version: 1, items: [], categories: [] }

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
    case 'monthly':
      return date.slice(8, 10) === item.date.slice(8, 10)
    case 'custom': {
      const interval = Math.max(1, Math.floor(repeat.interval ?? 1))
      const start = new Date(item.date + 'T00:00:00').getTime()
      const cur = new Date(date + 'T00:00:00').getTime()
      const diffDays = Math.round((cur - start) / 86400000)
      return diffDays % interval === 0
    }
  }
}

function isRecurring(item: TodoItem): boolean {
  return !!item.repeat && item.repeat.type !== 'none'
}

export function useTodoEntries() {
  const { t } = useTranslation()
  const { data, setData, loading } = useFirestore<TodoStorageData>('todoData', INITIAL, validate)

  // Built-in categories (localized names) + user-defined ones
  const categories: TodoCategory[] = [
    ...DEFAULT_CATEGORIES.map(c => ({ ...c, name: t(`todo.category.${c.id}`) })),
    ...(data.categories ?? []),
  ]

  const addCategory = useCallback((name: string) => {
    setData(prev => {
      const custom = prev.categories ?? []
      const color = CATEGORY_COLORS[custom.length % CATEGORY_COLORS.length]
      return { ...prev, categories: [...custom, { id: crypto.randomUUID(), name, color }] }
    })
  }, [setData])

  /** Delete a custom category; its items fall back to uncategorized */
  const deleteCategory = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      categories: (prev.categories ?? []).filter(c => c.id !== id),
      items: prev.items.map(it => it.categoryId === id ? { ...it, categoryId: undefined } : it),
    }))
  }, [setData])

  const addItem = useCallback((item: TodoItem) => {
    setData(prev => ({ ...prev, items: [...prev.items, item] }))
  }, [setData])

  /**
   * Toggle an item's completion. For recurring items `date` decides which
   * occurrence is toggled; for one-off items it is ignored.
   */
  const toggleItem = useCallback((id: string, date?: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(t => {
        if (t.id !== id) return t
        if (isRecurring(t) && date) {
          const dates = t.completedDates ?? []
          const completedDates = dates.includes(date)
            ? dates.filter(d => d !== date)
            : [...dates, date]
          return { ...t, completedDates }
        }
        return { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined }
      }),
    }))
  }, [setData])

  /** Remove a single occurrence of a recurring item */
  const skipOccurrence = useCallback((id: string, date: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(t =>
        t.id === id
          ? { ...t, skippedDates: [...(t.skippedDates ?? []), date] }
          : t
      ),
    }))
  }, [setData])

  const deleteItem = useCallback((id: string) => {
    setData(prev => ({ ...prev, items: prev.items.filter(t => t.id !== id) }))
  }, [setData])

  const updateItem = useCallback((id: string, updates: Partial<TodoItem>) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(t => t.id === id ? { ...t, ...updates } : t),
    }))
  }, [setData])

  /**
   * Items visible on a date: one-off items on their date, plus every
   * recurring item that occurs on it. A recurring item's `done` reflects
   * that date's completion.
   */
  const getItemsForDate = useCallback((date: string) => {
    return data.items
      .filter(t => todoOccursOn(t, date))
      .map(t => isRecurring(t) ? { ...t, done: (t.completedDates ?? []).includes(date) } : t)
  }, [data.items])

  return {
    items: data.items,
    categories,
    addCategory,
    deleteCategory,
    loading,
    addItem,
    toggleItem,
    skipOccurrence,
    deleteItem,
    updateItem,
    getItemsForDate,
  }
}
