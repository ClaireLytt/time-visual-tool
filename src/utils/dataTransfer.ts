import { format } from 'date-fns'
import i18n from '../i18n'
import { DEFAULT_CATEGORY_LIST } from '../constants'
import type { StorageData, TimeEntry, Category } from '../types'

export function isValidEntry(e: unknown): e is TimeEntry {
  if (typeof e !== 'object' || e === null) return false
  const obj = e as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.activity === 'string' &&
    typeof obj.duration === 'number' &&
    typeof obj.weight === 'number' &&
    typeof obj.category === 'string' &&
    typeof obj.createdAt === 'string'
  )
}

export function isValidCategory(c: unknown): c is Category {
  if (typeof c !== 'object' || c === null) return false
  const obj = c as Record<string, unknown>
  return typeof obj.name === 'string' && typeof obj.color === 'string'
}

export function validateImportData(raw: unknown): StorageData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  if (!Array.isArray(obj.entries)) return null
  const entries = obj.entries.filter(isValidEntry)

  let categories: Category[]
  if (Array.isArray(obj.categories)) {
    categories = obj.categories.filter(isValidCategory)
    if (categories.length === 0) categories = DEFAULT_CATEGORY_LIST
  } else {
    categories = DEFAULT_CATEGORY_LIST
  }

  return { version: 2, entries, categories }
}

export function exportToFile(data: StorageData) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `time-visual-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function readImportFile(file: File): Promise<StorageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const validated = validateImportData(parsed)
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
