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
import SportWeeklyGoal from './SportWeeklyGoal'
import SportQuickTemplates from './SportQuickTemplates'
import NeonHoopsOverlay from './NeonHoopsOverlay'
import { getPeriodKey, periodKeyToAnchorDate } from '../../utils/diaryPeriod'
import AnimatedCollapse from '../common/AnimatedCollapse'
import { exportSportToFile, readSportImportFile } from '../../utils/sportTransfer'
import SportStreaks from './SportStreaks'
import type { SportEntry, SportReflection, SportStorageData, SportViewMode } from '../../types/sport'

const SPORT_MODES: readonly SportViewMode[] = ['day', 'week', 'month', 'year']

function SportDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [viewMode, setViewMode] = useState<SportViewMode>('day')
  const [editingEntry, setEditingEntry] = useState<SportEntry | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [templateFill, setTemplateFill] = useState<{ content: string; duration: number; sportType: string } | null>(null)
  const [showGame, setShowGame] = useState(false)
  const [filterType, setFilterType] = useState<string>('')
  const {
    entries, categories, reflections, data,
    addEntry, deleteEntry, updateEntry,
    addCategory, updateCategory, deleteCategory, reorderCategories,
    getReflection, upsertReflection, deleteReflection,
    importData,
    getEntriesForDate, getSummaryForPeriod,
    weeklyGoal, setWeeklyGoal,
    quickTemplates, addQuickTemplate, deleteQuickTemplate,
  } = useSportEntries()

  const dayEntries = useMemo(() => {
    const all = getEntriesForDate(selectedDate)
    return filterType ? all.filter(e => e.sportType === filterType) : all
  }, [getEntriesForDate, selectedDate, filterType])

  // Personal best: track the ID of the entry that first achieved the best duration per sport type
  const bestEntryIds = useMemo(() => {
    const bests: Record<string, { duration: number; id: string; createdAt: string }> = {}
    for (const e of entries) {
      if (e.duration <= 0) continue
      const cur = bests[e.sportType]
      if (!cur || e.duration > cur.duration || (e.duration === cur.duration && e.createdAt < cur.createdAt)) {
        bests[e.sportType] = { duration: e.duration, id: e.id, createdAt: e.createdAt }
      }
    }
    const ids = new Set<string>()
    for (const v of Object.values(bests)) ids.add(v.id)
    return ids
  }, [entries])
  const periodSummary = useMemo(() => getSummaryForPeriod(selectedDate, viewMode), [getSummaryForPeriod, selectedDate, viewMode])

  const isDaily = viewMode === 'day'
  const categoryEntries = useMemo(() => entries.map(e => ({ category: e.sportType })), [entries])
  const reflectionPeriodType: 'week' | 'month' | 'year' = isDaily ? 'week' : viewMode
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

  const handleChartDateClick = useCallback((date: string) => {
    setSelectedDate(date)
    setViewMode('day')
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
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <ViewModeToggle viewMode={viewMode} modes={SPORT_MODES} onViewModeChange={handleViewModeChange} />
          <div className="flex flex-col gap-2 items-center">
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
            <button
              onClick={() => setShowGame(true)}
              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-mode-sport hover:bg-mode-sport/10 transition-colors"
              aria-label={t('game.neonHoops')}
              title={t('game.neonHoops')}
            >
              <span className="text-lg leading-none" aria-hidden="true">🏀</span>
            </button>
          </div>
        </div>

        <AnimatedCollapse open={showSettings}>
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
        </AnimatedCollapse>

        <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} viewMode={viewMode} />

        {/* Sport type filter */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterType('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!filterType ? 'bg-mode-sport text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {t('sport.filterAll')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setFilterType(filterType === cat.name ? '' : cat.name)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterType === cat.name ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              style={filterType === cat.name ? { backgroundColor: cat.color } : undefined}
            >
              {t('category.names.' + cat.name, cat.name)}
            </button>
          ))}
        </div>

        <SportWeeklyGoal entries={entries} selectedDate={selectedDate} weeklyGoal={weeklyGoal} onWeeklyGoalChange={setWeeklyGoal} />
        <SportStreaks entries={entries} selectedDate={selectedDate} />
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
              onDateClick={viewMode !== 'year' ? handleChartDateClick : undefined}
            />
          </div>
        )}

        {isDaily && (
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
            <div>
              <SportQuickTemplates
                templates={quickTemplates}
                categories={categories}
                onSelect={tpl => setTemplateFill({ content: tpl.content, duration: tpl.duration, sportType: tpl.sportType })}
                onAdd={addQuickTemplate}
                onDelete={deleteQuickTemplate}
              />
              <SportEntryForm
                selectedDate={selectedDate}
                categories={categories}
                onAdd={addEntry}
                editingEntry={editingEntry}
                onUpdate={updateEntry}
                onCancelEdit={handleCancelEdit}
                templateFill={templateFill}
                onTemplateFillConsumed={() => setTemplateFill(null)}
              />
            </div>
            <SportEntryList entries={dayEntries} onDelete={deleteEntry} onEdit={setEditingEntry} bestEntryIds={bestEntryIds} />
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 mt-6">
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
      <NeonHoopsOverlay open={showGame} onClose={() => setShowGame(false)} />
    </CategoryProvider>
  )
}

export default SportDashboard
