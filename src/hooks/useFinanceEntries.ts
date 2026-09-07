import { useCallback } from 'react'
import { useFirestore } from './useFirestore'
import { DEFAULT_FINANCE_CATEGORY_LIST } from '../constants/finance'
import { computeFinancePeriodSummary } from '../utils/financeSummary'
import { validateFinanceData } from '../utils/financeTransfer'
import type { FinanceEntry, FinanceCategory, FinanceStorageData, FinancePeriodSummary, FinanceViewMode } from '../types/finance'

const INITIAL_DATA: FinanceStorageData = {
  version: 1,
  entries: [],
  categories: DEFAULT_FINANCE_CATEGORY_LIST,
}

export function useFinanceEntries() {
  const { data, setData, loading } = useFirestore<FinanceStorageData>('financeData', INITIAL_DATA, validateFinanceData)

  const entries = data.entries
  const categories = data.categories ?? DEFAULT_FINANCE_CATEGORY_LIST

  const addEntry = useCallback((entry: Omit<FinanceEntry, 'id' | 'createdAt'>) => {
    const newEntry: FinanceEntry = {
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

  const updateEntry = useCallback((id: string, updates: Partial<FinanceEntry>) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, ...updates } : e),
    }))
  }, [setData])

  const addCategory = useCallback((category: FinanceCategory) => {
    setData(prev => {
      if (prev.categories.some(c => c.name === category.name)) return prev
      return { ...prev, categories: [...prev.categories, category] }
    })
  }, [setData])

  const updateCategory = useCallback((oldName: string, updated: FinanceCategory) => {
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

  const importData = useCallback((imported: FinanceStorageData, mode: 'replace' | 'merge') => {
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

  const getSummaryForPeriod = useCallback((anchorDate: string, viewMode: FinanceViewMode): FinancePeriodSummary => {
    return computeFinancePeriodSummary(entries, anchorDate, viewMode)
  }, [entries])

  return {
    entries, categories, data, loading,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory,
    importData,
    getEntriesForDate, getSummaryForPeriod,
  }
}
