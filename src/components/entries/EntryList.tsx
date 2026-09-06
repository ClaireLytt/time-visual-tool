import { useTranslation } from 'react-i18next'
import type { TimeEntry } from '../../types'
import EntryItem from './EntryItem'

interface EntryListProps {
  entries: TimeEntry[]
  onDelete: (id: string) => void
  onEdit: (entry: TimeEntry) => void
}

function EntryList({ entries, onDelete, onEdit }: EntryListProps) {
  const { t } = useTranslation()

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('entryList.emptyTitle')}</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('entryList.emptySubtitle')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-3 pt-2 pb-1">
        {t('entryList.title', { count: entries.length })}
      </h3>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {entries.map(entry => (
          <EntryItem key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}

export default EntryList
