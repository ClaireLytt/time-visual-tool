import type { Category } from '../types'

export const STORAGE_KEY = 'time-visual-entries'

export const DEFAULT_CATEGORIES = [
  '工作',
  '学习',
  '运动',
  '阅读',
  '休息',
  '其他',
] as const

export type DefaultCategory = (typeof DEFAULT_CATEGORIES)[number]

export const CATEGORY_COLORS: Record<DefaultCategory, string> = {
  '工作': '#3b82f6',
  '学习': '#8b5cf6',
  '运动': '#10b981',
  '阅读': '#f59e0b',
  '休息': '#6b7280',
  '其他': '#ec4899',
}

export const DEFAULT_CATEGORY_LIST: Category[] = DEFAULT_CATEGORIES.map(name => ({
  name,
  color: CATEGORY_COLORS[name],
}))
