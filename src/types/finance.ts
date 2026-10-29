import type { ExtendedViewMode } from './index'

export type FinanceViewMode = ExtendedViewMode

export type FinanceEntryType = 'income' | 'expense'

/** Blind-box draw result for a non-essential expense */
export type FinanceLuck = 'good' | 'normal' | 'bad'

export interface FinanceEntry {
  id: string
  date: string
  description: string
  /** Amount in yuan, always positive; sign is determined by `type` */
  amount: number
  type: FinanceEntryType
  category: string
  createdAt: string
  /** Blind-box result; only present on non-essential expenses that drew one */
  luck?: FinanceLuck
}

export interface FinanceCategory {
  name: string
  color: string
  kind: FinanceEntryType
}

export interface FinanceStorageData {
  version: 1
  entries: FinanceEntry[]
  categories: FinanceCategory[]
  monthlyBudget?: number
  /** Per-category monthly budgets (expense categories), keyed by category name */
  categoryBudgets?: Record<string, number>
  /** Expense categories that trigger the blind-box draw; undefined = defaults */
  nonEssentialCategories?: string[]
}

export interface FinanceCategoryBreakdown {
  amount: number
  percentage: number
  count: number
}

export interface FinanceDailyDataPoint {
  date: string
  label: string
  income: number
  expense: number
}

export interface FinancePeriodSummary {
  income: number
  expense: number
  balance: number
  entryCount: number
  incomeBreakdown: Record<string, FinanceCategoryBreakdown>
  expenseBreakdown: Record<string, FinanceCategoryBreakdown>
  dailyBreakdown: FinanceDailyDataPoint[]
}
