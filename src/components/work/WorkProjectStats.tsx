import { useMemo } from 'react'
import type { WorkEntry } from '../../types/work'

const PROJECT_COLORS = ['#e67e22', '#0099db', '#3e8948', '#8b5cf6', '#e43b44', '#f4b41a', '#2ce8f5', '#be4a7f']

interface WorkProjectStatsProps {
  entries: WorkEntry[]
}

export default function WorkProjectStats({ entries }: WorkProjectStatsProps) {
  const stats = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of entries) {
      map[e.project] = (map[e.project] || 0) + e.duration
    }
    const items = Object.entries(map).sort((a, b) => b[1] - a[1])
    const max = items.length > 0 ? items[0][1] : 1
    return items.map(([project, duration], i) => ({
      project,
      duration,
      pct: (duration / max) * 100,
      color: PROJECT_COLORS[i % PROJECT_COLORS.length],
    }))
  }, [entries])

  if (stats.length === 0) return null

  return (
    <div className="panel p-4 space-y-2">
      {stats.map(s => (
        <div key={s.project} className="flex items-center gap-3">
          <span className="text-xs w-14 text-right text-gray-500 dark:text-gray-400 shrink-0 truncate">{s.project}</span>
          <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700/50 rounded-sm overflow-hidden">
            <div className="h-full rounded-sm" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
          </div>
          <span className="text-xs tabular-nums text-gray-700 dark:text-gray-300 w-10 shrink-0">
            {s.duration >= 60 ? `${(s.duration / 60).toFixed(1)}h` : `${s.duration}m`}
          </span>
        </div>
      ))}
    </div>
  )
}
