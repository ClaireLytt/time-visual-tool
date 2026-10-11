/* ─── IELTS Review Module — Firestore Hooks ─── */

import { useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { useFirestore } from '../../hooks/useFirestore'
import { DEFAULT_SOURCE_CATEGORIES } from './constants'
import type {
  IeltsSession, IeltsSessionsData, IeltsSourceCategory,
  IeltsMistake, IeltsMistakesData,
  IeltsItem, IeltsItemsData,
  IeltsReview, IeltsReviewsData,
  IeltsReflection, IeltsReflectionsData,
  IeltsImportRecord, IeltsImportsData,
  IeltsVocabWord,
} from './types'

/* ── Generic helpers ── */

function makeInitial<T>(): { version: number; entries: T[] } {
  return { version: 1, entries: [] }
}

function makeValidate<T>(check: (e: unknown) => boolean) {
  return (raw: unknown): { version: number; entries: T[] } | null => {
    if (!raw || typeof raw !== 'object') return null
    const obj = raw as Record<string, unknown>
    if (typeof obj.version !== 'number') return null
    if (!Array.isArray(obj.entries)) return null
    const entries = obj.entries.filter(check) as T[]
    // Preserve extra fields (e.g. sourceCategories) via spread
    return { ...obj, version: obj.version, entries } as { version: number; entries: T[] }
  }
}

function isString(v: unknown): v is string { return typeof v === 'string' }
function isNumber(v: unknown): v is number { return typeof v === 'number' }

/* ── Entry validators ── */

function isValidSession(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const o = e as Record<string, unknown>
  return isString(o.id) && isString(o.date) && isString(o.subject) && isString(o.createdAt)
    && isNumber(o.minutes) && isString(o.source)
}

function isValidMistake(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const o = e as Record<string, unknown>
  return isString(o.id) && isString(o.sessionId) && isString(o.tag) && isString(o.date) && isString(o.createdAt)
}

function isValidItem(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const o = e as Record<string, unknown>
  return isString(o.id) && isString(o.type) && isString(o.content) && isString(o.createdAt)
}

function isValidReview(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const o = e as Record<string, unknown>
  return isString(o.id) && isString(o.itemId) && isString(o.nextReviewDate) && isNumber(o.reviewCount)
}

function isValidReflection(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const o = e as Record<string, unknown>
  return isString(o.id) && isString(o.date) && isString(o.text)
}

function isValidImport(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const o = e as Record<string, unknown>
  return isString(o.id) && isString(o.importedAt) && isString(o.rawJson)
}

function isValidVocabWord(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const o = e as Record<string, unknown>
  return isString(o.id) && isString(o.word) && isString(o.meaning)
    && isNumber(o.easeFactor) && isNumber(o.interval) && isNumber(o.repetitions)
    && isString(o.nextReview) && isString(o.createdAt) && isString(o.source)
    && isString(o.listType)
}

/* ── Hook factory ── */

function useIeltsCollection<T extends { id: string; date?: string }>(
  key: string,
  validate: (e: unknown) => boolean,
) {
  const { data, setData, loading, error } = useFirestore<{ version: number; entries: T[] }>(
    key,
    makeInitial<T>(),
    makeValidate<T>(validate),
  )

  const entries = data.entries

  const addEntry = useCallback((entry: T) => {
    setData(prev => ({ ...prev, entries: [...prev.entries, entry] }))
  }, [setData])

  const deleteEntry = useCallback((id: string) => {
    setData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }))
  }, [setData])

  const updateEntry = useCallback((id: string, patch: Partial<T>) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, ...patch } : e),
    }))
  }, [setData])

  const getEntriesForDate = useCallback((date: string) => {
    return entries.filter(e => 'date' in e && (e as { date: string }).date === date)
  }, [entries])

  return { entries, loading, error, addEntry, deleteEntry, updateEntry, getEntriesForDate, data, setData }
}

/* ── Exported hooks ── */

export function useIeltsSessions() {
  const base = useIeltsCollection<IeltsSession>('ieltsSessions', isValidSession)

  // Source categories are stored alongside sessions
  const categories: IeltsSourceCategory[] = (base.data as IeltsSessionsData).sourceCategories
    ?? DEFAULT_SOURCE_CATEGORIES

  const addCategory = useCallback((cat: IeltsSourceCategory) => {
    base.setData(prev => {
      const existing = (prev as IeltsSessionsData).sourceCategories ?? DEFAULT_SOURCE_CATEGORIES
      if (existing.some(c => c.name === cat.name)) return prev
      return { ...prev, sourceCategories: [...existing, cat] }
    })
  }, [base.setData])

  const updateCategory = useCallback((id: string, patch: Partial<IeltsSourceCategory>) => {
    base.setData(prev => {
      const existing = (prev as IeltsSessionsData).sourceCategories ?? DEFAULT_SOURCE_CATEGORIES
      return {
        ...prev,
        sourceCategories: existing.map(c => c.id === id ? { ...c, ...patch } : c),
      }
    })
  }, [base.setData])

  const deleteCategory = useCallback((id: string) => {
    base.setData(prev => {
      const existing = (prev as IeltsSessionsData).sourceCategories ?? DEFAULT_SOURCE_CATEGORIES
      return {
        ...prev,
        sourceCategories: existing.filter(c => c.id !== id || c.builtIn),
      }
    })
  }, [base.setData])

  return { ...base, categories, addCategory, updateCategory, deleteCategory }
}

export function useIeltsMistakes() {
  return useIeltsCollection<IeltsMistake>('ieltsMistakes', isValidMistake)
}

export function useIeltsItems() {
  return useIeltsCollection<IeltsItem>('ieltsItems', isValidItem)
}

export function useIeltsReviews() {
  const result = useIeltsCollection<IeltsReview>('ieltsReviews', isValidReview)

  const dueReviews = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return result.entries.filter(r => r.nextReviewDate <= today)
  }, [result.entries])

  return { ...result, dueReviews }
}

export function useIeltsReflections() {
  return useIeltsCollection<IeltsReflection>('ieltsReflections', isValidReflection)
}

export function useIeltsImports() {
  return useIeltsCollection<IeltsImportRecord>('ieltsImports', isValidImport)
}

export function useIeltsVocab() {
  return useIeltsCollection<IeltsVocabWord>('ieltsVocab', isValidVocabWord)
}
