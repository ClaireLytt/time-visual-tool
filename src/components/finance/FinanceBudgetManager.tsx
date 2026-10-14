import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { FinanceCategory } from '../../types/finance'

const MIN_MONTHLY = 100
const MIN_CATEGORY = 1
const MAX_BUDGET = 1000000

interface FinanceBudgetManagerProps {
  categories: FinanceCategory[]
  monthlyBudget: number | undefined
  categoryBudgets: Record<string, number> | undefined
  onSetMonthlyBudget: (budget: number | undefined) => void
  onSetCategoryBudget: (name: string, budget: number | undefined) => void
}

/** Parses a budget input string; '' clears, invalid returns 'invalid'. */
function parseBudget(value: string, min: number): number | undefined | 'invalid' {
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  const num = Number(trimmed)
  if (!Number.isFinite(num) || num < min || num > MAX_BUDGET) return 'invalid'
  return Math.round(num)
}

function FinanceBudgetManager({
  categories, monthlyBudget, categoryBudgets,
  onSetMonthlyBudget, onSetCategoryBudget,
}: FinanceBudgetManagerProps) {
  const { t } = useTranslation()
  const [monthlyInput, setMonthlyInput] = useState(() => monthlyBudget != null ? String(monthlyBudget) : '')
  const [catInputs, setCatInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const [name, value] of Object.entries(categoryBudgets ?? {})) init[name] = String(value)
    return init
  })

  const expenseCategories = categories.filter(c => c.kind === 'expense')

  const commitMonthly = useCallback(() => {
    const parsed = parseBudget(monthlyInput, MIN_MONTHLY)
    if (parsed === 'invalid') {
      setMonthlyInput(monthlyBudget != null ? String(monthlyBudget) : '')
      return
    }
    onSetMonthlyBudget(parsed)
    setMonthlyInput(parsed != null ? String(parsed) : '')
  }, [monthlyInput, monthlyBudget, onSetMonthlyBudget])

  const commitCategory = useCallback((name: string) => {
    const raw = catInputs[name] ?? ''
    const parsed = parseBudget(raw, MIN_CATEGORY)
    const current = categoryBudgets?.[name]
    if (parsed === 'invalid') {
      setCatInputs(prev => ({ ...prev, [name]: current != null ? String(current) : '' }))
      return
    }
    onSetCategoryBudget(name, parsed)
    setCatInputs(prev => ({ ...prev, [name]: parsed != null ? String(parsed) : '' }))
  }, [catInputs, categoryBudgets, onSetCategoryBudget])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur()
  }, [])

  const inputClass = 'w-28 px-2 py-1.5 text-sm text-right tabular-nums rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-calm-accent'

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400 mb-3">
        {t('finance.budgetSettings')}
      </h3>
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
        <label htmlFor="finance-monthly-budget" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('finance.budgetTitle')}
        </label>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('currency.symbol')}</span>
          <input
            id="finance-monthly-budget"
            type="number"
            inputMode="numeric"
            min={MIN_MONTHLY}
            max={MAX_BUDGET}
            placeholder={t('finance.budgetPlaceholder')}
            value={monthlyInput}
            onChange={e => setMonthlyInput(e.target.value)}
            onBlur={commitMonthly}
            onKeyDown={handleKeyDown}
            className={inputClass}
          />
        </div>
      </div>
      <p className="text-xs text-calm-muted dark:text-gray-400 mb-2">{t('finance.categoryBudgetHint')}</p>
      <div className="space-y-2">
        {expenseCategories.map(cat => (
          <div key={cat.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} aria-hidden="true" />
              <span className="truncate">{t('category.names.' + cat.name, cat.name)}</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('currency.symbol')}</span>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_CATEGORY}
                max={MAX_BUDGET}
                placeholder={t('finance.noBudget')}
                aria-label={t('finance.categoryBudgetLabel', { name: t('category.names.' + cat.name, cat.name) })}
                value={catInputs[cat.name] ?? ''}
                onChange={e => setCatInputs(prev => ({ ...prev, [cat.name]: e.target.value }))}
                onBlur={() => commitCategory(cat.name)}
                onKeyDown={handleKeyDown}
                className={inputClass}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FinanceBudgetManager
