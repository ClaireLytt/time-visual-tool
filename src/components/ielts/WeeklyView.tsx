import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { toast } from 'sonner'
import { useIeltsSessions, useIeltsMistakes } from './hooks'
import { IELTS_SUBJECTS, SUBJECT_COLORS } from './constants'
import { ACCENT, useIsDark, btnPrimary, btnSecondary } from './styles'
import type { IeltsSubject } from './types'

export default function WeeklyView() {
  const { t } = useTranslation()
  const isDark = useIsDark()
  const [weekOffset, setWeekOffset] = useState(0) // 0 = this week, -1 = last week
  const [copied, setCopied] = useState(false)

  const { entries: allSessions } = useIeltsSessions()
  const { entries: allMistakes } = useIeltsMistakes()

  // Week boundaries
  const weekStart = useMemo(() => {
    const base = weekOffset === 0 ? new Date() : subWeeks(new Date(), -weekOffset)
    return startOfWeek(base, { weekStartsOn: 1 })
  }, [weekOffset])
  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart])
  const prevWeekStart = useMemo(() => subWeeks(weekStart, 1), [weekStart])
  const prevWeekEnd = useMemo(() => endOfWeek(prevWeekStart, { weekStartsOn: 1 }), [prevWeekStart])

  const weekRange = `${format(weekStart, 'M.d')} - ${format(weekEnd, 'M.d')}`
  const wsStr = format(weekStart, 'yyyy-MM-dd')
  const weStr = format(weekEnd, 'yyyy-MM-dd')
  const pwsStr = format(prevWeekStart, 'yyyy-MM-dd')
  const pweStr = format(prevWeekEnd, 'yyyy-MM-dd')

  // This week data
  const weekSessions = useMemo(() => allSessions.filter(s => s.date >= wsStr && s.date <= weStr), [allSessions, wsStr, weStr])
  const weekMistakes = useMemo(() => allMistakes.filter(m => m.date >= wsStr && m.date <= weStr), [allMistakes, wsStr, weStr])
  const prevSessions = useMemo(() => allSessions.filter(s => s.date >= pwsStr && s.date <= pweStr), [allSessions, pwsStr, pweStr])
  const prevMistakes = useMemo(() => allMistakes.filter(m => m.date >= pwsStr && m.date <= pweStr), [allMistakes, pwsStr, pweStr])

  const totalMinutes = weekSessions.reduce((s, e) => s + e.minutes, 0)
  const prevTotalMinutes = prevSessions.reduce((s, e) => s + e.minutes, 0)
  const deltaMinutes = totalMinutes - prevTotalMinutes
  const deltaMistakes = weekMistakes.length - prevMistakes.length

  // Subject breakdown for pie chart
  const subjectData = useMemo(() => {
    return IELTS_SUBJECTS.map(s => ({
      name: s === 'listening' ? '听力' : s === 'reading' ? '阅读' : s === 'writing' ? '写作' : '口语',
      subject: s,
      value: weekSessions.filter(e => e.subject === s).reduce((sum, e) => sum + e.minutes, 0),
    })).filter(d => d.value > 0)
  }, [weekSessions])

  // Mistake tag comparison: this week vs last week
  const tagComparison = useMemo(() => {
    const thisWeekTags = new Map<string, number>()
    const prevWeekTags = new Map<string, number>()
    for (const m of weekMistakes) thisWeekTags.set(m.tag, (thisWeekTags.get(m.tag) ?? 0) + 1)
    for (const m of prevMistakes) prevWeekTags.set(m.tag, (prevWeekTags.get(m.tag) ?? 0) + 1)
    const allTags = new Set([...thisWeekTags.keys(), ...prevWeekTags.keys()])
    return Array.from(allTags).map(tag => ({
      tag,
      thisWeek: thisWeekTags.get(tag) ?? 0,
      prevWeek: prevWeekTags.get(tag) ?? 0,
    })).sort((a, b) => b.thisWeek - a.thisWeek)
  }, [weekMistakes, prevMistakes])

  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const tickColor = isDark ? '#9ca3af' : '#6b7280'

  // AI prompt generation
  const handleCopyPrompt = useCallback(() => {
    const subjectBreakdown = IELTS_SUBJECTS
      .map(s => {
        const mins = weekSessions.filter(e => e.subject === s).reduce((sum, e) => sum + e.minutes, 0)
        const label = s === 'listening' ? '听力' : s === 'reading' ? '阅读' : s === 'writing' ? '写作' : '口语'
        return mins > 0 ? `${label} ${mins}分钟` : null
      }).filter(Boolean).join('、') || '无'

    const scoreList = weekSessions
      .filter(s => s.score)
      .map(s => {
        const label = s.subject === 'listening' ? '听力' : s.subject === 'reading' ? '阅读' : s.subject === 'writing' ? '写作' : '口语'
        return `${s.date} ${label} ${s.source}: ${s.score}`
      }).join('\n  ') || '无'

    const mistakeBreakdown = Array.from(
      weekMistakes.reduce((m, e) => m.set(e.tag, (m.get(e.tag) ?? 0) + 1), new Map<string, number>())
    ).map(([tag, count]) => `${tag}×${count}`).join('、') || '无'

    const prompt = `请根据以下雅思学习数据，生成一份周复盘报告。

本周学习数据（${weekRange}）：
- 总学时：${totalMinutes} 分钟
- 练习次数：${weekSessions.length} 次
- 各科练习：${subjectBreakdown}
- 各科分数：
  ${scoreList}
- 错题统计（共${weekMistakes.length}题）：${mistakeBreakdown}
- 上周对比：学时 ${deltaMinutes >= 0 ? '+' : ''}${deltaMinutes}分钟，错题 ${deltaMistakes >= 0 ? '+' : ''}${deltaMistakes}题

请输出：
1. 本周学习总结（2-3 句）
2. 进步的地方
3. 最需要改进的方面（基于错因分布）
4. 下周学习建议（具体到每天做什么）`

    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      toast.success('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    })
  }, [weekRange, totalMinutes, weekSessions, weekMistakes, deltaMinutes, deltaMistakes])

  const fmtDuration = (m: number) => m < 60 ? `${m}min` : `${(m / 60).toFixed(1)}h`

  return (
    <div className="space-y-4">
      {/* Week selector */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/40 no-press">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
        </button>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums min-w-[120px] text-center">{weekRange}</span>
        <button onClick={() => setWeekOffset(w => Math.min(w + 1, 0))} disabled={weekOffset >= 0}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/40 no-press disabled:opacity-30">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{fmtDuration(totalMinutes)}</p>
          <p className="text-xs text-gray-400 mt-0.5">总学时</p>
          {deltaMinutes !== 0 && (
            <p className={`text-[11px] mt-0.5 ${deltaMinutes > 0 ? 'text-green-500' : 'text-red-400'}`}>
              {deltaMinutes > 0 ? '↑' : '↓'} {Math.abs(deltaMinutes)}min
            </p>
          )}
        </div>
        <div className="panel p-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{weekSessions.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">练习次数</p>
        </div>
        <div className="panel p-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-[#c0392b]">{weekMistakes.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">错题数</p>
          {deltaMistakes !== 0 && (
            <p className={`text-[11px] mt-0.5 ${deltaMistakes < 0 ? 'text-green-500' : 'text-red-400'}`}>
              {deltaMistakes > 0 ? '↑' : '↓'} {Math.abs(deltaMistakes)}
            </p>
          )}
        </div>
      </div>

      {/* Subject time pie chart */}
      {subjectData.length > 0 && (
        <div className="panel p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">各科用时</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={subjectData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name} ${value}min`} labelLine={false}>
                {subjectData.map(d => <Cell key={d.subject} fill={SUBJECT_COLORS[d.subject as IeltsSubject]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}min`, '用时']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tag comparison */}
      {tagComparison.length > 0 && (
        <div className="panel p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">错因对比（本周 vs 上周）</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tagComparison} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="tag" tick={{ fontSize: 11, fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="thisWeek" name="本周" fill={ACCENT} radius={[4, 4, 0, 0]} />
              <Bar dataKey="prevWeek" name="上周" fill={isDark ? '#4b5563' : '#d1d5db'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty state */}
      {weekSessions.length === 0 && (
        <div className="panel p-10 text-center space-y-2">
          <p className="text-2xl">📅</p>
          <p className="text-sm text-gray-500">本周暂无练习记录</p>
        </div>
      )}

      {/* AI prompt copy */}
      {weekSessions.length > 0 && (
        <div className="panel p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI 周报</p>
          <p className="text-sm text-gray-500">一键复制本周数据，粘贴到 ChatGPT / Claude / Kimi 生成复盘报告</p>
          <button
            onClick={handleCopyPrompt}
            className={`${copied ? btnSecondary : btnPrimary()} h-11 px-5`}
            style={copied ? undefined : { backgroundColor: ACCENT }}
          >
            {copied ? '✓ 已复制' : '📋 复制本周数据给 AI'}
          </button>
        </div>
      )}
    </div>
  )
}
