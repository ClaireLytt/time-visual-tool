import type { FinanceCategory } from '../types/finance'

export const FINANCE_STORAGE_KEY = 'money-visual-entries'

export const DEFAULT_FINANCE_CATEGORY_LIST: FinanceCategory[] = [
  { name: '餐饮', color: '#c4956b', kind: 'expense' },
  { name: '交通', color: '#6ba5b5', kind: 'expense' },
  { name: '购物', color: '#c48b9b', kind: 'expense' },
  { name: '居住', color: '#9b8db5', kind: 'expense' },
  { name: '娱乐', color: '#c4a36b', kind: 'expense' },
  { name: '医疗', color: '#c47070', kind: 'expense' },
  { name: '教育', color: '#6b8db5', kind: 'expense' },
  { name: '通讯', color: '#6ba5a0', kind: 'expense' },
  { name: '人情', color: '#a855f7', kind: 'expense' },
  { name: '其他支出', color: '#a0a0a0', kind: 'expense' },
  { name: '工资', color: '#10b981', kind: 'income' },
  { name: '奖金', color: '#8bab6b', kind: 'income' },
  { name: '理财收益', color: '#7aab8e', kind: 'income' },
  { name: '其他收入', color: '#8b95a0', kind: 'income' },
]
