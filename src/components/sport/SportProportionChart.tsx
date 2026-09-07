import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { SportCategoryBreakdown } from '../../types/sport'
import { useCategories } from '../../contexts/CategoryContext'
import { useTheme } from '../../hooks/useTheme'
import { formatDuration } from '../../utils/time'

interface SportProportionChartProps {
  categoryBreakdown: Record<string, SportCategoryBreakdown>
  totalDuration: number
}

function SportProportionChart({ categoryBreakdown, totalDuration }: SportProportionChartProps) {
  const { t } = useTranslation()
  const { getColor } = useCategories()
  const { isDark } = useTheme()

  const chartData = Object.entries(categoryBreakdown).map(([name, data]) => ({
    name,
    value: data.duration,
  }))

  const legendItems = Object.entries(categoryBreakdown).sort((a, b) => b[1].duration - a[1].duration)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
        {t('sport.chartProportion')}
      </h3>

      {chartData.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-24 h-24 mx-auto mb-3 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14.4 14.4 9.6 9.6" />
              <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767-1.768a2 2 0 1 1-2.829-2.828l6.364-6.364a2 2 0 1 1 2.829 2.828l1.767 1.768a2 2 0 1 1 2.829 2.828z" />
              <path d="m21.5 21.5-1.4-1.4" />
              <path d="M3.9 3.9 2.5 2.5" />
              <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l6.364-6.364a2 2 0 1 1 2.828 2.829l-1.767 1.767a2 2 0 1 1 2.828 2.829z" />
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
                formatter={(value: number, name: string) => [formatDuration(value), t('category.names.' + name, name)]}
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
                {formatDuration(totalDuration)}
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
                <span className="text-gray-500 dark:text-gray-400 text-xs">{formatDuration(data.duration)}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">{Math.round(data.calories)} {t('sport.calorieUnit')}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs w-10 text-right">{data.percentage}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default SportProportionChart
