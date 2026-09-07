import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { SPORT_STORAGE_KEY, DEFAULT_SPORT_CATEGORY_LIST } from '../constants/sport'
import { computeSportPeriodSummary } from '../utils/sportSummary'
import { validateSportData } from '../utils/sportTransfer'
import type { SportEntry, SportCategory, SportReflection, SportStorageData, SportPeriodSummary, SportViewMode } from '../types/sport'

const INITIAL_DATA: SportStorageData = {
  version: 1,
  entries: [],
  categories: DEFAULT_SPORT_CATEGORY_LIST,
  reflections: [],
}

export function useSportEntries() {
  const [data, setData] = useLocalStorage<SportStorageData>(SPORT_STORAGE_KEY, INITIAL_DATA, validateSportData)

  const entries = data.entries
  const categories = data.categories
  const reflections = data.reflections

  const addEntry = useCallback((entry: Omit<SportEntry, 'id' | 'createdAt'>) => {
    const newEntry: SportEntry = {
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

  const updateEntry = useCallback((id: string, updates: Omit<Partial<SportEntry>, 'id' | 'createdAt'>) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, ...updates } : e),
    }))
  }, [setData])

  const addCategory = useCallback((category: SportCategory) => {
    setData(prev => {
      if (prev.categories.some(c => c.name === category.name)) return prev
      return { ...prev, categories: [...prev.categories, category] }
    })
  }, [setData])

  const updateCategory = useCallback((oldName: string, updated: SportCategory) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.name === oldName ? updated : c),
      entries: oldName !== updated.name
        ? prev.entries.map(e => e.sportType === oldName ? { ...e, sportType: updated.name } : e)
        : prev.entries,
    }))
  }, [setData])

  const deleteCategory = useCallback((name: string) => {
    setData(prev => {
      if (prev.entries.some(e => e.sportType === name)) return prev
      return { ...prev, categories: prev.categories.filter(c => c.name !== name) }
    })
  }, [setData])

  const reorderCategories = useCallback((reordered: SportCategory[]) => {
    setData(prev => {
      if (reordered.length !== prev.categories.length) return prev
      return { ...prev, categories: reordered }
    })
  }, [setData])

  const getReflection = useCallback((periodType: SportReflection['periodType'], periodKey: string) => {
    return reflections.find(r => r.periodType === periodType && r.periodKey === periodKey)
  }, [reflections])

  const upsertReflection = useCallback((periodType: SportReflection['periodType'], periodKey: string, text: string) => {
    setData(prev => {
      const existing = prev.reflections.find(r => r.periodType === periodType && r.periodKey === periodKey)
      const now = new Date().toISOString()
      if (existing) {
        return {
          ...prev,
          reflections: prev.reflections.map(r =>
            r.id === existing.id ? { ...r, text, updatedAt: now } : r
          ),
        }
      }
      const newReflection: SportReflection = {
        id: crypto.randomUUID(),
        periodType,
        periodKey,
        text,
        createdAt: now,
        updatedAt: now,
      }
      return { ...prev, reflections: [...prev.reflections, newReflection] }
    })
  }, [setData])

  const deleteReflection = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      reflections: prev.reflections.filter(r => r.id !== id),
    }))
  }, [setData])

  const importData = useCallback((imported: SportStorageData, mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setData(imported)
    } else {
      setData(prev => {
        const existingIds = new Set(prev.entries.map(e => e.id))
        const newEntries = imported.entries.filter(e => !existingIds.has(e.id))
        const existingNames = new Set(prev.categories.map(c => c.name))
        const newCategories = imported.categories.filter(c => !existingNames.has(c.name))
        const existingReflectionKeys = new Set(prev.reflections.map(r => `${r.periodType}:${r.periodKey}`))
        const newReflections = (imported.reflections ?? []).filter(r => !existingReflectionKeys.has(`${r.periodType}:${r.periodKey}`))
        const mergedCategoryNames = new Set([...existingNames, ...newCategories.map(c => c.name)])
        const allEntries = [...prev.entries, ...newEntries]
        const orphanCategories: SportCategory[] = []
        for (const e of allEntries) {
          if (!mergedCategoryNames.has(e.sportType)) {
            mergedCategoryNames.add(e.sportType)
            orphanCategories.push({ name: e.sportType, color: '#6b7280' })
          }
        }

        return {
          version: 1,
          entries: allEntries,
          categories: [...prev.categories, ...newCategories, ...orphanCategories],
          reflections: [...prev.reflections, ...newReflections],
        }
      })
    }
  }, [setData])

  const getEntriesForDate = useCallback((date: string) => {
    return entries.filter(e => e.date === date)
  }, [entries])

  const getSummaryForPeriod = useCallback((anchorDate: string, viewMode: SportViewMode): SportPeriodSummary => {
    return computeSportPeriodSummary(entries, anchorDate, viewMode)
  }, [entries])

  return {
    entries, categories, reflections, data,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory, reorderCategories,
    getReflection, upsertReflection, deleteReflection,
    importData,
    getEntriesForDate, getSummaryForPeriod,
  }
}
