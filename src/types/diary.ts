import type { ExtendedViewMode } from './index'

export type DiaryPeriodType = ExtendedViewMode

export interface DiaryGoal {
  id: string
  text: string
  done: boolean
}

export interface DiaryEntry {
  id: string
  periodType: DiaryPeriodType
  periodKey: string
  gratitude: string
  feelings: string
  motivation: string
  goals: DiaryGoal[]
  createdAt: string
  updatedAt: string
}

export interface DiaryStorageData {
  version: 1
  entries: DiaryEntry[]
}
