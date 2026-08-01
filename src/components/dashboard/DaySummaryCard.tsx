import type { DaySummary } from '../../types'
import { formatDuration } from '../../utils/time'

interface DaySummaryCardProps {
  summary: DaySummary
}

function DaySummaryCard({ summary }: DaySummaryCardProps) {
  const stats = [
    { label: '总时长', value: formatDuration(summary.totalMinutes) },
    { label: '加权时长', value: formatDuration(Math.round(summary.weightedMinutes)) },
    { label: '记录条数', value: `${summary.entries.length} 条` },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
          <p className="text-lg font-bold text-gray-800">{stat.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

export default DaySummaryCard
