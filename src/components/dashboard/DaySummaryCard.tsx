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
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-4 mb-5">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className={`panel ${i === 0 ? 'pt-6 pb-4 pl-5 pr-4' : 'p-3'} ${i === 0 ? 'text-left' : 'text-center'}`}
          initial={{ opacity: 0, transform: 'translateY(6px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{
            duration: 0.3,
            ease: [0.23, 1, 0.32, 1],
            delay: i * 0.05,
          }}
        >
          <p className="font-pixel text-[7px] text-px-blue dark:text-px-blue mb-2">{stat.label}</p>
          <p className={`${i === 0 ? 'text-3xl' : 'text-xl'} font-bold tabular-nums tracking-display text-gray-900 dark:text-gray-100`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  )
})

export default DaySummaryCard
