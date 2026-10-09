import { useCallback } from 'react'
import { useFirestore } from './useFirestore'
import type { TodoItem, TodoStorageData } from '../types/todo'

function validate(raw: unknown): TodoStorageData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.items)) return null
  return { version: 1, items: obj.items as TodoItem[] }
}

const INITIAL: TodoStorageData = { version: 1, items: [] }

export function useTodoEntries() {
  const { data, setData, loading } = useFirestore<TodoStorageData>('todoData', INITIAL, validate)

  const addItem = useCallback((item: TodoItem) => {
    setData(prev => ({ ...prev, items: [...prev.items, item] }))
  }, [setData])

  const toggleItem = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(t =>
        t.id === id
          ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined }
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

  const getItemsForDate = useCallback((date: string) => {
    return data.items.filter(t => t.date === date)
  }, [data.items])

  return {
    items: data.items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    updateItem,
    getItemsForDate,
  }
}
