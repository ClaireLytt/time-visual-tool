import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../../utils/time'

interface SportSummaryCardProps {
  totalDuration: number
  totalCalories: number
  entryCount: number
  averageDurationPerEntry: number
}

const SportSummaryCard = memo(function SportSummaryCard({ totalDuration, totalCalories, entryCount, averageDurationPerEntry }: SportSummaryCardProps) {
  const { t } = useTranslation()

  const stats = [
    { label: t('sport.totalDuration'), value: formatDuration(totalDuration), color: 'text-teal-600 dark:text-teal-400' },
    { label: t('sport.totalCalories'), value: `${Math.round(totalCalories)} ${t('sport.calorieUnit')}`, color: 'text-amber-600 dark:text-amber-400' },
    { label: t('sport.entryCount'), value: t('sport.countUnit', { count: entryCount }), color: 'text-gray-800 dark:text-gray-100' },
    { label: t('sport.avgPerSession'), value: formatDuration(Math.round(averageDurationPerEntry)), color: 'text-blue-600 dark:text-blue-400' },
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

export default SportSummaryCard
