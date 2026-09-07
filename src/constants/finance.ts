import type { FinanceCategory } from '../types/finance'

export const FINANCE_STORAGE_KEY = 'money-visual-entries'

export const DEFAULT_FINANCE_CATEGORY_LIST: FinanceCategory[] = [
  { name: '餐饮', color: '#f97316', kind: 'expense' },
  { name: '交通', color: '#06b6d4', kind: 'expense' },
  { name: '购物', color: '#ec4899', kind: 'expense' },
  { name: '居住', color: '#8b5cf6', kind: 'expense' },
  { name: '娱乐', color: '#f59e0b', kind: 'expense' },
  { name: '医疗', color: '#ef4444', kind: 'expense' },
  { name: '教育', color: '#3b82f6', kind: 'expense' },
  { name: '通讯', color: '#14b8a6', kind: 'expense' },
  { name: '人情', color: '#a855f7', kind: 'expense' },
  { name: '其他支出', color: '#6b7280', kind: 'expense' },
  { name: '工资', color: '#10b981', kind: 'income' },
  { name: '奖金', color: '#84cc16', kind: 'income' },
  { name: '理财收益', color: '#22c55e', kind: 'income' },
  { name: '其他收入', color: '#64748b', kind: 'income' },
]
