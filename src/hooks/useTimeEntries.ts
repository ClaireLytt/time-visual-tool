import { useCallback } from 'react'
import { useFirestore } from './useFirestore'
import { DEFAULT_CATEGORY_LIST } from '../constants'
import { computePeriodSummary } from '../utils/summary'
import { isValidEntry, isValidCategory } from '../utils/dataTransfer'
import type { TimeEntry, Category, StorageData, ViewMode, PeriodSummary } from '../types'

function validateStorageData(raw: unknown): StorageData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.entries)) return null
  const entries = obj.entries.filter(isValidEntry)
  const categories = Array.isArray(obj.categories)
    ? obj.categories.filter(isValidCategory)
    : DEFAULT_CATEGORY_LIST
  return {
    version: 2,
    entries,
    categories: categories.length > 0 ? categories : DEFAULT_CATEGORY_LIST,
  }
}

const INITIAL_DATA: StorageData = {
  version: 2,
  entries: [],
  categories: DEFAULT_CATEGORY_LIST,
}

export function useTimeEntries() {
  const { data, setData, loading } = useFirestore<StorageData>('timeData', INITIAL_DATA, validateStorageData)

  const entries = data.entries
  const categories = data.categories ?? DEFAULT_CATEGORY_LIST

  const addEntry = useCallback((entry: Omit<TimeEntry, 'id' | 'createdAt'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setData(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry],
    }))
  }, [setData])

  const deleteEntry = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== id),
    }))
  }, [setData])

  const updateEntry = useCallback((id: string, updates: Partial<TimeEntry>) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, ...updates } : e),
    }))
  }, [setData])

  const addCategory = useCallback((category: Category) => {
    setData(prev => {
      if (prev.categories.some(c => c.name === category.name)) return prev
      return { ...prev, categories: [...prev.categories, category] }
    })
  }, [setData])

  const updateCategory = useCallback((oldName: string, updated: Category) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.name === oldName ? updated : c),
      entries: oldName !== updated.name
        ? prev.entries.map(e => e.category === oldName ? { ...e, category: updated.name } : e)
        : prev.entries,
    }))
  }, [setData])

  const deleteCategory = useCallback((name: string) => {
    setData(prev => {
      if (prev.entries.some(e => e.category === name)) return prev
      return { ...prev, categories: prev.categories.filter(c => c.name !== name) }
    })
  }, [setData])

  const importData = useCallback((imported: StorageData, mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setData(imported)
    } else {
      setData(prev => {
        const existingIds = new Set(prev.entries.map(e => e.id))
        const newEntries = imported.entries.filter(e => !existingIds.has(e.id))
        const existingNames = new Set(prev.categories.map(c => c.name))
        const newCategories = imported.categories.filter(c => !existingNames.has(c.name))
        return {
          version: 2,
          entries: [...prev.entries, ...newEntries],
          categories: [...prev.categories, ...newCategories],
        }
      })
    }
  }, [setData])

  const getEntriesForDate = useCallback((date: string) => {
    return entries.filter(e => e.date === date)
  }, [entries])

  const getSummaryForPeriod = useCallback((anchorDate: string, viewMode: ViewMode): PeriodSummary => {
    return computePeriodSummary(entries, anchorDate, viewMode)
  }, [entries])

  return {
    entries, categories, data, loading,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory,
    importData,
    getEntriesForDate, getSummaryForPeriod,
  }
}
