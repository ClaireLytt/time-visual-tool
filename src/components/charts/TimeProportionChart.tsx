import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategoryBreakdown } from '../../types'
import { useCategories } from '../../contexts/CategoryContext'
import { useTheme } from '../../hooks/useTheme'
import { formatDuration } from '../../utils/time'
import { ClockIcon } from '../icons'
import ChartLegend from './ChartLegend'

interface TimeProportionChartProps {
  categoryBreakdown: Record<string, CategoryBreakdown>
  totalMinutes: number
}

function TimeProportionChart({ categoryBreakdown, totalMinutes }: TimeProportionChartProps) {
  const { t } = useTranslation()
  const { getColor } = useCategories()
  const { isDark } = useTheme()
  const chartData = Object.entries(categoryBreakdown).map(([name, data]) => ({
    name,
    value: data.totalMinutes,
  }))

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <div className="w-24 h-24 mx-auto mb-3 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center">
          <ClockIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('chart.noData')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('chart.proportion')}</h3>

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
            formatter={(value: number) => formatDuration(value)}
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
            {formatDuration(totalMinutes)}
          </text>
        </PieChart>
      </ResponsiveContainer>

      <ChartLegend breakdown={categoryBreakdown} />
    </div>
  )
}

export default TimeProportionChart
