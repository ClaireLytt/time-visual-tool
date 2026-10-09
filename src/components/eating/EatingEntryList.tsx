import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { EatingEntry } from '../../types/eating'
import EatingEntryItem from './EatingEntryItem'

interface EatingEntryListProps {
  entries: EatingEntry[]
  onDelete: (id: string) => void
  onEdit: (entry: EatingEntry) => void
}

function EatingEntryList({ entries, onDelete, onEdit }: EatingEntryListProps) {
  const { t } = useTranslation()
  const sorted = useMemo(() => [...entries].sort((a, b) => a.mealTime.localeCompare(b.mealTime)), [entries])

  if (entries.length === 0) {
    return (
      <div className="panel p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 flex items-center justify-center">
          <svg className="w-6 h-6 text-mode-eating/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('eating.emptyTitle')}</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('eating.emptySubtitle')}</p>
      </div>
    )
  }

  return (
    <div className="panel panel-accent p-2" style={{ '--panel-accent': '#c4a36b' } as React.CSSProperties}>
      <h3 className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400 px-3 pt-3 pb-1">
        {t('eating.listTitle', { count: entries.length })}
      </h3>
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {sorted.map(entry => (
          <EatingEntryItem key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}

export default EatingEntryList
