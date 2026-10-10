import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { useTimeEntries } from '../../hooks/useTimeEntries'
import { useFinanceEntries } from '../../hooks/useFinanceEntries'
import { useEatingEntries } from '../../hooks/useEatingEntries'
import { useDiaryEntries } from '../../hooks/useDiaryEntries'
import { useSportEntries } from '../../hooks/useSportEntries'
import { useHabitEntries } from '../../hooks/useHabitEntries'
import { useTodoEntries } from '../../hooks/useTodoEntries'
import { useStudyEntries } from '../../hooks/useStudyEntries'
import { useWorkEntries } from '../../hooks/useWorkEntries'
import StreakRow from './StreakRow'
import WeeklySparklines from './WeeklySparklines'
import { useEpisodeStats } from '../../hooks/useEpisodeStats'
import { exportAllData } from '../../utils/exportAllData'
import { MODE_ACCENT } from '../../constants/modes'
import { SCENE_COMPONENTS } from './PixelScenes'
import type { AppMode } from '../../types'

interface OverviewDashboardProps {
  onNavigate: (mode: AppMode) => void
}

/* ── Reusable card shell with pixel scene ── */
function Card({ mode, scene, children, onClick }: {
  mode: AppMode
  scene: string
  children: React.ReactNode
  onClick?: () => void
}) {
  const color = MODE_ACCENT[mode]
  const Scene = SCENE_COMPONENTS[mode]
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className="panel w-full text-left overflow-hidden no-press"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {Scene && (
        <div className="w-full overflow-hidden bg-black/5 dark:bg-white/5 h-6">
          <Scene />
        </div>
      )}
      <div className="px-2 py-1.5 flex flex-col gap-0.5">
        <span className="font-pixel text-[8px] leading-none" style={{ color }}>{scene}</span>
        {children}
      </div>
    </Tag>
  )
}

function OverviewDashboard({ onNavigate }: OverviewDashboardProps) {
  const { t, i18n } = useTranslation()
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const locale = i18n.language === 'zh' ? zhCN : enUS
  const dateLabel = format(new Date(), i18n.language === 'zh' ? 'M月d日 EEEE' : 'EEEE, MMM d', { locale })

  const time = useTimeEntries()
  const finance = useFinanceEntries()
  const eating = useEatingEntries()
  const diary = useDiaryEntries()
  const sport = useSportEntries()
  const habit = useHabitEntries()
  const todo = useTodoEntries()
  const study = useStudyEntries()
  const work = useWorkEntries()
  const episodeStats = useEpisodeStats()

  // Today's aggregations
  const timeToday = useMemo(() => time.getEntriesForDate(today), [time.getEntriesForDate, today])
  const timeMinutes = useMemo(() => timeToday.reduce((s, e) => s + e.duration, 0), [timeToday])
  const timeHours = timeMinutes / 60

  const financeToday = useMemo(() => finance.getEntriesForDate(today), [finance.getEntriesForDate, today])
  const financeIncome = useMemo(() => financeToday.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0), [financeToday])
  const financeExpense = useMemo(() => financeToday.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0), [financeToday])

  const eatingToday = useMemo(() => eating.getEntriesForDate(today), [eating.getEntriesForDate, today])
  const eatingCalories = useMemo(() => eatingToday.reduce((s, e) => s + e.calories, 0), [eatingToday])

  const sportToday = useMemo(() => sport.getEntriesForDate(today), [sport.getEntriesForDate, today])
  const sportDuration = useMemo(() => sportToday.reduce((s, e) => s + e.duration, 0), [sportToday])

  const diaryToday = useMemo(() => diary.getEntry('day', today), [diary.getEntry, today])
  const hasDiary = diaryToday != null && (diaryToday.gratitude || diaryToday.feelings || diaryToday.motivation)

  const habitCheckedCount = useMemo(() => habit.getCheckedCountForDate(today), [habit.getCheckedCountForDate, today])

  const todoToday = useMemo(() => todo.getItemsForDate(today), [todo.getItemsForDate, today])
  const todoDoneCount = useMemo(() => todoToday.filter(item => item.done).length, [todoToday])

  const studyToday = useMemo(() => study.getEntriesForDate(today), [study.getEntriesForDate, today])
  const studyMinutes = useMemo(() => studyToday.reduce((s, e) => s + e.duration, 0), [studyToday])

  const workToday = useMemo(() => work.getEntriesForDate(today), [work.getEntriesForDate, today])
  const workMinutes = useMemo(() => workToday.reduce((s, e) => s + e.duration, 0), [workToday])

  const podcastStarred = useMemo(() => Object.values(episodeStats.stats).filter(e => e.starred).length, [episodeStats.stats])
  const podcastWords = useMemo(() => Object.values(episodeStats.stats).reduce((s, e) => s + e.wordCount, 0), [episodeStats.stats])

  // Streaks
  const timeDates = useMemo(() => time.entries.map(e => e.date), [time.entries])
  const financeDates = useMemo(() => finance.entries.map(e => e.date), [finance.entries])
  const eatingDates = useMemo(() => eating.entries.map(e => e.date), [eating.entries])
  const diaryDates = useMemo(() => diary.entries.filter(e => e.periodType === 'day').map(e => e.periodKey), [diary.entries])
  const sportDates = useMemo(() => sport.entries.map(e => e.date), [sport.entries])

  // Quick todo
  const [quickTodo, setQuickTodo] = useState('')
  const handleQuickTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTodo.trim()) return
    todo.addItem({ id: crypto.randomUUID(), text: quickTodo.trim(), done: false, priority: 'medium', date: today, createdAt: new Date().toISOString() })
    setQuickTodo('')
  }

  // Format helper
  const fmtDuration = (m: number) => m < 60 ? `${m}m` : `${(m / 60).toFixed(1)}h`

  return (
    <div id="main-content" className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-pixel text-[10px] text-px-gold">📍 HUB WORLD</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{dateLabel}</h2>
        </div>
      </div>

      {/* ── Hero: Time ── */}
      <button
        onClick={() => onNavigate('time')}
        className="panel-hero w-full text-left overflow-hidden no-press"
        style={{ borderLeft: `3px solid ${MODE_ACCENT.time}` }}
      >
        <div className="w-full overflow-hidden bg-black/5 dark:bg-white/5 h-8">
          {(() => { const S = SCENE_COMPONENTS.time; return S ? <S /> : null })()}
        </div>
        <div className="px-3 py-2 flex items-end justify-between gap-3">
          <div>
            <span className="font-pixel text-[8px] text-px-blue">⚔️ DUNGEON</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold tabular-nums tracking-display text-gray-900 dark:text-gray-100">
                {fmtDuration(timeMinutes)}
              </span>
              {time.dailyHoursGoal && (
                <span className="text-sm text-gray-400 tabular-nums">/ {time.dailyHoursGoal}h</span>
              )}
            </div>
          </div>
          {time.dailyHoursGoal && (
            <MiniRing ratio={timeHours / time.dailyHoursGoal} color="#0099db" size={36} />
          )}
        </div>
      </button>

      {/* ── 2×3 Grid: Finance, Eating, Sport, Diary, Study, Work ── */}
      <div className="grid grid-cols-3 gap-2">
        <Card mode="finance" scene="💰 TREASURE" onClick={() => onNavigate('finance')}>
          <div className="flex items-center gap-1 flex-wrap">
            {financeIncome > 0 && <span className="text-sm font-bold text-px-green tabular-nums">+¥{financeIncome.toLocaleString()}</span>}
            {financeExpense > 0 && <span className="text-sm font-bold text-px-red tabular-nums">−¥{financeExpense.toLocaleString()}</span>}
            {financeIncome === 0 && financeExpense === 0 && <span className="text-sm text-gray-400">¥0</span>}
          </div>
        </Card>

        <Card mode="eating" scene="🍺 TAVERN" onClick={() => onNavigate('eating')}>
          <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">{eatingCalories.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">kcal</span></span>
        </Card>

        <Card mode="sport" scene="⚔️ ARENA" onClick={() => onNavigate('sport')}>
          {sportToday.length > 0
            ? <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">{fmtDuration(sportDuration)}</span>
            : <span className="text-xs text-gray-400">{t('overview.restDay')}</span>
          }
        </Card>

        <Card mode="diary" scene="📜 LIBRARY" onClick={() => onNavigate('diary')}>
          <span className={`text-sm font-semibold ${hasDiary ? 'text-px-purple' : 'text-gray-400'}`}>
            {hasDiary ? '✓ ' + t('overview.written') : t('overview.notYet')}
          </span>
        </Card>

        <Card mode="study" scene="🎓 ACADEMY" onClick={() => onNavigate('study')}>
          <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">{fmtDuration(studyMinutes)}</span>
          <span className="text-[10px] text-gray-400">{studyToday.length} {t('study.entryCount')}</span>
        </Card>

        <Card mode="work" scene="🏢 GUILD HALL" onClick={() => onNavigate('work')}>
          <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">{fmtDuration(workMinutes)}</span>
          <span className="text-[10px] text-gray-400">{workToday.length} {t('work.entryCount')}</span>
        </Card>

        <Card mode="podcast" scene="🎧 BARD HALL" onClick={() => onNavigate('podcast')}>
          <div className="flex items-center gap-1">
            {podcastStarred > 0 && <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">⭐{podcastStarred}</span>}
            {podcastWords > 0 && <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">📝{podcastWords}</span>}
            {podcastStarred === 0 && podcastWords === 0 && <span className="text-xs text-gray-400">{t('podcastApp.subtitle')}</span>}
          </div>
        </Card>
      </div>

      {/* ── Habit: inline check-in ── */}
      <Card mode="habit" scene="🏰 CASTLE">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">{habitCheckedCount}/{habit.habits.length}</span>
          <button onClick={() => onNavigate('habit')} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 no-press">→</button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {habit.habits.slice(0, 6).map(h => {
            const checked = habit.isChecked(h.id, today)
            return (
              <button
                key={h.id}
                onClick={() => habit.toggleCheck(h.id, today)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all no-press ${checked ? 'text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500'}`}
                style={checked ? { backgroundColor: h.color } : undefined}
              >
                {h.icon} {h.name}
              </button>
            )
          })}
        </div>
      </Card>

      {/* ── Todo: inline quick-add ── */}
      <Card mode="todo" scene="📋 QUEST LOG">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">{todoDoneCount}/{todoToday.length}</span>
          <button onClick={() => onNavigate('todo')} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 no-press">→</button>
        </div>
        <form className="flex gap-1.5 mt-0.5" onSubmit={handleQuickTodo}>
          <input value={quickTodo} onChange={e => setQuickTodo(e.target.value)} placeholder="+" className="input-base flex-1 text-xs py-1" />
        </form>
      </Card>

      {/* ── Streaks ── */}
      <div className="panel p-3">
        <StreakRow timeDates={timeDates} financeDates={financeDates} eatingDates={eatingDates} diaryDates={diaryDates} sportDates={sportDates} />
      </div>

      {/* ── 7-day Sparklines ── */}
      <WeeklySparklines data={useMemo(() => {
        const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'))
        return [
          { emoji: '⏱', label: 'Time', color: '#0099db', values: last7.map(d => time.getEntriesForDate(d).reduce((s, e) => s + e.duration, 0)) },
          { emoji: '💰', label: 'Finance', color: '#3e8948', values: last7.map(d => finance.getEntriesForDate(d).length) },
          { emoji: '🍽', label: 'Eating', color: '#f77622', values: last7.map(d => eating.getEntriesForDate(d).length) },
          { emoji: '🏃', label: 'Sport', color: '#2ce8f5', values: last7.map(d => sport.getEntriesForDate(d).reduce((s, e) => s + e.duration, 0)) },
          { emoji: '🏰', label: 'Habit', color: '#e8a838', values: last7.map(d => habit.getCheckedCountForDate(d)) },
          { emoji: '📋', label: 'Todo', color: '#5b8def', values: last7.map(d => todo.getItemsForDate(d).filter(item => item.done).length) },
          { emoji: '🎓', label: 'Study', color: '#4a90d9', values: last7.map(d => study.getEntriesForDate(d).reduce((s, e) => s + e.duration, 0)) },
          { emoji: '🏢', label: 'Work', color: '#e67e22', values: last7.map(d => work.getEntriesForDate(d).reduce((s, e) => s + e.duration, 0)) },
        ]
      }, [time.getEntriesForDate, finance.getEntriesForDate, eating.getEntriesForDate, sport.getEntriesForDate, habit.getCheckedCountForDate, todo.getItemsForDate, study.getEntriesForDate, work.getEntriesForDate])} />

      {/* ── Export ── */}
      <button
        onClick={() => exportAllData({
          timeData: time.data, financeData: finance.data, eatingData: eating.data,
          diaryData: diary.data, sportData: sport.data,
          habitData: { habits: habit.habits, checks: habit.checks },
          todoData: { items: todo.items },
          studyData: { entries: study.entries },
          workData: { entries: work.entries },
        })}
        className="panel p-3 w-full text-center no-press hover:shadow-elevated transition-shadow"
      >
        <span className="font-pixel text-[8px] text-gray-400 dark:text-gray-500 block mb-0.5">💾 SAVE GAME</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('overview.exportAll')}</span>
      </button>
    </div>
  )
}

function MiniRing({ ratio, color, size = 32 }: { ratio: number; color: string; size?: number }) {
  const sw = 3
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.min(ratio, 1)
  const ringColor = ratio > 1 ? '#c47070' : ratio > 0.8 ? color : '#7aab8e'
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} className="text-gray-100 dark:text-gray-700/50" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringColor} strokeWidth={sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - clamped)} />
    </svg>
  )
}

export default OverviewDashboard
