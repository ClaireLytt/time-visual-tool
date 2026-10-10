import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { PRIORITY_COLORS } from '../../constants/todo'
import { XIcon } from '../icons'
import ConfirmDialog from '../common/ConfirmDialog'
import type { TodoItem as TodoItemType } from '../../types/todo'

interface TodoItemProps {
  item: TodoItemType
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

const TodoItem = memo(function TodoItem({ item, onToggle, onDelete }: TodoItemProps) {
  const { t } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className={`flex items-center gap-3 py-2.5 ${item.done ? 'opacity-50' : ''}`}>
      {/* Priority dot */}
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[item.priority] }} />

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
  )
})

export default TodoItem
