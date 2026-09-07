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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
        {t('eating.chartProportion')}
      </h3>

      {chartData.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-24 h-24 mx-auto mb-3 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center">
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
              >
                {chartData.map(entry => (
                  <Cell key={entry.name} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [formatCalories(value), t('category.names.' + name, name)]}
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
                {formatCalories(totalCalories)}
              </text>
            </PieChart>
          </ResponsiveContainer>

          <ul className="space-y-1.5 mt-3">
            {legendItems.map(([cat, data]) => (
              <li key={cat} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: getColor(cat) }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-gray-700 dark:text-gray-200">{t('category.names.' + cat, cat)}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">{formatCalories(data.calories)}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs w-10 text-right">{data.percentage}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default EatingProportionChart
