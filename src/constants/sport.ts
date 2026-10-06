import type { SportCategory } from '../types/sport'

export const SPORT_STORAGE_KEY = 'sport-visual-entries'

export const DEFAULT_SPORT_CATEGORY_LIST: SportCategory[] = [
  { name: '跑步', color: '#c47070' },
  { name: '游泳', color: '#6b8db5' },
  { name: '瑜伽', color: '#a855f7' },
  { name: '普拉提', color: '#c48b9b' },
  { name: '舞蹈', color: '#c4a36b' },
  { name: '骑行', color: '#7aab8e' },
  { name: '力量训练', color: '#7b7fb5' },
  { name: '球类运动', color: '#c4956b' },
  { name: '徒步', color: '#8bab6b' },
  { name: '其他运动', color: '#a0a0a0' },
]
