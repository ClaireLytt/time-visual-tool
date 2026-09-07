import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useSportEntries } from '../../hooks/useSportEntries'
import { CategoryProvider } from '../../contexts/CategoryContext'
import DatePicker from '../dashboard/DatePicker'
import ViewModeToggle from '../dashboard/ViewModeToggle'
import CategoryManager, { type ManagedCategory } from '../categories/CategoryManager'
import DataTransfer from '../settings/DataTransfer'
import SportSummaryCard from './SportSummaryCard'
import SportEntryForm from './SportEntryForm'
import SportEntryList from './SportEntryList'
import SportProportionChart from './SportProportionChart'
import SportDailyChart from './SportDailyChart'
import SportReflectionEditor from './SportReflectionEditor'
import SportReflectionList from './SportReflectionList'
import SportYearReview from './SportYearReview'
import { getPeriodKey, periodKeyToAnchorDate } from '../../utils/diaryPeriod'
import { exportSportToFile, readSportImportFile } from '../../utils/sportTransfer'
import type { SportEntry, SportReflection, SportStorageData, SportViewMode } from '../../types/sport'

const SPORT_MODES: readonly SportViewMode[] = ['day', 'week', 'month', 'year']

function SportDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [viewMode, setViewMode] = useState<SportViewMode>('day')
  const [editingEntry, setEditingEntry] = useState<SportEntry | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const {
    entries, categories, reflections, data,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory, reorderCategories,
    getReflection, upsertReflection, deleteReflection,
    importData,
    getEntriesForDate, getSummaryForPeriod,
  } = useSportEntries()

  const dayEntries = useMemo(() => getEntriesForDate(selectedDate), [getEntriesForDate, selectedDate])
  const periodSummary = useMemo(() => getSummaryForPeriod(selectedDate, viewMode), [getSummaryForPeriod, selectedDate, viewMode])

  const isDaily = viewMode === 'day'
  const categoryEntries = useMemo(() => entries.map(e => ({ category: e.sportType })), [entries])
  const reflectionPeriodType = viewMode as 'week' | 'month' | 'year'
  const periodKey = useMemo(
    () => !isDaily ? getPeriodKey(selectedDate, viewMode) : '',
    [selectedDate, viewMode, isDaily]
  )
  const currentReflection = !isDaily ? getReflection(reflectionPeriodType, periodKey) : undefined

  const handleSaveReflection = useCallback((text: string) => {
    upsertReflection(reflectionPeriodType, periodKey, text)
  }, [upsertReflection, reflectionPeriodType, periodKey])

  const handleSelectReflection = useCallback((reflection: SportReflection) => {
    setSelectedDate(periodKeyToAnchorDate(reflection.periodType, reflection.periodKey))
  }, [])

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date)
    setEditingEntry(null)
  }, [])

  const handleViewModeChange = useCallback((mode: SportViewMode) => {
    setViewMode(mode)
    setEditingEntry(null)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingEntry(null)
  }, [])

  const handleAddCategory = useCallback((category: ManagedCategory) => {
    addCategory({ name: category.name, color: category.color })
  }, [addCategory])

  const handleUpdateCategory = useCallback((oldName: string, updated: ManagedCategory) => {
    updateCategory(oldName, { name: updated.name, color: updated.color })
  }, [updateCategory])

  const handleReorderCategories = useCallback((reordered: ManagedCategory[]) => {
    reorderCategories(reordered.map(c => ({ name: c.name, color: c.color })))
  }, [reorderCategories])

  return (
    <CategoryProvider categories={categories}>
      <div id="main-content">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <ViewModeToggle viewMode={viewMode} modes={SPORT_MODES} onViewModeChange={handleViewModeChange} />
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
            <CategoryManager
              categories={categories}
              entries={categoryEntries}
              onAdd={handleAddCategory}
              onUpdate={handleUpdateCategory}
              onDelete={deleteCategory}
              onReorder={handleReorderCategories}
            />
            <DataTransfer
              data={data}
              onImport={importData}
              onExport={exportSportToFile}
              readFile={readSportImportFile}
              getCounts={(d: SportStorageData) => ({ entries: d.entries.length, categories: d.categories.length })}
            />
          </div>
        )}

        <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} viewMode={viewMode} />
        <SportSummaryCard
          totalDuration={periodSummary.totalDuration}
          totalCalories={periodSummary.totalCalories}
          entryCount={periodSummary.entryCount}
          averageDurationPerEntry={periodSummary.averageDurationPerEntry}
        />

        {!isDaily && (
          <div className="mb-4">
            <SportDailyChart
              dailyBreakdown={periodSummary.dailyBreakdown}
              title={viewMode === 'year' ? t('sport.chartMonthly') : undefined}
            />
          </div>
        )}

        {isDaily && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SportEntryForm
              selectedDate={selectedDate}
              categories={categories}
              onAdd={addEntry}
              editingEntry={editingEntry}
              onUpdate={updateEntry}
              onCancelEdit={handleCancelEdit}
            />
            <SportEntryList entries={dayEntries} onDelete={deleteEntry} onEdit={setEditingEntry} />
          </div>
        )}

        {!isDaily && (
          <div className="mb-4">
            <SportProportionChart
              categoryBreakdown={periodSummary.categoryBreakdown}
              totalDuration={periodSummary.totalDuration}
            />
          </div>
        )}

        {viewMode === 'year' && (
          <div className="mb-4">
            <SportYearReview allEntries={entries} selectedDate={selectedDate} />
          </div>
        )}

        {!isDaily && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <SportReflectionEditor
              periodType={reflectionPeriodType}
              periodKey={periodKey}
              reflection={currentReflection}
              onSave={handleSaveReflection}
              onDelete={deleteReflection}
            />
            <SportReflectionList
              reflections={reflections}
              periodType={reflectionPeriodType}
              activePeriodKey={periodKey}
              onSelect={handleSelectReflection}
            />
          </div>
        )}
      </div>
    </CategoryProvider>
  )
}

export default SportDashboard
