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
