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
    { label: t('eating.totalCalories'), value: formatCalories(totalCalories), color: 'text-amber-600 dark:text-amber-400' },
    { label: t('eating.entryCount'), value: t('eating.countUnit', { count: entryCount }), color: 'text-gray-800 dark:text-gray-100' },
    { label: t('eating.avgPerMeal'), value: formatCalories(averageCaloriesPerEntry), color: 'text-blue-600 dark:text-blue-400' },
    { label: t('eating.lateNightCount'), value: t('eating.countTimes', { count: lateNightCount }), color: lateNightCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
          <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  )
})

export default EatingSummaryCard
