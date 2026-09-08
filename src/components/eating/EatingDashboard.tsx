import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useEatingEntries } from '../../hooks/useEatingEntries'
import { CategoryProvider } from '../../contexts/CategoryContext'
import DatePicker from '../dashboard/DatePicker'
import ViewModeToggle from '../dashboard/ViewModeToggle'
import CategoryManager, { type ManagedCategory } from '../categories/CategoryManager'
import DataTransfer from '../settings/DataTransfer'
import EatingSummaryCard from './EatingSummaryCard'
import EatingEntryForm from './EatingEntryForm'
import EatingEntryList from './EatingEntryList'
import EatingProportionChart from './EatingProportionChart'
import EatingDailyChart from './EatingDailyChart'
import { exportEatingToFile, readEatingImportFile } from '../../utils/eatingTransfer'
import { LATE_NIGHT_CATEGORY_NAME } from '../../constants/eating'
import type { EatingEntry, EatingStorageData, EatingViewMode } from '../../types/eating'

const EATING_MODES: readonly EatingViewMode[] = ['day', 'week', 'month', 'year']

function EatingDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [viewMode, setViewMode] = useState<EatingViewMode>('day')
  const [editingEntry, setEditingEntry] = useState<EatingEntry | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const {
    entries, categories, data, loading,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory,
    importData,
    getEntriesForDate, getSummaryForPeriod,
  } = useEatingEntries()

  const dayEntries = useMemo(() => getEntriesForDate(selectedDate), [getEntriesForDate, selectedDate])
  const periodSummary = useMemo(() => getSummaryForPeriod(selectedDate, viewMode), [getSummaryForPeriod, selectedDate, viewMode])

  const lateNightCount = useMemo(() => {
    const summaryEntries = viewMode === 'day'
      ? dayEntries
      : entries.filter(e => {
          const breakdown = periodSummary.dailyBreakdown
          if (breakdown.length === 0) return false
          return e.date >= breakdown[0].date && e.date <= breakdown[breakdown.length - 1].date
        })
    return summaryEntries.filter(e => e.category === LATE_NIGHT_CATEGORY_NAME).length
  }, [viewMode, dayEntries, entries, periodSummary.dailyBreakdown])

  const isDaily = viewMode === 'day'

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date)
    setEditingEntry(null)
  }, [])

  const handleViewModeChange = useCallback((mode: EatingViewMode) => {
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <CategoryProvider categories={categories}>
      <div id="main-content">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <ViewModeToggle viewMode={viewMode} modes={EATING_MODES} onViewModeChange={handleViewModeChange} />
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
              entries={entries}
              onAdd={handleAddCategory}
              onUpdate={handleUpdateCategory}
              onDelete={deleteCategory}
            />
            <DataTransfer
              data={data}
              onImport={importData}
              onExport={exportEatingToFile}
              readFile={readEatingImportFile}
              getCounts={(d: EatingStorageData) => ({ entries: d.entries.length, categories: d.categories.length })}
            />
          </div>
        )}

        <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} viewMode={viewMode} />
        <EatingSummaryCard
          totalCalories={periodSummary.totalCalories}
          entryCount={periodSummary.entryCount}
          averageCaloriesPerEntry={periodSummary.averageCaloriesPerEntry}
          lateNightCount={lateNightCount}
        />

        {!isDaily && (
          <div className="mb-4">
            <EatingDailyChart
              dailyBreakdown={periodSummary.dailyBreakdown}
              title={viewMode === 'year' ? t('eating.chartMonthly') : undefined}
            />
          </div>
        )}

        {isDaily && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EatingEntryForm
              selectedDate={selectedDate}
              categories={categories}
              onAdd={addEntry}
              editingEntry={editingEntry}
              onUpdate={updateEntry}
              onCancelEdit={handleCancelEdit}
            />
            <EatingEntryList entries={dayEntries} onDelete={deleteEntry} onEdit={setEditingEntry} />
          </div>
        )}

        {(viewMode === 'month' || viewMode === 'year') && (
          <div className="mb-4">
            <EatingProportionChart
              categoryBreakdown={periodSummary.categoryBreakdown}
              totalCalories={periodSummary.totalCalories}
            />
          </div>
        )}
      </div>
    </CategoryProvider>
  )
}

export default EatingDashboard
