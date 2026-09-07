import type { ExtendedViewMode } from './index'

export type EatingViewMode = ExtendedViewMode

export interface EatingEntry {
  id: string
  date: string
  food: string
  calories: number
  mealTime: string
  category: string
  note: string
  createdAt: string
}

export interface EatingCategory {
  name: string
  color: string
}

export interface EatingStorageData {
  version: 1
  entries: EatingEntry[]
  categories: EatingCategory[]
}

export interface EatingCategoryBreakdown {
  calories: number
  percentage: number
  count: number
}

export interface EatingDailyDataPoint {
  date: string
  label: string
  calories: number
}

export interface EatingPeriodSummary {
  totalCalories: number
  entryCount: number
  averageCaloriesPerEntry: number
  categoryBreakdown: Record<string, EatingCategoryBreakdown>
  dailyBreakdown: EatingDailyDataPoint[]
}
