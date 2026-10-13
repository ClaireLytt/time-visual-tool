/* ─── IELTS — Weekly Report View ─── */

import { useState, useMemo, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays, subWeeks, addWeeks, startOfWeek, endOfWeek } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { toast } from 'sonner'
import { useIeltsSessions, useIeltsMistakes } from './hooks'
import { IELTS_SUBJECTS, SUBJECT_COLORS } from './constants'
import { ACCENT, useIsDark, btnPrimary, btnSecondary, btnGhost } from './styles'
import { parseScore } from './utils'
import type { IeltsSubject, IeltsSession, IeltsMistake } from './types'

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
  const reportRef = useRef<HTMLDivElement>(null)

  const handleExportPDF = useCallback(async () => {
    if (!reportRef.current) return
    toast.loading('正在生成 PDF...')
    try {
      const { default: html2canvas } = await import('html2canvas-pro')
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, backgroundColor: '#fdf2f5', useCORS: true,
      })
      // Convert to PDF-like download (as PNG, A4 ratio)
      const link = document.createElement('a')
      link.download = `ielts-weekly-${rangeLabel.replace(/\s/g, '')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.dismiss()
      toast.success('周报已导出')
    } catch {
      toast.dismiss()
      toast.error('导出失败，请重试')
    }
  }, [rangeLabel])

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

        {/* Export PDF */}
        {weekSessions.length > 0 && (
          <button onClick={handleExportPDF}
            className="h-8 px-3 rounded-full text-xs font-medium text-gray-500 hover:text-gray-700
              hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors select-none no-press mr-1">
            📄 导出
          </button>
        )}

        <div className="relative">
          <button onClick={() => setRangeOpen(!rangeOpen)}
            className={`h-9 px-4 rounded-full text-sm font-medium flex items-center gap-1
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

      {/* Report content — wrapped for PDF export */}
      <div ref={reportRef} className="space-y-3">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">⏱ 总学时</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{fmtDuration(totalMinutes)}</p>
          <DeltaBadge value={deltaMinutes} unit="min" />
        </div>
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">📝 练习次数</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{weekSessions.length}</p>
          <DeltaBadge value={deltaSessions} unit="次" />
        </div>
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">❌ 错题数</p>
          <p className="text-2xl font-bold tabular-nums text-[#c0392b]">{weekMistakes.length}</p>
          <DeltaBadge value={deltaMistakes} unit="题" invertColor />
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
            <p className="text-xs text-gray-400 mb-2">
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

      {/* Streak badge */}
      {weekSessions.length > 0 && (() => {
        // Calculate consecutive study days
        const studyDates = new Set(allSessions.map(s => s.date))
        let streak = 0
        const d = new Date()
        while (studyDates.has(format(d, 'yyyy-MM-dd'))) {
          streak++
          d.setDate(d.getDate() - 1)
        }
        // Also check if yesterday had data (user might not have practiced today yet)
        if (streak === 0) {
          const y = new Date()
          y.setDate(y.getDate() - 1)
          if (studyDates.has(format(y, 'yyyy-MM-dd'))) {
            const d2 = new Date(y)
            while (studyDates.has(format(d2, 'yyyy-MM-dd'))) {
              streak++
              d2.setDate(d2.getDate() - 1)
            }
          }
        }
        return streak > 0 ? (
          <div className="panel p-3 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">连续打卡 {streak} 天</p>
              <p className="text-xs text-gray-400">坚持就是胜利！</p>
            </div>
          </div>
        ) : null
      })()}

      {/* AI Report */}
      {weekSessions.length > 0 && (
        <AIReportCard
          weekSessions={weekSessions} prevSessions={prevSessions}
          weekMistakes={weekMistakes} prevMistakes={prevMistakes}
          tagComparison={tagComparison}
          totalMinutes={totalMinutes} deltaMinutes={deltaMinutes}
          rangeLabel={rangeLabel}
        />
      )}

      </div>{/* end reportRef */}

      {/* Copy buttons */}
      {weekSessions.length > 0 && (
        <div className="flex gap-2">
          <button onClick={handleCopyJson}
            className={`${copiedType === 'json' ? btnSecondary : btnPrimary()} h-11 px-5 flex-1`}
            style={copiedType === 'json' ? undefined : { backgroundColor: ACCENT }}>
            {copiedType === 'json' ? '✓ 已复制' : '📋 复制JSON数据'}
          </button>
          <button onClick={handleCopyText}
              className={`${copiedType === 'text' ? btnSecondary : btnGhost} h-11 px-5 flex-1
                border border-gray-200 dark:border-gray-700`}>
              {copiedType === 'text' ? '✓ 已复制' : '📝 复制复盘文本'}
            </button>
        </div>
      )}
    </div>
  )
}

/** Delta arrow with correct units. invertColor: ↑=bad(red), ↓=good(green) */
function DeltaBadge({ value, unit = 'min', invertColor }: { value: number; unit?: string; invertColor?: boolean }) {
  if (value === 0) return null
  const isUp = value > 0
  const isGood = invertColor ? !isUp : isUp
  return (
    <p className={`text-xs mt-0.5 font-medium ${isGood ? 'text-green-500' : 'text-[#c0392b]'}`}>
      {isUp ? '↑' : '↓'} {Math.abs(value)}{unit}
    </p>
  )
}

/** AI-powered weekly report with local fallback */
function AIReportCard({ weekSessions, prevSessions, weekMistakes, prevMistakes, tagComparison, totalMinutes, deltaMinutes, rangeLabel }: {
  weekSessions: IeltsSession[]; prevSessions: IeltsSession[]
  weekMistakes: IeltsMistake[]; prevMistakes: IeltsMistake[]
  tagComparison: { tag: string; thisWeek: number; prevWeek: number }[]
  totalMinutes: number; deltaMinutes: number; rangeLabel: string
}) {
  const { t } = useTranslation()
  const [aiReport, setAiReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  // Build local fallback report
  const localReport = useMemo(() => {
    const lines: string[] = []
    const fmtD = (m: number) => m < 60 ? `${m}min` : `${(m / 60).toFixed(1)}h`

    // 1. Study time
    lines.push(`📊 本周学习 ${fmtD(totalMinutes)}${deltaMinutes !== 0
      ? `（较上周 ${deltaMinutes > 0 ? '+' : ''}${deltaMinutes}min）` : ''}`)

    // 2. TOP1 error
    if (tagComparison.length > 0) {
      const top = tagComparison[0]
      const delta = top.thisWeek - top.prevWeek
      lines.push(`🔥 TOP1 错因：${top.tag}（${top.thisWeek}次${
        top.prevWeek > 0 ? `，${delta > 0 ? '↑' : '↓'}${Math.abs(delta)}` : ''}）`)
    }

    // 3. Score improvements
    const improvements: string[] = []
    const warnings: string[] = []
    for (const s of IELTS_SUBJECTS) {
      const thisS = weekSessions.filter(e => e.subject === s && e.score)
      const prevS = prevSessions.filter(e => e.subject === s && e.score)
      if (thisS.length > 0 && prevS.length > 0) {
        const thisScores = thisS.map(e => parseScore(e.score)).filter((v): v is number => v !== null)
        const prevScores = prevS.map(e => parseScore(e.score)).filter((v): v is number => v !== null)
        if (thisScores.length > 0 && prevScores.length > 0) {
          const thisAvg = thisScores.reduce((a, b) => a + b, 0) / thisScores.length
          const prevAvg = prevScores.reduce((a, b) => a + b, 0) / prevScores.length
          if (thisAvg > prevAvg) improvements.push(`${t(`ielts.${s}`)} ${prevAvg.toFixed(1)}→${thisAvg.toFixed(1)}`)
        }
      }
      if (thisS.length === 0 && prevS.length > 0) warnings.push(t(`ielts.${s}`))
      if (thisS.length === 0 && prevS.length === 0 && weekSessions.some(e => e.subject !== s)) {
        warnings.push(t(`ielts.${s}`))
      }
    }
    if (improvements.length > 0) lines.push(`✅ 进步：${improvements.join('、')}`)
    if (warnings.length > 0) lines.push(`⚠️ ${warnings.join('、')}本周未练习`)

    // 4. Suggestions based on top errors
    lines.push('')
    lines.push('📝 下周建议：')
    if (tagComparison.length > 0) {
      const topTags = tagComparison.slice(0, 3)
      for (const tg of topTags) {
        if (['没听到', '跟丢了', '同义替换', '拼写', '单复数时态'].includes(tg.tag)) {
          lines.push(`· 针对「${tg.tag}」做 2 次听力精听专项`)
        } else if (['TFNG混淆', '定位错', '时间不够', '生词'].includes(tg.tag)) {
          lines.push(`· 针对「${tg.tag}」做 2 次阅读限时训练`)
        } else if (['词汇', '语法', '连贯', '任务回应'].includes(tg.tag)) {
          lines.push(`· 针对「${tg.tag}」做 1 次写作限时练习`)
        } else if (['流利度', '发音'].includes(tg.tag)) {
          lines.push(`· 针对「${tg.tag}」做 2 次口语跟读练习`)
        } else {
          lines.push(`· 重点复习「${tg.tag}」相关错题`)
        }
      }
    }

    return lines.join('\n')
  }, [weekSessions, prevSessions, tagComparison, totalMinutes, deltaMinutes, t])

  // Try LLM generation
  const generateAI = useCallback(async () => {
    // Check for API key in localStorage
    let apiKey = ''
    try { apiKey = localStorage.getItem('ielts-ai-api-key') ?? '' } catch { /* */ }

    if (!apiKey) {
      // No API key — use local fallback
      setAiReport(null)
      return
    }

    setLoading(true)
    setError(false)

    const prompt = `你是雅思备考助手。根据以下学习数据生成 200 字以内的周复盘报告。

本周（${rangeLabel}）：
${JSON.stringify(weekSessions.map(s => ({ date: s.date, subject: s.subject, source: s.source, score: s.score, minutes: s.minutes })), null, 2)}

上周数据条数：${prevSessions.length}条，上周错题：${prevMistakes.length}条
本周错题：${weekMistakes.length}条
本周错因TOP3：${tagComparison.slice(0, 3).map(t => `${t.tag}×${t.thisWeek}`).join('、')}

要求输出：
1. 本周学时变化（具体增减多少 min）
2. 错因 TOP1 分析
3. 哪科进步了
4. 哪科偷懒了
5. 下周 3 条具体建议`

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15_000)
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setAiReport(data.choices?.[0]?.message?.content ?? null)
    } catch {
      setError(true)
      setAiReport(null)
    } finally {
      setLoading(false)
    }
  }, [weekSessions, prevSessions, weekMistakes, prevMistakes, tagComparison, rangeLabel])

  const displayText = aiReport ?? localReport
  const isAI = aiReport !== null

  return (
    <div className="panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {isAI ? '✨ AI 复盘' : '📊 本周复盘'}
        </p>
        <button onClick={generateAI} disabled={loading}
          className="text-xs text-[#c0392b] font-medium hover:underline select-none disabled:opacity-50">
          {loading ? '生成中...' : isAI ? '🔄 重新生成' : '✨ AI 生成'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      ) : error ? (
        <div className="text-sm text-[#c0392b]">
          AI 复盘生成失败。
          <button onClick={generateAI} className="ml-1 underline font-medium">点击重试</button>
        </div>
      ) : (
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {displayText}
        </div>
      )}

      {!isAI && (
        <p className="text-xs text-gray-400">
          💡 在浏览器 Console 输入 <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">localStorage.setItem('ielts-ai-api-key', '你的key')</code> 可启用 AI 生成
        </p>
      )}
    </div>
  )
}

