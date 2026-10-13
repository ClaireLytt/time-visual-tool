import type { ExtendedViewMode } from './index'

export type DiaryPeriodType = ExtendedViewMode

export interface DiaryGoal {
  id: string
  text: string
  done: boolean
}

/** A user-defined editor section (prompt) inside a notebook */
export interface DiarySection {
  id: string
  name: string
}

/** A notebook: its own entries + its own editor template (sections) */
export interface DiaryNotebook {
  id: string
  name: string
  color: string
  sections: DiarySection[]
  createdAt: string
}

export interface DiaryEntry {
  id: string
  periodType: DiaryPeriodType
  periodKey: string
  gratitude: string
  feelings: string
  motivation: string
  mood?: string
  goals: DiaryGoal[]
  /** owning notebook; absent = the default notebook */
  notebookId?: string
  /** contents of user-defined sections, keyed by section id */
  custom?: Record<string, string>
  /** compressed data-URL images */
  images?: string[]
  createdAt: string
  updatedAt: string
}

export interface DiaryStorageData {
  version: 1
  entries: DiaryEntry[]
  /** user-created notebooks ('default' lives in code, not storage) */
  notebooks?: DiaryNotebook[]
}
