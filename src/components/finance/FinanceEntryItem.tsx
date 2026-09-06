import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FinanceEntry } from '../../types/finance'
import { formatAmount } from '../../utils/money'
import { useCategories } from '../../contexts/CategoryContext'
import { EditIcon, XIcon } from '../icons'
import ConfirmDialog from '../common/ConfirmDialog'

interface FinanceEntryItemProps {
  entry: FinanceEntry
  onDelete: (id: string) => void
  onEdit: (entry: FinanceEntry) => void
}

function FinanceEntryItem({ entry, onDelete, onEdit }: FinanceEntryItemProps) {
  const { t } = useTranslation()
  const [showConfirm, setShowConfirm] = useState(false)
  const { getColor } = useCategories()
  const color = getColor(entry.category)
  const isIncome = entry.type === 'income'
  const categoryName = t('category.names.' + entry.category, entry.category)
  const displayName = entry.description || categoryName

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{displayName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{categoryName}</p>
      </div>

      <span className={`text-sm font-semibold shrink-0 ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
        {isIncome ? '+' : '-'}{formatAmount(entry.amount)}
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

export default FinanceEntryItem
