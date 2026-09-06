import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEY, DEFAULT_CATEGORY_LIST } from '../constants'
import { computeDaySummary, computePeriodSummary } from '../utils/summary'
import type { TimeEntry, DaySummary, Category, StorageData, ViewMode, PeriodSummary } from '../types'

export function useTimeEntries() {
  const [data, setData] = useLocalStorage<StorageData>(STORAGE_KEY, {
    version: 2,
    entries: [],
    categories: DEFAULT_CATEGORY_LIST,
  })

  useEffect(() => {
    if (data.version === 1) {
      setData(prev => ({
        ...prev,
        version: 2,
        categories: DEFAULT_CATEGORY_LIST,
      }))
    }
  }, [])

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

  const getSummaryForDate = useCallback((date: string): DaySummary => {
    return computeDaySummary(entries, date)
  }, [entries])

  const getSummaryForPeriod = useCallback((anchorDate: string, viewMode: ViewMode): PeriodSummary => {
    return computePeriodSummary(entries, anchorDate, viewMode)
  }, [entries])

  const allDates = useMemo(() => {
    const dates = new Set(entries.map(e => e.date))
    return Array.from(dates).sort()
  }, [entries])

  return {
    entries, categories, data,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory,
    importData,
    getEntriesForDate, getSummaryForDate, getSummaryForPeriod, allDates,
  }
}
