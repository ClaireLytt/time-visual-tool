import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategoryBreakdown } from '../../types'
import { getCategoryColor } from '../../constants'
import { formatDuration } from '../../utils/time'
import ChartLegend from './ChartLegend'

interface TimeProportionChartProps {
  categoryBreakdown: Record<string, CategoryBreakdown>
  totalMinutes: number
}

function TimeProportionChart({ categoryBreakdown, totalMinutes }: TimeProportionChartProps) {
  const chartData = Object.entries(categoryBreakdown).map(([name, data]) => ({
    name,
    value: data.totalMinutes,
  }))

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="w-24 h-24 mx-auto mb-3 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <p className="text-gray-400 text-sm">暂无数据</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">时间占比</h3>

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
              <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatDuration(value)}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-gray-800 font-semibold">
            {formatDuration(totalMinutes)}
          </text>
        </PieChart>
      </ResponsiveContainer>

      <ChartLegend breakdown={categoryBreakdown} />
    </div>
  )
}

export default TimeProportionChart
