import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { FinanceCategoryBreakdown, FinanceEntryType } from '../../types/finance'
import { useCategories } from '../../contexts/CategoryContext'
import { useTheme } from '../../hooks/useTheme'
import { formatAmount } from '../../utils/money'
import { WalletIcon } from '../icons'

interface FinanceProportionChartProps {
  incomeBreakdown: Record<string, FinanceCategoryBreakdown>
  expenseBreakdown: Record<string, FinanceCategoryBreakdown>
  income: number
  expense: number
}

function FinanceProportionChart({ incomeBreakdown, expenseBreakdown, income, expense }: FinanceProportionChartProps) {
  const { t } = useTranslation()
  const { getColor } = useCategories()
  const { isDark } = useTheme()
  const [chartType, setChartType] = useState<FinanceEntryType>('expense')

  const breakdown = chartType === 'expense' ? expenseBreakdown : incomeBreakdown
  const total = chartType === 'expense' ? expense : income
  const chartData = Object.entries(breakdown).map(([name, data]) => ({
    name,
    value: data.amount,
  }))

  const legendItems = Object.entries(breakdown).sort((a, b) => b[1].amount - a[1].amount)

  const typeToggle = (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 text-xs" role="radiogroup" aria-label={t('finance.chartTypeLabel')}>
      {(['expense', 'income'] as const).map(type => (
        <button
          key={type}
          type="button"
          role="radio"
          aria-checked={chartType === type}
          onClick={() => setChartType(type)}
          className={`px-2 py-1 font-medium transition-colors ${chartType === type ? (type === 'expense' ? 'bg-rose-500 text-white' : 'bg-green-500 text-white') : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
          {t(type === 'expense' ? 'finance.expense' : 'finance.income')}
        </button>
      ))}
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t('finance.chartProportion', { type: t(chartType === 'expense' ? 'finance.expense' : 'finance.income') })}
        </h3>
        {typeToggle}
      </div>

      {chartData.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-24 h-24 mx-auto mb-3 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <WalletIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">{t('chart.noData')}</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map(entry => (
                  <Cell key={entry.name} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [formatAmount(value), t('category.names.' + name, name)]}
                contentStyle={{
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  backgroundColor: isDark ? '#1f2937' : '#fff',
                  color: isDark ? '#e5e7eb' : '#111827',
                  fontSize: '13px',
                }}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isDark ? '#e5e7eb' : '#1f2937'}
                className="text-sm font-semibold"
              >
                {formatAmount(total)}
              </text>
            </PieChart>
          </ResponsiveContainer>

          <ul className="space-y-1.5 mt-3">
            {legendItems.map(([category, data]) => (
              <li key={category} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: getColor(category) }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-gray-700 dark:text-gray-200">{t('category.names.' + category, category)}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">{formatAmount(data.amount)}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs w-10 text-right">{data.percentage}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default FinanceProportionChart
