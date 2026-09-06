import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategories } from '../../contexts/CategoryContext'
import { parseDurationInput } from '../../utils/time'
import type { TimeEntry } from '../../types'

interface EntryFormProps {
  selectedDate: string
  onAdd: (entry: { date: string; activity: string; duration: number; weight: number; category: string }) => void
  editingEntry?: TimeEntry | null
  onUpdate?: (id: string, updates: Partial<TimeEntry>) => void
  onCancelEdit?: () => void
}

function EntryForm({ selectedDate, onAdd, editingEntry, onUpdate, onCancelEdit }: EntryFormProps) {
  const { t } = useTranslation()
  const { categories } = useCategories()
  const [activity, setActivity] = useState('')
  const [durationInput, setDurationInput] = useState('')
  const [weight, setWeight] = useState('1')
  const [category, setCategory] = useState<string>(categories[0]?.name ?? '')
  const [error, setError] = useState('')
  const [prevEditingEntry, setPrevEditingEntry] = useState(editingEntry)

  const isEditing = !!editingEntry

  if (prevEditingEntry !== editingEntry) {
    setPrevEditingEntry(editingEntry)
    if (editingEntry) {
      setActivity(editingEntry.activity)
      setDurationInput(String(editingEntry.duration))
      setWeight(String(editingEntry.weight))
      setCategory(editingEntry.category)
      setError('')
    } else {
      setActivity('')
      setDurationInput('')
      setWeight('1')
      setCategory(categories[0]?.name ?? '')
      setError('')
    }
  }

  const effectiveCategory = categories.some(c => c.name === category) ? category : (categories[0]?.name ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!activity.trim()) {
      setError(t('entry.errorActivity'))
      return
    }

    const duration = parseDurationInput(durationInput)
    if (duration === null || duration <= 0) {
      setError(t('entry.errorDuration'))
      return
    }

    const w = parseFloat(weight)
    if (isNaN(w) || w < 0.1 || w > 10) {
      setError(t('entry.errorWeight'))
      return
    }

    if (isEditing && onUpdate) {
      onUpdate(editingEntry.id, {
        activity: activity.trim(),
        duration,
        weight: w,
        category: effectiveCategory,
      })
      onCancelEdit?.()
    } else {
      onAdd({
        date: selectedDate,
        activity: activity.trim(),
        duration,
        weight: w,
        category: effectiveCategory,
      })
      setActivity('')
      setDurationInput('')
      setWeight('1')
      setError('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        {isEditing ? t('entry.editTitle') : t('entry.addTitle')}
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <input
            type="text"
            value={activity}
            onChange={e => setActivity(e.target.value)}
            placeholder={t('entry.activityPlaceholder')}
            aria-label={t('entry.activityLabel')}
            className="input-base"
            maxLength={100}
          />
        </div>

        <div>
          <input
            type="text"
            value={durationInput}
            onChange={e => setDurationInput(e.target.value)}
            placeholder={t('entry.durationPlaceholder')}
            aria-label={t('entry.durationLabel')}
            className="input-base"
          />
        </div>

        <div>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder={t('entry.weightPlaceholder')}
            aria-label={t('entry.weightLabel')}
            step="0.1"
            min="0.1"
            max="10"
            className="input-base"
          />
        </div>

        <div className="col-span-2">
          <select
            value={effectiveCategory}
            onChange={e => setCategory(e.target.value)}
            aria-label={t('entry.categoryLabel')}
            className="input-base"
          >
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-xs mb-2" role="alert">{error}</p>}

      <div className={isEditing ? 'flex gap-2' : ''}>
        <button
          type="submit"
          className={`${isEditing ? 'flex-1' : 'w-full'} py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors`}
        >
          {isEditing ? t('entry.saveButton') : t('entry.addButton')}
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

export default EntryForm
