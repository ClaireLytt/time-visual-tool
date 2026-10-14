import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format, parseISO, isSameMonth, getDaysInMonth } from 'date-fns'
import { useFinanceEntries } from '../../hooks/useFinanceEntries'
import { CategoryProvider } from '../../contexts/CategoryContext'
import DatePicker from '../dashboard/DatePicker'
import ViewModeToggle from '../dashboard/ViewModeToggle'
import CategoryManager, { type ManagedCategory } from '../categories/CategoryManager'
import DataTransfer from '../settings/DataTransfer'
import FinanceSummaryCard from './FinanceSummaryCard'
import FinanceBudgetManager from './FinanceBudgetManager'
import FinanceEntryForm from './FinanceEntryForm'
import FinanceEntryList from './FinanceEntryList'
import FinanceProportionChart from './FinanceProportionChart'
import FinanceOverviewChart from './FinanceOverviewChart'
import FinanceDailyChart from './FinanceDailyChart'
import AnimatedCollapse from '../common/AnimatedCollapse'
import { exportFinanceToFile, readFinanceImportFile } from '../../utils/financeTransfer'
import type { FinanceEntry, FinanceStorageData, FinanceViewMode } from '../../types/finance'

const FINANCE_MODES: readonly FinanceViewMode[] = ['day', 'week', 'month', 'year']

function FinanceDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [viewMode, setViewMode] = useState<FinanceViewMode>('day')
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const {
    entries, categories, data,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory,
    importData,
    getEntriesForDate, getSummaryForPeriod,
    monthlyBudget, setMonthlyBudget,
    categoryBudgets, setCategoryBudget,
  } = useFinanceEntries()

  const dayEntries = useMemo(() => getEntriesForDate(selectedDate), [getEntriesForDate, selectedDate])
  const periodSummary = useMemo(() => getSummaryForPeriod(selectedDate, viewMode), [getSummaryForPeriod, selectedDate, viewMode])
  const monthlySummary = useMemo(() => getSummaryForPeriod(selectedDate, 'month'), [getSummaryForPeriod, selectedDate])

  const isDaily = viewMode === 'day'

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date)
    setEditingEntry(null)
  }, [])

  const handleViewModeChange = useCallback((mode: FinanceViewMode) => {
    setViewMode(mode)
    setEditingEntry(null)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingEntry(null)
  }, [])

  const handleAddCategory = useCallback((category: ManagedCategory) => {
    addCategory({ name: category.name, color: category.color, kind: category.kind ?? 'expense' })
  }, [addCategory])

  const handleUpdateCategory = useCallback((oldName: string, updated: ManagedCategory) => {
    updateCategory(oldName, { name: updated.name, color: updated.color, kind: updated.kind ?? 'expense' })
  }, [updateCategory])


  return (
    <CategoryProvider categories={categories}>
      <div id="main-content">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <ViewModeToggle viewMode={viewMode} modes={FINANCE_MODES} onViewModeChange={handleViewModeChange} />
          <button
            onClick={() => setShowSettings(s => !s)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            aria-label={t('settings.label')}
            aria-expanded={showSettings}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        <AnimatedCollapse open={showSettings}>
          <div className="space-y-4 mb-4">
            <CategoryManager
              categories={categories}
              entries={entries}
              onAdd={handleAddCategory}
              onUpdate={handleUpdateCategory}
              onDelete={deleteCategory}
              withKind
            />
            <FinanceBudgetManager
              key={showSettings ? 'open' : 'closed'}
              categories={categories}
              monthlyBudget={monthlyBudget}
              categoryBudgets={categoryBudgets}
              onSetMonthlyBudget={setMonthlyBudget}
              onSetCategoryBudget={setCategoryBudget}
            />
            <DataTransfer
              data={data}
              onImport={importData}
              onExport={exportFinanceToFile}
              readFile={readFinanceImportFile}
              getCounts={(d: FinanceStorageData) => ({ entries: d.entries.length, categories: d.categories.length })}
            />
          </div>
        </AnimatedCollapse>

        <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} viewMode={viewMode} />
        <FinanceSummaryCard
          income={periodSummary.income}
          expense={periodSummary.expense}
          balance={periodSummary.balance}
          entryCount={periodSummary.entryCount}
        />

        {monthlyBudget != null && monthlyBudget > 0 && (() => {
          const ratio = monthlySummary.expense / monthlyBudget
          const pct = ratio * 100
          const barColor = pct > 90 ? '#c18383' : pct > 60 ? '#c9ab77' : '#86a98d'
          const today = new Date()
          const isCurrentMonth = isSameMonth(parseISO(selectedDate), today)
          const remainingDays = getDaysInMonth(today) - today.getDate() + 1
          const remaining = monthlyBudget - monthlySummary.expense
          const dailyAllowance = remaining > 0 ? remaining / remainingDays : 0
          return (
            <div className="panel p-3 mb-4">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {t('finance.budgetProgress', {
                    spent: `${t('currency.symbol')}${monthlySummary.expense.toLocaleString()}`,
                    budget: `${t('currency.symbol')}${monthlyBudget.toLocaleString()}`,
                  })}
                </span>
                <span className="text-xs font-medium tabular-nums" style={{ color: barColor }}>
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="hp-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemax={100}>
                <div
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    '--hp-color': barColor,
                  } as React.CSSProperties}
                />
              </div>
              {isCurrentMonth && (
                <p className="mt-1.5 text-xs text-calm-muted dark:text-gray-400 tabular-nums">
                  {remaining >= 0
                    ? t('finance.budgetDailyAllowance', {
                        days: remainingDays,
                        amount: `${t('currency.symbol')}${dailyAllowance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                      })
                    : t('finance.budgetOverspent', {
                        amount: `${t('currency.symbol')}${Math.abs(remaining).toLocaleString()}`,
                      })}
                </p>
              )}
            </div>
          )
        })()}

        {/* Category expense breakdown for current month */}
        {(() => {
          const breakdown = monthlySummary.expenseBreakdown
          const allSorted = Object.entries(breakdown)
            .sort(([, a], [, b]) => b.amount - a.amount)
          // Top 6 spenders, plus any budgeted category with spending beyond the top 6
          const sortedCats = allSorted.filter(([name], i) => i < 6 || categoryBudgets?.[name] != null)
          if (sortedCats.length === 0) return null
          const maxAmount = sortedCats[0][1].amount
          return (
            <div className="panel p-3 mb-4">
              <h3 className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400 mb-3">
                {t('finance.categoryBreakdown')}
              </h3>
              <div className="space-y-2">
                {sortedCats.map(([catName, data]) => {
                  const cat = categories.find(c => c.name === catName)
                  const color = cat?.color ?? '#888'
                  const budget = categoryBudgets?.[catName]
                  const budgetPct = budget != null && budget > 0 ? (data.amount / budget) * 100 : null
                  const overBudget = budgetPct != null && budgetPct > 100
                  const nearBudget = budgetPct != null && budgetPct > 90 && budgetPct <= 100
                  const barWidth = budgetPct != null
                    ? Math.min(budgetPct, 100)
                    : maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0
                  return (
                    <div key={catName} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300 w-16 truncate shrink-0">
                        {t('category.names.' + catName, catName)}
                      </span>
                      <div
                        className={`flex-1 h-4 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden ${budgetPct != null ? 'ring-1 ring-inset ring-gray-200 dark:ring-gray-600' : ''}`}
                        {...(budgetPct != null && {
                          role: 'progressbar',
                          'aria-valuenow': Math.round(budgetPct),
                          'aria-valuemax': 100,
                          'aria-label': t('finance.categoryBudgetLabel', { name: t('category.names.' + catName, catName) }),
                        })}
                      >
                        <div
                          className="h-full rounded transition-all duration-300"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: overBudget ? '#c18383' : nearBudget ? '#c9ab77' : color,
                            opacity: 0.8,
                          }}
                        />
                      </div>
                      <span className={`text-xs font-medium tabular-nums text-right shrink-0 ${overBudget ? 'text-[#c47070]' : 'text-gray-600 dark:text-gray-400'} ${budget != null ? 'w-28' : 'w-16'}`}>
                        {t('currency.symbol')}{data.amount.toLocaleString()}
                        {budget != null && (
                          <span className="text-calm-muted dark:text-gray-500"> {t('finance.budgetOf', { budget: budget.toLocaleString() })}</span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {!isDaily && (
          <div className="mb-4">
            <FinanceDailyChart
              dailyBreakdown={periodSummary.dailyBreakdown}
              title={viewMode === 'year' ? t('finance.chartMonthly') : undefined}
            />
          </div>
        )}

        {isDaily && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            <FinanceEntryForm
              selectedDate={selectedDate}
              categories={categories}
              onAdd={addEntry}
              editingEntry={editingEntry}
              onUpdate={updateEntry}
              onCancelEdit={handleCancelEdit}
            />
            <FinanceEntryList entries={dayEntries} onDelete={deleteEntry} onEdit={setEditingEntry} />
          </div>
        )}

        {(viewMode === 'month' || viewMode === 'year') && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6">
            <FinanceProportionChart
              incomeBreakdown={periodSummary.incomeBreakdown}
              expenseBreakdown={periodSummary.expenseBreakdown}
              income={periodSummary.income}
              expense={periodSummary.expense}
            />
            <FinanceOverviewChart
              income={periodSummary.income}
              expense={periodSummary.expense}
              balance={periodSummary.balance}
            />
          </div>
        )}
      </div>
    </CategoryProvider>
  )
}

export default FinanceDashboard
