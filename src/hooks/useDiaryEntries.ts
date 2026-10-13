import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFirestore } from './useFirestore'
import { validateDiaryData } from '../utils/diaryTransfer'
import type { DiaryEntry, DiaryGoal, DiaryNotebook, DiaryPeriodType, DiaryStorageData } from '../types/diary'

const INITIAL_DATA: DiaryStorageData = {
  version: 1,
  entries: [],
}

export const DEFAULT_NOTEBOOK_ID = 'default'

/** Palette cycled through for user-created notebooks */
const NOTEBOOK_COLORS = ['#b09cc4', '#86a98d', '#c79a74', '#8aa7c4', '#b4879d', '#c9ab77']

export interface DiaryEntryUpsert {
  gratitude: string
  feelings: string
  motivation: string
  mood?: string
  goals: DiaryGoal[]
  custom?: Record<string, string>
  images?: string[]
}

export function useDiaryEntries() {
  const { t } = useTranslation()
  const { data, setData, loading, error } = useFirestore<DiaryStorageData>('diaryData', INITIAL_DATA, validateDiaryData)

  const entries = data.entries

  // The default notebook lives in code; stored notebooks may extend it with
  // custom sections (stored under the 'default' id) or add new notebooks.
  const storedDefault = (data.notebooks ?? []).find(n => n.id === DEFAULT_NOTEBOOK_ID)
  const notebooks: DiaryNotebook[] = [
    {
      id: DEFAULT_NOTEBOOK_ID,
      name: t('diary.defaultNotebook'),
      color: '#b09cc4',
      sections: storedDefault?.sections ?? [],
      createdAt: '',
    },
    ...(data.notebooks ?? []).filter(n => n.id !== DEFAULT_NOTEBOOK_ID),
  ]

  const addNotebook = useCallback((name: string) => {
    setData(prev => {
      const existing = prev.notebooks ?? []
      const color = NOTEBOOK_COLORS[existing.length % NOTEBOOK_COLORS.length]
      const nb: DiaryNotebook = { id: crypto.randomUUID(), name, color, sections: [], createdAt: new Date().toISOString() }
      return { ...prev, notebooks: [...existing, nb] }
    })
  }, [setData])

  /**
   * Delete a custom notebook; its entries move to the default notebook.
   * When the default notebook already has an entry for the same period the
   * contents are merged (appended), never silently dropped by dedupe.
   */
  const deleteNotebook = useCallback((id: string) => {
    if (id === DEFAULT_NOTEBOOK_ID) return
    setData(prev => {
      const nbName = (prev.notebooks ?? []).find(n => n.id === id)?.name ?? ''
      const defaults = new Map(
        prev.entries
          .filter(e => (e.notebookId ?? DEFAULT_NOTEBOOK_ID) === DEFAULT_NOTEBOOK_ID)
          .map(e => [`${e.periodType}:${e.periodKey}`, e])
      )
      const out: DiaryEntry[] = []
      for (const e of prev.entries) {
        if (e.notebookId !== id) { out.push(e); continue }
        const target = defaults.get(`${e.periodType}:${e.periodKey}`)
        if (!target) { out.push({ ...e, notebookId: undefined }); continue }
        // merge colliding entry into the existing default entry
        const prefix = nbName ? `[${nbName}] ` : ''
        const glue = (base: string, extra: string) =>
          extra.trim() ? (base.trim() ? `${base}

${prefix}${extra}` : `${prefix}${extra}`) : base
        target.gratitude = glue(target.gratitude, e.gratitude)
        target.feelings = glue(target.feelings, e.feelings)
        target.motivation = glue(target.motivation, e.motivation)
        target.custom = { ...e.custom, ...target.custom }
        target.images = [...(target.images ?? []), ...(e.images ?? [])].slice(0, 8)
        target.goals = [...target.goals, ...e.goals]
        target.updatedAt = new Date().toISOString()
      }
      return {
        ...prev,
        notebooks: (prev.notebooks ?? []).filter(n => n.id !== id),
        entries: out,
      }
    })
  }, [setData])

  /** Add a custom section (editor module) to a notebook's template */
  const addSection = useCallback((notebookId: string, name: string) => {
    setData(prev => {
      const stored = prev.notebooks ?? []
      const section = { id: crypto.randomUUID(), name }
      if (stored.some(n => n.id === notebookId)) {
        return { ...prev, notebooks: stored.map(n => n.id === notebookId ? { ...n, sections: [...n.sections, section] } : n) }
      }
      // first section added to the default notebook — materialize its record
      if (notebookId === DEFAULT_NOTEBOOK_ID) {
        return { ...prev, notebooks: [...stored, { id: DEFAULT_NOTEBOOK_ID, name: '', color: '', sections: [section], createdAt: new Date().toISOString() }] }
      }
      return prev
    })
  }, [setData])

  /** Remove a section from a notebook template (entry contents are kept in storage) */
  const removeSection = useCallback((notebookId: string, sectionId: string) => {
    setData(prev => ({
      ...prev,
      notebooks: (prev.notebooks ?? []).map(n =>
        n.id === notebookId ? { ...n, sections: n.sections.filter(sec => sec.id !== sectionId) } : n
      ),
    }))
  }, [setData])

  const getEntry = useCallback((notebookId: string, periodType: DiaryPeriodType, periodKey: string): DiaryEntry | undefined => {
    return entries.find(e =>
      (e.notebookId ?? DEFAULT_NOTEBOOK_ID) === notebookId &&
      e.periodType === periodType && e.periodKey === periodKey
    )
  }, [entries])

  const upsertEntry = useCallback((
    notebookId: string,
    periodType: DiaryPeriodType,
    periodKey: string,
    fields: DiaryEntryUpsert
  ) => {
    const now = new Date().toISOString()
    setData(prev => {
      const existing = prev.entries.find(e =>
        (e.notebookId ?? DEFAULT_NOTEBOOK_ID) === notebookId &&
        e.periodType === periodType && e.periodKey === periodKey
      )
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
        ...(notebookId !== DEFAULT_NOTEBOOK_ID ? { notebookId } : {}),
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
          const key = `${e.notebookId ?? DEFAULT_NOTEBOOK_ID}:${e.periodType}:${e.periodKey}`
          const existing = merged.get(key)
          if (!existing || e.updatedAt > existing.updatedAt) merged.set(key, e)
        }
        // merge notebooks by id (imported wins on name/sections)
        const nbs = new Map((prev.notebooks ?? []).map(n => [n.id, n]))
        for (const n of imported.notebooks ?? []) nbs.set(n.id, n)
        const notebooks = [...nbs.values()]
        return { version: 1, entries: [...merged.values()], ...(notebooks.length ? { notebooks } : {}) }
      })
    }
  }, [setData])

  return {
    entries, data, loading, error,
    notebooks, addNotebook, deleteNotebook, addSection, removeSection,
    getEntry, upsertEntry, deleteEntry,
    importData,
  }
}
