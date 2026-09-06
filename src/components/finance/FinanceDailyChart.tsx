import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { FinanceDailyDataPoint } from '../../types/finance'
import { useTheme } from '../../hooks/useTheme'
import { formatAmount } from '../../utils/money'

interface FinanceDailyChartProps {
  dailyBreakdown: FinanceDailyDataPoint[]
  title?: string
}

function FinanceDailyChart({ dailyBreakdown, title }: FinanceDailyChartProps) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const hasData = dailyBreakdown.some(d => d.income > 0 || d.expense > 0)

  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const tickColor = isDark ? '#9ca3af' : '#52514e'
  const incomeColor = '#10b981'
  const expenseColor = '#f43f5e'

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('chart.noData')}</p>
      </div>
    )
  }

  const isMonthly = dailyBreakdown.length > 12

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{title ?? t('finance.chartDaily')}</h3>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={dailyBreakdown} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: tickColor }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
            interval={isMonthly ? 4 : 0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: tickColor }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => value >= 10000 ? `${(value / 10000).toFixed(1)}w` : `${value}`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatAmount(value), name]}
            contentStyle={{
              borderRadius: '8px',
              border: `1px solid ${gridColor}`,
              backgroundColor: isDark ? '#1f2937' : '#fff',
              color: isDark ? '#e5e7eb' : '#111827',
              fontSize: '13px',
            }}
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar
            dataKey="income"
            name={t('finance.income')}
            fill={incomeColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
          />
          <Bar
            dataKey="expense"
            name={t('finance.expense')}
            fill={expenseColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FinanceDailyChart
