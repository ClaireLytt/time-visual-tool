import { useCallback } from 'react'
import { useFirestore } from './useFirestore'
import { DEFAULT_FINANCE_CATEGORY_LIST, DEFAULT_NON_ESSENTIAL_CATEGORIES } from '../constants/finance'
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

  const addEntry = useCallback((entry: Omit<FinanceEntry, 'id' | 'createdAt'>): FinanceEntry => {
    const newEntry: FinanceEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setData(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry],
    }))
    return newEntry
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
    setData(prev => {
      const renamed = oldName !== updated.name
      let categoryBudgets = prev.categoryBudgets
      if (renamed && categoryBudgets && oldName in categoryBudgets) {
        const { [oldName]: budget, ...rest } = categoryBudgets
        categoryBudgets = { ...rest, [updated.name]: budget }
      }
      // Resolve defaults before remapping, otherwise renaming a default
      // non-essential category (e.g. 购物) would silently drop its eligibility
      const storedNonEssential = prev.nonEssentialCategories
        ?? DEFAULT_NON_ESSENTIAL_CATEGORIES.filter(n =>
          (prev.categories ?? DEFAULT_FINANCE_CATEGORY_LIST).some(c => c.name === n && c.kind === 'expense'))
      const nonEssentialCategories = renamed && storedNonEssential.includes(oldName)
        ? storedNonEssential.map(n => n === oldName ? updated.name : n)
        : prev.nonEssentialCategories
      return {
        ...prev,
        categories: prev.categories.map(c => c.name === oldName ? updated : c),
        entries: renamed
          ? prev.entries.map(e => e.category === oldName ? { ...e, category: updated.name } : e)
          : prev.entries,
        ...(categoryBudgets != null && { categoryBudgets }),
        ...(nonEssentialCategories != null && { nonEssentialCategories }),
      }
    })
  }, [setData])

  const deleteCategory = useCallback((name: string) => {
    setData(prev => {
      if (prev.entries.some(e => e.category === name)) return prev
      let categoryBudgets = prev.categoryBudgets
      if (categoryBudgets && name in categoryBudgets) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [name]: _removed, ...rest } = categoryBudgets
        categoryBudgets = rest
      }
      const nonEssentialCategories = prev.nonEssentialCategories?.includes(name)
        ? prev.nonEssentialCategories.filter(n => n !== name)
        : prev.nonEssentialCategories
      return {
        ...prev,
        categories: prev.categories.filter(c => c.name !== name),
        ...(categoryBudgets != null && { categoryBudgets }),
        ...(nonEssentialCategories != null && { nonEssentialCategories }),
      }
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
          ...(imported.monthlyBudget != null
            ? { monthlyBudget: imported.monthlyBudget }
            : prev.monthlyBudget != null
              ? { monthlyBudget: prev.monthlyBudget }
              : {}),
          ...(imported.categoryBudgets != null || prev.categoryBudgets != null
            ? { categoryBudgets: { ...prev.categoryBudgets, ...imported.categoryBudgets } }
            : {}),
          ...(imported.nonEssentialCategories != null
            ? { nonEssentialCategories: imported.nonEssentialCategories }
            : prev.nonEssentialCategories != null
              ? { nonEssentialCategories: prev.nonEssentialCategories }
              : {}),
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

  const monthlyBudget = data.monthlyBudget

  const setMonthlyBudget = useCallback((budget: number | undefined) => {
    setData(prev => {
      if (budget === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { monthlyBudget: _, ...rest } = prev
        return rest as FinanceStorageData
      }
      return { ...prev, monthlyBudget: budget }
    })
  }, [setData])

  const categoryBudgets = data.categoryBudgets

  const setCategoryBudget = useCallback((name: string, budget: number | undefined) => {
    setData(prev => {
      const current = prev.categoryBudgets ?? {}
      if (budget === undefined) {
        if (!(name in current)) return prev
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [name]: _removed, ...rest } = current
        if (Object.keys(rest).length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { categoryBudgets: _all, ...withoutBudgets } = prev
          return withoutBudgets as FinanceStorageData
        }
        return { ...prev, categoryBudgets: rest }
      }
      return { ...prev, categoryBudgets: { ...current, [name]: budget } }
    })
  }, [setData])

  // undefined in storage means "use defaults" (intersected with current expense categories)
  const nonEssentialCategories = data.nonEssentialCategories
    ?? DEFAULT_NON_ESSENTIAL_CATEGORIES.filter(n => categories.some(c => c.name === n && c.kind === 'expense'))

  const toggleNonEssentialCategory = useCallback((name: string) => {
    setData(prev => {
      const current = prev.nonEssentialCategories
        ?? DEFAULT_NON_ESSENTIAL_CATEGORIES.filter(n =>
          (prev.categories ?? DEFAULT_FINANCE_CATEGORY_LIST).some(c => c.name === n && c.kind === 'expense'))
      const next = current.includes(name)
        ? current.filter(n => n !== name)
        : [...current, name]
      return { ...prev, nonEssentialCategories: next }
    })
  }, [setData])

  return {
    entries, categories, data, loading,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory,
    importData,
    getEntriesForDate, getSummaryForPeriod,
    monthlyBudget, setMonthlyBudget,
    categoryBudgets, setCategoryBudget,
    nonEssentialCategories, toggleNonEssentialCategory,
  }
}
