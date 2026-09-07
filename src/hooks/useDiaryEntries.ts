import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DIARY_STORAGE_KEY } from '../constants/diary'
import { validateDiaryData } from '../utils/diaryTransfer'
import type { DiaryEntry, DiaryGoal, DiaryPeriodType, DiaryStorageData } from '../types/diary'

const INITIAL_DATA: DiaryStorageData = {
  version: 1,
  entries: [],
}

export function useDiaryEntries() {
  const [data, setData] = useLocalStorage<DiaryStorageData>(DIARY_STORAGE_KEY, INITIAL_DATA, validateDiaryData)

  const entries = data.entries

  const getEntry = useCallback((periodType: DiaryPeriodType, periodKey: string): DiaryEntry | undefined => {
    return entries.find(e => e.periodType === periodType && e.periodKey === periodKey)
  }, [entries])

  const upsertEntry = useCallback((
    periodType: DiaryPeriodType,
    periodKey: string,
    fields: { gratitude: string; feelings: string; motivation: string; goals: DiaryGoal[] }
  ) => {
    const now = new Date().toISOString()
    setData(prev => {
      const existing = prev.entries.find(e => e.periodType === periodType && e.periodKey === periodKey)
      if (existing) {
        return {
          ...prev,
          entries: prev.entries.map(e =>
            e.id === existing.id ? { ...e, ...fields, updatedAt: now } : e
          ),
        }
      }
      const newEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        periodType,
        periodKey,
        ...fields,
        createdAt: now,
        updatedAt: now,
      }
      return { ...prev, entries: [...prev.entries, newEntry] }
    })
  }, [setData])

  const deleteEntry = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== id),
    }))
  }, [setData])

  const importData = useCallback((imported: DiaryStorageData, mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setData(imported)
    } else {
      setData(prev => {
        const merged = new Map<string, DiaryEntry>()
        for (const e of [...prev.entries, ...imported.entries]) {
          const key = `${e.periodType}:${e.periodKey}`
          const existing = merged.get(key)
          if (!existing || e.updatedAt > existing.updatedAt) merged.set(key, e)
        }
        return { version: 1, entries: [...merged.values()] }
      })
    }
  }, [setData])

  return {
    entries, data,
    getEntry, upsertEntry, deleteEntry,
    importData,
  }
}
