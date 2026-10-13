import { useMemo, useState } from 'react'
import { subDays, format, startOfWeek, eachDayOfInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useIsDark } from './styles'
import type { IeltsSession } from './types'

interface Props {
  sessions: IeltsSession[]
  onDateClick?: (date: string) => void
}

const WEEKS = 12
const CELL = 13
const GAP = 3

function getColor(minutes: number, isDark: boolean): string {
  if (minutes === 0) return isDark ? '#1f2937' : '#f3f0eb'
  if (minutes < 30) return isDark ? 'rgba(192,57,43,0.2)' : '#fce4ec'
  if (minutes < 60) return isDark ? 'rgba(192,57,43,0.4)' : '#e8a5ad'
  if (minutes < 120) return isDark ? 'rgba(192,57,43,0.6)' : '#d06b75'
  return isDark ? 'rgba(192,57,43,0.85)' : '#b83a48'
}

const DAY_LABELS = ['一', '', '三', '', '五', '', '']

export default function StudyHeatmap({ sessions, onDateClick }: Props) {
  const isDark = useIsDark()
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  const { grid, sessionCountByDate } = useMemo(() => {
    const minutesByDate = new Map<string, number>()
    const countByDate = new Map<string, number>()
    for (const s of sessions) {
      minutesByDate.set(s.date, (minutesByDate.get(s.date) ?? 0) + s.minutes)
      countByDate.set(s.date, (countByDate.get(s.date) ?? 0) + 1)
    }

    const today = new Date()
    const start = startOfWeek(subDays(today, (WEEKS - 1) * 7), { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start, end: today })

    const weeks: { date: string; minutes: number }[][] = []
    let currentWeek: { date: string; minutes: number }[] = []

    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayOfWeek = (day.getDay() + 6) % 7

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      const mins = minutesByDate.get(dateStr) ?? 0
      currentWeek.push({ date: dateStr, minutes: mins })
    }
    if (currentWeek.length > 0) weeks.push(currentWeek)

    return { grid: weeks, sessionCountByDate: countByDate }
  }, [sessions])

  const totalWidth = grid.length * (CELL + GAP)

  const handleHover = (e: React.MouseEvent, day: { date: string; minutes: number }) => {
    if (day.minutes === 0 && !sessionCountByDate.get(day.date)) {
      setTooltip(null)
      return
    }
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const count = sessionCountByDate.get(day.date) ?? 0
    const dateLabel = format(new Date(day.date + 'T12:00:00'), 'M月d日 EEEE', { locale: zhCN })
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      text: `${dateLabel} · ${day.minutes}min · ${count}场`,
    })
  }

  return (
    <div className="panel p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">学习日历</p>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col justify-between" style={{ height: 7 * (CELL + GAP) - GAP, paddingTop: 1 }}>
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="text-[9px] text-gray-400 leading-none" style={{ height: CELL, lineHeight: `${CELL}px` }}>
              {label}
            </span>
          ))}
        </div>
        {/* Grid */}
        <div className="overflow-x-auto flex-1">
          <div className="flex gap-[3px]" style={{ width: totalWidth }}>
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {wi === 0 && week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                  <div key={`pad-${i}`} style={{ width: CELL, height: CELL }} />
                ))}
                {week.map(day => {
                  const isToday = day.date === format(new Date(), 'yyyy-MM-dd')
                  return (
                    <div
                      key={day.date}
                      className={`rounded-[4px] transition-all duration-150 ${
                        onDateClick && day.minutes > 0 ? 'cursor-pointer hover:scale-[1.15]' : ''
                      } ${isToday ? 'ring-2 ring-white ring-offset-1' : ''}`}
                      style={{
                        width: CELL,
                        height: CELL,
                        backgroundColor: getColor(day.minutes, isDark),
                      }}
                      onClick={() => onDateClick?.(day.date)}
                      onMouseEnter={(e) => handleHover(e, day)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-xs text-gray-400">少</span>
        {[0, 15, 45, 90, 150].map(m => (
          <div
            key={m}
            className="rounded-[2px]"
            style={{ width: 10, height: 10, backgroundColor: getColor(m, isDark) }}
          />
        ))}
        <span className="text-xs text-gray-400">多</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed z-50 pointer-events-none px-3 py-2 rounded-xl text-xs font-medium
          bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
          shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700
          -translate-x-1/2 -translate-y-full whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
