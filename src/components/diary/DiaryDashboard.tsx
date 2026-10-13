import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useDiaryEntries, DEFAULT_NOTEBOOK_ID } from '../../hooks/useDiaryEntries'
import DatePicker from '../dashboard/DatePicker'
import ViewModeToggle from '../dashboard/ViewModeToggle'
import DataTransfer from '../settings/DataTransfer'
import DiaryEntryEditor, { type DiaryEntryFields } from './DiaryEntryEditor'
import DiaryCalendar from './DiaryCalendar'
import DiaryDayPopup from './DiaryDayPopup'
import { useTodoEntries } from '../../hooks/useTodoEntries'
import { getPeriodKey } from '../../utils/diaryPeriod'
import AnimatedCollapse from '../common/AnimatedCollapse'
import ConfirmDialog from '../common/ConfirmDialog'
import { exportDiaryToFile, readDiaryImportFile } from '../../utils/diaryTransfer'
import type { DiaryPeriodType, DiaryStorageData } from '../../types/diary'

const DIARY_MODES: readonly DiaryPeriodType[] = ['day', 'week', 'month', 'year']

function DiaryDashboard() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [viewMode, setViewMode] = useState<DiaryPeriodType>('day')
  const [showSettings, setShowSettings] = useState(false)
  const [popupDate, setPopupDate] = useState<string | null>(null)
  const { entries, data, notebooks, addNotebook, deleteNotebook, addSection, removeSection, getEntry, upsertEntry, deleteEntry, importData } = useDiaryEntries()
  const [notebookId, setNotebookId] = useState<string>(DEFAULT_NOTEBOOK_ID)
  const [addingNotebook, setAddingNotebook] = useState(false)
  const [newNotebookName, setNewNotebookName] = useState('')
  const [confirmDeleteNb, setConfirmDeleteNb] = useState<string | null>(null)
  const notebook = notebooks.find(n => n.id === notebookId) ?? notebooks[0]

  const handleAddNotebook = () => {
    const name = newNotebookName.trim()
    if (!name) return
    addNotebook(name)
    setNewNotebookName('')
    setAddingNotebook(false)
  }
  const { addItem: addTodoItem, getItemsForDate: getTodosForDate } = useTodoEntries()

  const periodKey = useMemo(() => getPeriodKey(selectedDate, viewMode), [selectedDate, viewMode])
  const currentEntry = getEntry(notebook.id, viewMode, periodKey)

  const handleSave = useCallback((fields: DiaryEntryFields) => {
    upsertEntry(notebook.id, viewMode, periodKey, fields)
  }, [upsertEntry, notebook.id, viewMode, periodKey])

  // dates (yyyy-MM-dd) that have a day entry in the active notebook — calendar dots
  const entryDates = useMemo(
    () => new Set(entries.filter(e => e.periodType === 'day' && (e.notebookId ?? DEFAULT_NOTEBOOK_ID) === notebook.id).map(e => e.periodKey)),
    [entries, notebook.id]
  )
  const popupEntry = popupDate ? getEntry(notebook.id, 'day', popupDate) : undefined

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
      {/* Notebook switcher */}
      <div className="flex gap-1.5 flex-wrap items-center mb-4">
        {notebooks.map(nb => {
          const active = nb.id === notebook.id
          const isDefault = nb.id === DEFAULT_NOTEBOOK_ID
          return (
            <span key={nb.id} className="inline-flex items-stretch">
              <button
                onClick={() => setNotebookId(nb.id)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${isDefault || !active ? 'rounded-lg' : 'rounded-l-lg'} ${
                  active ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                style={active ? { backgroundColor: nb.color } : undefined}
              >
                📔 {nb.name}
              </button>
              {!isDefault && active && (
                <button
                  onClick={() => setConfirmDeleteNb(nb.id)}
                  className="px-2 rounded-r-lg text-white/80 hover:text-white text-xs"
                  style={{ backgroundColor: nb.color }}
                  aria-label={t('diary.deleteNotebookTitle')}
                >
                  ✕
                </button>
              )}
            </span>
          )
        })}
        {addingNotebook ? (
          <span className="inline-flex items-center gap-1.5">
            <input
              autoFocus
              value={newNotebookName}
              onChange={e => setNewNotebookName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddNotebook(); if (e.key === 'Escape') setAddingNotebook(false) }}
              placeholder={t('diary.notebookNamePlaceholder')}
              maxLength={12}
              className="input-base w-28 text-xs py-1.5 px-2"
            />
            <button onClick={handleAddNotebook} className="px-2.5 py-1.5 text-xs rounded-lg bg-mode-diary text-white">
              {t('diary.goalAdd')}
            </button>
            <button onClick={() => { setAddingNotebook(false); setNewNotebookName('') }} className="px-1.5 py-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              {t('confirm.cancel')}
            </button>
          </span>
        ) : (
          <button
            onClick={() => setAddingNotebook(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-400 transition-colors"
          >
            + {t('diary.addNotebook')}
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteNb !== null}
        title={t('diary.deleteNotebookTitle')}
        message={t('diary.deleteNotebookMessage')}
        confirmVariant="danger"
        onConfirm={() => {
          if (confirmDeleteNb) {
            deleteNotebook(confirmDeleteNb)
            if (notebookId === confirmDeleteNb) setNotebookId(DEFAULT_NOTEBOOK_ID)
          }
          setConfirmDeleteNb(null)
        }}
        onCancel={() => setConfirmDeleteNb(null)}
      />

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
          notebook={notebook}
          onAddSection={name => addSection(notebook.id, name)}
          onRemoveSection={secId => removeSection(notebook.id, secId)}
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
        sections={notebook.sections}
        onEdit={handleEditDay}
        onClose={() => setPopupDate(null)}
      />
      </div>
    </div>
  )
}

export default DiaryDashboard
