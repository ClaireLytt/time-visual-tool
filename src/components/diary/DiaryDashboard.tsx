import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useDiaryEntries } from '../../hooks/useDiaryEntries'
import DatePicker from '../dashboard/DatePicker'
import ViewModeToggle from '../dashboard/ViewModeToggle'
import DataTransfer from '../settings/DataTransfer'
import DiaryEntryEditor, { type DiaryEntryFields } from './DiaryEntryEditor'
import DiaryEntryList from './DiaryEntryList'
import { getPeriodKey, periodKeyToAnchorDate } from '../../utils/diaryPeriod'
import { exportDiaryToFile, readDiaryImportFile } from '../../utils/diaryTransfer'
import type { DiaryEntry, DiaryPeriodType, DiaryStorageData } from '../../types/diary'

const DIARY_MODES: readonly DiaryPeriodType[] = ['day', 'week', 'month', 'year']

function DiaryDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [viewMode, setViewMode] = useState<DiaryPeriodType>('day')
  const [showSettings, setShowSettings] = useState(false)
  const { entries, data, loading, getEntry, upsertEntry, deleteEntry, importData } = useDiaryEntries()

  const periodKey = useMemo(() => getPeriodKey(selectedDate, viewMode), [selectedDate, viewMode])
  const currentEntry = getEntry(viewMode, periodKey)

  const handleSave = useCallback((fields: DiaryEntryFields) => {
    upsertEntry(viewMode, periodKey, fields)
  }, [upsertEntry, viewMode, periodKey])

  const handleSelectEntry = useCallback((entry: DiaryEntry) => {
    setSelectedDate(periodKeyToAnchorDate(entry.periodType, entry.periodKey))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div id="main-content">
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

      {showSettings && (
        <div className="space-y-4 mb-4">
          <DataTransfer
            data={data}
            onImport={importData}
            onExport={exportDiaryToFile}
            readFile={readDiaryImportFile}
            getCounts={(d: DiaryStorageData) => ({ entries: d.entries.length, categories: 0 })}
          />
        </div>
      )}

      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} viewMode={viewMode} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DiaryEntryEditor
          periodType={viewMode}
          periodKey={periodKey}
          entry={currentEntry}
          onSave={handleSave}
          onDelete={deleteEntry}
        />
        <DiaryEntryList
          entries={entries}
          periodType={viewMode}
          activePeriodKey={periodKey}
          onSelect={handleSelectEntry}
        />
      </div>
    </div>
  )
}

export default DiaryDashboard
