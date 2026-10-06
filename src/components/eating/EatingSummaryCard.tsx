import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCalories } from '../../utils/calories'

interface EatingSummaryCardProps {
  totalCalories: number
  entryCount: number
  averageCaloriesPerEntry: number
  lateNightCount: number
}

const EatingSummaryCard = memo(function EatingSummaryCard({ totalCalories, entryCount, averageCaloriesPerEntry, lateNightCount }: EatingSummaryCardProps) {
  const { t } = useTranslation()

  const stats = [
    { label: t('eating.totalCalories'), value: formatCalories(totalCalories), color: 'text-mode-eating', tint: 'bg-amber-50/60 dark:bg-amber-900/10', accent: '#c4a36b' },
    { label: t('eating.entryCount'), value: t('eating.countUnit', { count: entryCount }), color: 'text-gray-800 dark:text-gray-100', tint: 'bg-gray-50/60 dark:bg-gray-800', accent: '#8a8a8a' },
    { label: t('eating.avgPerMeal'), value: formatCalories(averageCaloriesPerEntry), color: 'text-calm-accent', tint: 'bg-blue-50/40 dark:bg-blue-900/10', accent: '#6b8db5' },
    { label: t('eating.lateNightCount'), value: t('eating.countTimes', { count: lateNightCount }), color: lateNightCount > 0 ? 'text-[#c47070]' : 'text-gray-800 dark:text-gray-100', tint: lateNightCount > 0 ? 'bg-red-50/40 dark:bg-red-900/10' : 'bg-gray-50/60 dark:bg-gray-800', accent: lateNightCount > 0 ? '#c47070' : '#8a8a8a' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {stats.map(stat => (
        <div
          key={stat.label}
          className={`stat-card ${stat.tint}`}
          style={{ '--panel-accent': stat.accent } as React.CSSProperties}
        >
          <div className="w-8 h-0.5 rounded-full mx-auto mb-2 opacity-60" style={{ backgroundColor: stat.accent }} />
          <p className={`text-2xl font-bold tracking-display tabular-nums ${stat.color}`}>{stat.value}</p>
          <p className="text-xs tracking-wide uppercase text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  )
})

export default EatingSummaryCard
