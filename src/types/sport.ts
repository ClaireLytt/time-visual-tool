import type { ExtendedViewMode } from './index'

export type SportViewMode = ExtendedViewMode

export interface SportEntry {
  id: string
  date: string
  sportType: string
  content: string
  duration: number
  calories: number
  note: string
  createdAt: string
}

export interface SportCategory {
  name: string
  color: string
}

export interface SportReflection {
  id: string
  periodType: 'week' | 'month' | 'year'
  periodKey: string
  text: string
  createdAt: string
  updatedAt: string
}

export interface SportStorageData {
  version: 1
  entries: SportEntry[]
  categories: SportCategory[]
  reflections: SportReflection[]
}

export interface SportCategoryBreakdown {
  duration: number
  calories: number
  percentage: number
  count: number
}

export interface SportDailyDataPoint {
  date: string
  label: string
  duration: number
  calories: number
}

export interface SportPeriodSummary {
  totalDuration: number
  totalCalories: number
  entryCount: number
  averageDurationPerEntry: number
  categoryBreakdown: Record<string, SportCategoryBreakdown>
  dailyBreakdown: SportDailyDataPoint[]
}
