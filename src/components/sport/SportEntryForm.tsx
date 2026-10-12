import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { parseCalorieInput } from '../../utils/calories'
import DurationPresets from '../common/DurationPresets'
import type { SportEntry, SportCategory } from '../../types/sport'

export interface SportFormFill {
  content: string
  duration: number
  sportType: string
}

interface FrequentSport {
  content: string
  sportType: string
  avgDuration: number
  avgCalories: number
  count: number
}

interface SportEntryFormProps {
  selectedDate: string
  categories: SportCategory[]
  allEntries: SportEntry[]
  onAdd: (entry: Omit<SportEntry, 'id' | 'createdAt'>) => void
  editingEntry?: SportEntry | null
  onUpdate?: (id: string, updates: Partial<SportEntry>) => void
  onCancelEdit?: () => void
  templateFill?: SportFormFill | null
  onTemplateFillConsumed?: () => void
  /** When set by the filter tag, pre-select this sport type */
  filterSportType?: string
  /** When true, skip the outer panel wrapper (parent provides it) */
  inline?: boolean
}

function SportEntryForm({ selectedDate, categories, allEntries, onAdd, editingEntry, onUpdate, onCancelEdit, templateFill, onTemplateFillConsumed, filterSportType, inline }: SportEntryFormProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [durationInput, setDurationInput] = useState('')
  const [calorieInput, setCalorieInput] = useState('')
  const [distanceInput, setDistanceInput] = useState('')
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
      setDistanceInput(editingEntry.distance ? String(editingEntry.distance) : '')
      setSportType(editingEntry.sportType)
      setNote(editingEntry.note)
      setError('')
    } else {
      setContent('')
      setDurationInput('')
      setCalorieInput('')
      setDistanceInput('')
      setSportType('')
      setNote('')
      setError('')
    }
  }

  // Apply template fill (render-time sync, same pattern as editingEntry)
  const [prevTemplateFill, setPrevTemplateFill] = useState(templateFill)
  if (prevTemplateFill !== templateFill) {
    setPrevTemplateFill(templateFill)
    if (templateFill && !isEditing) {
      setContent(templateFill.content)
      setDurationInput(String(templateFill.duration))
      setSportType(templateFill.sportType)
      setError('')
      onTemplateFillConsumed?.()
    }
  }

  // Sync sport type from filter tag selection
  const [prevFilterType, setPrevFilterType] = useState(filterSportType)
  if (prevFilterType !== filterSportType) {
    setPrevFilterType(filterSportType)
    if (filterSportType && !isEditing) {
      setSportType(filterSportType)
    }
  }

  const effectiveSportType = categories.some(c => c.name === sportType)
    ? sportType
    : (categories[0]?.name ?? '')

  // Compute frequently used sport combos from history
  const frequentSports = useMemo((): FrequentSport[] => {
    const map = new Map<string, { content: string; sportType: string; totalDur: number; totalCal: number; count: number }>()
    for (const e of allEntries) {
      const key = `${e.content}||${e.sportType}`
      const existing = map.get(key)
      if (existing) {
        existing.totalDur += e.duration
        existing.totalCal += e.calories
        existing.count++
      } else {
        map.set(key, { content: e.content, sportType: e.sportType, totalDur: e.duration, totalCal: e.calories, count: 1 })
      }
    }
    return [...map.values()]
      .filter(v => v.count >= 2) // only show items used 2+ times
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(v => ({
        content: v.content,
        sportType: v.sportType,
        avgDuration: Math.round(v.totalDur / v.count),
        avgCalories: Math.round(v.totalCal / v.count),
        count: v.count,
      }))
  }, [allEntries])

  const handleQuickFill = (fs: FrequentSport) => {
    setContent(fs.content)
    setSportType(fs.sportType)
    setDurationInput(String(fs.avgDuration))
    if (fs.avgCalories > 0) setCalorieInput(String(fs.avgCalories))
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError(t('sport.errorContentEmpty'))
      return
    }

    let duration = 0
    if (durationInput.trim()) {
      const n = Number(durationInput.trim())
      if (!Number.isFinite(n) || n < 0 || n > 1440) {
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

    let distance: number | undefined
    if (distanceInput.trim()) {
      const n = Number(distanceInput.trim())
      if (!Number.isFinite(n) || n < 0 || n > 1000) {
        setError(t('sport.errorDistance'))
        return
      }
      distance = Math.round(n * 100) / 100
    }

    if (isEditing && onUpdate) {
      onUpdate(editingEntry.id, {
        content: content.trim(),
        duration,
        calories,
        distance,
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
        distance,
        sportType: effectiveSportType,
        note: note.trim(),
      })
      setContent('')
      setDurationInput('')
      setCalorieInput('')
      setDistanceInput('')
      setNote('')
      setError('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={inline ? '' : 'panel p-4 mb-4'}>
      {!inline && (
        <h3 className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-200 mb-3">
          {isEditing ? t('sport.editTitle') : t('sport.addTitle')}
        </h3>
      )}

      {/* Frequent sports quick-fill */}
      {!isEditing && frequentSports.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">{t('sport.frequentSports')}</p>
          <div className="flex flex-wrap gap-1.5">
            {frequentSports.map(fs => (
              <button
                key={`${fs.content}||${fs.sportType}`}
                type="button"
                onClick={() => handleQuickFill(fs)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700/60 hover:bg-mode-sport/15 dark:hover:bg-mode-sport/20 text-xs text-gray-700 dark:text-gray-200 rounded-full transition-colors border border-transparent hover:border-mode-sport/30"
              >
                <span>{t('category.names.' + fs.sportType, fs.sportType)}</span>
                <span className="text-gray-400 dark:text-gray-500">·</span>
                <span>{fs.content}</span>
                <span className="text-gray-400 dark:text-gray-500">{fs.avgDuration}min</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 mb-3">
        {/* 训练内容 — 通栏 */}
        <input type="text" value={content} onChange={e => setContent(e.target.value)} placeholder={t('sport.contentPlaceholder')} aria-label={t('sport.contentLabel')} className="input-base w-full" maxLength={100} />

        {/* 时长输入 + 快捷标签 — 同行 */}
        <div className="flex items-center gap-3">
          <div className="relative w-[140px] shrink-0">
            <input type="text" value={durationInput} onChange={e => setDurationInput(e.target.value)} placeholder={t('sport.durationPlaceholder')} aria-label={t('sport.durationLabel')} className="input-base w-full pr-10" inputMode="numeric" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">min</span>
          </div>
          <DurationPresets onSelect={v => setDurationInput(String(v))} selected={durationInput ? parseInt(durationInput, 10) : undefined} />
        </div>

        {/* 热量 + 距离 + 运动类型 — 同行 */}
        <div className="grid grid-cols-3 gap-3">
          <input type="text" value={calorieInput} onChange={e => setCalorieInput(e.target.value)} placeholder={t('sport.caloriePlaceholder')} aria-label={t('sport.calorieLabel')} className="input-base" inputMode="decimal" />
          <div className="relative">
            <input type="text" value={distanceInput} onChange={e => setDistanceInput(e.target.value)} placeholder={t('sport.distancePlaceholder')} aria-label={t('sport.distanceLabel')} className="input-base w-full pr-8" inputMode="decimal" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">km</span>
          </div>
          <select value={effectiveSportType} onChange={e => setSportType(e.target.value)} aria-label={t('sport.sportTypeLabel')} className="input-base">
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{t('category.names.' + cat.name, cat.name)}</option>
            ))}
          </select>
        </div>

        {/* 备注 — 通栏 */}
        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder={t('sport.notePlaceholder')} aria-label={t('sport.noteLabel')} className="input-base w-full" maxLength={200} />
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-xs mb-2" role="alert">{error}</p>}

      {/* 按钮 — 深绿色提交 */}
      <div className={isEditing ? 'flex gap-2' : ''}>
        <button type="submit" className={`${isEditing ? 'flex-1' : 'w-full'} py-2.5 bg-[#2d7a6f] hover:bg-[#256b61] text-white text-sm font-medium rounded-xl transition-colors`}>
          {isEditing ? t('entry.saveButton') : t('sport.addButton')}
        </button>
        {isEditing && (
          <button type="button" onClick={onCancelEdit} className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {t('entry.cancelButton')}
          </button>
        )}
      </div>
    </form>
  )
}

export default SportEntryForm
