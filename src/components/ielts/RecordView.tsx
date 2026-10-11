/* ─── IELTS — Record View (Session + Mistake Entry) ─── */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import DatePicker from '../dashboard/DatePicker'
import CollapsibleForm from '../common/CollapsibleForm'
import SessionForm from './SessionForm'
import SessionList from './SessionList'
import { useIeltsSessions, useIeltsMistakes, useIeltsReflections } from './hooks'

export default function RecordView() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  const sessions = useIeltsSessions()
  const mistakes = useIeltsMistakes()
  const reflections = useIeltsReflections()

  const todaySessions = useMemo(
    () => sessions.getEntriesForDate(selectedDate),
    [sessions.getEntriesForDate, selectedDate],
  )
  const todayMistakes = useMemo(
    () => mistakes.entries.filter(m => m.date === selectedDate),
    [mistakes.entries, selectedDate],
  )
  const totalMinutes = useMemo(
    () => todaySessions.reduce((s, e) => s + e.minutes, 0),
    [todaySessions],
  )
  const todayReflection = useMemo(
    () => reflections.entries.find(r => r.date === selectedDate),
    [reflections.entries, selectedDate],
  )

  const fmtDuration = (m: number) => m < 60 ? `${m}min` : `${(m / 60).toFixed(1)}h`

  return (
    <div className="space-y-3">
      <DatePicker
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        viewMode="day"
      />

      {/* Reflection for this day */}
      {todayReflection && (
        <div className="panel p-3 border-l-4 border-[#c0392b]/30">
          <p className="text-xs font-semibold text-gray-400 mb-1">📝 当日反思</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{todayReflection.text}</p>
        </div>
      )}

      {/* Day summary */}
      <div className="flex gap-3">
        <div className="panel p-3 flex-1 text-center">
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {fmtDuration(totalMinutes)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{t('ielts.totalMinutes')}</p>
        </div>
        <div className="panel p-3 flex-1 text-center">
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {todaySessions.length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{t('ielts.sessions')}</p>
        </div>
        {todayMistakes.length > 0 && (
          <div className="panel p-3 flex-1 text-center">
            <p className="text-2xl font-bold tabular-nums text-[#c0392b]">
              {todayMistakes.length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">错题</p>
          </div>
        )}
      </div>

      {/* Add session form */}
      <CollapsibleForm accentColor="#c0392b" addLabel={`+ ${t('ielts.addSession')}`}>
        <SessionForm
          date={selectedDate}
          categories={sessions.categories}
          onAdd={sessions.addEntry}
          onAddMistake={mistakes.addEntry}
          onAddCategory={sessions.addCategory}
          onUpdateCategory={sessions.updateCategory}
          onDeleteCategory={sessions.deleteCategory}
        />
      </CollapsibleForm>

      {/* Session list */}
      <SessionList
        sessions={todaySessions}
        mistakes={todayMistakes}
        date={selectedDate}
        onDeleteSession={sessions.deleteEntry}
        onAddMistake={mistakes.addEntry}
      />
    </div>
  )
}
