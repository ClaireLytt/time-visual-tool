export type TodoPriority = 'high' | 'medium' | 'low'

export type TodoRepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'

export interface TodoRepeat {
  type: TodoRepeatType
  /** custom: repeat every N days (>= 1) */
  interval?: number
  /** weekly: days of week to repeat on, 0 (Sun) - 6 (Sat) */
  weekdays?: number[]
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  priority: TodoPriority
  /** start date for recurring items, the item's date otherwise */
  date: string
  dueDate?: string
  completedAt?: string
  createdAt: string
  notes?: string
  repeat?: TodoRepeat
  /** for recurring items: dates (yyyy-MM-dd) on which the item was completed */
  completedDates?: string[]
}

export interface TodoStorageData {
  version: number
  items: TodoItem[]
}
