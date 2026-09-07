import { useState } from 'react'
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

function EatingEntryItem({ entry, onDelete, onEdit }: EatingEntryItemProps) {
  const { t } = useTranslation()
  const [showConfirm, setShowConfirm] = useState(false)
  const { getColor } = useCategories()
  const color = getColor(entry.category)
  const categoryName = t('category.names.' + entry.category, entry.category)
  const displayName = entry.food || categoryName

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
          <span>{entry.mealTime}</span>
          {entry.note && <span className="truncate max-w-[120px]">{entry.note}</span>}
        </div>
      </div>

      <span className="text-sm font-semibold shrink-0 text-amber-600 dark:text-amber-400">
        {formatCalories(entry.calories)}
      </span>

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

export default EatingEntryItem
