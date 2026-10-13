import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { IELTS_SUBJECTS, SUBJECT_COLORS } from './constants'
import { useIsDark } from './styles'
import { parseScore } from './utils'
import type { IeltsSession, IeltsSubject } from './types'

interface Props { sessions: IeltsSession[] }

export default function ScoreTrendChart({ sessions }: Props) {
  const isDark = useIsDark()
  const [hiddenSubjects, setHiddenSubjects] = useState<Set<IeltsSubject>>(new Set())

  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const tickColor = isDark ? '#9ca3af' : '#6b7280'

  // Build data: group by date, each date has {date, listening, reading, writing, speaking}
  const data = useMemo(() => {
    const byDate = new Map<string, Record<string, string | number | null>>()
    // Sort sessions by date
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
    for (const s of sorted) {
      const score = parseScore(s.score)
      if (score === null) continue
      if (!byDate.has(s.date)) byDate.set(s.date, { date: s.date })
      const row = byDate.get(s.date)!
      // If multiple sessions of same subject on same day, use latest
      row[s.subject] = score
    }
    return Array.from(byDate.values())
  }, [sessions])

  const toggleSubject = (s: IeltsSubject) => {
    setHiddenSubjects(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  if (data.length < 2) return null

  return (
    <div className="panel p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">得分趋势</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
            tickFormatter={(d: string) => d.slice(5)} // "10-11"
          />
          <YAxis
            domain={[0, 9]}
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            tickCount={10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#fff',
              border: `1px solid ${gridColor}`,
              borderRadius: 8,
              fontSize: 13,
            }}
            labelFormatter={(d: string) => d}
            formatter={(value: number, name: string) => [value.toFixed(1), name]}
          />
          {IELTS_SUBJECTS.map(s => (
            !hiddenSubjects.has(s) && (
              <Line
                key={s}
                type="monotone"
                dataKey={s}
                stroke={SUBJECT_COLORS[s]}
                strokeWidth={2}
                dot={{ r: 3, fill: SUBJECT_COLORS[s] }}
                connectNulls
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>
      {/* Legend with toggles */}
      <div className="flex flex-wrap gap-3 justify-center">
        {IELTS_SUBJECTS.map(s => {
          const hidden = hiddenSubjects.has(s)
          return (
            <button
              key={s}
              onClick={() => toggleSubject(s)}
              className={`flex items-center gap-1.5 text-xs font-medium no-press transition-opacity ${hidden ? 'opacity-30' : ''}`}
            >
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: SUBJECT_COLORS[s] }} />
              {s === 'listening' ? '听力' : s === 'reading' ? '阅读' : s === 'writing' ? '写作' : '口语'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
