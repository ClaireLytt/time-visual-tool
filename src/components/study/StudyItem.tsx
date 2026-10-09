import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XIcon } from '../icons'
import ConfirmDialog from '../common/ConfirmDialog'
import type { StudyEntry } from '../../types/study'

interface StudyItemProps {
  entry: StudyEntry
  onDelete: (id: string) => void
  onRepeat?: (entry: StudyEntry) => void
}

const StudyItem = memo(function StudyItem({ entry, onDelete, onRepeat }: StudyItemProps) {
  const { t } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const display = entry.duration >= 60
    ? `${(entry.duration / 60).toFixed(1)}h`
    : `${entry.duration}m`

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#4a90d9]/10 flex items-center justify-center text-sm shrink-0">
        📚
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.subject}</span>
          <span className="text-xs font-bold tabular-nums text-[#4a90d9]">{display}</span>
        </div>
        {entry.notes && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{entry.notes}</p>
        )}
      </div>
      {onRepeat && (
        <button onClick={() => onRepeat(entry)} className="btn-icon text-gray-400 hover:text-[#4a90d9]" aria-label="Repeat">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M5 19a9 9 0 0115-6.7M19 5a9 9 0 01-15 6.7" /></svg>
        </button>
      )}
      <button onClick={() => setConfirmDelete(true)} className="btn-icon text-gray-400 hover:text-red-500">
        <XIcon className="w-4 h-4" />
      </button>
      <ConfirmDialog
        open={confirmDelete}
        title={t('study.deleteTitle')}
        message={t('study.deleteMessage')}
        onConfirm={() => { onDelete(entry.id); setConfirmDelete(false) }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
})

export default StudyItem
