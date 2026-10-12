import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SportQuickTemplate, SportCategory } from '../../types/sport'

const DEFAULT_EMOJIS = ['🏃', '🏋️', '🧘', '🚴', '🏊', '⚽', '🥾', '🎾', '💪', '🏓']

interface SportQuickTemplatesProps {
  templates: SportQuickTemplate[]
  categories: SportCategory[]
  onSelect: (template: { content: string; duration: number; sportType: string }) => void
  onAdd: (template: Omit<SportQuickTemplate, 'id'>) => void
  onDelete: (id: string) => void
}

export default function SportQuickTemplates({ templates, categories, onSelect, onAdd, onDelete }: SportQuickTemplatesProps) {
  const { t } = useTranslation()
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [duration, setDuration] = useState('')
  const [sportType, setSportType] = useState('')
  const [emoji, setEmoji] = useState('💪')

  const handleAdd = () => {
    if (!label.trim() || !duration.trim()) return
    const type = sportType || categories[0]?.name || ''
    onAdd({
      emoji,
      label: label.trim(),
      content: label.trim(),
      duration: Math.max(1, parseInt(duration, 10) || 0),
      sportType: type,
    })
    setLabel('')
    setDuration('')
    setSportType('')
    setEmoji('💪')
    setAdding(false)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400">
          {t('sport.quickTemplates')}
        </p>
        <button
          type="button"
          onClick={() => setAdding(!adding)}
          className="text-xs text-mode-sport hover:underline"
        >
          {adding ? t('entry.cancelButton') : `+ ${t('sport.addTemplate')}`}
        </button>
      </div>

      {adding && (
        <div className="panel p-3 mb-2 space-y-2">
          <div className="flex gap-2">
            <div className="flex gap-1 flex-wrap">
              {DEFAULT_EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-7 h-7 rounded text-sm flex items-center justify-center transition-colors ${emoji === e ? 'bg-mode-sport/20 ring-1 ring-mode-sport' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={t('sport.templateName')}
              className="input-base flex-1"
              maxLength={20}
            />
            <div className="relative w-[100px]">
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder={t('sport.durationPlaceholder')}
                className="input-base w-full pr-10"
                inputMode="numeric"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">min</span>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sportType}
              onChange={e => setSportType(e.target.value)}
              className="input-base flex-1"
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{t('category.names.' + cat.name, cat.name)}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!label.trim() || !duration.trim()}
              className="px-4 py-1.5 bg-mode-sport text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-40 transition-colors"
            >
              {t('sport.addButton')}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {templates.map(tpl => (
          <div key={tpl.id} className="group relative">
            <button
              type="button"
              onClick={() => onSelect({ content: tpl.content, duration: tpl.duration, sportType: tpl.sportType })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-w-[100px] bg-gray-100 dark:bg-gray-700/60 hover:bg-mode-sport/15 dark:hover:bg-mode-sport/20 text-sm text-gray-700 dark:text-gray-200 rounded-full transition-colors border border-transparent hover:border-mode-sport/30"
            >
              <span>{tpl.emoji}</span>
              <span>{tpl.label} {tpl.duration}min</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(tpl.id)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={t('entry.deleteAriaLabel', { name: tpl.label })}
            >
              ×
            </button>
          </div>
        ))}
        {templates.length === 0 && !adding && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{t('sport.noTemplates')}</p>
        )}
      </div>
    </div>
  )
}
