import { useState } from 'react'
import type { TimeEntry } from '../../types'
import { formatDuration } from '../../utils/time'
import { useCategories } from '../../contexts/CategoryContext'
import ConfirmDialog from '../common/ConfirmDialog'

interface EntryItemProps {
  entry: TimeEntry
  onDelete: (id: string) => void
  onEdit: (entry: TimeEntry) => void
}

function EntryItem({ entry, onDelete, onEdit }: EntryItemProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const { getColor } = useCategories()
  const color = getColor(entry.category)

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 rounded-lg group">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{entry.activity}</p>
        <p className="text-xs text-gray-500">
          {entry.category} · {formatDuration(entry.duration)}
          {entry.weight !== 1 && <span className="ml-1 text-amber-600">x{entry.weight}</span>}
        </p>
      </div>

      <button
        onClick={() => onEdit(entry)}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all"
        title="编辑"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <button
        onClick={() => setShowConfirm(true)}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
        title="删除"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <ConfirmDialog
        open={showConfirm}
        title="确认删除"
        message={`确定要删除「${entry.activity}」吗？此操作无法撤销。`}
        confirmLabel="删除"
        confirmVariant="danger"
        onConfirm={() => { onDelete(entry.id); setShowConfirm(false) }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default EntryItem
