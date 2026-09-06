export interface TimeEntry {
  id: string
  date: string
  activity: string
  duration: number
  weight: number
  category: string
  createdAt: string
}

export interface CategoryBreakdown {
  totalMinutes: number
  weightedMinutes: number
  percentage: number
  count: number
}

export interface DaySummary {
  date: string
  totalMinutes: number
  weightedMinutes: number
  entries: TimeEntry[]
  categoryBreakdown: Record<string, CategoryBreakdown>
}

export interface Category {
  name: string
  color: string
}

export interface StorageData {
  version: number
  entries: TimeEntry[]
  categories: Category[]
}
