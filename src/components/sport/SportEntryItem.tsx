import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SportEntry } from '../../types/sport'
import { formatDuration } from '../../utils/time'
import { useCategories } from '../../contexts/CategoryContext'
import { EditIcon, XIcon } from '../icons'
import ConfirmDialog from '../common/ConfirmDialog'

interface SportEntryItemProps {
  entry: SportEntry
  onDelete: (id: string) => void
  onEdit: (entry: SportEntry) => void
}

function SportEntryItem({ entry, onDelete, onEdit }: SportEntryItemProps) {
  const { t } = useTranslation()
  const [showConfirm, setShowConfirm] = useState(false)
  const { getColor } = useCategories()
  const color = getColor(entry.sportType)
  const categoryName = t('category.names.' + entry.sportType, entry.sportType)
  const displayName = entry.content || categoryName

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{displayName}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{categoryName}</span>
          {entry.duration > 0 && <span>{formatDuration(entry.duration)}</span>}
          {entry.note && <span className="truncate max-w-[120px]">{entry.note}</span>}
        </div>
      </div>

      {entry.calories > 0 && (
        <span className="text-sm font-semibold shrink-0 text-teal-600 dark:text-teal-400">
          {Math.round(entry.calories)} {t('sport.calorieUnit')}
        </span>
      )}

      <button
        onClick={() => onEdit(entry)}
        className="opacity-70 hover:opacity-100 focus-visible:opacity-100 p-1 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
        aria-label={t('entry.editAriaLabel', { name: displayName })}
      >
        <EditIcon />
      </button>

      <button
        onClick={() => setShowConfirm(true)}
        className="opacity-70 hover:opacity-100 focus-visible:opacity-100 p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
        aria-label={t('entry.deleteAriaLabel', { name: displayName })}
      >
        <XIcon />
      </button>

      <ConfirmDialog
        open={showConfirm}
        title={t('delete.confirmTitle')}
        message={t('delete.confirmMessage', { name: displayName })}
        confirmLabel={t('delete.deleteButton')}
        confirmVariant="danger"
        onConfirm={() => { onDelete(entry.id); setShowConfirm(false) }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default SportEntryItem
