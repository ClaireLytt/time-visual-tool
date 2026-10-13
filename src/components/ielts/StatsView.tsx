/* ─── IELTS — Weakness Statistics ─── */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import {
  BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { useIeltsMistakes, useIeltsSessions } from './hooks'
import { IELTS_SUBJECTS, SUBJECT_COLORS } from './constants'
import { ACCENT, useIsDark, btnToggle } from './styles'
import { parseScore } from './utils'
import { getTargetScores } from './SettingsModal'
import ScoreTrendChart from './ScoreTrendChart'
import type { IeltsSubject } from './types'

type DateRange = '7d' | '30d' | '90d' | 'all'

const RANGES: { key: DateRange; label: string }[] = [
  { key: '7d',  label: '近7天' },
  { key: '30d', label: '近30天' },
  { key: '90d', label: '近90天' },
  { key: 'all', label: '全部' },
]

/** Get date boundary for a range */
function rangeAfter(range: DateRange): string {
  if (range === 'all') return ''
  const days = range === '7d' ? 6 : range === '30d' ? 29 : 89
  return format(subDays(new Date(), days), 'yyyy-MM-dd')
}

/** Get the "previous period" boundary for comparison */
function prevRangeAfter(range: DateRange): { from: string; to: string } | null {
  if (range === 'all') return null
  const days = range === '7d' ? 6 : range === '30d' ? 29 : 89
  return {
    from: format(subDays(new Date(), days * 2 + 1), 'yyyy-MM-dd'),
    to: format(subDays(new Date(), days + 1), 'yyyy-MM-dd'),
  }
}

export default function StatsView() {
  const { t } = useTranslation()
  const [, setSearchParams] = useSearchParams()
  const [subject, setSubject] = useState<IeltsSubject | 'all'>('all')
  const [range, setRange] = useState<DateRange>('30d')
  const [highlightTag, setHighlightTag] = useState<string | null>(null)
  const { entries: allMistakes } = useIeltsMistakes()
  const { entries: allSessions } = useIeltsSessions()

  const isDark = useIsDark()
  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const tickColor = isDark ? '#9ca3af' : '#6b7280'

  const sessionSubjectMap = useMemo(() => new Map(allSessions.map(s => [s.id, s.subject])), [allSessions])

  const subjectMistakeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of allMistakes) {
      const subj = sessionSubjectMap.get(m.sessionId)
      if (subj) counts.set(subj, (counts.get(subj) ?? 0) + 1)
    }
    return counts
  }, [allMistakes, sessionSubjectMap])

  // Current period mistakes
  const filtered = useMemo(() => {
    let list = allMistakes
    const after = rangeAfter(range)
    if (after) list = list.filter(m => m.date >= after)
    if (subject !== 'all') list = list.filter(m => sessionSubjectMap.get(m.sessionId) === subject)
    return list
  }, [allMistakes, sessionSubjectMap, subject, range])

  // Previous period mistakes (for comparison arrows)
  const prevFiltered = useMemo(() => {
    const prev = prevRangeAfter(range)
    if (!prev) return []
    let list = allMistakes.filter(m => m.date >= prev.from && m.date <= prev.to)
    if (subject !== 'all') list = list.filter(m => sessionSubjectMap.get(m.sessionId) === subject)
    return list
  }, [allMistakes, sessionSubjectMap, subject, range])

  // Previous period tag counts
  const prevTagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of prevFiltered) counts.set(m.tag, (counts.get(m.tag) ?? 0) + 1)
    return counts
  }, [prevFiltered])

  const tagData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of filtered) counts.set(m.tag, (counts.get(m.tag) ?? 0) + 1)
    const total = filtered.length || 1
    return Array.from(counts.entries())
      .map(([tag, count]) => {
        const prev = prevTagCounts.get(tag) ?? 0
        const delta = count - prev
        return { tag, count, percentage: Math.round((count / total) * 100), prev, delta }
      })
      .sort((a, b) => b.count - a.count)
  }, [filtered, prevTagCounts])

  const radarData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of filtered) {
      if (m.questionType) counts.set(m.questionType, (counts.get(m.questionType) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [filtered])

  // Sessions for trend chart
  const filteredSessions = useMemo(() => {
    let list = allSessions
    const after = rangeAfter(range)
    if (after) list = list.filter(s => s.date >= after)
    if (subject !== 'all') list = list.filter(s => s.subject === subject)
    return list
  }, [allSessions, subject, range])

  // Target score radar: current avg per subject vs user-set target
  const scoreRadarData = useMemo(() => {
    const targets = getTargetScores()
    return IELTS_SUBJECTS.map(s => {
      const sess = allSessions.filter(e => e.subject === s && e.score)
      const recent = sess.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
      const scores = recent.map(e => parseScore(e.score)).filter((v): v is number => v !== null)
      const avg = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0
      return {
        subject: t(`ielts.${s}`),
        current: avg,
        target: targets[s],
      }
    })
  }, [allSessions, t])

  const hasScoreData = scoreRadarData.some(d => d.current > 0)

  const topWeakness = tagData[0]

  const goToKnowledge = () => {
    setSearchParams({ iv: 'knowledge' }, { replace: true })
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setSubject('all')}
          className={`${btnToggle(subject === 'all')} h-10 px-4 rounded-lg text-sm`}>
          {t('ielts.allSubjects')}
          <span className="ml-1 text-xs opacity-50">{allMistakes.length}</span>
        </button>
        {IELTS_SUBJECTS.map(s => {
          const count = subjectMistakeCounts.get(s) ?? 0
          return (
            <button key={s} onClick={() => setSubject(s)}
              className={`h-10 px-4 rounded-full text-sm font-medium transition-all duration-150 select-none no-press active:scale-[0.97] ${
                subject === s ? 'text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-gray-600'
              }`}
              style={subject === s ? { backgroundColor: SUBJECT_COLORS[s] } : undefined}>
              {t(`ielts.${s}`)}
              {count > 0 && <span className="ml-1 text-xs opacity-50">{count}</span>}
            </button>
          )
        })}

        <div className="flex-1 min-w-[8px]" />

        {RANGES.map(r => (
          <button key={r.key} onClick={() => setRange(r.key)}
            className={`h-9 px-3 rounded-lg text-xs font-medium transition-all select-none no-press ${
              range === r.key
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold'
                : 'bg-gray-50 dark:bg-gray-800/40 text-gray-400 hover:text-gray-600'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Summary stat */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-4 px-1">
          <span className="text-sm text-gray-400">
            共 <span className="font-semibold text-gray-700 dark:text-gray-300">{filtered.length}</span> 条错题
            {prevFiltered.length > 0 && (
              <span className={`ml-1 ${filtered.length > prevFiltered.length ? 'text-[#c0392b]' : 'text-green-500'}`}>
                （{filtered.length > prevFiltered.length ? '↑' : '↓'}{Math.abs(filtered.length - prevFiltered.length)}）
              </span>
            )}
          </span>
        </div>
      )}

      {/* Chart 1: Error cause bar chart */}
      {tagData.length > 0 ? (
        <div className="panel p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            错因分布
            {highlightTag && (
              <button onClick={() => setHighlightTag(null)}
                className="ml-2 text-xs text-[#c0392b] font-normal">✕ 清除筛选</button>
            )}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tagData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
              onClick={(e) => {
                if (e?.activeLabel) setHighlightTag(prev => prev === e.activeLabel ? null : (e.activeLabel ?? null))
              }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="tag" tick={{ fontSize: 11, fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 13 }}
                formatter={(value: number, _name: string, props: { payload?: { prev?: number } }) => {
                  const prev = props.payload?.prev ?? 0
                  return [`${value} 次${prev > 0 ? `（上期 ${prev}）` : ''}`, '错误数']
                }}
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} cursor="pointer" animationDuration={300}>
                {tagData.map(d => (
                  <Cell key={d.tag}
                    fill={highlightTag === null || highlightTag === d.tag ? ACCENT : isDark ? '#374151' : '#e5e7eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="panel p-10 text-center space-y-3">
          <p className="text-3xl">📊</p>
          <p className="text-base font-medium text-gray-600 dark:text-gray-300">
            导入或记录几场练习后，这里会显示错因分布
          </p>
          <p className="text-sm text-gray-400">切换到「记录」或「导入」页面添加数据</p>
        </div>
      )}

      {/* Chart 2: Score trend */}
      {filteredSessions.length > 1 && (
        <ScoreTrendChart sessions={filteredSessions} />
      )}

      {/* Target score radar */}
      {hasScoreData && (
        <div className="panel p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">科目雷达 — 当前 vs 目标</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={scoreRadarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: tickColor }} />
              <PolarRadiusAxis domain={[0, 9]} tick={{ fontSize: 10, fill: tickColor }} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 13 }} />
              <Radar dataKey="target" stroke={isDark ? '#6b7280' : '#d1d5db'} fill="none" strokeWidth={1.5} strokeDasharray="5 5" name="目标" />
              <Radar dataKey="current" stroke={ACCENT} fill={ACCENT} fillOpacity={0.2} strokeWidth={2} name="当前" />
            </RadarChart>
          </ResponsiveContainer>
          {/* Gap display */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {scoreRadarData.map(d => {
              const gap = d.current > 0 ? d.target - d.current : null
              return (
                <div key={d.subject} className="text-center">
                  <p className="text-sm font-bold tabular-nums text-gray-800 dark:text-gray-200">{d.current || '—'}</p>
                  <p className="text-xs text-gray-400">{d.subject}</p>
                  {gap !== null && gap > 0 && (
                    <p className="text-xs text-[#c0392b] font-medium">差 {gap.toFixed(1)}</p>
                  )}
                  {gap !== null && gap <= 0 && (
                    <p className="text-xs text-green-500 font-medium">已达标 ✓</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top weakness — clickable */}
      {tagData.length > 0 && (
        <div className="panel p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {t('ielts.topWeakness')}
          </p>
          <div className="flex flex-wrap gap-2">
            {tagData.slice(0, 5).map((d, i) => (
              <button key={d.tag} onClick={goToKnowledge}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all select-none no-press active:scale-[0.97] hover:brightness-95 cursor-pointer ${
                  i === 0
                    ? 'bg-[#c0392b]/10 text-[#c0392b] dark:text-[#ef6f6f]'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'
                }`}>
                {i === 0 && <span className="text-xs">🔥</span>}
                {d.tag}
                <span className="text-xs opacity-60 tabular-nums">×{d.count}</span>
                {d.delta !== 0 && range !== 'all' && (
                  <span className={`text-xs font-medium ${d.delta > 0 ? 'text-[#c0392b]' : 'text-green-500'}`}>
                    {d.delta > 0 ? '↑' : '↓'}{Math.abs(d.delta)}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">💡 点击标签跳转知识库查看对应错题</p>
        </div>
      )}

      {/* Ranked list with change arrows */}
      {tagData.length > 0 && (
        <div className="panel p-4 space-y-0.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">错因排行</p>
          {tagData.map((d, i) => {
            const active = highlightTag === d.tag
            return (
              <button key={d.tag}
                onClick={() => setHighlightTag(prev => prev === d.tag ? null : d.tag)}
                className={`flex items-center gap-3 w-full rounded-lg px-2 py-2 transition-all select-none no-press ${
                  active ? 'bg-[#c0392b]/5 dark:bg-[#c0392b]/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'
                }`}>
                <span className={`text-xs w-5 text-right tabular-nums shrink-0 font-bold ${
                  i === 0 ? 'text-[#c0392b]' : active ? 'text-[#c0392b]' : 'text-gray-400'
                }`}>{i + 1}</span>
                <span className={`text-sm font-medium flex-1 text-left truncate ${
                  active ? 'text-[#c0392b]' : 'text-gray-700 dark:text-gray-300'
                }`}>{d.tag}</span>
                <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shrink-0">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${d.percentage}%`, backgroundColor: active || i === 0 ? ACCENT : isDark ? '#6b7280' : '#d1d5db' }} />
                </div>
                <span className={`text-xs tabular-nums w-8 text-right shrink-0 ${
                  active ? 'text-[#c0392b] font-semibold' : 'text-gray-400'
                }`}>{d.percentage}%</span>
                <span className={`text-xs tabular-nums w-6 text-right shrink-0 ${
                  active ? 'text-[#c0392b]' : 'text-gray-400'
                }`}>{d.count}次</span>
                {range !== 'all' && <ChangeArrow delta={d.delta} />}
              </button>
            )
          })}
        </div>
      )}

      {/* Question type radar */}
      {radarData.length >= 3 && (
        <div className="panel p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t('ielts.questionTypeRadar')}
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="type" tick={{ fontSize: 11, fill: tickColor }} />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: tickColor }} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 13 }}
                formatter={(value: number) => [`${value} 次`, t('ielts.errorCount')]}
              />
              <Radar dataKey="count" stroke={ACCENT} fill={ACCENT} fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

/** Change arrow for error ranking: ↑ red worsened, ↓ green improved, → unchanged */
function ChangeArrow({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-xs text-gray-400 w-8 text-right shrink-0">→</span>
  return (
    <span className={`text-xs font-medium w-8 text-right shrink-0 ${delta > 0 ? 'text-[#c0392b]' : 'text-green-500'}`}>
      {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}
    </span>
  )
}
