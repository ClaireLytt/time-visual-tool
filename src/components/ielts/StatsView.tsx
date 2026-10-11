/* ─── IELTS — Weakness Statistics ─── */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { useIeltsMistakes, useIeltsSessions } from './hooks'
import { IELTS_SUBJECTS, SUBJECT_COLORS } from './constants'
import { ACCENT, useIsDark } from './styles'
import ScoreTrendChart from './ScoreTrendChart'
import type { IeltsSubject } from './types'

type DateRange = '7d' | '30d' | '90d' | 'all'

export default function StatsView() {
  const { t } = useTranslation()
  const [subject, setSubject] = useState<IeltsSubject | 'all'>('all')
  const [range, setRange] = useState<DateRange>('30d')
  const { entries: allMistakes } = useIeltsMistakes()
  const { entries: allSessions } = useIeltsSessions()

  const filtered = useMemo(() => {
    let list = allMistakes
    if (range !== 'all') {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
      const after = format(subDays(new Date(), days), 'yyyy-MM-dd')
      list = list.filter(m => m.date >= after)
    }
    if (subject !== 'all') {
      // Filter by session's subject — not by tag (tags like '词汇'/'语法' overlap)
      const sessionSubject = new Map(allSessions.map(s => [s.id, s.subject]))
      list = list.filter(m => sessionSubject.get(m.sessionId) === subject)
    }
    return list
  }, [allMistakes, allSessions, subject, range])

  const tagData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of filtered) counts.set(m.tag, (counts.get(m.tag) ?? 0) + 1)
    const total = filtered.length || 1
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count, percentage: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
  }, [filtered])

  const topWeakness = tagData[0]
  const isDark = useIsDark()
  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const tickColor = isDark ? '#9ca3af' : '#6b7280'

  const RANGES: { key: DateRange; label: string }[] = [
    { key: '7d', label: t('ielts.last7d') },
    { key: '30d', label: t('ielts.last30d') },
    { key: '90d', label: t('ielts.last90d') },
    { key: 'all', label: t('ielts.allTime') },
  ]

  return (
    <div className="space-y-3">
      {/* Filters — subjects left, time range right, unified row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSubject('all')}
          className={`h-10 px-4 rounded-lg text-sm font-medium transition-all select-none no-press active:scale-[0.97] ${
            subject === 'all'
              ? 'bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-800 shadow-sm'
              : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('ielts.allSubjects')}
        </button>
        {IELTS_SUBJECTS.map(s => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            className={`h-10 px-4 rounded-lg text-sm font-medium transition-all select-none no-press active:scale-[0.97] ${
              subject === s
                ? 'text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-gray-600'
            }`}
            style={subject === s ? { backgroundColor: SUBJECT_COLORS[s] } : undefined}
          >
            {t(`ielts.${s}`)}
          </button>
        ))}

        <div className="flex-1 min-w-[16px]" />

        {RANGES.map(r => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-all select-none no-press active:scale-[0.97] ${
              range === r.key
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold'
                : 'bg-gray-50 dark:bg-gray-800/40 text-gray-400 hover:text-gray-600'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {tagData.length > 0 ? (
        <div className="panel p-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tagData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="tag" tick={{ fontSize: 12, fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#fff',
                  border: `1px solid ${gridColor}`,
                  borderRadius: 8,
                  fontSize: 13,
                }}
                formatter={(value: number) => [`${value} 次`, '错误数']}
              />
              <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {topWeakness && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              {t('ielts.topWeakness')}：
              <span className="font-semibold text-[#c0392b] ml-1">{topWeakness.tag}</span>
              <span className="text-gray-400 ml-1">({topWeakness.percentage}%，{topWeakness.count}次)</span>
            </p>
          )}
        </div>
      ) : (
        <div className="panel p-10 text-center space-y-3">
          <p className="text-3xl">📊</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            导入或记录几场练习后，这里会显示错因分布
          </p>
          <p className="text-xs text-gray-400">
            切换到「记录」或「导入」页面添加数据
          </p>
        </div>
      )}

      {/* Ranked list */}
      {tagData.length > 0 && (
        <div className="panel p-4 space-y-2.5">
          {tagData.map((d, i) => (
            <div key={d.tag} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-4 text-right tabular-nums">{i + 1}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">{d.tag}</span>
              <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${d.percentage}%`, backgroundColor: ACCENT }} />
              </div>
              <span className="text-xs text-gray-400 tabular-nums w-12 text-right">{d.percentage}%</span>
            </div>
          ))}
        </div>
      )}
      {/* Score trend chart */}
      {allSessions.length > 1 && (
        <ScoreTrendChart sessions={allSessions} />
      )}
    </div>
  )
}
