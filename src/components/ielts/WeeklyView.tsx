/* ─── IELTS — Weekly Report View ─── */

import { useState, useMemo, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays, subWeeks, addWeeks, startOfWeek, endOfWeek } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { toast } from 'sonner'
import { useIeltsSessions, useIeltsMistakes } from './hooks'
import { IELTS_SUBJECTS, SUBJECT_COLORS } from './constants'
import { ACCENT, useIsDark, btnPrimary, btnSecondary, btnGhost } from './styles'
import type { IeltsSubject } from './types'

type QuickRange = 'this' | 'last' | '4w' | 'custom'
const RANGES: { key: QuickRange; label: string }[] = [
  { key: 'this',   label: '本周' },
  { key: 'last',   label: '上周' },
  { key: '4w',     label: '近4周' },
  { key: 'custom', label: '自定义区间' },
]

export default function WeeklyView() {
  const { t } = useTranslation()
  const isDark = useIsDark()
  const [weekOffset, setWeekOffset] = useState(0)
  const [quickRange, setQuickRange] = useState<QuickRange>('this')
  const [rangeOpen, setRangeOpen] = useState(false)
  const [copiedType, setCopiedType] = useState<'json' | 'text' | null>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const { entries: allSessions } = useIeltsSessions()
  const { entries: allMistakes } = useIeltsMistakes()

  // Week boundaries
  const weekStart = useMemo(() => {
    const base = weekOffset === 0 ? new Date() : (weekOffset < 0 ? subWeeks(new Date(), -weekOffset) : addWeeks(new Date(), weekOffset))
    return startOfWeek(base, { weekStartsOn: 1 })
  }, [weekOffset])
  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart])

  // Data range
  const { wsStr, weStr, rangeLabel, prevWsStr, prevWeStr } = useMemo(() => {
    if (quickRange === 'this' || quickRange === 'custom') {
      const ws = format(weekStart, 'yyyy-MM-dd')
      const we = format(weekEnd, 'yyyy-MM-dd')
      const pw = subWeeks(weekStart, 1)
      return { wsStr: ws, weStr: we, rangeLabel: `${format(weekStart, 'M.d')} - ${format(weekEnd, 'M.d')}`,
        prevWsStr: format(pw, 'yyyy-MM-dd'), prevWeStr: format(endOfWeek(pw, { weekStartsOn: 1 }), 'yyyy-MM-dd') }
    }
    if (quickRange === 'last') {
      const lw = subWeeks(new Date(), 1)
      const lwStart = startOfWeek(lw, { weekStartsOn: 1 })
      const lwEnd = endOfWeek(lw, { weekStartsOn: 1 })
      const pw = subWeeks(lwStart, 1)
      return { wsStr: format(lwStart, 'yyyy-MM-dd'), weStr: format(lwEnd, 'yyyy-MM-dd'),
        rangeLabel: `${format(lwStart, 'M.d')} - ${format(lwEnd, 'M.d')}`,
        prevWsStr: format(pw, 'yyyy-MM-dd'), prevWeStr: format(endOfWeek(pw, { weekStartsOn: 1 }), 'yyyy-MM-dd') }
    }
    // '4w'
    const end = endOfWeek(new Date(), { weekStartsOn: 1 })
    const start = subWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 3)
    const pEnd = subDays(start, 1)
    const pStart = subWeeks(start, 4)
    return { wsStr: format(start, 'yyyy-MM-dd'), weStr: format(end, 'yyyy-MM-dd'),
      rangeLabel: `${format(start, 'M.d')} - ${format(end, 'M.d')}`,
      prevWsStr: format(pStart, 'yyyy-MM-dd'), prevWeStr: format(pEnd, 'yyyy-MM-dd') }
  }, [quickRange, weekStart, weekEnd])

  const weekSessions = useMemo(() => allSessions.filter(s => s.date >= wsStr && s.date <= weStr), [allSessions, wsStr, weStr])
  const weekMistakes = useMemo(() => allMistakes.filter(m => m.date >= wsStr && m.date <= weStr), [allMistakes, wsStr, weStr])
  const prevSessions = useMemo(() => allSessions.filter(s => s.date >= prevWsStr && s.date <= prevWeStr), [allSessions, prevWsStr, prevWeStr])
  const prevMistakes = useMemo(() => allMistakes.filter(m => m.date >= prevWsStr && m.date <= prevWeStr), [allMistakes, prevWsStr, prevWeStr])

  const totalMinutes = weekSessions.reduce((s, e) => s + e.minutes, 0)
  const prevTotalMinutes = prevSessions.reduce((s, e) => s + e.minutes, 0)
  const deltaMinutes = totalMinutes - prevTotalMinutes
  const deltaSessions = weekSessions.length - prevSessions.length
  const deltaMistakes = weekMistakes.length - prevMistakes.length
  const hasPrevData = prevSessions.length > 0 || prevMistakes.length > 0

  // Pie chart
  const subjectData = useMemo(() =>
    IELTS_SUBJECTS.map(s => ({
      name: t(`ielts.${s}`), subject: s,
      value: weekSessions.filter(e => e.subject === s).reduce((sum, e) => sum + e.minutes, 0),
    })).filter(d => d.value > 0),
  [weekSessions, t])

  // Tag comparison
  const tagComparison = useMemo(() => {
    const thisMap = new Map<string, number>()
    const prevMap = new Map<string, number>()
    for (const m of weekMistakes) thisMap.set(m.tag, (thisMap.get(m.tag) ?? 0) + 1)
    for (const m of prevMistakes) prevMap.set(m.tag, (prevMap.get(m.tag) ?? 0) + 1)
    const allTags = new Set([...thisMap.keys(), ...prevMap.keys()])
    return Array.from(allTags).map(tag => ({
      tag, thisWeek: thisMap.get(tag) ?? 0, prevWeek: prevMap.get(tag) ?? 0,
    })).sort((a, b) => b.thisWeek - a.thisWeek)
  }, [weekMistakes, prevMistakes])

  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const tickColor = isDark ? '#9ca3af' : '#6b7280'

  // Build data objects for copy
  const buildSubjectBreakdown = useCallback(() =>
    IELTS_SUBJECTS.map(s => {
      const mins = weekSessions.filter(e => e.subject === s).reduce((sum, e) => sum + e.minutes, 0)
      return mins > 0 ? `${t(`ielts.${s}`)} ${mins}分钟` : null
    }).filter(Boolean).join('、') || '无',
  [weekSessions, t])

  const buildMistakeBreakdown = useCallback(() =>
    Array.from(weekMistakes.reduce((m, e) => m.set(e.tag, (m.get(e.tag) ?? 0) + 1), new Map<string, number>()))
      .map(([tag, count]) => `${tag}×${count}`).join('、') || '无',
  [weekMistakes])

  // Copy as JSON
  const handleCopyJson = useCallback(() => {
    const data = {
      period: rangeLabel,
      totalMinutes, sessionCount: weekSessions.length, mistakeCount: weekMistakes.length,
      subjects: Object.fromEntries(IELTS_SUBJECTS.map(s => [s, {
        minutes: weekSessions.filter(e => e.subject === s).reduce((sum, e) => sum + e.minutes, 0),
        sessions: weekSessions.filter(e => e.subject === s).length,
      }])),
      scores: weekSessions.filter(s => s.score).map(s => ({
        date: s.date, subject: s.subject, source: s.source, score: s.score,
      })),
      mistakes: Object.fromEntries(
        Array.from(weekMistakes.reduce((m, e) => m.set(e.tag, (m.get(e.tag) ?? 0) + 1), new Map<string, number>()))
      ),
      delta: { minutes: deltaMinutes, sessions: deltaSessions, mistakes: deltaMistakes },
    }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopiedType('json'); toast.success('JSON 数据已复制')
      setTimeout(() => setCopiedType(null), 2000)
    }).catch(() => toast.error('复制失败'))
  }, [rangeLabel, totalMinutes, weekSessions, weekMistakes, deltaMinutes, deltaSessions, deltaMistakes])

  // Copy as prompt text
  const handleCopyText = useCallback(() => {
    const scoreList = weekSessions.filter(s => s.score)
      .map(s => `${s.date} ${t(`ielts.${s.subject}`)} ${s.source}: ${s.score}`).join('\n  ') || '无'

    const prompt = `请根据以下雅思学习数据，生成一份周复盘报告。

本周学习数据（${rangeLabel}）：
- 总学时：${totalMinutes} 分钟
- 练习次数：${weekSessions.length} 次
- 各科练习：${buildSubjectBreakdown()}
- 各科分数：
  ${scoreList}
- 错题统计（共${weekMistakes.length}题）：${buildMistakeBreakdown()}
- 上周对比：学时 ${deltaMinutes >= 0 ? '+' : ''}${deltaMinutes}分钟，错题 ${deltaMistakes >= 0 ? '+' : ''}${deltaMistakes}题

请输出：
1. 本周学习总结（2-3 句）
2. 进步的地方
3. 最需要改进的方面（基于错因分布）
4. 下周学习建议（具体到每天做什么）`

    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedType('text'); toast.success('复盘文本已复制')
      setTimeout(() => setCopiedType(null), 2000)
    }).catch(() => toast.error('复制失败'))
  }, [rangeLabel, totalMinutes, weekSessions, weekMistakes, deltaMinutes, deltaMistakes, buildSubjectBreakdown, buildMistakeBreakdown, t])

  const isNavigable = quickRange === 'this' || quickRange === 'custom'

  const handleRangeSelect = (key: QuickRange) => {
    setQuickRange(key); setRangeOpen(false)
    if (key === 'this') setWeekOffset(0)
    else if (key === 'last') setWeekOffset(-1)
    else if (key === 'custom') setTimeout(() => dateInputRef.current?.showPicker(), 50)
  }

  const fmtDuration = (m: number) => m < 60 ? `${m}min` : `${(m / 60).toFixed(1)}h`
  const activeRangeLabel = RANGES.find(r => r.key === quickRange)?.label ?? '本周'

  return (
    <div className="space-y-3">
      {/* ── Week selector row ── */}
      <div className="relative flex items-center gap-1.5">
        {isNavigable && (
          <button onClick={() => setWeekOffset(w => w - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400
              transition-colors active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <button onClick={() => dateInputRef.current?.showPicker()}
          className="text-lg font-bold text-gray-800 dark:text-gray-100 hover:text-[#c0392b]
            transition-colors cursor-pointer select-none tabular-nums">
          {rangeLabel}
        </button>
        <input ref={dateInputRef} type="date"
          onChange={e => {
            if (e.target.value) {
              const picked = new Date(e.target.value + 'T12:00:00')
              const pickedWeekStart = startOfWeek(picked, { weekStartsOn: 1 })
              const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
              const diffWeeks = Math.round((pickedWeekStart.getTime() - thisWeekStart.getTime()) / (7 * 24 * 3600_000))
              setWeekOffset(diffWeeks); setQuickRange('custom')
            }
          }}
          className="absolute w-0 h-0 opacity-0 pointer-events-none" tabIndex={-1} />

        {isNavigable && (
          <button onClick={() => setWeekOffset(w => Math.min(w + 1, 0))} disabled={weekOffset >= 0}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400
              disabled:opacity-30 transition-colors active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {isNavigable && weekOffset !== 0 && (
          <button onClick={() => { setWeekOffset(0); setQuickRange('this') }}
            className="ml-1 px-2.5 py-1 text-xs font-medium rounded-lg
              bg-[#c0392b]/8 text-[#c0392b] hover:bg-[#c0392b]/15 transition-colors select-none">
            本周
          </button>
        )}

        <div className="flex-1" />

        <div className="relative">
          <button onClick={() => setRangeOpen(!rangeOpen)}
            className={`h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-1
              transition-colors select-none no-press ${
              quickRange !== 'this' ? 'bg-[#c0392b]/10 text-[#c0392b]' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 hover:text-gray-700'
            }`}>
            {activeRangeLabel}
            <svg className={`w-3 h-3 transition-transform ${rangeOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {rangeOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setRangeOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800
                rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[130px]">
                {RANGES.map(r => (
                  <button key={r.key} onClick={() => handleRangeSelect(r.key)}
                    className={`w-full px-4 py-2.5 text-left text-base transition-colors ${
                      quickRange === r.key ? 'text-[#c0392b] font-semibold bg-[#c0392b]/5'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats cards — delta colors: study time ↑=green ↓=red, mistakes ↑=red ↓=green */}
      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">⏱ 总学时</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{fmtDuration(totalMinutes)}</p>
          <DeltaBadge value={deltaMinutes} />
        </div>
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">📝 练习次数</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{weekSessions.length}</p>
          <DeltaBadge value={deltaSessions} />
        </div>
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">❌ 错题数</p>
          <p className="text-2xl font-bold tabular-nums text-[#c0392b]">{weekMistakes.length}</p>
          <DeltaBadge value={deltaMistakes} invertColor />
        </div>
      </div>

      {/* Subject pie chart */}
      {subjectData.length > 0 ? (
        <div className="panel p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">各科用时</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={subjectData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                label={({ name, value }) => `${name} ${value}min`} labelLine={false}>
                {subjectData.map(d => <Cell key={d.subject} fill={SUBJECT_COLORS[d.subject as IeltsSubject]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 13 }}
                formatter={(value: number, name: string) => [`${value} 分钟`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : weekSessions.length > 0 ? null : null}

      {/* Tag comparison */}
      {tagComparison.length > 0 ? (
        <div className="panel p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            错因对比（{quickRange === '4w' ? '近4周 vs 前4周' : '本周 vs 上周'}）
          </p>
          {!hasPrevData && (
            <p className="text-xs text-gray-400 mb-2 italic">
              ℹ 暂无上周数据，仅显示本周错因分布
            </p>
          )}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tagComparison} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="tag" tick={{ fontSize: 11, fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="thisWeek" name={quickRange === '4w' ? '近4周' : '本周'} fill={ACCENT} radius={[4, 4, 0, 0]} />
              <Bar dataKey="prevWeek" name={quickRange === '4w' ? '前4周' : '上周'} fill={isDark ? '#4b5563' : '#d1d5db'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : weekMistakes.length === 0 && weekSessions.length > 0 ? (
        <div className="panel p-6 text-center">
          <p className="text-sm text-gray-500">🎉 本周暂无错题记录</p>
        </div>
      ) : null}

      {/* Empty state */}
      {weekSessions.length === 0 && (
        <div className="panel p-10 text-center space-y-3">
          <p className="text-3xl">📅</p>
          <p className="text-base font-medium text-gray-600 dark:text-gray-300">该时段暂无练习记录</p>
          <p className="text-xs text-gray-400">在「记录」或「导入」页面添加练习数据</p>
        </div>
      )}

      {/* AI prompt — two buttons */}
      {weekSessions.length > 0 && (
        <div className="panel p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI 周报</p>
          <p className="text-sm text-gray-500">
            复制数据粘贴到 ChatGPT / Claude / Kimi，一键生成周复盘报告
          </p>
          <div className="flex gap-2">
            <button onClick={handleCopyJson}
              className={`${copiedType === 'json' ? btnSecondary : btnPrimary()} h-11 px-5 flex-1`}
              style={copiedType === 'json' ? undefined : { backgroundColor: ACCENT }}>
              {copiedType === 'json' ? '✓ 已复制' : '📋 复制数据给AI (JSON)'}
            </button>
            <button onClick={handleCopyText}
              className={`${copiedType === 'text' ? btnSecondary : btnGhost} h-11 px-5 flex-1
                border border-gray-200 dark:border-gray-700`}>
              {copiedType === 'text' ? '✓ 已复制' : '📝 复制复盘文本'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Delta arrow: study time ↑=green ↓=red; mistakes ↑=red ↓=green (invertColor) */
function DeltaBadge({ value, invertColor }: { value: number; invertColor?: boolean }) {
  if (value === 0) return null
  const isUp = value > 0
  const isGood = invertColor ? !isUp : isUp
  return (
    <p className={`text-xs mt-0.5 font-medium ${isGood ? 'text-green-500' : 'text-[#c0392b]'}`}>
      {isUp ? '↑' : '↓'} {Math.abs(value)}{invertColor ? '' : 'min'}
    </p>
  )
}
