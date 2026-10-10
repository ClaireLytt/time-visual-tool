import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays, startOfWeek } from 'date-fns'

interface HabitHeatmapProps {
  getCheckedCountForDate: (date: string) => number
}

const WEEKS = 12
const CELL_SIZE = 14
const GAP = 2

export default function HabitHeatmap({ getCheckedCountForDate }: HabitHeatmapProps) {
  const { t } = useTranslation()

  const { cells, monthLabels } = useMemo(() => {
    const today = new Date()
    const mondayThisWeek = startOfWeek(today, { weekStartsOn: 1 })
    const startDate = subDays(mondayThisWeek, (WEEKS - 1) * 7)

    const cellData: { date: string; count: number; col: number; row: number }[] = []
    const months: { label: string; col: number }[] = []
    let lastMonth = -1

    for (let week = 0; week < WEEKS; week++) {
      for (let day = 0; day < 7; day++) {
        const d = new Date(startDate)
        d.setDate(startDate.getDate() + week * 7 + day)
        if (d > today) continue
        const dateStr = format(d, 'yyyy-MM-dd')
        const count = getCheckedCountForDate(dateStr)
        cellData.push({ date: dateStr, count, col: week, row: day })

        // Track month boundaries (first day of month in this week)
        const m = d.getMonth()
        if (m !== lastMonth && day === 0) {
          months.push({ label: format(d, 'MMM'), col: week })
          lastMonth = m
        }
      }
    }

    return { cells: cellData, monthLabels: months }
  }, [getCheckedCountForDate])

  const getColor = (count: number): string => {
    if (count === 0) return 'rgba(232,168,56,0.08)'
    if (count <= 2) return 'rgba(232,168,56,0.4)'
    return 'rgba(232,168,56,0.85)'
  }

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', '']
  const labelWidth = 28
  const gridWidth = WEEKS * (CELL_SIZE + GAP) - GAP
  const gridHeight = 7 * (CELL_SIZE + GAP) - GAP

  return (
    <div className="panel p-4">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
        {t('habit.heatmapTitle')}
      </p>

      <div className="overflow-x-auto">
        <div style={{ width: labelWidth + gridWidth, minWidth: labelWidth + gridWidth }}>
          {/* Month labels */}
          <div className="relative flex" style={{ paddingLeft: labelWidth, marginBottom: 4, height: 14 }}>
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-400 dark:text-gray-500"
                style={{
                  position: 'absolute' as const,
                  left: labelWidth + m.col * (CELL_SIZE + GAP),
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid with day labels */}
          <div className="relative" style={{ marginTop: 16 }}>
            <div className="flex">
              {/* Day labels */}
              <div
                className="shrink-0 flex flex-col"
                style={{ width: labelWidth, height: gridHeight, justifyContent: 'space-between' }}
              >
                {dayLabels.map((label, i) => (
                  <span
                    key={i}
                    className="text-[10px] text-gray-400 dark:text-gray-500 leading-none"
                    style={{ height: CELL_SIZE, display: 'flex', alignItems: 'center' }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Heatmap grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${WEEKS}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                  gap: `${GAP}px`,
                }}
              >
                {cells.map((cell, i) => (
                  <div
                    key={i}
                    title={`${cell.date}: ${cell.count}`}
                    className="rounded-sm"
                    style={{
                      gridColumn: cell.col + 1,
                      gridRow: cell.row + 1,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: getColor(cell.count),
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
