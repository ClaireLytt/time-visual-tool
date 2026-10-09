import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XIcon } from '../icons'
import ConfirmDialog from '../common/ConfirmDialog'
import type { WorkEntry } from '../../types/work'

interface WorkItemProps {
  entry: WorkEntry
  onDelete: (id: string) => void
  onRepeat?: (entry: WorkEntry) => void
}

const WorkItem = memo(function WorkItem({ entry, onDelete, onRepeat }: WorkItemProps) {
  const { t } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const hours = Math.floor(entry.duration / 60)
  const mins = entry.duration % 60
  const durationLabel = hours > 0 ? `${hours}h${mins > 0 ? `${mins}m` : ''}` : `${mins}m`

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-md text-white shrink-0"
        style={{ backgroundColor: '#e67e22' }}
      >
        {entry.project}
      </span>
      <span className="flex-1 text-sm text-gray-900 dark:text-gray-100 truncate">{entry.task}</span>
      <span className="text-sm font-bold tabular-nums text-gray-600 dark:text-gray-300 shrink-0">{durationLabel}</span>
      {onRepeat && (
        <button onClick={() => onRepeat(entry)} className="btn-icon text-gray-400 hover:text-[#e67e22]" aria-label="Repeat">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M5 19a9 9 0 0115-6.7M19 5a9 9 0 01-15 6.7" /></svg>
        </button>
      )}
      <button onClick={() => setConfirmDelete(true)} className="btn-icon text-gray-400 hover:text-red-500">
        <XIcon className="w-4 h-4" />
      </button>
      <ConfirmDialog
        open={confirmDelete}
        title={t('work.deleteTitle')}
        message={t('work.deleteMessage')}
        onConfirm={() => { onDelete(entry.id); setConfirmDelete(false) }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
})

export default WorkItem
