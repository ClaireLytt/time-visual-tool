import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface SimpleEntryListProps<T extends { id: string; createdAt: string }> {
  entries: T[]
  emptyKey: string
  renderItem: (entry: T) => ReactNode
}

/**
 * Generic sorted entry list with empty state.
 * Replaces duplicated StudyList / WorkList pattern.
 */
export default function SimpleEntryList<T extends { id: string; createdAt: string }>({
  entries,
  emptyKey,
  renderItem,
}: SimpleEntryListProps<T>) {
  const { t } = useTranslation()

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [entries],
  )

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400 dark:text-gray-500">{t(emptyKey)}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
      {sorted.map(entry => (
        <div key={entry.id}>{renderItem(entry)}</div>
      ))}
    </div>
  )
}
