import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '../common/ConfirmDialog'
import DiaryGoalList from './DiaryGoalList'
import { compressImageToDataUrl, MAX_IMAGES_PER_ENTRY } from '../../utils/imageCompress'
import { DEFAULT_NOTEBOOK_ID } from '../../hooks/useDiaryEntries'
import type { DiaryEntry, DiaryGoal, DiaryNotebook, DiaryPeriodType } from '../../types/diary'

export interface DiaryEntryFields {
  gratitude: string
  feelings: string
  motivation: string
  mood?: string
  goals: DiaryGoal[]
  custom?: Record<string, string>
  images?: string[]
}

const MOOD_OPTIONS = ['😊', '😐', '😢', '😤', '🥰', '😴']

interface DiaryEntryEditorProps {
  notebook: DiaryNotebook
  periodType: DiaryPeriodType
  periodKey: string
  entry: DiaryEntry | undefined
  onSave: (fields: DiaryEntryFields) => void
  onDelete: (id: string) => void
  /** add a custom section (editor module) to this notebook */
  onAddSection: (name: string) => void
  /** remove a custom section from this notebook */
  onRemoveSection: (sectionId: string) => void
  /** pre-formatted summary of the day's todos, insertable into the entry */
  todoSummary?: string
  /** convert a goal into a todo item */
  onSendGoalToTodo?: (text: string) => void
}

const TEXTAREA_CLASS = 'input-base text-base sm:text-sm leading-relaxed resize-none'

const LABEL_CLASS = 'block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5'

function DiaryEntryEditor({ notebook, periodType, periodKey, entry, onSave, onDelete, onAddSection, onRemoveSection, todoSummary, onSendGoalToTodo }: DiaryEntryEditorProps) {
  const { t, i18n } = useTranslation()
  const [gratitude, setGratitude] = useState(entry?.gratitude ?? '')
  const [feelings, setFeelings] = useState(entry?.feelings ?? '')
  const [goals, setGoals] = useState<DiaryGoal[]>(entry?.goals ?? [])
  const [mood, setMood] = useState(entry?.mood ?? '')
  const [custom, setCustom] = useState<Record<string, string>>(entry?.custom ?? {})
  const [images, setImages] = useState<string[]>(entry?.images ?? [])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [addingSection, setAddingSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [prevPeriod, setPrevPeriod] = useState(`${notebook.id}:${periodType}:${periodKey}`)

  const currentPeriod = `${notebook.id}:${periodType}:${periodKey}`
  if (prevPeriod !== currentPeriod) {
    setPrevPeriod(currentPeriod)
    setGratitude(entry?.gratitude ?? '')
    setFeelings(entry?.feelings ?? '')
    setMood(entry?.mood ?? '')
    setGoals(entry?.goals ?? [])
    setCustom(entry?.custom ?? {})
    setImages(entry?.images ?? [])
    setImageError('')
  }

  const isDaily = periodType === 'day'
  const isDefaultNotebook = notebook.id === DEFAULT_NOTEBOOK_ID
  // built-in prompts only in the default notebook; custom notebooks use their own sections
  const showBuiltins = isDefaultNotebook

  const customDirty = JSON.stringify(custom) !== JSON.stringify(entry?.custom ?? {})
  const imagesDirty = JSON.stringify(images) !== JSON.stringify(entry?.images ?? [])
  const isDirty =
    gratitude !== (entry?.gratitude ?? '') ||
    feelings !== (entry?.feelings ?? '') ||
    mood !== (entry?.mood ?? '') ||
    JSON.stringify(goals) !== JSON.stringify(entry?.goals ?? []) ||
    customDirty || imagesDirty
  const customHasText = Object.values(custom).some(v => v.trim() !== '')
  const isEmpty =
    gratitude.trim() === '' && feelings.trim() === '' && goals.length === 0 &&
    !customHasText && images.length === 0
  const canSave = isDirty && !isEmpty

  const savedAtLabel = entry
    ? new Date(entry.updatedAt).toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  const handleAddSection = () => {
    const name = newSectionName.trim()
    if (!name) return
    onAddSection(name)
    setNewSectionName('')
    setAddingSection(false)
  }

  const handlePickImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setImageError('')
    const room = MAX_IMAGES_PER_ENTRY - images.length
    if (room <= 0) { setImageError(t('diary.imageLimit', { max: MAX_IMAGES_PER_ENTRY })); return }
    try {
      const picked = [...files].slice(0, room)
      const urls = await Promise.all(picked.map(compressImageToDataUrl))
      setImages(prev => [...prev, ...urls])
      if (files.length > room) setImageError(t('diary.imageLimit', { max: MAX_IMAGES_PER_ENTRY }))
    } catch {
      setImageError(t('diary.imageFailed'))
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="panel p-4 sm:p-5">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">
        {isDefaultNotebook ? t(`diary.editorTitle.${periodType}`) : notebook.name}
      </h3>

      {isDaily && (
        <div className="flex gap-1.5 mb-4">
          {MOOD_OPTIONS.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(mood === m ? '' : m)}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${mood === m ? 'ring-2 ring-mode-diary bg-mode-diary/10 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {!isDaily && showBuiltins && (
          <div>
            <span className={LABEL_CLASS}>{t(`diary.goalsLabel.${periodType}`)}</span>
            <DiaryGoalList key={currentPeriod} goals={goals} onChange={setGoals} inputLabel={t(`diary.goalsLabel.${periodType}`)} onSendToTodo={onSendGoalToTodo} />
          </div>
        )}

        {isDaily && showBuiltins && (
          <div>
            <label htmlFor="diary-gratitude" className={LABEL_CLASS}>
              {t('diary.gratitudeLabel')}
            </label>
            <textarea
              id="diary-gratitude"
              rows={3}
              maxLength={2000}
              value={gratitude}
              onChange={e => setGratitude(e.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="diary-feelings" className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {showBuiltins ? (isDaily ? t('diary.feelingsLabel') : t('diary.summaryLabel')) : t('diary.contentLabel')}
            </label>
            {isDaily && todoSummary && (
              <button
                type="button"
                onClick={() => setFeelings(prev => prev.trim() ? `${prev}\n\n${todoSummary}` : todoSummary)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title={todoSummary}
              >
                📋 {t('diary.insertTodoSummary')}
              </button>
            )}
          </div>
          <textarea
            id="diary-feelings"
            rows={isDaily ? 7 : 8}
            maxLength={2000}
            value={feelings}
            onChange={e => setFeelings(e.target.value)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* User-defined sections */}
        {notebook.sections.map(sec => (
          <div key={sec.id}>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={`diary-sec-${sec.id}`} className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {sec.name}
              </label>
              <button
                type="button"
                onClick={() => onRemoveSection(sec.id)}
                className="text-xs text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
                title={t('diary.removeSection')}
              >
                ✕
              </button>
            </div>
            <textarea
              id={`diary-sec-${sec.id}`}
              rows={3}
              maxLength={2000}
              value={custom[sec.id] ?? ''}
              onChange={e => setCustom(prev => ({ ...prev, [sec.id]: e.target.value }))}
              className={TEXTAREA_CLASS}
            />
          </div>
        ))}

        {/* Add section */}
        {addingSection ? (
          <div className="flex gap-2 items-center">
            <input
              autoFocus
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') setAddingSection(false) }}
              placeholder={t('diary.sectionNamePlaceholder')}
              maxLength={16}
              className="input-base w-44 text-sm py-1.5"
            />
            <button type="button" onClick={handleAddSection} className="px-3 py-1.5 text-xs rounded-lg bg-mode-diary text-white">
              {t('diary.goalAdd')}
            </button>
            <button type="button" onClick={() => { setAddingSection(false); setNewSectionName('') }} className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              {t('confirm.cancel')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingSection(true)}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            + {t('diary.addSection')}
          </button>
        )}

        {/* Images */}
        {isDaily && (
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {images.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt={t('diary.imageAlt', { index: i + 1 })} className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-700 text-white text-[10px] flex items-center justify-center opacity-80 hover:opacity-100"
                    aria-label={t('diary.removeImage')}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES_PER_ENTRY && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-400 flex flex-col items-center justify-center text-[10px] gap-0.5 transition-colors"
                >
                  <span className="text-base leading-none">📷</span>
                  {t('diary.addImage')}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handlePickImages(e.target.files)}
            />
            {imageError && <p className="mt-1 text-xs text-red-500">{imageError}</p>}
          </div>
        )}

        {isDaily && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
            {(gratitude.length + feelings.length + Object.values(custom).join('').length).toLocaleString()} 字
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-1">
          <button
            onClick={() => onSave({
              gratitude: isDaily && showBuiltins ? gratitude : '',
              feelings,
              motivation: entry?.motivation ?? '',
              mood: isDaily ? mood : undefined,
              goals: isDaily ? [] : goals,
              custom,
              images,
            })}
            disabled={!canSave}
            className="btn-tactile w-full sm:w-auto px-5 bg-mode-diary disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:border-gray-400 text-white text-base sm:text-sm"
          >
            {t('diary.saveButton')}
          </button>
          <div className="flex items-center justify-between sm:justify-start gap-3 sm:flex-1">
            {entry && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 text-sm font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {t('diary.deleteButton')}
              </button>
            )}
            {savedAtLabel && !isDirty && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {t('diary.savedAt', { time: savedAtLabel })}
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={t('diary.deleteConfirmTitle')}
        message={t('diary.deleteConfirmMessage')}
        confirmVariant="danger"
        onConfirm={() => {
          if (entry) onDelete(entry.id)
          setShowDeleteConfirm(false)
          setGratitude('')
          setFeelings('')
          setMood('')
          setGoals([])
          setCustom({})
          setImages([])
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

export default DiaryEntryEditor
