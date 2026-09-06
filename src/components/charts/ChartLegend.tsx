import { useTranslation } from 'react-i18next'
import { useCategories } from '../../contexts/CategoryContext'
import { formatDuration } from '../../utils/time'
import type { CategoryBreakdown } from '../../types'

interface ChartLegendProps {
  breakdown: Record<string, CategoryBreakdown>
}

function ChartLegend({ breakdown }: ChartLegendProps) {
  const { t } = useTranslation()
  const { getColor } = useCategories()
  const items = Object.entries(breakdown).sort((a, b) => b[1].totalMinutes - a[1].totalMinutes)

  return (
    <ul className="space-y-1.5 mt-3">
      {items.map(([category, data]) => (
        <li key={category} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: getColor(category) }}
            aria-hidden="true"
          />
          <span className="flex-1 text-gray-700 dark:text-gray-200">{t('category.names.' + category, category)}</span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">{formatDuration(data.totalMinutes)}</span>
          <span className="text-gray-400 dark:text-gray-500 text-xs w-10 text-right">{data.percentage}%</span>
        </li>
      ))}
    </ul>
  )
}

export default ChartLegend
