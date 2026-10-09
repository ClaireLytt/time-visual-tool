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
    { label: t('sport.totalDuration'), value: formatDuration(totalDuration), color: 'text-mode-sport' },
    { label: t('sport.totalCalories'), value: `${Math.round(totalCalories).toLocaleString()} ${t('sport.calorieUnit')}`, color: 'text-mode-eating' },
    { label: t('sport.entryCount'), value: t('sport.countUnit', { count: entryCount }), color: 'text-gray-800 dark:text-gray-100' },
    { label: t('sport.avgPerSession'), value: formatDuration(Math.round(averageDurationPerEntry)), color: 'text-calm-accent' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {stats.map(stat => (
        <div key={stat.label} className="panel p-3 text-center">
          <p className={`text-2xl font-bold tracking-display tabular-nums ${stat.color}`}>{stat.value}</p>
          <p className="text-xs tracking-wide uppercase text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  )
})

export default SportSummaryCard
