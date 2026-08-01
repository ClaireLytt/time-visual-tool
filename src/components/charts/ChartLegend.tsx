import { getCategoryColor } from '../../constants'
import { formatDuration } from '../../utils/time'
import type { CategoryBreakdown } from '../../types'

interface ChartLegendProps {
  breakdown: Record<string, CategoryBreakdown>
}

function ChartLegend({ breakdown }: ChartLegendProps) {
  const items = Object.entries(breakdown).sort((a, b) => b[1].totalMinutes - a[1].totalMinutes)

  return (
    <div className="space-y-1.5 mt-3">
      {items.map(([category, data]) => (
        <div key={category} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: getCategoryColor(category) }}
          />
          <span className="flex-1 text-gray-700">{category}</span>
          <span className="text-gray-500 text-xs">{formatDuration(data.totalMinutes)}</span>
          <span className="text-gray-400 text-xs w-10 text-right">{data.percentage}%</span>
        </div>
      ))}
    </div>
  )
}

export default ChartLegend
