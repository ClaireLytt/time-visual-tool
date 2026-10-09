import { useMemo } from 'react'
import { ClockIcon, WalletIcon, UtensilsIcon, BookIcon, DumbbellIcon } from '../icons'
import { computeStreak } from '../../utils/streaks'

interface StreakRowProps {
  timeDates: string[]
  financeDates: string[]
  eatingDates: string[]
  diaryDates: string[]
  sportDates: string[]
}

const MODULES = [
  { key: 'time', Icon: ClockIcon, color: '#6b8db5' },
  { key: 'finance', Icon: WalletIcon, color: '#7aab8e' },
  { key: 'eating', Icon: UtensilsIcon, color: '#c4a36b' },
  { key: 'diary', Icon: BookIcon, color: '#9b8db5' },
  { key: 'sport', Icon: DumbbellIcon, color: '#6ba5a0' },
] as const

function StreakRow({ timeDates, financeDates, eatingDates, diaryDates, sportDates }: StreakRowProps) {
  const streaks = useMemo(() => ({
    time: computeStreak(timeDates),
    finance: computeStreak(financeDates),
    eating: computeStreak(eatingDates),
    diary: computeStreak(diaryDates),
    sport: computeStreak(sportDates),
  }), [timeDates, financeDates, eatingDates, diaryDates, sportDates])

  return (
    <div className="flex justify-center gap-2 flex-wrap">
      {MODULES.map(({ key, Icon, color }) => {
        const count = streaks[key]
        const isHot = count >= 3
        return (
          <div
            key={key}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: count > 0 ? `${color}15` : undefined,
              border: `1px solid ${count > 0 ? `${color}30` : 'rgba(0,0,0,0.06)'}`,
              color: count > 0 ? color : '#999',
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="tabular-nums font-semibold">{count}</span>
            {isHot && <span className="text-[10px]">🔥</span>}
          </div>
        )
      })}
    </div>
  )
}

export default StreakRow
