import type { EatingCategory } from '../types/eating'

export const EATING_STORAGE_KEY = 'eating-visual-entries'

export const LATE_NIGHT_CATEGORY_NAME = '夜宵'

export const DEFAULT_EATING_CATEGORY_LIST: EatingCategory[] = [
  { name: '早餐', color: '#f59e0b' },
  { name: '午餐', color: '#10b981' },
  { name: '晚餐', color: '#6366f1' },
  { name: '加餐', color: '#ec4899' },
  { name: '饮品', color: '#06b6d4' },
  { name: '夜宵', color: '#ef4444' },
]
