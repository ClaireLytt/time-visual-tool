import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { PRIORITY_COLORS, TODO_ACCENT } from '../../constants/todo'
import ConfirmDialog from '../common/ConfirmDialog'
import RepeatEditor from './RepeatEditor'
import type { TodoCategory, TodoItem as TodoItemType, TodoPriority, TodoRepeat } from '../../types/todo'

interface TodoItemProps {
  item: TodoItemType
  category?: TodoCategory
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate?: (id: string, updates: Partial<TodoItemType>) => void
  /** delete only the current occurrence of a recurring item */
  onSkipOccurrence?: (id: string) => void
}

// Left border width scales with priority; color comes from PRIORITY_COLORS
const BORDER_WIDTHS: Record<TodoPriority, number> = { high: 4, medium: 3, low: 2 }

const PRIORITIES: TodoPriority[] = ['high', 'medium', 'low']

/** Shared shell for the expandable sub-panels (priority, delete, repeat, notes) */
const SUB_PANEL_CLASS = 'mt-2 ml-8 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2'

const TodoItem = memo(function TodoItem({ item, category, onToggle, onDelete, onUpdate, onSkipOccurrence }: TodoItemProps) {
  const { t } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showDeleteChoice, setShowDeleteChoice] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notesText, setNotesText] = useState(item.notes ?? '')
  const [showPriorityEdit, setShowPriorityEdit] = useState(false)
  const [showRepeatEdit, setShowRepeatEdit] = useState(false)
  const [repeatDraft, setRepeatDraft] = useState<TodoRepeat | undefined>(item.repeat?.type !== 'none' ? item.repeat : undefined)

  const isRecurring = !!item.repeat && item.repeat.type !== 'none'

  const closePanels = () => {
    setShowDeleteChoice(false)
    setShowPriorityEdit(false)
    setShowRepeatEdit(false)
    setShowNotes(false)
  }

  const openPanel = (panel: 'priority' | 'delete' | 'repeat' | 'notes') => {
    const wasOpen =
      (panel === 'priority' && showPriorityEdit) ||
      (panel === 'delete' && showDeleteChoice) ||
      (panel === 'repeat' && showRepeatEdit) ||
      (panel === 'notes' && showNotes)
    closePanels()
    if (wasOpen) return
    if (panel === 'priority') setShowPriorityEdit(true)
    if (panel === 'delete') setShowDeleteChoice(true)
    if (panel === 'repeat') { setRepeatDraft(item.repeat?.type !== 'none' ? item.repeat : undefined); setShowRepeatEdit(true) }
    if (panel === 'notes') setShowNotes(true)
  }

  const handleNotesBlur = () => {
    const trimmed = notesText.trim()
    if (trimmed !== (item.notes ?? '')) {
      onUpdate?.(item.id, { notes: trimmed || undefined })
    }
  }

  const handleRepeatSave = () => {
    if (!repeatDraft && isRecurring) {
      // recurring -> one-off: anchor to today and keep today's completion,
      // otherwise the item resurfaces as an overdue task from its start date
      const today = format(new Date(), 'yyyy-MM-dd')
      onUpdate?.(item.id, {
        repeat: undefined,
        date: today,
        done: (item.completedDates ?? []).includes(today),
        completedDates: undefined,
        skippedDates: undefined,
      })
    } else {
      onUpdate?.(item.id, {
        repeat: repeatDraft,
        ...(repeatDraft && !isRecurring ? { completedDates: [] } : {}),
      })
    }
    setShowRepeatEdit(false)
  }

  return (
    <div
      className={`py-2 ${item.done ? 'opacity-50' : ''}`}
      style={{ borderLeft: `${BORDER_WIDTHS[item.priority]}px solid ${PRIORITY_COLORS[item.priority]}`, paddingLeft: '12px' }}
    >
      <div className="flex items-center gap-2">
        {/* Priority badge — tap to change (hit area padded to ~40px) */}
        <button
          type="button"
          onClick={() => onUpdate && openPanel('priority')}
          title={t('todo.changePriority')}
          className={`shrink-0 py-2.5 px-1 -my-2 ${onUpdate ? '' : 'cursor-default'}`}
        >
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: PRIORITY_COLORS[item.priority] + '20',
              color: PRIORITY_COLORS[item.priority],
            }}
          >
            {t(`todo.priority.${item.priority}`)}
          </span>
        </button>

        {/* Checkbox — 44px hit area around the 20px visual box */}
        <button
          onClick={() => onToggle(item.id)}
          className="shrink-0 p-2.5 -m-2 flex items-center justify-center"
          aria-label={item.done ? t('todo.markUndone') : t('todo.markDone')}
        >
          <span
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              item.done
                ? 'text-white border-transparent'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            style={item.done ? { backgroundColor: TODO_ACCENT } : undefined}
          >
            {item.done && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        </button>

        {/* Text + metadata */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm ${item.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {item.text}
          </span>
          {isRecurring && item.repeat && (
            <span className="ml-2 text-[10px]" style={{ color: TODO_ACCENT }} title={t(`todo.repeat.${item.repeat.type}`)}>
              🔁 {t(`todo.repeat.${item.repeat.type}`)}{item.repeat.until ? ` → ${item.repeat.until}` : ''}
            </span>
          )}
          {category && (
            <span
              className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: category.color + '1a', color: category.color }}
            >
              {category.name}
            </span>
          )}
          {item.notes && <span className="ml-1.5 text-[11px] text-gray-500" title={t('todo.notes')}>📝</span>}
          {item.dueDate && !item.done && (() => {
            const today = format(new Date(), 'yyyy-MM-dd')
            const isOverdue = item.dueDate < today
            const isToday = item.dueDate === today
            return (
              <span className={`ml-2 text-[11px] ${isOverdue ? 'text-red-500 font-semibold' : isToday ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
                {isOverdue ? '⚠ ' : ''}{item.dueDate}
              </span>
            )
          })()}
        </div>

        {/* Overflow: all secondary actions live behind one button */}
        <button
          onClick={() => { setShowActions(prev => !prev); closePanels() }}
          className="shrink-0 w-10 h-10 -my-1.5 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('todo.moreActions')}
          aria-expanded={showActions}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
          </svg>
        </button>

        <ConfirmDialog
          open={confirmDelete}
          title={t('todo.deleteTitle')}
          message={t('todo.deleteMessage')}
          confirmVariant="danger"
          onConfirm={() => { onDelete(item.id); setConfirmDelete(false) }}
          onCancel={() => setConfirmDelete(false)}
        />
      </div>

      {/* Action row (from ⋯) */}
      {showActions && (
        <div className={SUB_PANEL_CLASS}>
          <div className="flex gap-2 flex-wrap">
            {onUpdate && (
              <button
                onClick={() => openPanel('notes')}
                className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                📝 {item.notes ? t('todo.notes') : t('todo.addNotes')}
              </button>
            )}
            {onUpdate && (
              <button
                onClick={() => openPanel('repeat')}
                className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                🔁 {t('todo.editRepeat')}
              </button>
            )}
            <button
              onClick={() => isRecurring ? openPanel('delete') : setConfirmDelete(true)}
              className="px-3 py-2 text-xs rounded-lg text-red-500/80 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              {t('todo.deleteTitle')}
            </button>
          </div>
        </div>
      )}

      {/* Priority picker */}
      {showPriorityEdit && onUpdate && (
        <div className={SUB_PANEL_CLASS}>
          <div className="flex gap-2 items-center flex-wrap">
            {PRIORITIES.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => { onUpdate(item.id, { priority: p }); setShowPriorityEdit(false) }}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  item.priority === p ? 'text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                style={item.priority === p ? { backgroundColor: PRIORITY_COLORS[p] } : undefined}
              >
                {t(`todo.priority.${p}`)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowPriorityEdit(false)}
              className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {t('confirm.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Recurring delete: this occurrence or whole series */}
      {showDeleteChoice && (
        <div className={SUB_PANEL_CLASS}>
          <div className="flex gap-2 flex-wrap items-center">
            {onSkipOccurrence && (
              <button
                onClick={() => { onSkipOccurrence(item.id); setShowDeleteChoice(false) }}
                className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {t('todo.deleteOccurrence')}
              </button>
            )}
            <button
              onClick={() => { onDelete(item.id); setShowDeleteChoice(false) }}
              className="px-3 py-2 text-xs rounded-lg text-red-500/80 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
            >
              {t('todo.deleteSeries')}
            </button>
            <button
              onClick={() => setShowDeleteChoice(false)}
              className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {t('confirm.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Repeat rule editor */}
      {showRepeatEdit && (
        <div className={SUB_PANEL_CLASS}>
          <RepeatEditor value={repeatDraft} onChange={setRepeatDraft} />
          <div className="flex gap-2">
            <button
              onClick={handleRepeatSave}
              className="px-3 py-2 text-xs rounded-lg text-white"
              style={{ backgroundColor: TODO_ACCENT }}
            >
              {t('todo.save')}
            </button>
            <button
              onClick={() => setShowRepeatEdit(false)}
              className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {t('confirm.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Notes editor */}
      {showNotes && (
        <div className={SUB_PANEL_CLASS}>
          <textarea
            value={notesText}
            onChange={e => setNotesText(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder={t('todo.addNotes') + '\n- item 1\n- item 2'}
            className="w-full text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#90a6c9]/50"
            rows={3}
          />
        </div>
      )}
    </div>
  )
})

export default TodoItem
