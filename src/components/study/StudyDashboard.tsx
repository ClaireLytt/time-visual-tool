import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useStudyEntries } from '../../hooks/useStudyEntries'
import DatePicker from '../dashboard/DatePicker'
import StudyForm from './StudyForm'
import StudyList from './StudyList'
import StudySubjectStats from './StudySubjectStats'
import CollapsibleForm from '../common/CollapsibleForm'

export default function StudyDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const { entries: allEntries, addEntry, deleteEntry, getEntriesForDate } = useStudyEntries()

  const dayEntries = useMemo(() => getEntriesForDate(selectedDate), [getEntriesForDate, selectedDate])
  const recentSubjects = useMemo(() => [...new Set(allEntries.slice(-20).map(e => e.subject))].slice(0, 5), [allEntries])
  const totalMinutes = useMemo(() => dayEntries.reduce((s, e) => s + e.duration, 0), [dayEntries])
  const display = totalMinutes >= 60
    ? `${(totalMinutes / 60).toFixed(1)}h`
    : `${totalMinutes}m`

  return (
    <div id="main-content" className="space-y-4">
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} viewMode="day" />

      {/* Summary */}
      <div className="panel p-4">
        <p className="font-pixel text-[8px] text-[#4a90d9] mb-2">🎓 ACADEMY</p>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tabular-nums tracking-display text-gray-900 dark:text-gray-100">
            {display}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('study.totalDuration')}</span>
          <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">
            {dayEntries.length} {t('study.entryCount')}
          </span>
        </div>
      </div>

      {/* Form */}
      <CollapsibleForm accentColor="#4a90d9" addLabel={t('study.addButton')}>
        <StudyForm selectedDate={selectedDate} onAdd={addEntry} recentSubjects={recentSubjects} />
      </CollapsibleForm>

      {/* List */}
      <div className="panel p-4">
        <StudyList entries={dayEntries} onDelete={deleteEntry} onRepeat={e => addEntry({ ...e, id: crypto.randomUUID(), date: selectedDate, createdAt: new Date().toISOString() })} />
      </div>

      {/* Subject breakdown */}
      <StudySubjectStats entries={dayEntries} />
    </div>
  )
}
