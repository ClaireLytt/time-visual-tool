import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useEatingEntries } from '../../hooks/useEatingEntries'
import { CategoryProvider } from '../../contexts/CategoryContext'
import DatePicker from '../dashboard/DatePicker'
import DashboardHeader from '../common/DashboardHeader'
import CategoryManager, { type ManagedCategory } from '../categories/CategoryManager'
import DataTransfer from '../settings/DataTransfer'
import EatingSummaryCard from './EatingSummaryCard'
import CalorieGoalRing from './CalorieGoalRing'
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
  const {
    entries, categories, data, loading,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory,
    importData,
    getEntriesForDate, getSummaryForPeriod,
    dailyCalorieGoal, setDailyCalorieGoal,
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

  const dayTotalCalories = useMemo(() => dayEntries.reduce((sum, e) => sum + e.calories, 0), [dayEntries])

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
        <div className="w-8 h-8 border-4 border-mode-eating border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <CategoryProvider categories={categories}>
      <div id="main-content">
        <DashboardHeader
          viewMode={viewMode}
          modes={EATING_MODES}
          onViewModeChange={handleViewModeChange}
          settingsContent={
            <>
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
            </>
          }
        />

        <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} viewMode={viewMode} />
        <EatingSummaryCard
          totalCalories={periodSummary.totalCalories}
          entryCount={periodSummary.entryCount}
          averageCaloriesPerEntry={periodSummary.averageCaloriesPerEntry}
          lateNightCount={lateNightCount}
        />

        {isDaily && (
          <CalorieGoalRing
            currentCalories={dayTotalCalories}
            goal={dailyCalorieGoal}
            onGoalChange={setDailyCalorieGoal}
          />
        )}

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
              entries={entries}
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
