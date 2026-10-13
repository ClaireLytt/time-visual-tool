/* ─── IELTS — Record View (Session + Mistake Entry) ─── */

import { useState, useMemo, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { toast } from 'sonner'
import CollapsibleForm from '../common/CollapsibleForm'
import ConfirmDialog from '../common/ConfirmDialog'
import SessionForm from './SessionForm'
import SessionList from './SessionList'
import PracticeTimer from './PracticeTimer'
import { useIeltsSessions, useIeltsMistakes, useIeltsReflections } from './hooks'
import { IELTS_SUBJECTS, SUBJECT_COLORS } from './constants'
import { ACCENT, btnToggle } from './styles'
import type { IeltsSubject } from './types'

type QuickRange = 'day' | 'yesterday' | '7d' | '30d' | 'custom'
const RANGES: { key: QuickRange; label: string }[] = [
  { key: 'day',       label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: '7d',        label: '近7天' },
  { key: '30d',       label: '近30天' },
  { key: 'custom',    label: '自定义区间' },
]

export default function RecordView() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'zh' ? zhCN : enUS
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [quickRange, setQuickRange] = useState<QuickRange>('day')
  const [rangeOpen, setRangeOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<IeltsSubject | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const sessions = useIeltsSessions()
  const mistakes = useIeltsMistakes()
  const reflections = useIeltsReflections()

  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  // Compute date range boundaries
  const dateRange = useMemo<{ from: string; to: string } | null>(() => {
    if (quickRange === 'day') return null
    if (quickRange === 'yesterday') return { from: yesterday, to: yesterday }
    if (quickRange === '7d')  return { from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: today }
    if (quickRange === '30d') return { from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: today }
    return null // 'custom' uses selectedDate as single day
  }, [quickRange, today, yesterday])

  const isRangeMode = dateRange !== null
  const effectiveDate = quickRange === 'yesterday' ? yesterday : selectedDate

  // Sessions for current view
  const viewSessions = useMemo(() => {
    if (dateRange) return sessions.entries.filter(s => s.date >= dateRange.from && s.date <= dateRange.to)
    return sessions.getEntriesForDate(effectiveDate)
  }, [sessions.entries, sessions.getEntriesForDate, effectiveDate, dateRange])

  const viewMistakes = useMemo(() => {
    if (dateRange) return mistakes.entries.filter(m => m.date >= dateRange.from && m.date <= dateRange.to)
    return mistakes.entries.filter(m => m.date === effectiveDate)
  }, [mistakes.entries, effectiveDate, dateRange])

  const totalMinutes = useMemo(() => viewSessions.reduce((s, e) => s + e.minutes, 0), [viewSessions])

  const todayReflection = useMemo(
    () => reflections.entries.find(r => r.date === effectiveDate),
    [reflections.entries, effectiveDate],
  )

  // Filter by search + subject
  const filteredSessions = useMemo(() => {
    let list = viewSessions
    if (subjectFilter !== 'all') list = list.filter(s => s.subject === subjectFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(s => s.source.toLowerCase().includes(q) || s.note.toLowerCase().includes(q))
    }
    return list
  }, [viewSessions, subjectFilter, search])

  const filteredMistakes = useMemo(() => {
    const ids = new Set(filteredSessions.map(s => s.id))
    return viewMistakes.filter(m => ids.has(m.sessionId))
  }, [filteredSessions, viewMistakes])

  const [timerMinutes, setTimerMinutes] = useState<number | undefined>()
  const handleTimerStop = useCallback((minutes: number) => {
    setTimerMinutes(minutes)
    toast.success(t('ielts.timerAutoFill'))
    // Auto-scroll to form so user sees the auto-filled duration
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }, [t])

  const fmtDuration = (m: number) => m < 60 ? `${m}min` : `${(m / 60).toFixed(1)}h`

  // Date navigation
  const goBack = () => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
  const goForward = () => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
  const dateLabel = format(parseISO(selectedDate), t('date.dayFormat'), { locale })

  const handleRangeSelect = (key: QuickRange) => {
    setQuickRange(key)
    setRangeOpen(false)
    setSelectedIds(new Set())
    if (key === 'day') setSelectedDate(today)
    if (key === 'custom') setTimeout(() => dateInputRef.current?.showPicker(), 50)
  }

  const activeRangeLabel = RANGES.find(r => r.key === quickRange)?.label ?? '今日'
  const isDayNav = quickRange === 'day' || quickRange === 'custom'

  // Batch selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev =>
      prev.size === filteredSessions.length ? new Set() : new Set(filteredSessions.map(s => s.id)),
    )
  }, [filteredSessions])

  const handleBatchDelete = useCallback(() => {
    // Atomic delete — filter out selected sessions and their mistakes in one setData call
    sessions.setData(prev => ({
      ...prev,
      entries: prev.entries.filter(e => !selectedIds.has(e.id)),
    }))
    mistakes.setData(prev => ({
      ...prev,
      entries: prev.entries.filter(m => !selectedIds.has(m.sessionId)),
    }))
    toast.success(`已删除 ${selectedIds.size} 条记录`)
    setSelectedIds(new Set())
    setConfirmBatchDelete(false)
  }, [selectedIds, sessions, mistakes])

  // Subject count badges for filter buttons
  const subjectCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of viewSessions) counts.set(s.subject, (counts.get(s.subject) ?? 0) + 1)
    return counts
  }, [viewSessions])

  return (
    <div className="space-y-3">
      {/* ── Date row ── */}
      <div className="relative flex items-center gap-1.5">
        {isDayNav && (
          <button onClick={goBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400
              transition-colors active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <button onClick={() => dateInputRef.current?.showPicker()}
          className="text-lg font-bold text-gray-800 dark:text-gray-100 hover:text-[#c0392b]
            transition-colors cursor-pointer select-none">
          {isDayNav ? dateLabel : activeRangeLabel}
        </button>
        <input ref={dateInputRef} type="date" value={selectedDate}
          onChange={e => { if (e.target.value) { setSelectedDate(e.target.value); setQuickRange('custom') } }}
          className="absolute w-0 h-0 opacity-0 pointer-events-none" tabIndex={-1} />

        {isDayNav && (
          <button onClick={goForward}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400
              transition-colors active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {isDayNav && selectedDate !== today && (
          <button onClick={() => { setSelectedDate(today); setQuickRange('day') }}
            className="ml-1 px-3 py-1 text-xs font-medium rounded-full
              bg-[#c0392b]/8 text-[#c0392b] hover:bg-[#c0392b]/15 transition-colors select-none">
            今天
          </button>
        )}

        <div className="flex-1" />

        {/* Quick range dropdown */}
        <div className="relative">
          <button onClick={() => setRangeOpen(!rangeOpen)}
            className={`h-9 px-4 rounded-full text-sm font-medium flex items-center gap-1
              transition-colors select-none no-press ${
              quickRange !== 'day'
                ? 'bg-[#c0392b]/10 text-[#c0392b]'
                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 hover:text-gray-700'
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
                rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[130px]
                animate-in fade-in slide-in-from-top-1 duration-150">
                {RANGES.map(r => (
                  <button key={r.key} onClick={() => handleRangeSelect(r.key)}
                    className={`w-full px-4 py-2.5 text-left text-base transition-colors ${
                      quickRange === r.key
                        ? 'text-[#c0392b] font-semibold bg-[#c0392b]/5'
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

      {/* Reflection (single-day only) */}
      {!isRangeMode && todayReflection && (
        <div className="panel p-3 border-l-4 border-[#c0392b]/30">
          <p className="text-xs font-semibold text-gray-400 mb-1">📝 当日反思</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{todayReflection.text}</p>
        </div>
      )}

      {/* Stats summary */}
      <div className="flex gap-3">
        <div className="panel p-3 flex-1 flex flex-col items-center gap-1">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#c0392b]/8 text-base">⏱</span>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100" style={{ letterSpacing: '-0.02em' }}>{fmtDuration(totalMinutes)}</p>
          <p className="text-xs text-gray-400">{t('ielts.totalMinutes')}</p>
        </div>
        <div className="panel p-3 flex-1 flex flex-col items-center gap-1">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#c0392b]/8 text-base">📝</span>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100" style={{ letterSpacing: '-0.02em' }}>{viewSessions.length}</p>
          <p className="text-xs text-gray-400">{t('ielts.sessions')}</p>
        </div>
        <div className="panel p-3 flex-1 flex flex-col items-center gap-1">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#c0392b]/8 text-base">❌</span>
          <p className={`text-2xl font-bold tabular-nums ${viewMistakes.length > 0 ? 'text-[#c0392b]' : 'text-gray-900 dark:text-gray-100'}`}
            style={{ letterSpacing: '-0.02em' }}>
            {viewMistakes.length}
          </p>
          <p className="text-xs text-gray-400">错题</p>
        </div>
      </div>

      {/* Practice timer */}
      <PracticeTimer onStop={handleTimerStop} />

      {/* Add session form */}
      <div ref={formRef}>
        <CollapsibleForm accentColor="#c0392b" addLabel={`+ ${t('ielts.addSession')}`}>
          <SessionForm
            date={effectiveDate}
            categories={sessions.categories}
            onAdd={sessions.addEntry}
            onAddMistake={mistakes.addEntry}
            onAddCategory={sessions.addCategory}
            onUpdateCategory={sessions.updateCategory}
            onDeleteCategory={sessions.deleteCategory}
            defaultMinutes={timerMinutes}
          />
        </CollapsibleForm>
      </div>

      {/* Search & filter — always visible */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索题库或备注..."
              data-shortcut="search"
              className="input-base w-full rounded-lg text-base h-11 pl-10" />
          </div>
        </div>

        {/* Subject filter — scrollable on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
          <button onClick={() => setSubjectFilter('all')}
            className={`${btnToggle(subjectFilter === 'all')} h-10 px-4 rounded-lg text-sm shrink-0`}>
            {t('ielts.allSubjects')}
            {viewSessions.length > 0 && (
              <span className="ml-1 text-xs opacity-60">{viewSessions.length}</span>
            )}
          </button>
          {IELTS_SUBJECTS.map(s => {
            const count = subjectCounts.get(s) ?? 0
            return (
              <button key={s} onClick={() => setSubjectFilter(s)}
                className={`h-10 px-4 rounded-lg text-sm font-medium transition-all select-none no-press
                  active:scale-[0.97] shrink-0 ${
                  subjectFilter === s
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-gray-600'
                }`}
                style={subjectFilter === s ? { backgroundColor: SUBJECT_COLORS[s] } : undefined}>
                {t(`ielts.${s}`)}
                {count > 0 && <span className="ml-1 text-xs opacity-60">{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Batch action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#c0392b]/5 border border-[#c0392b]/15">
            <span className="text-xs font-medium text-[#c0392b]">已选 {selectedIds.size} 项</span>
            <div className="flex-1" />
            <button onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded
                hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors select-none">
              取消选择
            </button>
            <button onClick={() => {
              const selected = filteredSessions.filter(s => selectedIds.has(s.id))
              const selectedMistakes = mistakes.entries.filter(m => selectedIds.has(m.sessionId))
              const data = { version: 1, sessions: selected, mistakes: selectedMistakes }
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `ielts-export-${effectiveDate}.json`
              a.click(); URL.revokeObjectURL(url)
              toast.success(`已导出 ${selected.length} 条记录`)
            }}
              className="text-xs font-medium text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full
                bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600
                transition-colors select-none">
              导出JSON
            </button>
            <button onClick={() => setConfirmBatchDelete(true)}
              className="text-xs font-medium text-white px-3 py-1.5 rounded-full
                hover:brightness-110 transition-colors select-none"
              style={{ backgroundColor: ACCENT }}>
              批量删除
            </button>
          </div>
        )}
      </div>

      {/* Session list */}
      <SessionList
        sessions={filteredSessions}
        mistakes={filteredMistakes}
        date={effectiveDate}
        onDeleteSession={(id) => {
          // Atomic delete — session + its mistakes in one call each
          sessions.deleteEntry(id)
          mistakes.setData(prev => ({
            ...prev,
            entries: prev.entries.filter(m => m.sessionId !== id),
          }))
        }}
        onAddMistake={mistakes.addEntry}
        onEditSession={(id, patch) => { sessions.updateEntry(id, patch); toast.success('已更新') }}
        showDate={isRangeMode}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onScrollToForm={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      />

      {/* Batch delete confirm */}
      <ConfirmDialog
        open={confirmBatchDelete}
        title="批量删除"
        message={`确定删除选中的 ${selectedIds.size} 条练习记录？此操作不可撤销。`}
        onConfirm={handleBatchDelete}
        onCancel={() => setConfirmBatchDelete(false)}
        variant="danger"
      />
    </div>
  )
}
