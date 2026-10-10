import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { PRIORITY_COLORS } from '../../constants/todo'
import { XIcon } from '../icons'
import ConfirmDialog from '../common/ConfirmDialog'
import type { TodoItem as TodoItemType, TodoPriority } from '../../types/todo'

interface TodoItemProps {
  item: TodoItemType
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate?: (id: string, updates: Partial<TodoItemType>) => void
}

const BORDER_STYLES: Record<TodoPriority, string> = {
  high: '4px solid #ef4444',
  medium: '3px solid #eab308',
  low: '2px solid #d1d5db',
}

const TodoItem = memo(function TodoItem({ item, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const { t } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notesText, setNotesText] = useState(item.notes ?? '')

  const handleNotesBlur = () => {
    const trimmed = notesText.trim()
    if (trimmed !== (item.notes ?? '')) {
      onUpdate?.(item.id, { notes: trimmed || undefined })
    }
  }

  return (
    <div
      className={`py-2.5 ${item.done ? 'opacity-50' : ''}`}
      style={{ borderLeft: BORDER_STYLES[item.priority], paddingLeft: '12px' }}
    >
      <div className="flex items-center gap-3">
        {/* Priority badge */}
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
          style={{
            backgroundColor: PRIORITY_COLORS[item.priority] + '20',
            color: PRIORITY_COLORS[item.priority],
          }}
        >
          {t(`todo.priority.${item.priority}`)}
        </span>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(item.id)}
          className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
            item.done
              ? 'bg-[#5b8def] border-[#5b8def] text-white'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          aria-label={item.done ? t('todo.markUndone') : t('todo.markDone')}
        >
          {item.done && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Text + due date */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm ${item.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {item.text}
          </span>
          {item.dueDate && !item.done && (() => {
            const today = format(new Date(), 'yyyy-MM-dd')
            const isOverdue = item.dueDate < today
            const isToday = item.dueDate === today
            return (
              <span className={`ml-2 text-[10px] ${isOverdue ? 'text-red-500 font-semibold' : isToday ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
                {isOverdue ? '⚠ ' : ''}{item.dueDate}
              </span>
            )
          })()}
        </div>

        {/* Notes indicator */}
        {item.notes && (
          <button
            onClick={() => setShowNotes(prev => !prev)}
            className="text-sm shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title={t('todo.notes')}
          >
            📝
          </button>
        )}

        {/* Toggle notes editor */}
        {!item.notes && (
          <button
            onClick={() => setShowNotes(prev => !prev)}
            className="text-xs shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
            title={t('todo.addNotes')}
          >
            +📝
          </button>
        )}

        {/* Delete */}
        <button onClick={() => setConfirmDelete(true)} className="btn-icon text-gray-400 hover:text-red-500">
          <XIcon className="w-4 h-4" />
        </button>
        <ConfirmDialog
          open={confirmDelete}
          title={t('todo.deleteTitle')}
          message={t('todo.deleteMessage')}
          onConfirm={() => { onDelete(item.id); setConfirmDelete(false) }}
          onCancel={() => setConfirmDelete(false)}
        />
      </div>

      {/* Collapsible notes */}
      {showNotes && (
        <div className="mt-2 ml-8">
          <textarea
            value={notesText}
            onChange={e => setNotesText(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder={t('todo.addNotes') + '\n- item 1\n- item 2'}
            className="w-full text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#5b8def]/50"
            rows={3}
          />
        </div>
      )}
    </div>
  )
})

export default TodoItem
