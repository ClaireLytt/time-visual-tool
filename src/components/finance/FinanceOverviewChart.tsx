import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '../../hooks/useTheme'
import { formatAmount } from '../../utils/money'
import { WalletIcon } from '../icons'

interface FinanceOverviewChartProps {
  income: number
  expense: number
  balance: number
}

function FinanceOverviewChart({ income, expense, balance }: FinanceOverviewChartProps) {
  const { t } = useTranslation()
  const { isDark } = useTheme()

  const isOverspent = balance < 0
  const chartData = [
    { name: t('finance.income'), value: income, color: '#10b981' },
    { name: t('finance.expense'), value: expense, color: '#f43f5e' },
  ]
  const visibleData = chartData.filter(d => d.value > 0)
  const total = income + expense

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('finance.chartOverview')}</h3>

      {visibleData.length === 0 ? (
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
                data={visibleData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {visibleData.map(item => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [formatAmount(value), name]}
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
                y="44%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isDark ? '#9ca3af' : '#6b7280'}
                className="text-xs"
              >
                {t('finance.balance')}
              </text>
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isOverspent ? '#dc2626' : (isDark ? '#e5e7eb' : '#1f2937')}
                className="text-sm font-semibold"
              >
                {formatAmount(balance)}
              </text>
            </PieChart>
          </ResponsiveContainer>

          <ul className="space-y-1.5 mt-3">
            {visibleData.map(item => (
              <li key={item.name} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-gray-700 dark:text-gray-200">{item.name}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">{formatAmount(item.value)}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs w-10 text-right">
                  {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default FinanceOverviewChart
