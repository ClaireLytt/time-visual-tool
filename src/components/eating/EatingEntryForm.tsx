import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { parseCalorieInput, formatCalories } from '../../utils/calories'
import { COMMON_FOODS } from '../../data/commonFoods'
import type { EatingEntry, EatingCategory } from '../../types/eating'

interface EatingEntryFormProps {
  selectedDate: string
  categories: EatingCategory[]
  onAdd: (entry: Omit<EatingEntry, 'id' | 'createdAt'>) => void
  editingEntry?: EatingEntry | null
  onUpdate?: (id: string, updates: Partial<EatingEntry>) => void
  onCancelEdit?: () => void
}

function EatingEntryForm({ selectedDate, categories, onAdd, editingEntry, onUpdate, onCancelEdit }: EatingEntryFormProps) {
  const { t, i18n } = useTranslation()
  const [food, setFood] = useState('')
  const [calorieInput, setCalorieInput] = useState('')
  const [mealTime, setMealTime] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [showFoodSearch, setShowFoodSearch] = useState(false)
  const [foodQuery, setFoodQuery] = useState('')
  const [prevEditingEntry, setPrevEditingEntry] = useState(editingEntry)

  const isEditing = !!editingEntry
  const isZh = i18n.language === 'zh'

  if (prevEditingEntry !== editingEntry) {
    setPrevEditingEntry(editingEntry)
    if (editingEntry) {
      setFood(editingEntry.food)
      setCalorieInput(String(editingEntry.calories))
      setMealTime(editingEntry.mealTime)
      setCategory(editingEntry.category)
      setNote(editingEntry.note)
      setError('')
    } else {
      setFood('')
      setCalorieInput('')
      setMealTime(() => {
        const now = new Date()
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      })
      setCategory('')
      setNote('')
      setError('')
    }
  }

  const effectiveCategory = categories.some(c => c.name === category)
    ? category
    : (categories[0]?.name ?? '')

  const parsedCalories = parseCalorieInput(calorieInput)
  const showCalcResult = parsedCalories !== null && /[+-]/.test(calorieInput.trim().slice(1))

  const filteredFoods = useMemo(() => {
    if (!foodQuery.trim()) return COMMON_FOODS.slice(0, 20)
    const q = foodQuery.toLowerCase()
    return COMMON_FOODS.filter(f =>
      f.name.toLowerCase().includes(q) || f.nameEn.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [foodQuery])

  const handleFoodSelect = (foodItem: typeof COMMON_FOODS[0]) => {
    setFood(isZh ? foodItem.name : foodItem.nameEn)
    setCalorieInput(String(foodItem.calories))
    setShowFoodSearch(false)
    setFoodQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!food.trim()) {
      setError(t('eating.errorFood'))
      return
    }

    const calories = parseCalorieInput(calorieInput)
    if (calories === null) {
      setError(t('eating.errorCalorie'))
      return
    }

    if (isEditing && onUpdate) {
      onUpdate(editingEntry.id, {
        food: food.trim(),
        calories,
        mealTime,
        category: effectiveCategory,
        note: note.trim(),
      })
      onCancelEdit?.()
    } else {
      onAdd({
        date: selectedDate,
        food: food.trim(),
        calories,
        mealTime,
        category: effectiveCategory,
        note: note.trim(),
      })
      setFood('')
      setCalorieInput('')
      setNote('')
      setError('')
      const now = new Date()
      setMealTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        {isEditing ? t('eating.editTitle') : t('eating.addTitle')}
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <input
            type="text"
            value={food}
            onChange={e => setFood(e.target.value)}
            placeholder={t('eating.foodPlaceholder')}
            aria-label={t('eating.foodLabel')}
            className="input-base"
            maxLength={100}
          />
        </div>

        <div>
          <input
            type="text"
            value={calorieInput}
            onChange={e => setCalorieInput(e.target.value)}
            placeholder={t('eating.caloriePlaceholder')}
            aria-label={t('eating.calorieLabel')}
            className="input-base"
            inputMode="decimal"
          />
          {showCalcResult && (
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1" aria-live="polite">
              = {formatCalories(parsedCalories)}
            </p>
          )}
        </div>

        <div>
          <input
            type="time"
            value={mealTime}
            onChange={e => setMealTime(e.target.value)}
            aria-label={t('eating.mealTimeLabel')}
            className="input-base"
          />
        </div>

        <div>
          <select
            value={effectiveCategory}
            onChange={e => setCategory(e.target.value)}
            aria-label={t('entry.categoryLabel')}
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
            placeholder={t('eating.notePlaceholder')}
            aria-label={t('eating.noteLabel')}
            className="input-base"
            maxLength={200}
          />
        </div>
      </div>

      <div className="mb-3">
        <button
          type="button"
          onClick={() => setShowFoodSearch(s => !s)}
          className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          aria-expanded={showFoodSearch}
        >
          {t('eating.foodSearch')} {showFoodSearch ? '▲' : '▼'}
        </button>

        {showFoodSearch && (
          <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <input
              type="text"
              value={foodQuery}
              onChange={e => setFoodQuery(e.target.value)}
              placeholder={t('eating.foodSearchPlaceholder')}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 focus:outline-none"
            />
            <div className="max-h-48 overflow-y-auto">
              {filteredFoods.length === 0 ? (
                <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">{t('eating.foodSearchEmpty')}</p>
              ) : (
                filteredFoods.map(item => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleFoodSelect(item)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex justify-between items-center"
                  >
                    <span className="text-gray-800 dark:text-gray-100">
                      {isZh ? item.name : item.nameEn}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2">
                      {item.calories} {t('eating.calorieUnit')} / {item.unit}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="px-3 py-1.5 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">{t('eating.foodSearchHint')}</span>
              <a
                href="https://www.boohee.com/food/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 dark:text-blue-400 hover:underline"
              >
                {t('eating.calorieRef')} → {t('eating.calorieRefSite')}
              </a>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-xs mb-2" role="alert">{error}</p>}

      <div className={isEditing ? 'flex gap-2' : ''}>
        <button
          type="submit"
          className={`${isEditing ? 'flex-1' : 'w-full'} py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors`}
        >
          {isEditing ? t('entry.saveButton') : t('eating.addButton')}
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

export default EatingEntryForm
