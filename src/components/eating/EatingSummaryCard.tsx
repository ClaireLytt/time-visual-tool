import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCalories } from '../../utils/calories'

interface EatingSummaryCardProps {
  totalCalories: number
  entryCount: number
  averageCaloriesPerEntry: number
  lateNightCount: number
  dailyAverage?: number
  calorieGoal?: number
}

const EatingSummaryCard = memo(function EatingSummaryCard({ totalCalories, entryCount, averageCaloriesPerEntry, lateNightCount, dailyAverage, calorieGoal }: EatingSummaryCardProps) {
  const { t } = useTranslation()

  // Goal comparison for multi-day views
  const goalDiff = dailyAverage != null && calorieGoal != null && calorieGoal > 0
    ? Math.round(dailyAverage - calorieGoal)
    : null
  const isOverGoal = goalDiff !== null && goalDiff > 0

  const stats = [
    { label: t('eating.totalCalories'), value: formatCalories(totalCalories), color: 'text-mode-eating', tint: 'bg-amber-50/60 dark:bg-amber-900/10', accent: '#c4a36b' },
    { label: t('eating.entryCount'), value: t('eating.countUnit', { count: entryCount }), color: 'text-gray-800 dark:text-gray-100', tint: 'bg-gray-50/60 dark:bg-gray-800', accent: '#8a8a8a' },
    ...(dailyAverage != null ? [{
      label: t('eating.dailyAvg'),
      value: formatCalories(dailyAverage),
      color: isOverGoal ? 'text-[#c47070]' : 'text-[#7aab8e]',
      tint: isOverGoal ? 'bg-red-50/40 dark:bg-red-900/10' : 'bg-green-50/40 dark:bg-green-900/10',
      accent: isOverGoal ? '#c47070' : '#7aab8e',
      sub: goalDiff !== null ? `${goalDiff > 0 ? '+' : ''}${goalDiff.toLocaleString('en-US')}` : undefined,
    }] : [{
      label: t('eating.avgPerMeal'), value: formatCalories(averageCaloriesPerEntry), color: 'text-calm-accent', tint: 'bg-blue-50/40 dark:bg-blue-900/10', accent: '#6b8db5',
    }]),
    { label: t('eating.lateNightCount'), value: t('eating.countTimes', { count: lateNightCount }), color: lateNightCount > 0 ? 'text-[#c47070]' : 'text-gray-800 dark:text-gray-100', tint: lateNightCount > 0 ? 'bg-red-50/40 dark:bg-red-900/10' : 'bg-gray-50/60 dark:bg-gray-800', accent: lateNightCount > 0 ? '#c47070' : '#8a8a8a' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-4 mb-5">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`stat-card ${i === 0 ? 'pt-6 pb-4 pl-5 pr-4 text-left' : 'p-3 text-center'}`}
          style={{ borderTopColor: stat.accent } as React.CSSProperties}
        >
          <p className="font-pixel text-[7px] text-px-orange dark:text-px-orange mb-2">{stat.label}</p>
          <p className={`${i === 0 ? 'text-3xl' : 'text-lg'} font-bold tabular-nums tracking-display ${stat.color}`}>{stat.value}</p>
          {'sub' in stat && stat.sub && (
            <p className={`text-[10px] font-semibold tabular-nums mt-0.5 ${isOverGoal ? 'text-[#c47070]' : 'text-[#7aab8e]'}`}>
              {stat.sub} {t('eating.vsGoal')}
            </p>
          )}
        </div>
      ))}
    </div>
  )
})

export default EatingSummaryCard
