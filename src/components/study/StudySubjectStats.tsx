import { useMemo } from 'react'
import type { StudyEntry } from '../../types/study'

const SUBJECT_COLORS: Record<string, string> = {
  '数学': '#e43b44',
  '英语': '#0099db',
  '编程': '#3e8948',
  '阅读': '#8b5cf6',
  '其他': '#f4b41a',
}

interface StudySubjectStatsProps {
  entries: StudyEntry[]
}

export default function StudySubjectStats({ entries }: StudySubjectStatsProps) {
  const stats = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of entries) {
      map[e.subject] = (map[e.subject] || 0) + e.duration
    }
    const items = Object.entries(map).sort((a, b) => b[1] - a[1])
    const max = items.length > 0 ? items[0][1] : 1
    return items.map(([subject, duration]) => ({
      subject,
      duration,
      pct: (duration / max) * 100,
      color: SUBJECT_COLORS[subject] || '#999',
    }))
  }, [entries])

  if (stats.length === 0) return null

  return (
    <div className="panel p-4 space-y-2">
      {stats.map(s => (
        <div key={s.subject} className="flex items-center gap-3">
          <span className="text-xs w-12 text-right text-gray-500 dark:text-gray-400 shrink-0">{s.subject}</span>
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
