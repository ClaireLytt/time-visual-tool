import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { formatDuration } from '../../utils/time'

interface SummaryCardProps {
  totalMinutes: number
  weightedMinutes: number
  entryCount: number
}

/**
 * Gate: seen 1–3 times/day on date change → occasional. Purpose: preventing jarring change.
 * Tool: motion — needs stagger which CSS can do but motion is already in the project.
 * Budget: 300ms ease-out with 50ms stagger. Reduced-motion: opacity only.
 */
const DaySummaryCard = memo(function DaySummaryCard({ totalMinutes, weightedMinutes, entryCount }: SummaryCardProps) {
  const { t } = useTranslation()

  const stats = [
    { label: t('summary.totalDuration'), value: formatDuration(totalMinutes) },
    { label: t('summary.weightedDuration'), value: formatDuration(Math.round(weightedMinutes)) },
    { label: t('summary.entryCount'), value: t('summary.countUnit', { count: entryCount }) },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-calm-border dark:border-gray-700 shadow-card p-3 text-center"
          initial={{ opacity: 0, transform: 'translateY(6px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{
            duration: 0.3,
            ease: [0.23, 1, 0.32, 1],
            delay: i * 0.05,
          }}
        >
          <p className="text-2xl font-bold tracking-display tabular-nums text-gray-800 dark:text-gray-100">{stat.value}</p>
          <p className="text-xs tracking-wide uppercase text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
})

export default DaySummaryCard
