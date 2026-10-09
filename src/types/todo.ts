export type TodoPriority = 'high' | 'medium' | 'low'

export interface TodoItem {
  id: string
  text: string
  done: boolean
  priority: TodoPriority
  date: string
  dueDate?: string
  completedAt?: string
  createdAt: string
}

export interface TodoStorageData {
  version: number
  items: TodoItem[]
}
