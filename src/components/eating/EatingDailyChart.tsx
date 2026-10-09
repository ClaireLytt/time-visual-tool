import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import type { EatingDailyDataPoint } from '../../types/eating'
import { useTheme } from '../../hooks/useTheme'
import { formatCalories } from '../../utils/calories'

interface EatingDailyChartProps {
  dailyBreakdown: EatingDailyDataPoint[]
  title?: string
  calorieGoal?: number
}

function EatingDailyChart({ dailyBreakdown, title, calorieGoal }: EatingDailyChartProps) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const hasData = dailyBreakdown.some(d => d.calories > 0)

  const gridColor = isDark ? '#2e2e34' : '#e8e7e3'
  const tickColor = isDark ? '#9ca3af' : '#52514e'
  const barColor = '#c4a36b'
  const barHoverColor = '#b3924f'

  if (!hasData) {
    return (
      <div className="panel p-6 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('chart.noData')}</p>
      </div>
    )
  }

  const isMonthly = dailyBreakdown.length > 12

  return (
    <div className="panel panel-accent p-4" style={{ '--panel-accent': '#c4a36b' } as React.CSSProperties}>
      <h3 className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400 mb-3 mt-0.5">{title ?? t('eating.chartDaily')}</h3>

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
            formatter={(value: number) => [formatCalories(value), t('eating.totalCalories')]}
            contentStyle={{
              borderRadius: '12px',
              border: `1px solid ${gridColor}`,
              backgroundColor: isDark ? '#1f2937' : '#fff',
              color: isDark ? '#e5e7eb' : '#111827',
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(196,163,107,0.06)' }}
          />
          {calorieGoal != null && calorieGoal > 0 && (
            <ReferenceLine
              y={calorieGoal}
              stroke={isDark ? '#c47070' : '#c47070'}
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: `${t('eating.goalLabel')} ${calorieGoal.toLocaleString('en-US')}`,
                position: 'right',
                fill: isDark ? '#c47070' : '#c47070',
                fontSize: 10,
                fontWeight: 600,
              }}
            />
          )}
          <Bar
            dataKey="calories"
            name={t('eating.totalCalories')}
            fill={barColor}
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EatingDailyChart
