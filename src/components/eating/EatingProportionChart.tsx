import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { EatingCategoryBreakdown } from '../../types/eating'
import { useCategories } from '../../contexts/CategoryContext'
import { useTheme } from '../../hooks/useTheme'
import { formatCalories } from '../../utils/calories'

interface EatingProportionChartProps {
  categoryBreakdown: Record<string, EatingCategoryBreakdown>
  totalCalories: number
}

function EatingProportionChart({ categoryBreakdown, totalCalories }: EatingProportionChartProps) {
  const { t } = useTranslation()
  const { getColor } = useCategories()
  const { isDark } = useTheme()

  const chartData = Object.entries(categoryBreakdown).map(([name, data]) => ({
    name,
    value: data.calories,
  }))

  const legendItems = Object.entries(categoryBreakdown).sort((a, b) => b[1].calories - a[1].calories)

  return (
    <div className="panel panel-accent p-4" style={{ '--panel-accent': '#9b8db5' } as React.CSSProperties}>
      <h3 className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400 mb-2 mt-0.5">
        {t('eating.chartProportion')}
      </h3>

      {chartData.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-24 h-24 mx-auto mb-3 rounded-full border-4 border-dashed border-calm-border dark:border-gray-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
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
                stroke={isDark ? '#1f2937' : '#fff'}
                strokeWidth={2}
              >
                {chartData.map(entry => (
                  <Cell key={entry.name} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [formatCalories(value), t('category.names.' + name, name)]}
                contentStyle={{
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#2e2e34' : '#e8e7e3'}`,
                  backgroundColor: isDark ? '#1f2937' : '#fff',
                  color: isDark ? '#e5e7eb' : '#111827',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isDark ? '#e5e7eb' : '#1f2937'}
                className="text-sm font-bold"
              >
                {formatCalories(totalCalories)}
              </text>
            </PieChart>
          </ResponsiveContainer>

          <ul className="space-y-1 mt-3">
            {legendItems.map(([cat, data]) => (
              <li key={cat} className="flex items-center gap-2 text-sm py-1 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: getColor(cat), boxShadow: `0 0 4px ${getColor(cat)}30` }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-gray-700 dark:text-gray-200 font-medium">{t('category.names.' + cat, cat)}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs tabular-nums">{formatCalories(data.calories)}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs w-10 text-right tabular-nums font-medium">{data.percentage}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default EatingProportionChart
