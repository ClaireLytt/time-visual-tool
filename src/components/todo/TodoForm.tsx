import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PRIORITY_COLORS, TODO_ACCENT } from '../../constants/todo'
import RepeatEditor from './RepeatEditor'
import type { TodoCategory, TodoItem, TodoPriority, TodoRepeat } from '../../types/todo'

interface TodoFormProps {
  selectedDate: string
  onAdd: (item: TodoItem) => void
  categories: TodoCategory[]
  defaultCategoryId: string
}

const PRIORITIES: TodoPriority[] = ['high', 'medium', 'low']

export default function TodoForm({ selectedDate, onAdd, categories, defaultCategoryId }: TodoFormProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [repeat, setRepeat] = useState<TodoRepeat | undefined>(undefined)
  const [categoryId, setCategoryId] = useState(defaultCategoryId)
  const [prevDefault, setPrevDefault] = useState(defaultCategoryId)
  if (prevDefault !== defaultCategoryId) {
    setPrevDefault(defaultCategoryId)
    setCategoryId(defaultCategoryId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
      priority,
      date: selectedDate,
      ...(dueDate ? { dueDate } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(repeat ? { repeat, completedDates: [] } : {}),
      categoryId,
      createdAt: new Date().toISOString(),
    })
    setText('')
    setDueDate('')
    setNotes('')
    setShowNotes(false)
    setRepeat(undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-4 space-y-3">
      <p className="font-pixel text-[8px] mb-1" style={{ color: TODO_ACCENT }}>{t('todo.addTitle')}</p>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t('todo.textPlaceholder')}
          className="input-base flex-1"
        />
        <button type="submit" className="btn-tactile px-4 text-white" style={{ backgroundColor: TODO_ACCENT }}>
          {t('todo.addButton')}
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="input-base w-auto text-xs"
          placeholder="截止日期"
        />
      </div>

      {/* Category */}
      <div className="flex gap-1.5 flex-wrap items-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">{t('todo.categoryLabel')}</span>
        {categories.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoryId(c.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              categoryId === c.id ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
            style={categoryId === c.id ? { backgroundColor: c.color } : undefined}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Repeat */}
      <RepeatEditor value={repeat} onChange={setRepeat} />

      {/* Notes toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          📝 {t('todo.addNotes')}
        </button>
        {showNotes && (
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('todo.addNotes') + '\n- item 1\n- item 2'}
            className="mt-1 w-full text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#90a6c9]/50"
            rows={3}
          />
        )}
      </div>

      <div className="flex gap-2">
        {PRIORITIES.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(p)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              priority === p ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
            style={priority === p ? { backgroundColor: PRIORITY_COLORS[p] } : undefined}
          >
            {t(`todo.priority.${p}`)}
          </button>
        ))}
      </div>
    </form>
  )
}
