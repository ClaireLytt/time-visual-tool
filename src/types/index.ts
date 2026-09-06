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

export type ViewMode = 'day' | 'week' | 'month'

export interface DailyDataPoint {
  date: string
  label: string
  totalMinutes: number
  weightedMinutes: number
}

export interface StorageData {
  version: number
  entries: TimeEntry[]
}

export interface PeriodSummary {
  totalMinutes: number
  weightedMinutes: number
  entryCount: number
  categoryBreakdown: Record<string, CategoryBreakdown>
  dailyBreakdown: DailyDataPoint[]
}
