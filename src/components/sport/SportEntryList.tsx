import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { SportEntry } from '../../types/sport'
import SportEntryItem from './SportEntryItem'

interface SportEntryListProps {
  entries: SportEntry[]
  onDelete: (id: string) => void
  onEdit: (entry: SportEntry) => void
  bestDurations?: Record<string, number>
}

function SportEntryList({ entries, onDelete, onEdit, bestDurations }: SportEntryListProps) {
  const { t } = useTranslation()
  const sorted = useMemo(() => [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [entries])

  if (entries.length === 0) {
    return (
      <div className="panel p-6 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('sport.emptyTitle')}</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('sport.emptySubtitle')}</p>
      </div>
    )
  }

  return (
    <div className="panel p-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-3 pt-2 pb-1">
        {t('sport.listTitle', { count: entries.length })}
      </h3>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {sorted.map(entry => (
          <SportEntryItem key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} isPB={!!bestDurations && entry.duration > 0 && entry.duration >= (bestDurations[entry.sportType] ?? Infinity)} />
        ))}
      </div>
    </div>
  )
}

export default SportEntryList
