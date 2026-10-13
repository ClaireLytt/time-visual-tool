import { format } from 'date-fns'
import i18n from '../i18n'
import { isValidPeriodKey } from './diaryPeriod'
import type { DiaryStorageData, DiaryEntry, DiaryGoal, DiaryPeriodType } from '../types/diary'

const PERIOD_TYPES: readonly string[] = ['day', 'week', 'month', 'year']

function isValidGoal(g: unknown): g is DiaryGoal {
  if (typeof g !== 'object' || g === null) return false
  const obj = g as Record<string, unknown>
  return typeof obj.id === 'string' && typeof obj.text === 'string' && obj.text.length <= 200 && typeof obj.done === 'boolean'
}

export function isValidDiaryEntry(e: unknown): e is DiaryEntry {
  if (typeof e !== 'object' || e === null) return false
  const obj = e as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.periodType === 'string' &&
    PERIOD_TYPES.includes(obj.periodType) &&
    typeof obj.periodKey === 'string' &&
    isValidPeriodKey(obj.periodType as DiaryPeriodType, obj.periodKey) &&
    typeof obj.gratitude === 'string' && obj.gratitude.length <= 5000 &&
    typeof obj.feelings === 'string' && obj.feelings.length <= 5000 &&
    typeof obj.motivation === 'string' && obj.motivation.length <= 5000 &&
    (obj.goals === undefined || (Array.isArray(obj.goals) && obj.goals.length <= 20 && obj.goals.every(isValidGoal))) &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  )
}

export function dedupeDiaryEntries(entries: DiaryEntry[]): DiaryEntry[] {
  const byPeriod = new Map<string, DiaryEntry>()
  for (const entry of entries) {
    const key = `${entry.notebookId ?? 'default'}:${entry.periodType}:${entry.periodKey}`
    const existing = byPeriod.get(key)
    if (!existing || entry.updatedAt > existing.updatedAt) {
      byPeriod.set(key, entry)
    }
  }
  return [...byPeriod.values()]
}

export function validateDiaryData(raw: unknown): DiaryStorageData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  if (!Array.isArray(obj.entries)) return null
  const entries = dedupeDiaryEntries(
    obj.entries.filter(isValidDiaryEntry).map(e => ({
      ...e,
      goals: e.goals ?? [],
      // strip malformed optional fields instead of letting them crash the UI
      ...(Array.isArray(e.images) ? { images: e.images.filter((i: unknown) => typeof i === 'string') } : { images: undefined }),
      ...(typeof e.custom === 'object' && e.custom !== null && !Array.isArray(e.custom) ? {} : { custom: undefined }),
      ...(typeof e.notebookId === 'string' || e.notebookId === undefined ? {} : { notebookId: undefined }),
    }))
  )

  // notebooks: keep only structurally sound records, defaulting what's optional
  const notebooks = Array.isArray(obj.notebooks)
    ? (obj.notebooks as unknown[])
        .filter((n): n is Record<string, unknown> =>
          typeof n === 'object' && n !== null &&
          typeof (n as Record<string, unknown>).id === 'string' &&
          typeof (n as Record<string, unknown>).name === 'string')
        .map(n => ({
          id: n.id as string,
          name: n.name as string,
          color: typeof n.color === 'string' ? n.color : '#8B9DAB',
          sections: Array.isArray(n.sections)
            ? (n.sections as unknown[]).filter((sec): sec is { id: string; name: string } =>
                typeof sec === 'object' && sec !== null &&
                typeof (sec as Record<string, unknown>).id === 'string' &&
                typeof (sec as Record<string, unknown>).name === 'string')
            : [],
          createdAt: typeof n.createdAt === 'string' ? n.createdAt : '',
        }))
    : undefined
  return { version: 1, entries, ...(notebooks && notebooks.length ? { notebooks } : {}) }
}

export function exportDiaryToFile(data: DiaryStorageData) {
  try {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diary-visual-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    throw new Error(i18n.t('dataTransferError.exportFailed'))
  }
}

export function readDiaryImportFile(file: File): Promise<DiaryStorageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const validated = validateDiaryData(parsed)
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
