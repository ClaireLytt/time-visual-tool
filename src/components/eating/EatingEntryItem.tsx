import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { EatingEntry } from '../../types/eating'
import { formatCalories } from '../../utils/calories'
import { useCategories } from '../../contexts/CategoryContext'
import { EditIcon, XIcon } from '../icons'
import ConfirmDialog from '../common/ConfirmDialog'

interface EatingEntryItemProps {
  entry: EatingEntry
  onDelete: (id: string) => void
  onEdit: (entry: EatingEntry) => void
}

const EatingEntryItem = memo(function EatingEntryItem({ entry, onDelete, onEdit }: EatingEntryItemProps) {
  const { t } = useTranslation()
  const [showConfirm, setShowConfirm] = useState(false)
  const { getColor } = useCategories()
  const color = getColor(entry.category)
  const categoryName = t('category.names.' + entry.category, entry.category)
  const displayName = entry.food || categoryName

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg group transition-all hover:bg-gray-50/80 dark:hover:bg-gray-700/30 hover:shadow-soft">
      <span
        className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white dark:ring-gray-800"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}40` }}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{displayName}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{categoryName}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span>{entry.mealTime}</span>
          {entry.note && (
            <>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="truncate max-w-[120px]">{entry.note}</span>
            </>
          )}
        </div>
      </div>

      <span className="text-sm font-bold shrink-0 text-mode-eating tabular-nums">
        {formatCalories(entry.calories)}
      </span>

      <button
        onClick={() => onEdit(entry)}
        className="btn-icon text-gray-400 dark:text-gray-500 hover:text-calm-accent"
        aria-label={t('entry.editAriaLabel', { name: displayName })}
      >
        <EditIcon />
      </button>

      <button
        onClick={() => setShowConfirm(true)}
        className="btn-icon text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
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
})

export default EatingEntryItem
