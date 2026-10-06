import type { EatingCategory } from '../types/eating'

export const EATING_STORAGE_KEY = 'eating-visual-entries'

export const LATE_NIGHT_CATEGORY_NAME = '夜宵'

export const DEFAULT_EATING_CATEGORY_LIST: EatingCategory[] = [
  { name: '早餐', color: '#c4a36b' },
  { name: '午餐', color: '#7aab8e' },
  { name: '晚餐', color: '#7b7fb5' },
  { name: '加餐', color: '#c48b9b' },
  { name: '饮品', color: '#6ba5b5' },
  { name: '夜宵', color: '#c47070' },
]
