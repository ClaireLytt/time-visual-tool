import { format } from 'date-fns'
import i18n from '../i18n'
import { DEFAULT_FINANCE_CATEGORY_LIST } from '../constants/finance'
import type { FinanceStorageData, FinanceEntry, FinanceCategory } from '../types/finance'

export function isValidFinanceEntry(e: unknown): e is FinanceEntry {
  if (typeof e !== 'object' || e === null) return false
  const obj = e as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.amount === 'number' &&
    (obj.type === 'income' || obj.type === 'expense') &&
    typeof obj.category === 'string' &&
    typeof obj.createdAt === 'string'
  )
}

export function isValidFinanceCategory(c: unknown): c is FinanceCategory {
  if (typeof c !== 'object' || c === null) return false
  const obj = c as Record<string, unknown>
  return (
    typeof obj.name === 'string' &&
    typeof obj.color === 'string' &&
    (obj.kind === 'income' || obj.kind === 'expense')
  )
}

export function validateFinanceData(raw: unknown): FinanceStorageData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  if (!Array.isArray(obj.entries)) return null
  const entries = obj.entries.filter(isValidFinanceEntry)

  let categories: FinanceCategory[]
  if (Array.isArray(obj.categories)) {
    categories = obj.categories.filter(isValidFinanceCategory)
    if (categories.length === 0) categories = DEFAULT_FINANCE_CATEGORY_LIST
  } else {
    categories = DEFAULT_FINANCE_CATEGORY_LIST
  }

  return { version: 1, entries, categories }
}

export function exportFinanceToFile(data: FinanceStorageData) {
  try {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `money-visual-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    throw new Error(i18n.t('dataTransferError.exportFailed'))
  }
}

export function readFinanceImportFile(file: File): Promise<FinanceStorageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const validated = validateFinanceData(parsed)
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
