import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { EATING_STORAGE_KEY, DEFAULT_EATING_CATEGORY_LIST } from '../constants/eating'
import { computeEatingPeriodSummary } from '../utils/eatingSummary'
import { validateEatingData } from '../utils/eatingTransfer'
import type { EatingEntry, EatingCategory, EatingStorageData, EatingPeriodSummary, EatingViewMode } from '../types/eating'

const INITIAL_DATA: EatingStorageData = {
  version: 1,
  entries: [],
  categories: DEFAULT_EATING_CATEGORY_LIST,
}

export function useEatingEntries() {
  const [data, setData] = useLocalStorage<EatingStorageData>(EATING_STORAGE_KEY, INITIAL_DATA, validateEatingData)

  const entries = data.entries
  const categories = data.categories ?? DEFAULT_EATING_CATEGORY_LIST

  const addEntry = useCallback((entry: Omit<EatingEntry, 'id' | 'createdAt'>) => {
    const newEntry: EatingEntry = {
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

  const updateEntry = useCallback((id: string, updates: Partial<EatingEntry>) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, ...updates } : e),
    }))
  }, [setData])

  const addCategory = useCallback((category: EatingCategory) => {
    setData(prev => {
      if (prev.categories.some(c => c.name === category.name)) return prev
      return { ...prev, categories: [...prev.categories, category] }
    })
  }, [setData])

  const updateCategory = useCallback((oldName: string, updated: EatingCategory) => {
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

  const importData = useCallback((imported: EatingStorageData, mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setData(imported)
    } else {
      setData(prev => {
        const existingIds = new Set(prev.entries.map(e => e.id))
        const newEntries = imported.entries.filter(e => !existingIds.has(e.id))
        const existingNames = new Set(prev.categories.map(c => c.name))
        const newCategories = imported.categories.filter(c => !existingNames.has(c.name))
        return {
          version: 1,
          entries: [...prev.entries, ...newEntries],
          categories: [...prev.categories, ...newCategories],
        }
      })
    }
  }, [setData])

  const getEntriesForDate = useCallback((date: string) => {
    return entries.filter(e => e.date === date)
  }, [entries])

  const getSummaryForPeriod = useCallback((anchorDate: string, viewMode: EatingViewMode): EatingPeriodSummary => {
    return computeEatingPeriodSummary(entries, anchorDate, viewMode)
  }, [entries])

  return {
    entries, categories, data,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory,
    importData,
    getEntriesForDate, getSummaryForPeriod,
  }
}
