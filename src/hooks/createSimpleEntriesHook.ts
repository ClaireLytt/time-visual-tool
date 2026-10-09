import { useCallback } from 'react'
import { useFirestore } from './useFirestore'

interface HasIdAndDate {
  id: string
  date: string
}

interface SimpleStorageData<T> {
  version: number
  entries: T[]
}

/**
 * Factory for simple entry-based modules (study, work, etc.)
 * Eliminates duplicated hook boilerplate.
 */
export function createSimpleEntriesHook<T extends HasIdAndDate>(
  firestoreKey: string,
) {
  function validate(raw: unknown): SimpleStorageData<T> | null {
    if (typeof raw !== 'object' || raw === null) return null
    const obj = raw as Record<string, unknown>
    if (!Array.isArray(obj.entries)) return null
    return { version: 1, entries: obj.entries as T[] }
  }

  const INITIAL: SimpleStorageData<T> = { version: 1, entries: [] }

  return function useEntries() {
    const { data, setData, loading } = useFirestore<SimpleStorageData<T>>(firestoreKey, INITIAL, validate)

    const addEntry = useCallback((entry: T) => {
      setData(prev => ({ ...prev, entries: [...prev.entries, entry] }))
    }, [setData])

    const deleteEntry = useCallback((id: string) => {
      setData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }))
    }, [setData])

    const getEntriesForDate = useCallback((date: string) => {
      return data.entries.filter(e => e.date === date)
    }, [data.entries])

    return { entries: data.entries, loading, addEntry, deleteEntry, getEntriesForDate }
  }
}
