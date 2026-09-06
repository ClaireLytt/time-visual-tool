import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DailyDataPoint } from '../../types'
import { formatDuration } from '../../utils/time'

interface DailyBreakdownChartProps {
  dailyBreakdown: DailyDataPoint[]
}

function DailyBreakdownChart({ dailyBreakdown }: DailyBreakdownChartProps) {
  const hasData = dailyBreakdown.some(d => d.totalMinutes > 0)

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-400 text-sm">暂无数据</p>
      </div>
    )
  }

  const isMonthly = dailyBreakdown.length > 7

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">每日分布</h3>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={dailyBreakdown} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#52514e' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            interval={isMonthly ? 4 : 0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#52514e' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => value >= 60 ? `${(value / 60).toFixed(0)}h` : `${value}m`}
          />
          <Tooltip
            formatter={(value: number) => [formatDuration(value), '总时长']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />
          <Bar
            dataKey="totalMinutes"
            fill="#2a78d6"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DailyBreakdownChart
