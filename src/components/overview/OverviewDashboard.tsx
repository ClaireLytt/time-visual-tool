import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { useTimeEntries } from '../../hooks/useTimeEntries'
import { useFinanceEntries } from '../../hooks/useFinanceEntries'
import { useEatingEntries } from '../../hooks/useEatingEntries'
import { useDiaryEntries } from '../../hooks/useDiaryEntries'
import { useSportEntries } from '../../hooks/useSportEntries'
import { ClockIcon, WalletIcon, UtensilsIcon, BookIcon, DumbbellIcon } from '../icons'
import GoalRing from '../common/GoalRing'
import StreakRow from './StreakRow'
import { formatCalories } from '../../utils/calories'
import { DEFAULT_DAILY_CALORIE_GOAL } from '../../constants/eating'
import type { AppMode } from '../../types'

interface OverviewDashboardProps {
  onNavigate: (mode: AppMode) => void
}

function OverviewDashboard({ onNavigate }: OverviewDashboardProps) {
  const { t, i18n } = useTranslation()
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const locale = i18n.language === 'zh' ? zhCN : enUS
  const dateLabel = format(new Date(), i18n.language === 'zh' ? 'M月d日 EEEE' : 'EEEE, MMM d', { locale })

  // All module hooks
  const time = useTimeEntries()
  const finance = useFinanceEntries()
  const eating = useEatingEntries()
  const diary = useDiaryEntries()
  const sport = useSportEntries()

  // Today's data
  const timeToday = useMemo(() => time.getEntriesForDate(today), [time.getEntriesForDate, today])
  const financeToday = useMemo(() => finance.getEntriesForDate(today), [finance.getEntriesForDate, today])
  const eatingToday = useMemo(() => eating.getEntriesForDate(today), [eating.getEntriesForDate, today])
  const sportToday = useMemo(() => sport.getEntriesForDate(today), [sport.getEntriesForDate, today])
  const diaryToday = useMemo(() => diary.getEntry('day', today), [diary.getEntry, today])

  // Aggregations
  const timeMinutes = useMemo(() => timeToday.reduce((s, e) => s + e.duration, 0), [timeToday])
  const timeHours = timeMinutes / 60

  const financeIncome = useMemo(() => financeToday.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0), [financeToday])
  const financeExpense = useMemo(() => financeToday.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0), [financeToday])

  const eatingCalories = useMemo(() => eatingToday.reduce((s, e) => s + e.calories, 0), [eatingToday])

  const sportDuration = useMemo(() => sportToday.reduce((s, e) => s + e.duration, 0), [sportToday])
  const sportCalories = useMemo(() => sportToday.reduce((s, e) => s + e.calories, 0), [sportToday])

  const hasDiary = diaryToday != null && (diaryToday.gratitude || diaryToday.feelings || diaryToday.motivation)

  // Streak dates
  const timeDates = useMemo(() => time.entries.map(e => e.date), [time.entries])
  const financeDates = useMemo(() => finance.entries.map(e => e.date), [finance.entries])
  const eatingDates = useMemo(() => eating.entries.map(e => e.date), [eating.entries])
  const diaryDates = useMemo(() => diary.entries.filter(e => e.periodType === 'day').map(e => e.periodKey), [diary.entries])
  const sportDates = useMemo(() => sport.entries.map(e => e.date), [sport.entries])

  const anyLoading = time.loading || finance.loading || eating.loading || diary.loading || sport.loading

  if (anyLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-calm-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div id="main-content" className="space-y-4">
      {/* Date header */}
      <h2 className="text-lg font-bold tracking-tight-sm text-gray-800 dark:text-gray-100">{dateLabel}</h2>

      {/* Time card */}
      <button onClick={() => onNavigate('time')} className="panel p-4 w-full text-left flex items-center gap-4 transition-all hover:shadow-elevated no-press">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/15 flex items-center justify-center shrink-0">
          <ClockIcon className="w-5 h-5 text-mode-time" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-gray-800 dark:text-gray-100">
              {timeHours < 1 ? `${timeMinutes}m` : `${timeHours.toFixed(1)}h`}
            </span>
            {time.dailyHoursGoal && (
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">/ {time.dailyHoursGoal}h</span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{timeToday.length} {t('eating.countUnit', { count: timeToday.length })}</p>
        </div>
        {time.dailyHoursGoal && (
          <div className="shrink-0">
            <MiniRing ratio={timeHours / time.dailyHoursGoal} color="#6b8db5" />
          </div>
        )}
      </button>

      {/* Finance card */}
      <button onClick={() => onNavigate('finance')} className="panel p-4 w-full text-left flex items-center gap-4 transition-all hover:shadow-elevated no-press">
        <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/15 flex items-center justify-center shrink-0">
          <WalletIcon className="w-5 h-5 text-mode-finance" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {financeIncome > 0 && (
              <span className="text-sm font-semibold text-green-600 dark:text-green-400 tabular-nums">
                +¥{financeIncome.toLocaleString()}
              </span>
            )}
            {financeExpense > 0 && (
              <span className="text-sm font-semibold text-red-500 dark:text-red-400 tabular-nums">
                −¥{financeExpense.toLocaleString()}
              </span>
            )}
            {financeIncome === 0 && financeExpense === 0 && (
              <span className="text-sm text-gray-400 dark:text-gray-500">¥0</span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{financeToday.length} {t('eating.countUnit', { count: financeToday.length })}</p>
        </div>
        {finance.monthlyBudget && financeExpense > 0 && (
          <div className="shrink-0">
            <MiniRing ratio={financeExpense / finance.monthlyBudget} color="#7aab8e" />
          </div>
        )}
      </button>

      {/* Eating card */}
      <button onClick={() => onNavigate('eating')} className="panel p-4 w-full text-left flex items-center gap-4 transition-all hover:shadow-elevated no-press">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/15 flex items-center justify-center shrink-0">
          <UtensilsIcon className="w-5 h-5 text-mode-eating" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-gray-800 dark:text-gray-100">
              {eatingCalories.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{t('eating.calorieUnit')}</span>
            {eating.dailyCalorieGoal && (
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">/ {eating.dailyCalorieGoal.toLocaleString()}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{eatingToday.length} {t('overview.meals')}</p>
        </div>
        {eating.dailyCalorieGoal && (
          <div className="shrink-0">
            <MiniRing ratio={eatingCalories / (eating.dailyCalorieGoal ?? DEFAULT_DAILY_CALORIE_GOAL)} color="#c4a36b" />
          </div>
        )}
      </button>

      {/* Sport card */}
      <button onClick={() => onNavigate('sport')} className="panel p-4 w-full text-left flex items-center gap-4 transition-all hover:shadow-elevated no-press">
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/15 flex items-center justify-center shrink-0">
          <DumbbellIcon className="w-5 h-5 text-mode-sport" />
        </div>
        <div className="flex-1 min-w-0">
          {sportToday.length > 0 ? (
            <>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold tabular-nums text-gray-800 dark:text-gray-100">
                  {sportDuration}m
                </span>
                {sportCalories > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
                    {sportCalories.toLocaleString()} {t('eating.calorieUnit')}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{sportToday.length} {t('eating.countUnit', { count: sportToday.length })}</p>
            </>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">{t('overview.restDay')}</span>
          )}
        </div>
      </button>

      {/* Diary card */}
      <button onClick={() => onNavigate('diary')} className="panel p-4 w-full text-left flex items-center gap-4 transition-all hover:shadow-elevated no-press">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/15 flex items-center justify-center shrink-0">
          <BookIcon className="w-5 h-5 text-mode-diary" />
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${hasDiary ? 'text-mode-diary' : 'text-gray-400 dark:text-gray-500'}`}>
            {hasDiary ? t('overview.written') : t('overview.notYet')}
          </span>
          {hasDiary && diaryToday?.gratitude && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{diaryToday.gratitude}</p>
          )}
        </div>
        {hasDiary && (
          <svg className="w-5 h-5 text-mode-diary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Streak row */}
      <div className="panel p-3">
        <StreakRow
          timeDates={timeDates}
          financeDates={financeDates}
          eatingDates={eatingDates}
          diaryDates={diaryDates}
          sportDates={sportDates}
        />
      </div>
    </div>
  )
}

/** Compact 32px progress ring for card right side */
function MiniRing({ ratio, color }: { ratio: number; color: string }) {
  const size = 32
  const sw = 3
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.min(ratio, 1)
  const ringColor = ratio > 1 ? '#c47070' : ratio > 0.8 ? color : '#7aab8e'

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} className="text-gray-100 dark:text-gray-700/50" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={ringColor} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - clamped)}
      />
    </svg>
  )
}

export default OverviewDashboard
