import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useDiaryEntries } from '../../hooks/useDiaryEntries'
import DatePicker from '../dashboard/DatePicker'
import ViewModeToggle from '../dashboard/ViewModeToggle'
import DataTransfer from '../settings/DataTransfer'
import DiaryEntryEditor, { type DiaryEntryFields } from './DiaryEntryEditor'
import DiaryCalendar from './DiaryCalendar'
import DiaryDayPopup from './DiaryDayPopup'
import { useTodoEntries } from '../../hooks/useTodoEntries'
import { getPeriodKey } from '../../utils/diaryPeriod'
import AnimatedCollapse from '../common/AnimatedCollapse'
import { exportDiaryToFile, readDiaryImportFile } from '../../utils/diaryTransfer'
import type { DiaryPeriodType, DiaryStorageData } from '../../types/diary'

const DIARY_MODES: readonly DiaryPeriodType[] = ['day', 'week', 'month', 'year']

function DiaryDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [viewMode, setViewMode] = useState<DiaryPeriodType>('day')
  const [showSettings, setShowSettings] = useState(false)
  const [popupDate, setPopupDate] = useState<string | null>(null)
  const { entries, data, getEntry, upsertEntry, deleteEntry, importData } = useDiaryEntries()
  const { addItem: addTodoItem, getItemsForDate: getTodosForDate } = useTodoEntries()

  const periodKey = useMemo(() => getPeriodKey(selectedDate, viewMode), [selectedDate, viewMode])
  const currentEntry = getEntry(viewMode, periodKey)

  const handleSave = useCallback((fields: DiaryEntryFields) => {
    upsertEntry(viewMode, periodKey, fields)
  }, [upsertEntry, viewMode, periodKey])

  // dates (yyyy-MM-dd) that have a day entry — calendar dots
  const entryDates = useMemo(
    () => new Set(entries.filter(e => e.periodType === 'day').map(e => e.periodKey)),
    [entries]
  )
  const popupEntry = popupDate ? getEntry('day', popupDate) : undefined

  const handleEditDay = useCallback((date: string) => {
    setViewMode('day')
    setSelectedDate(date)
    setPopupDate(null)
  }, [])

  // Today's todo summary, insertable into the daily diary entry
  const dayTodos = useMemo(
    () => viewMode === 'day' ? getTodosForDate(selectedDate) : [],
    [viewMode, getTodosForDate, selectedDate]
  )
  const todoSummary = useMemo(() => {
    if (dayTodos.length === 0) return undefined
    const done = dayTodos.filter(td => td.done)
    const lines = [t('diary.todoSummaryLine', { done: done.length, total: dayTodos.length })]
    done.forEach(td => lines.push(`✅ ${td.text}`))
    return lines.join('\n')
  }, [dayTodos, t])

  // Convert a period goal into a todo item on the current anchor date
  const handleGoalToTodo = useCallback((text: string) => {
    addTodoItem({
      id: crypto.randomUUID(),
      text,
      done: false,
      priority: 'medium',
      date: selectedDate,
      createdAt: new Date().toISOString(),
    })
  }, [addTodoItem, selectedDate])


  return (
    <div id="main-content" className="diary-scope">
      <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <ViewModeToggle viewMode={viewMode} modes={DIARY_MODES} onViewModeChange={setViewMode} />
        <button
          onClick={() => setShowSettings(s => !s)}
          className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          aria-label={t('settings.label')}
          aria-expanded={showSettings}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      <AnimatedCollapse open={showSettings}>
        <div className="space-y-4 mb-4">
          <DataTransfer
            data={data}
            onImport={importData}
            onExport={exportDiaryToFile}
            readFile={readDiaryImportFile}
            getCounts={(d: DiaryStorageData) => ({ entries: d.entries.length, categories: 0 })}
          />
        </div>
      </AnimatedCollapse>

      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} viewMode={viewMode} />

      {/* Editor is the main view; compact calendar on the side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
        <DiaryEntryEditor
          periodType={viewMode}
          periodKey={periodKey}
          entry={currentEntry}
          onSave={handleSave}
          onDelete={deleteEntry}
          todoSummary={todoSummary}
          onSendGoalToTodo={handleGoalToTodo}
        />
        <DiaryCalendar
          selectedDate={selectedDate}
          entryDates={entryDates}
          onPickDate={setPopupDate}
        />
      </div>

      <DiaryDayPopup
        date={popupDate}
        entry={popupEntry}
        onEdit={handleEditDay}
        onClose={() => setPopupDate(null)}
      />
      </div>
    </div>
  )
}

export default DiaryDashboard
