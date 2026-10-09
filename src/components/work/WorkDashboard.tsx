import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useWorkEntries } from '../../hooks/useWorkEntries'
import DatePicker from '../dashboard/DatePicker'
import WorkForm from './WorkForm'
import WorkList from './WorkList'
import WorkProjectStats from './WorkProjectStats'
import CollapsibleForm from '../common/CollapsibleForm'

export default function WorkDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const { entries: allEntries, addEntry, deleteEntry, getEntriesForDate } = useWorkEntries()

  const dayEntries = useMemo(() => getEntriesForDate(selectedDate), [getEntriesForDate, selectedDate])
  const recentProjects = useMemo(() => [...new Set(allEntries.slice(-20).map(e => e.project))].slice(0, 5), [allEntries])
  const totalMinutes = useMemo(() => dayEntries.reduce((s, e) => s + e.duration, 0), [dayEntries])
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  return (
    <div id="main-content" className="space-y-4">
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} viewMode="day" />

      {/* Summary */}
      <div className="panel p-4">
        <p className="font-pixel text-[8px] text-[#e67e22] mb-2">🏢 GUILD HALL</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums tracking-display text-gray-900 dark:text-gray-100">
            {hours > 0 ? `${hours}h${mins > 0 ? `${mins}m` : ''}` : `${mins}m`}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('work.totalDuration')}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {dayEntries.length} {t('work.entryCount')}
        </p>
      </div>

      {/* Form */}
      <CollapsibleForm accentColor="#e67e22" addLabel={t('work.addButton')}>
        <WorkForm selectedDate={selectedDate} onAdd={addEntry} recentProjects={recentProjects} />
      </CollapsibleForm>

      {/* List */}
      <div className="panel p-4">
        <WorkList entries={dayEntries} onDelete={deleteEntry} onRepeat={e => addEntry({ ...e, id: crypto.randomUUID(), date: selectedDate, createdAt: new Date().toISOString() })} />
      </div>

      {/* Project breakdown */}
      <WorkProjectStats entries={dayEntries} />
    </div>
  )
}
