import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import type { TimeEntry } from '../../types'
import EntryItem from './EntryItem'

interface EntryListProps {
  entries: TimeEntry[]
  onDelete: (id: string) => void
  onEdit: (entry: TimeEntry) => void
}

/**
 * Gate: entries change a few times/day → occasional. Purpose: preventing jarring change.
 * Tool: motion AnimatePresence — needs exit animation + layout reflow.
 * Budget: 250ms enter, 200ms exit. Reduced-motion: opacity only.
 */
function EntryList({ entries, onDelete, onEdit }: EntryListProps) {
  const { t } = useTranslation()

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-calm-border dark:border-gray-700 shadow-card p-6 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('entryList.emptyTitle')}</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('entryList.emptySubtitle')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-calm-border dark:border-gray-700 shadow-card p-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-3 pt-2 pb-1">
        {t('entryList.title', { count: entries.length })}
      </h3>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        <AnimatePresence initial={false}>
          {entries.map(entry => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, transform: 'translateY(8px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              <EntryItem entry={entry} onDelete={onDelete} onEdit={onEdit} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default EntryList
