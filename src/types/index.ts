export interface TimeEntry {
  id: string
  date: string
  activity: string
  duration: number
  /** Valid range: 0.1 – 10 */
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

export type ViewMode = 'day' | 'week' | 'month'

export type ExtendedViewMode = ViewMode | 'year'

export type AppMode = 'time' | 'finance' | 'eating' | 'diary'

export interface DailyDataPoint {
  date: string
  label: string
  totalMinutes: number
  weightedMinutes: number
}

export interface Category {
  name: string
  color: string
}

export interface StorageData {
  version: 2
  entries: TimeEntry[]
  categories: Category[]
}

export interface PeriodSummary {
  totalMinutes: number
  weightedMinutes: number
  entryCount: number
  categoryBreakdown: Record<string, CategoryBreakdown>
  dailyBreakdown: DailyDataPoint[]
}
