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
import MealTemplates from './MealTemplates'
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
    entries, categories, data,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory,
    importData,
    getEntriesForDate, getSummaryForPeriod,
    dailyCalorieGoal, setDailyCalorieGoal,
    customTemplates, addTemplate, deleteTemplate,
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

  const dayMacros = useMemo(() => {
    let protein = 0, carbs = 0, fat = 0
    for (const e of dayEntries) {
      protein += e.protein ?? 0
      carbs += e.carbs ?? 0
      fat += e.fat ?? 0
    }
    return { protein, carbs, fat, total: protein + carbs + fat }
  }, [dayEntries])

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
          dailyAverage={!isDaily && periodSummary.dailyBreakdown.length > 0
            ? Math.round(periodSummary.totalCalories / periodSummary.dailyBreakdown.filter(d => d.calories > 0).length || 1)
            : undefined
          }
          calorieGoal={dailyCalorieGoal}
        />

        {isDaily && (
          <CalorieGoalRing
            currentCalories={dayTotalCalories}
            goal={dailyCalorieGoal}
            onGoalChange={setDailyCalorieGoal}
          />
        )}

        {isDaily && dayMacros.total > 0 && (
          <div className="panel p-3 mb-4">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400 mb-2">
              {t('eating.macroTitle')}
            </h3>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 mb-2">
              {dayMacros.protein > 0 && (
                <div className="h-full" style={{ width: `${(dayMacros.protein / dayMacros.total) * 100}%`, backgroundColor: '#5b8def' }} />
              )}
              {dayMacros.carbs > 0 && (
                <div className="h-full" style={{ width: `${(dayMacros.carbs / dayMacros.total) * 100}%`, backgroundColor: '#e8a838' }} />
              )}
              {dayMacros.fat > 0 && (
                <div className="h-full" style={{ width: `${(dayMacros.fat / dayMacros.total) * 100}%`, backgroundColor: '#e45858' }} />
              )}
            </div>
            <div className="flex justify-between text-xs tabular-nums">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#5b8def' }} />
                <span className="text-gray-600 dark:text-gray-400">{t('eating.proteinShort')}</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{Math.round(dayMacros.protein)}g</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#e8a838' }} />
                <span className="text-gray-600 dark:text-gray-400">{t('eating.carbsShort')}</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{Math.round(dayMacros.carbs)}g</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#e45858' }} />
                <span className="text-gray-600 dark:text-gray-400">{t('eating.fatShort')}</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{Math.round(dayMacros.fat)}g</span>
              </span>
            </div>
          </div>
        )}

        {!isDaily && (
          <div className="mb-4">
            <EatingDailyChart
              dailyBreakdown={periodSummary.dailyBreakdown}
              title={viewMode === 'year' ? t('eating.chartMonthly') : undefined}
              calorieGoal={viewMode !== 'year' ? dailyCalorieGoal : undefined}
            />
          </div>
        )}

        {isDaily && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            <div className="space-y-3">
              <MealTemplates
                onQuickAdd={(meal) => addEntry({ date: selectedDate, food: meal.name, calories: meal.calories, mealTime: '', category: '', note: '' })}
                entries={entries}
                savedTemplates={customTemplates}
                onSaveTemplate={addTemplate}
                onDeleteTemplate={deleteTemplate}
              />
              <EatingEntryForm
                selectedDate={selectedDate}
                categories={categories}
                onAdd={addEntry}
                editingEntry={editingEntry}
                onUpdate={updateEntry}
                onCancelEdit={handleCancelEdit}
                entries={entries}
              />
            </div>
            <EatingEntryList entries={dayEntries} onDelete={deleteEntry} onEdit={setEditingEntry} />
          </div>
        )}

        {(viewMode === 'week' || viewMode === 'month' || viewMode === 'year') && (
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
