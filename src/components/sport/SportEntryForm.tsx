import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { parseCalorieInput } from '../../utils/calories'
import type { SportEntry, SportCategory } from '../../types/sport'

interface SportEntryFormProps {
  selectedDate: string
  categories: SportCategory[]
  onAdd: (entry: Omit<SportEntry, 'id' | 'createdAt'>) => void
  editingEntry?: SportEntry | null
  onUpdate?: (id: string, updates: Partial<SportEntry>) => void
  onCancelEdit?: () => void
}

function SportEntryForm({ selectedDate, categories, onAdd, editingEntry, onUpdate, onCancelEdit }: SportEntryFormProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [durationInput, setDurationInput] = useState('')
  const [calorieInput, setCalorieInput] = useState('')
  const [sportType, setSportType] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [prevEditingEntry, setPrevEditingEntry] = useState(editingEntry)

  const isEditing = !!editingEntry

  if (prevEditingEntry !== editingEntry) {
    setPrevEditingEntry(editingEntry)
    if (editingEntry) {
      setContent(editingEntry.content)
      setDurationInput(editingEntry.duration ? String(editingEntry.duration) : '')
      setCalorieInput(editingEntry.calories ? String(editingEntry.calories) : '')
      setSportType(editingEntry.sportType)
      setNote(editingEntry.note)
      setError('')
    } else {
      setContent('')
      setDurationInput('')
      setCalorieInput('')
      setSportType('')
      setNote('')
      setError('')
    }
  }

  const effectiveSportType = categories.some(c => c.name === sportType)
    ? sportType
    : (categories[0]?.name ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    let duration = 0
    if (durationInput.trim()) {
      const n = Number(durationInput.trim())
      if (!Number.isFinite(n) || n < 0) {
        setError(t('sport.errorDuration'))
        return
      }
      duration = Math.round(n)
    }

    let calories = 0
    if (calorieInput.trim()) {
      const parsed = parseCalorieInput(calorieInput)
      if (parsed === null) {
        setError(t('sport.errorCalorie'))
        return
      }
      calories = parsed
    }

    if (isEditing && onUpdate) {
      onUpdate(editingEntry.id, {
        content: content.trim(),
        duration,
        calories,
        sportType: effectiveSportType,
        note: note.trim(),
      })
      onCancelEdit?.()
    } else {
      onAdd({
        date: selectedDate,
        content: content.trim(),
        duration,
        calories,
        sportType: effectiveSportType,
        note: note.trim(),
      })
      setContent('')
      setDurationInput('')
      setCalorieInput('')
      setNote('')
      setError('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        {isEditing ? t('sport.editTitle') : t('sport.addTitle')}
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t('sport.contentPlaceholder')}
            aria-label={t('sport.contentLabel')}
            className="input-base"
            maxLength={100}
          />
        </div>

        <div className="relative">
          <input
            type="text"
            value={durationInput}
            onChange={e => setDurationInput(e.target.value)}
            placeholder={t('sport.durationPlaceholder')}
            aria-label={t('sport.durationLabel')}
            className="input-base pr-10"
            inputMode="numeric"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">min</span>
        </div>

        <div>
          <input
            type="text"
            value={calorieInput}
            onChange={e => setCalorieInput(e.target.value)}
            placeholder={t('sport.caloriePlaceholder')}
            aria-label={t('sport.calorieLabel')}
            className="input-base"
            inputMode="decimal"
          />
        </div>

        <div>
          <select
            value={effectiveSportType}
            onChange={e => setSportType(e.target.value)}
            aria-label={t('sport.sportTypeLabel')}
            className="input-base"
          >
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{t('category.names.' + cat.name, cat.name)}</option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t('sport.notePlaceholder')}
            aria-label={t('sport.noteLabel')}
            className="input-base"
            maxLength={200}
          />
        </div>
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-xs mb-2" role="alert">{error}</p>}

      <div className={isEditing ? 'flex gap-2' : ''}>
        <button
          type="submit"
          className={`${isEditing ? 'flex-1' : 'w-full'} py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors`}
        >
          {isEditing ? t('entry.saveButton') : t('sport.addButton')}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('entry.cancelButton')}
          </button>
        )}
      </div>
    </form>
  )
}

export default SportEntryForm
