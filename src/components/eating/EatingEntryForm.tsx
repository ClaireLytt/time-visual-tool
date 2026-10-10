import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { parseCalorieInput, formatCalories } from '../../utils/calories'
import { COMMON_FOODS } from '../../data/commonFoods'
import AnimatedCollapse from '../common/AnimatedCollapse'
import type { EatingEntry, EatingCategory } from '../../types/eating'

interface EatingEntryFormProps {
  selectedDate: string
  categories: EatingCategory[]
  onAdd: (entry: Omit<EatingEntry, 'id' | 'createdAt'>) => void
  editingEntry?: EatingEntry | null
  onUpdate?: (id: string, updates: Partial<EatingEntry>) => void
  onCancelEdit?: () => void
  entries?: EatingEntry[]
}

function EatingEntryForm({ selectedDate, categories, onAdd, editingEntry, onUpdate, onCancelEdit, entries = [] }: EatingEntryFormProps) {
  const { t, i18n } = useTranslation()
  const [food, setFood] = useState('')
  const [calorieInput, setCalorieInput] = useState('')
  const [mealTime, setMealTime] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [showMacros, setShowMacros] = useState(false)
  const [error, setError] = useState('')
  const [showFoodSearch, setShowFoodSearch] = useState(false)
  const [foodQuery, setFoodQuery] = useState('')
  const [prevEditingEntry, setPrevEditingEntry] = useState(editingEntry)

  // Serving multiplier state
  const [baseCalories, setBaseCalories] = useState<number | null>(null)
  const [multiplier, setMultiplier] = useState(1)

  const isEditing = !!editingEntry
  const isZh = i18n.language === 'zh'

  // Recent foods — deduplicated by food name, most recent first
  const recentFoods = useMemo(() => {
    if (entries.length === 0) return []
    const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const seen = new Set<string>()
    const result: { food: string; calories: number }[] = []
    for (const e of sorted) {
      const key = e.food.toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      result.push({ food: e.food, calories: e.calories })
      if (result.length >= 8) break
    }
    return result
  }, [entries])

  if (prevEditingEntry !== editingEntry) {
    setPrevEditingEntry(editingEntry)
    if (editingEntry) {
      setFood(editingEntry.food)
      setCalorieInput(String(editingEntry.calories))
      setMealTime(editingEntry.mealTime)
      setCategory(editingEntry.category)
      setNote(editingEntry.note)
      setProtein(editingEntry.protein != null ? String(editingEntry.protein) : '')
      setCarbs(editingEntry.carbs != null ? String(editingEntry.carbs) : '')
      setFat(editingEntry.fat != null ? String(editingEntry.fat) : '')
      setShowMacros(!!(editingEntry.protein || editingEntry.carbs || editingEntry.fat))
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
      setProtein('')
      setCarbs('')
      setFat('')
      setShowMacros(false)
      setError('')
    }
    setBaseCalories(null)
    setMultiplier(1)
  }

  const effectiveCategory = categories.some(c => c.name === category)
    ? category
    : (categories[0]?.name ?? '')

  const parsedCalories = parseCalorieInput(calorieInput)
  const showCalcResult = parsedCalories !== null && /[+-]/.test(calorieInput.trim().slice(1)) && baseCalories === null

  const filteredFoods = useMemo(() => {
    if (!foodQuery.trim()) return COMMON_FOODS.slice(0, 20)
    const q = foodQuery.toLowerCase()
    return COMMON_FOODS.filter(f =>
      f.name.toLowerCase().includes(q) || f.nameEn.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [foodQuery])

  const applyFoodSelection = (name: string, calories: number) => {
    setFood(name)
    setCalorieInput(String(calories))
    setBaseCalories(calories)
    setMultiplier(1)
    setShowFoodSearch(false)
    setFoodQuery('')
  }

  const handleFoodSelect = (foodItem: typeof COMMON_FOODS[0]) => {
    applyFoodSelection(isZh ? foodItem.name : foodItem.nameEn, foodItem.calories)
  }

  const handleRecentSelect = (item: { food: string; calories: number }) => {
    applyFoodSelection(item.food, item.calories)
  }

  const handleMultiplierChange = (delta: number) => {
    if (baseCalories === null) return
    const next = Math.max(0.5, Math.min(5, multiplier + delta))
    setMultiplier(next)
    setCalorieInput(String(Math.round(baseCalories * next)))
  }

  const handleFoodManualChange = (value: string) => {
    setFood(value)
    setBaseCalories(null)
    setMultiplier(1)
  }

  const handleCalorieManualChange = (value: string) => {
    setCalorieInput(value)
    setBaseCalories(null)
    setMultiplier(1)
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

    const parsedProtein = protein.trim() ? parseFloat(protein) : undefined
    const parsedCarbs = carbs.trim() ? parseFloat(carbs) : undefined
    const parsedFat = fat.trim() ? parseFloat(fat) : undefined

    const macroFields = {
      ...(parsedProtein != null && !isNaN(parsedProtein) ? { protein: parsedProtein } : {}),
      ...(parsedCarbs != null && !isNaN(parsedCarbs) ? { carbs: parsedCarbs } : {}),
      ...(parsedFat != null && !isNaN(parsedFat) ? { fat: parsedFat } : {}),
    }

    if (isEditing && onUpdate) {
      onUpdate(editingEntry.id, {
        food: food.trim(),
        calories,
        mealTime,
        category: effectiveCategory,
        note: note.trim(),
        ...macroFields,
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
        ...macroFields,
      })
      setFood('')
      setCalorieInput('')
      setNote('')
      setProtein('')
      setCarbs('')
      setFat('')
      setShowMacros(false)
      setError('')
      setBaseCalories(null)
      setMultiplier(1)
      const now = new Date()
      setMealTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel panel-accent p-4 mb-4" style={{ '--panel-accent': '#c4a36b' } as React.CSSProperties}>
      <h3 className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-200 mb-3 mt-1">
        {isEditing ? t('eating.editTitle') : t('eating.addTitle')}
      </h3>

      {/* Recent foods pills */}
      {!isEditing && recentFoods.length > 0 && (
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {recentFoods.map(item => (
            <button
              key={item.food}
              type="button"
              onClick={() => handleRecentSelect(item)}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all bg-amber-50 dark:bg-amber-900/15 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
              style={{
                border: '1px solid rgba(196,163,107,0.2)',
                boxShadow: '0 1px 0 rgba(0,0,0,0.03)',
              }}
            >
              <span className="truncate max-w-[80px]">{item.food}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">{item.calories}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <input
            type="text"
            value={food}
            onChange={e => handleFoodManualChange(e.target.value)}
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
            onChange={e => handleCalorieManualChange(e.target.value)}
            placeholder={t('eating.caloriePlaceholder')}
            aria-label={t('eating.calorieLabel')}
            className="input-base"
            inputMode="decimal"
          />
          {showCalcResult && (
            <p className="text-xs text-mode-eating font-medium mt-1" aria-live="polite">
              = {formatCalories(parsedCalories)}
            </p>
          )}
          {/* Serving multiplier */}
          <AnimatedCollapse open={baseCalories !== null}>
            <div
              className="flex items-center justify-center gap-2 mt-1.5 py-1 rounded-lg"
              role="group"
              aria-label={t('eating.multiplierAriaLabel')}
            >
              <button
                type="button"
                onClick={() => handleMultiplierChange(-0.5)}
                disabled={multiplier <= 0.5}
                className="btn-icon w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 disabled:opacity-30"
                aria-label={t('eating.multiplierDecrease')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" d="M5 12h14" />
                </svg>
              </button>
              <span className="text-sm font-semibold tabular-nums text-mode-eating min-w-[2.5rem] text-center">
                {multiplier}×
              </span>
              <button
                type="button"
                onClick={() => handleMultiplierChange(0.5)}
                disabled={multiplier >= 5}
                className="btn-icon w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 disabled:opacity-30"
                aria-label={t('eating.multiplierIncrease')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
                </svg>
              </button>
            </div>
          </AnimatedCollapse>
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

      {/* Macro nutrients toggle */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setShowMacros(s => !s)}
          className="text-xs font-medium text-mode-eating hover:opacity-80 transition-colors flex items-center gap-1"
          aria-expanded={showMacros}
        >
          <span>{t('eating.macroToggle')}</span>
          <svg className={`w-3 h-3 transition-transform ${showMacros ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatedCollapse open={showMacros}>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">{t('eating.proteinLabel')}</label>
              <input
                type="number"
                value={protein}
                onChange={e => setProtein(e.target.value)}
                placeholder="g"
                className="input-base text-sm"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">{t('eating.carbsLabel')}</label>
              <input
                type="number"
                value={carbs}
                onChange={e => setCarbs(e.target.value)}
                placeholder="g"
                className="input-base text-sm"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">{t('eating.fatLabel')}</label>
              <input
                type="number"
                value={fat}
                onChange={e => setFat(e.target.value)}
                placeholder="g"
                className="input-base text-sm"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </AnimatedCollapse>
      </div>

      <div className="mb-3">
        <button
          type="button"
          onClick={() => setShowFoodSearch(s => !s)}
          className="text-xs font-medium text-mode-eating hover:opacity-80 transition-colors flex items-center gap-1"
          aria-expanded={showFoodSearch}
        >
          <span>{t('eating.foodSearch')}</span>
          <svg className={`w-3 h-3 transition-transform ${showFoodSearch ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showFoodSearch && (
          <div className="mt-2 rounded-xl overflow-hidden" style={{ border: '1px solid #e0dfdb', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}>
            <input
              type="text"
              value={foodQuery}
              onChange={e => setFoodQuery(e.target.value)}
              placeholder={t('eating.foodSearchPlaceholder')}
              className="w-full px-3 py-2 text-base sm:text-sm bg-[#f4f3f1] dark:bg-[#1e1e22] text-gray-900 dark:text-gray-100 border-b border-[#e0dfdb] dark:border-[#3a3a40] focus:outline-none"
            />
            <div className="max-h-48 overflow-y-auto bg-white dark:bg-gray-800">
              {filteredFoods.length === 0 ? (
                <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">{t('eating.foodSearchEmpty')}</p>
              ) : (
                filteredFoods.map(item => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleFoodSelect(item)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex justify-between items-center border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span className="text-gray-800 dark:text-gray-100 font-medium">
                      {isZh ? item.name : item.nameEn}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2 tabular-nums">
                      {item.calories} {t('eating.calorieUnit')} / {item.unit}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="px-3 py-1.5 border-t border-[#e0dfdb] dark:border-[#3a3a40] bg-[#f4f3f1] dark:bg-[#1e1e22] flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">{t('eating.foodSearchHint')}</span>
              <a
                href="https://www.boohee.com/food/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-calm-accent hover:underline"
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
          className={`${isEditing ? 'flex-1' : 'w-full'} btn-tactile bg-mode-eating text-white`}
        >
          {isEditing ? t('entry.saveButton') : t('eating.addButton')}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="btn-secondary text-gray-600 dark:text-gray-300"
          >
            {t('entry.cancelButton')}
          </button>
        )}
      </div>
    </form>
  )
}

export default EatingEntryForm
