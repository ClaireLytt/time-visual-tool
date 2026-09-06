import { useState, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { useTimeEntries } from '../../hooks/useTimeEntries'
import DatePicker from './DatePicker'
import DaySummaryCard from './DaySummaryCard'
import ViewModeToggle from './ViewModeToggle'
import EntryForm from '../entries/EntryForm'
import EntryList from '../entries/EntryList'
import TimeProportionChart from '../charts/TimeProportionChart'
import DailyBreakdownChart from '../charts/DailyBreakdownChart'
import type { TimeEntry, ViewMode } from '../../types'

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const { addEntry, deleteEntry, updateEntry, getEntriesForDate, getSummaryForPeriod } = useTimeEntries()

  const dayEntries = useMemo(() => getEntriesForDate(selectedDate), [getEntriesForDate, selectedDate])
  const periodSummary = useMemo(() => getSummaryForPeriod(selectedDate, viewMode), [getSummaryForPeriod, selectedDate, viewMode])

  const isDaily = viewMode === 'day'

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date)
    setEditingEntry(null)
  }, [])

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    setEditingEntry(null)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingEntry(null)
  }, [])

  return (
    <div>
      <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
      <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} viewMode={viewMode} />
      <DaySummaryCard
        totalMinutes={periodSummary.totalMinutes}
        weightedMinutes={periodSummary.weightedMinutes}
        entryCount={periodSummary.entryCount}
      />

      {!isDaily && (
        <div className="mb-4">
          <DailyBreakdownChart dailyBreakdown={periodSummary.dailyBreakdown} />
        </div>
      )}

      <div className={isDaily ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-4'}>
        {isDaily && (
          <div className="space-y-4">
            <EntryForm
              selectedDate={selectedDate}
              onAdd={addEntry}
              editingEntry={editingEntry}
              onUpdate={updateEntry}
              onCancelEdit={handleCancelEdit}
            />
            <EntryList entries={dayEntries} onDelete={deleteEntry} onEdit={setEditingEntry} />
          </div>
        )}
        <div>
          <TimeProportionChart
            categoryBreakdown={periodSummary.categoryBreakdown}
            totalMinutes={periodSummary.totalMinutes}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
