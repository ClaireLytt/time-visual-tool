import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEY } from '../constants'
import { computeDaySummary, computePeriodSummary } from '../utils/summary'
import type { TimeEntry, DaySummary, ViewMode, PeriodSummary, StorageData } from '../types'

export function useTimeEntries() {
  const [data, setData] = useLocalStorage<StorageData>(STORAGE_KEY, {
    version: 1,
    entries: [],
  })

  const entries = data.entries

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

  return { entries, addEntry, deleteEntry, updateEntry, getEntriesForDate, getSummaryForDate, getSummaryForPeriod, allDates }
}
