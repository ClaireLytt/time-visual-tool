import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '../common/ConfirmDialog'
import type { SportReflection } from '../../types/sport'

interface SportReflectionEditorProps {
  periodType: 'week' | 'month' | 'year'
  periodKey: string
  reflection: SportReflection | undefined
  onSave: (text: string) => void
  onDelete: (id: string) => void
}

const TEXTAREA_CLASS = 'w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-base sm:text-sm leading-relaxed bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-500 focus:bg-white dark:focus:bg-gray-700 resize-none transition-colors'

function SportReflectionEditor({ periodType, periodKey, reflection, onSave, onDelete }: SportReflectionEditorProps) {
  const { t, i18n } = useTranslation()
  const [text, setText] = useState(reflection?.text ?? '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [prevPeriod, setPrevPeriod] = useState(`${periodType}:${periodKey}`)

  const currentPeriod = `${periodType}:${periodKey}`
  if (prevPeriod !== currentPeriod) {
    setPrevPeriod(currentPeriod)
    setText(reflection?.text ?? '')
  }

  const isDirty = text !== (reflection?.text ?? '')
  const isEmpty = text.trim() === ''
  const canSave = isDirty && !isEmpty

  const savedAtLabel = reflection
    ? new Date(reflection.updatedAt).toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">
        {t(`sport.reflectionTitle.${periodType}`)}
      </h3>

      <div className="space-y-4">
        <textarea
          rows={5}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t('sport.reflectionPlaceholder')}
          className={TEXTAREA_CLASS}
          maxLength={5000}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-1">
          <button
            onClick={() => onSave(text)}
            disabled={!canSave}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-base sm:text-sm font-medium rounded-xl transition-colors"
          >
            {t('diary.saveButton')}
          </button>
          <div className="flex items-center justify-between sm:justify-start gap-3 sm:flex-1">
            {reflection && (
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
          if (reflection) onDelete(reflection.id)
          setShowDeleteConfirm(false)
          setText('')
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

export default SportReflectionEditor
