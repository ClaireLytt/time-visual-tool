import { useTranslation } from 'react-i18next'
import type { FinanceEntry } from '../../types/finance'
import FinanceEntryItem from './FinanceEntryItem'

interface FinanceEntryListProps {
  entries: FinanceEntry[]
  onDelete: (id: string) => void
  onEdit: (entry: FinanceEntry) => void
}

function FinanceEntryList({ entries, onDelete, onEdit }: FinanceEntryListProps) {
  const { t } = useTranslation()

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('finance.emptyTitle')}</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('finance.emptySubtitle')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-3 pt-2 pb-1">
        {t('finance.listTitle', { count: entries.length })}
      </h3>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {entries.map(entry => (
          <FinanceEntryItem key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}

export default FinanceEntryList
