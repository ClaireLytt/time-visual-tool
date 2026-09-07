import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '../common/ConfirmDialog'
import DiaryGoalList from './DiaryGoalList'
import type { DiaryEntry, DiaryGoal, DiaryPeriodType } from '../../types/diary'

export interface DiaryEntryFields {
  gratitude: string
  feelings: string
  motivation: string
  goals: DiaryGoal[]
}

interface DiaryEntryEditorProps {
  periodType: DiaryPeriodType
  periodKey: string
  entry: DiaryEntry | undefined
  onSave: (fields: DiaryEntryFields) => void
  onDelete: (id: string) => void
}

const TEXTAREA_CLASS = 'w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-base sm:text-sm leading-relaxed bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-700 resize-none transition-colors'

const LABEL_CLASS = 'block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5'

function DiaryEntryEditor({ periodType, periodKey, entry, onSave, onDelete }: DiaryEntryEditorProps) {
  const { t, i18n } = useTranslation()
  const [gratitude, setGratitude] = useState(entry?.gratitude ?? '')
  const [feelings, setFeelings] = useState(entry?.feelings ?? '')
  const [motivation, setMotivation] = useState(entry?.motivation ?? '')
  const [goals, setGoals] = useState<DiaryGoal[]>(entry?.goals ?? [])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [prevPeriod, setPrevPeriod] = useState(`${periodType}:${periodKey}`)

  const currentPeriod = `${periodType}:${periodKey}`
  if (prevPeriod !== currentPeriod) {
    setPrevPeriod(currentPeriod)
    setGratitude(entry?.gratitude ?? '')
    setFeelings(entry?.feelings ?? '')
    setMotivation(entry?.motivation ?? '')
    setGoals(entry?.goals ?? [])
  }

  const isDaily = periodType === 'day'

  const isDirty =
    gratitude !== (entry?.gratitude ?? '') ||
    feelings !== (entry?.feelings ?? '') ||
    motivation !== (entry?.motivation ?? '') ||
    JSON.stringify(goals) !== JSON.stringify(entry?.goals ?? [])
  const isEmpty =
    gratitude.trim() === '' && feelings.trim() === '' && motivation.trim() === '' && goals.length === 0
  const canSave = isDirty && !isEmpty

  const savedAtLabel = entry
    ? new Date(entry.updatedAt).toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">
        {t(`diary.editorTitle.${periodType}`)}
      </h3>

      <div className="space-y-4">
        {!isDaily && (
          <div>
            <span className={LABEL_CLASS}>{t(`diary.goalsLabel.${periodType}`)}</span>
            <DiaryGoalList key={currentPeriod} goals={goals} onChange={setGoals} inputLabel={t(`diary.goalsLabel.${periodType}`)} />
          </div>
        )}

        {isDaily && (
          <div>
            <label htmlFor="diary-gratitude" className={LABEL_CLASS}>
              {t('diary.gratitudeLabel')}
            </label>
            <textarea
              id="diary-gratitude"
              rows={3}
              value={gratitude}
              onChange={e => setGratitude(e.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
        )}

        <div>
          <label htmlFor="diary-feelings" className={LABEL_CLASS}>
            {isDaily ? t('diary.feelingsLabel') : t('diary.summaryLabel')}
          </label>
          <textarea
            id="diary-feelings"
            rows={isDaily ? 3 : 5}
            value={feelings}
            onChange={e => setFeelings(e.target.value)}
            className={TEXTAREA_CLASS}
          />
        </div>

        {isDaily && (
          <div>
            <label htmlFor="diary-motivation" className={LABEL_CLASS}>
              {t('diary.motivationLabel')}
            </label>
            <textarea
              id="diary-motivation"
              rows={2}
              value={motivation}
              onChange={e => setMotivation(e.target.value)}
              className={TEXTAREA_CLASS}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-1">
          <button
            onClick={() => onSave({
              gratitude: isDaily ? gratitude : '',
              feelings,
              motivation: isDaily ? motivation : '',
              goals: isDaily ? [] : goals,
            })}
            disabled={!canSave}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-base sm:text-sm font-medium rounded-xl transition-colors"
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
          setMotivation('')
          setGoals([])
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

export default DiaryEntryEditor
