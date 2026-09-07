import { format } from 'date-fns'
import i18n from '../i18n'
import { DEFAULT_SPORT_CATEGORY_LIST } from '../constants/sport'
import type { SportStorageData, SportEntry, SportCategory, SportReflection } from '../types/sport'

export function isValidSportEntry(e: unknown): e is SportEntry {
  if (typeof e !== 'object' || e === null) return false
  const obj = e as Record<string, unknown>
  return (
    typeof obj.id === 'string' && obj.id !== '' &&
    typeof obj.date === 'string' && obj.date !== '' &&
    typeof obj.sportType === 'string' && obj.sportType !== '' &&
    typeof obj.content === 'string' &&
    typeof obj.duration === 'number' && Number.isFinite(obj.duration) && obj.duration >= 0 &&
    typeof obj.calories === 'number' && Number.isFinite(obj.calories) && obj.calories >= 0 &&
    typeof obj.note === 'string' &&
    typeof obj.createdAt === 'string' && obj.createdAt !== ''
  )
}

export function isValidSportCategory(c: unknown): c is SportCategory {
  if (typeof c !== 'object' || c === null) return false
  const obj = c as Record<string, unknown>
  return (
    typeof obj.name === 'string' && obj.name !== '' &&
    typeof obj.color === 'string' && obj.color !== ''
  )
}

const VALID_REFLECTION_PERIODS = new Set(['week', 'month', 'year'])

export function isValidSportReflection(r: unknown): r is SportReflection {
  if (typeof r !== 'object' || r === null) return false
  const obj = r as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.periodType === 'string' &&
    VALID_REFLECTION_PERIODS.has(obj.periodType as string) &&
    typeof obj.periodKey === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  )
}

export function validateSportData(raw: unknown): SportStorageData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  if (!Array.isArray(obj.entries)) return null
  const entries = obj.entries.filter(isValidSportEntry)

  let categories: SportCategory[]
  if (Array.isArray(obj.categories)) {
    categories = obj.categories.filter(isValidSportCategory)
    if (categories.length === 0) categories = DEFAULT_SPORT_CATEGORY_LIST
  } else {
    categories = DEFAULT_SPORT_CATEGORY_LIST
  }

  const reflections: SportReflection[] = Array.isArray(obj.reflections)
    ? obj.reflections.filter(isValidSportReflection)
    : []

  return { version: 1, entries, categories, reflections }
}

export function exportSportToFile(data: SportStorageData) {
  try {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sport-visual-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    throw new Error(i18n.t('dataTransferError.exportFailed'))
  }
}

export function readSportImportFile(file: File): Promise<SportStorageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const validated = validateSportData(parsed)
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
