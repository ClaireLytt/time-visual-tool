import { STORAGE_KEY } from '../constants'
import type { TimeEntry } from '../types'

interface StorageData {
  version: number
  entries: TimeEntry[]
}

export const StorageService = {
  getEntries(): TimeEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const data: StorageData = JSON.parse(raw)
      if (data.version === 1) return data.entries
      return []
    } catch {
      return []
    }
  },

  saveEntries(entries: TimeEntry[]): void {
    const data: StorageData = { version: 1, entries }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  },
}
