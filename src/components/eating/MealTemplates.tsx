import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { EatingEntry } from '../../types/eating'

const DEFAULT_TEMPLATES = [
  { nameKey: 'eating.templateBreakfast', calories: 400 },
  { nameKey: 'eating.templateLunch', calories: 600 },
  { nameKey: 'eating.templateDinner', calories: 500 },
]

interface SavedTemplate {
  name: string
  calories: number
}

interface MealTemplatesProps {
  onQuickAdd: (meal: { name: string; calories: number }) => void
  entries?: EatingEntry[]
  savedTemplates?: SavedTemplate[]
  onSaveTemplate?: (template: SavedTemplate) => void
  onDeleteTemplate?: (name: string) => void
}

export default function MealTemplates({ onQuickAdd, entries = [], savedTemplates = [], onSaveTemplate, onDeleteTemplate }: MealTemplatesProps) {
  const { t } = useTranslation()
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCalories, setCustomCalories] = useState('')

  // Frequently logged meals (top 3 by frequency, excluding already saved)
  const frequentMeals = useMemo(() => {
    if (entries.length === 0) return []
    const freq = new Map<string, { count: number; calories: number }>()
    for (const e of entries) {
      const key = e.food.toLowerCase()
      if (!key) continue
      const existing = freq.get(key)
      if (existing) {
        existing.count++
      } else {
        freq.set(key, { count: 1, calories: e.calories })
      }
    }
    const savedNames = new Set(savedTemplates.map(t => t.name.toLowerCase()))
    return Array.from(freq.entries())
      .filter(([name]) => !savedNames.has(name))
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([name, data]) => ({ name: entries.find(e => e.food.toLowerCase() === name)?.food ?? name, calories: Math.round(data.calories / data.count) }))
  }, [entries, savedTemplates])

  const handleSaveCustom = useCallback(() => {
    if (!customName.trim() || !customCalories.trim()) return
    const cal = parseInt(customCalories, 10)
    if (isNaN(cal) || cal <= 0) return
    onSaveTemplate?.({ name: customName.trim(), calories: cal })
    setCustomName('')
    setCustomCalories('')
    setShowCustom(false)
  }, [customName, customCalories, onSaveTemplate])

  return (
    <div className="space-y-2">
      {/* Default templates */}
      <div className="flex gap-2">
        {DEFAULT_TEMPLATES.map(m => (
          <button
            key={m.nameKey}
            type="button"
            onClick={() => onQuickAdd({ name: t(m.nameKey), calories: m.calories })}
            className="btn-secondary flex-1 text-xs"
          >
            {t(m.nameKey)} ~{m.calories}kcal
          </button>
        ))}
      </div>

      {/* User-saved templates */}
      {savedTemplates.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {savedTemplates.map(tmpl => (
            <div key={tmpl.name} className="shrink-0 flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/15 text-gray-700 dark:text-gray-300" style={{ border: '1px solid rgba(196,163,107,0.25)' }}>
              <button
                type="button"
                onClick={() => onQuickAdd(tmpl)}
                className="hover:opacity-80 transition-opacity"
              >
                {tmpl.name} <span className="text-[10px] text-gray-400 tabular-nums">{tmpl.calories}</span>
              </button>
              {onDeleteTemplate && (
                <button
                  type="button"
                  onClick={() => onDeleteTemplate(tmpl.name)}
                  className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label={t('eating.deleteTemplate', { name: tmpl.name })}
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Frequent meals suggestion */}
      {frequentMeals.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500 self-center mr-0.5">{t('eating.frequentLabel')}</span>
          {frequentMeals.map(meal => (
            <button
              key={meal.name}
              type="button"
              onClick={() => onQuickAdd(meal)}
              className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
              style={{ border: '1px dashed rgba(156,163,175,0.3)' }}
            >
              <span className="truncate max-w-[70px]">{meal.name}</span>
              <span className="text-[10px] text-gray-400 tabular-nums">{meal.calories}</span>
            </button>
          ))}
        </div>
      )}

      {/* Add custom template */}
      {onSaveTemplate && (
        <>
          <button
            type="button"
            onClick={() => setShowCustom(s => !s)}
            className="text-[11px] text-gray-400 dark:text-gray-500 hover:text-mode-eating transition-colors flex items-center gap-0.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
            </svg>
            {t('eating.addTemplate')}
          </button>
          {showCustom && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder={t('eating.templateNamePlaceholder')}
                className="input-base flex-1 text-xs py-1.5"
                maxLength={30}
              />
              <input
                type="number"
                value={customCalories}
                onChange={e => setCustomCalories(e.target.value)}
                placeholder="kcal"
                className="input-base w-20 text-xs py-1.5"
                min={1}
                max={10000}
              />
              <button type="button" onClick={handleSaveCustom} className="btn-secondary text-xs py-1.5 px-3">
                {t('eating.saveTemplate')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
