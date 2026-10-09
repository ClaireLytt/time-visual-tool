export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  createdAt: string
}

export interface HabitCheck {
  habitId: string
  date: string
}

export interface HabitStorageData {
  version: number
  habits: Habit[]
  checks: HabitCheck[]
}
