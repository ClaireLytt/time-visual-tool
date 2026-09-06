import { formatDuration } from '../../utils/time'

interface SummaryCardProps {
  totalMinutes: number
  weightedMinutes: number
  entryCount: number
}

function DaySummaryCard({ totalMinutes, weightedMinutes, entryCount }: SummaryCardProps) {
  const stats = [
    { label: '总时长', value: formatDuration(totalMinutes) },
    { label: '加权时长', value: formatDuration(Math.round(weightedMinutes)) },
    { label: '记录条数', value: `${entryCount} 条` },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{stat.value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

export default DaySummaryCard
