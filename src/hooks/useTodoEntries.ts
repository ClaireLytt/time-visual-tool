import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFirestore } from './useFirestore'
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from '../constants/todo'
import { todoOccursOn } from '../utils/todoRepeat'

export { todoOccursOn }
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
        if (isRecurring(t)) {
          // recurring items are always toggled per-date; default to today
          const target = date ?? new Date().toISOString().slice(0, 10)
          const dates = t.completedDates ?? []
          const completedDates = dates.includes(target)
            ? dates.filter(d => d !== target)
            : [...dates, target]
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
    customCategories: data.categories ?? [],
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
