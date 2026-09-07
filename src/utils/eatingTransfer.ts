import { format } from 'date-fns'
import i18n from '../i18n'
import { DEFAULT_EATING_CATEGORY_LIST } from '../constants/eating'
import type { EatingStorageData, EatingEntry, EatingCategory } from '../types/eating'

export function isValidEatingEntry(e: unknown): e is EatingEntry {
  if (typeof e !== 'object' || e === null) return false
  const obj = e as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.food === 'string' &&
    typeof obj.calories === 'number' &&
    typeof obj.mealTime === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.note === 'string' &&
    typeof obj.createdAt === 'string'
  )
}

export function isValidEatingCategory(c: unknown): c is EatingCategory {
  if (typeof c !== 'object' || c === null) return false
  const obj = c as Record<string, unknown>
  return (
    typeof obj.name === 'string' &&
    typeof obj.color === 'string'
  )
}

export function validateEatingData(raw: unknown): EatingStorageData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  if (!Array.isArray(obj.entries)) return null
  const entries = obj.entries.filter(isValidEatingEntry)

  let categories: EatingCategory[]
  if (Array.isArray(obj.categories)) {
    categories = obj.categories.filter(isValidEatingCategory)
    if (categories.length === 0) categories = DEFAULT_EATING_CATEGORY_LIST
  } else {
    categories = DEFAULT_EATING_CATEGORY_LIST
  }

  return { version: 1, entries, categories }
}

export function exportEatingToFile(data: EatingStorageData) {
  try {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eating-visual-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    throw new Error(i18n.t('dataTransferError.exportFailed'))
  }
}

export function readEatingImportFile(file: File): Promise<EatingStorageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const validated = validateEatingData(parsed)
        if (!validated) {
          reject(new Error(i18n.t('dataTransferError.invalidFormat')))
          return
        }
        resolve(validated)
      } catch {
        reject(new Error(i18n.t('dataTransferError.parseFailed')))
      }
    }
    reader.onerror = () => reject(new Error(i18n.t('dataTransferError.readFailed')))
    reader.readAsText(file)
  })
}
