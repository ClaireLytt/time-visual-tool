import { useMemo } from 'react'
import { subDays, format, startOfWeek, eachDayOfInterval } from 'date-fns'
import { ACCENT } from './styles'
import type { IeltsSession } from './types'

interface Props { sessions: IeltsSession[] }

const WEEKS = 12
const CELL = 14
const GAP = 2

/** 4-level color scale based on minutes */
function getColor(minutes: number, isDark: boolean): string {
  if (minutes === 0) return isDark ? '#1f2937' : '#f3f4f6'
  if (minutes < 30) return isDark ? 'rgba(192,57,43,0.2)' : 'rgba(192,57,43,0.12)'
  if (minutes < 60) return isDark ? 'rgba(192,57,43,0.4)' : 'rgba(192,57,43,0.25)'
  if (minutes < 120) return isDark ? 'rgba(192,57,43,0.6)' : 'rgba(192,57,43,0.45)'
  return isDark ? 'rgba(192,57,43,0.85)' : 'rgba(192,57,43,0.7)'
}

const DAY_LABELS = ['一', '', '三', '', '五', '', '']

export default function StudyHeatmap({ sessions }: Props) {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  const { grid, maxMinutes } = useMemo(() => {
    // Build date → minutes map
    const minutesByDate = new Map<string, number>()
    for (const s of sessions) {
      minutesByDate.set(s.date, (minutesByDate.get(s.date) ?? 0) + s.minutes)
    }

    const today = new Date()
    const start = startOfWeek(subDays(today, (WEEKS - 1) * 7), { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start, end: today })

    // Build grid: array of weeks, each week is array of days
    const weeks: { date: string; minutes: number }[][] = []
    let currentWeek: { date: string; minutes: number }[] = []
    let maxMin = 0

    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayOfWeek = (day.getDay() + 6) % 7 // 0=Mon ... 6=Sun

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      const mins = minutesByDate.get(dateStr) ?? 0
      if (mins > maxMin) maxMin = mins
      currentWeek.push({ date: dateStr, minutes: mins })
    }
    if (currentWeek.length > 0) weeks.push(currentWeek)

    return { grid: weeks, maxMinutes: maxMin }
  }, [sessions])

  const totalWidth = grid.length * (CELL + GAP)

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
          <div className="flex gap-[2px]" style={{ width: totalWidth }}>
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {/* Pad first week if it doesn't start on Monday */}
                {wi === 0 && week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                  <div key={`pad-${i}`} style={{ width: CELL, height: CELL }} />
                ))}
                {week.map(day => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.minutes}min`}
                    className="rounded-[3px]"
                    style={{
                      width: CELL,
                      height: CELL,
                      backgroundColor: getColor(day.minutes, isDark),
                    }}
                  />
                ))}
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
    </div>
  )
}
