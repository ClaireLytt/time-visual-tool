import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { PRIORITY_COLORS } from '../../constants/todo'
import { XIcon } from '../icons'
import ConfirmDialog from '../common/ConfirmDialog'
import RepeatEditor from './RepeatEditor'
import type { TodoItem as TodoItemType, TodoPriority, TodoRepeat } from '../../types/todo'

interface TodoItemProps {
  item: TodoItemType
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate?: (id: string, updates: Partial<TodoItemType>) => void
  /** delete only the current occurrence of a recurring item */
  onSkipOccurrence?: (id: string) => void
}

const BORDER_STYLES: Record<TodoPriority, string> = {
  high: '4px solid #ef4444',
  medium: '3px solid #eab308',
  low: '2px solid #d1d5db',
}

const TodoItem = memo(function TodoItem({ item, onToggle, onDelete, onUpdate, onSkipOccurrence }: TodoItemProps) {
  const { t } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showDeleteChoice, setShowDeleteChoice] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notesText, setNotesText] = useState(item.notes ?? '')
  const [showPriorityEdit, setShowPriorityEdit] = useState(false)
  const [showRepeatEdit, setShowRepeatEdit] = useState(false)
  const [repeatDraft, setRepeatDraft] = useState<TodoRepeat | undefined>(item.repeat?.type !== 'none' ? item.repeat : undefined)

  const isRecurring = !!item.repeat && item.repeat.type !== 'none'

  const handleRepeatSave = () => {
    onUpdate?.(item.id, {
      repeat: repeatDraft,
      ...(repeatDraft && !isRecurring ? { completedDates: [] } : {}),
    })
    setShowRepeatEdit(false)
  }

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
        {/* Priority badge — click to change */}
        <button
          type="button"
          onClick={() => onUpdate && setShowPriorityEdit(prev => !prev)}
          title={t('todo.changePriority')}
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 transition-transform ${onUpdate ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          style={{
            backgroundColor: PRIORITY_COLORS[item.priority] + '20',
            color: PRIORITY_COLORS[item.priority],
          }}
        >
          {t(`todo.priority.${item.priority}`)}
        </button>

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
          {isRecurring && item.repeat && (
            <span className="ml-2 text-[10px] text-[#5b8def]" title={t(`todo.repeat.${item.repeat.type}`)}>
              🔁 {t(`todo.repeat.${item.repeat.type}`)}{item.repeat.until ? ` → ${item.repeat.until}` : ''}
            </span>
          )}
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

        {/* Edit repeat rule */}
        {onUpdate && (
          <button
            onClick={() => {
              setRepeatDraft(item.repeat?.type !== 'none' ? item.repeat : undefined)
              setShowRepeatEdit(prev => !prev)
            }}
            className="text-xs shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
            title={t('todo.editRepeat')}
          >
            🔁
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => isRecurring ? setShowDeleteChoice(prev => !prev) : setConfirmDelete(true)}
          className="btn-icon text-gray-400 hover:text-red-500"
        >
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

      {/* Priority picker */}
      {showPriorityEdit && onUpdate && (
        <div className="mt-2 ml-8 flex gap-2 items-center">
          {(['high', 'medium', 'low'] as TodoPriority[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => { onUpdate(item.id, { priority: p }); setShowPriorityEdit(false) }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                item.priority === p ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              style={item.priority === p ? { backgroundColor: PRIORITY_COLORS[p] } : undefined}
            >
              {t(`todo.priority.${p}`)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowPriorityEdit(false)}
            className="px-2 py-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {t('confirm.cancel')}
          </button>
        </div>
      )}

      {/* Recurring delete: this occurrence or whole series */}
      {showDeleteChoice && (
        <div className="mt-2 ml-8 flex gap-2 flex-wrap items-center text-xs">
          {onSkipOccurrence && (
            <button
              onClick={() => { onSkipOccurrence(item.id); setShowDeleteChoice(false) }}
              className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {t('todo.deleteOccurrence')}
            </button>
          )}
          <button
            onClick={() => { onDelete(item.id); setShowDeleteChoice(false) }}
            className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            {t('todo.deleteSeries')}
          </button>
          <button
            onClick={() => setShowDeleteChoice(false)}
            className="px-2.5 py-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {t('confirm.cancel')}
          </button>
        </div>
      )}

      {/* Repeat rule editor */}
      {showRepeatEdit && (
        <div className="mt-2 ml-8 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2">
          <RepeatEditor value={repeatDraft} onChange={setRepeatDraft} />
          <div className="flex gap-2">
            <button
              onClick={handleRepeatSave}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#5b8def] text-white"
            >
              {t('todo.save')}
            </button>
            <button
              onClick={() => setShowRepeatEdit(false)}
              className="px-2.5 py-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {t('confirm.cancel')}
            </button>
          </div>
        </div>
      )}

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
