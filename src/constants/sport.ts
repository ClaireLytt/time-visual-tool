import type { SportCategory } from '../types/sport'

export const SPORT_STORAGE_KEY = 'sport-visual-entries'

export const DEFAULT_SPORT_CATEGORY_LIST: SportCategory[] = [
  { name: '跑步', color: '#ef4444' },
  { name: '游泳', color: '#3b82f6' },
  { name: '瑜伽', color: '#a855f7' },
  { name: '普拉提', color: '#ec4899' },
  { name: '舞蹈', color: '#f59e0b' },
  { name: '骑行', color: '#10b981' },
  { name: '力量训练', color: '#6366f1' },
  { name: '球类运动', color: '#f97316' },
  { name: '徒步', color: '#84cc16' },
  { name: '其他运动', color: '#6b7280' },
]
