import type { Category } from '../types'

export const STORAGE_KEY = 'time-visual-entries'
export const APP_MODE_STORAGE_KEY = 'time-visual-mode'

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
  '工作': '#6b8db5',
  '学习': '#9b8db5',
  '运动': '#7aab8e',
  '阅读': '#c4a36b',
  '休息': '#a0a0a0',
  '其他': '#c48b9b',
}

export const DEFAULT_CATEGORY_LIST: Category[] = DEFAULT_CATEGORIES.map(name => ({
  name,
  color: CATEGORY_COLORS[name],
}))
