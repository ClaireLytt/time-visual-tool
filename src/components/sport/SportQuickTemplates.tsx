import { useState, useRef, useEffect } from 'react'
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
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [duration, setDuration] = useState('')
  const [sportType, setSportType] = useState('')
  const [emoji, setEmoji] = useState('💪')
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setAdding(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleAdd = () => {
    if (!label.trim() || !duration.trim()) return
    onAdd({
      emoji,
      label: label.trim(),
      content: label.trim(),
      duration: Math.max(1, parseInt(duration, 10) || 0),
      sportType: sportType || categories[0]?.name || '',
    })
    setLabel('')
    setDuration('')
    setSportType('')
    setEmoji('💪')
    setAdding(false)
  }

  const handleSelect = (tpl: SportQuickTemplate) => {
    onSelect({ content: tpl.content, duration: tpl.duration, sportType: tpl.sportType })
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      {/* Compact toggle text */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-mode-sport hover:underline whitespace-nowrap"
      >
        {t('sport.quickTemplates')} {templates.length > 0 && `(${templates.length})`}
        <span className="ml-1 text-[10px]">{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
          {/* Template list */}
          {templates.length > 0 && (
            <div className="space-y-1">
              {templates.map(tpl => (
                <div key={tpl.id} className="flex items-center gap-2 group">
                  <button
                    type="button"
                    onClick={() => handleSelect(tpl)}
                    className="flex-1 flex items-center gap-1.5 px-2 py-1.5 text-left text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-mode-sport/10 transition-colors"
                  >
                    <span>{tpl.emoji}</span>
                    <span className="truncate">{tpl.label}</span>
                    <span className="text-xs text-gray-400 ml-auto shrink-0">{tpl.duration}min</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(tpl.id)}
                    className="w-5 h-5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    aria-label={t('entry.deleteAriaLabel', { name: tpl.label })}
                  >
                    ×
                  </button>
                </div>
              ))}
              <hr className="border-gray-100 dark:border-gray-700" />
            </div>
          )}

          {/* Add form */}
          {adding ? (
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                {DEFAULT_EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-6 h-6 rounded text-xs flex items-center justify-center transition-colors ${emoji === e ? 'bg-mode-sport/20 ring-1 ring-mode-sport' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder={t('sport.templateName')} className="input-base flex-1 text-xs" maxLength={20} />
                <div className="relative w-[72px]">
                  <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="min" className="input-base w-full pr-7 text-xs" inputMode="numeric" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">min</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <select value={sportType} onChange={e => setSportType(e.target.value)} className="input-base flex-1 text-xs">
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{t('category.names.' + cat.name, cat.name)}</option>
                  ))}
                </select>
                <button type="button" onClick={handleAdd} disabled={!label.trim() || !duration.trim()} className="px-3 py-1 bg-mode-sport text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-40 transition-colors">
                  {t('sport.addButton')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full text-center text-xs text-mode-sport hover:underline py-1"
            >
              + {t('sport.addTemplate')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
