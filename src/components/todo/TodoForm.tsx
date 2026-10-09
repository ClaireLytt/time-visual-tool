import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { PRIORITY_COLORS } from '../../constants/todo'
import type { TodoItem, TodoPriority } from '../../types/todo'

interface TodoFormProps {
  selectedDate: string
  onAdd: (item: TodoItem) => void
}

const PRIORITIES: TodoPriority[] = ['high', 'medium', 'low']

export default function TodoForm({ selectedDate, onAdd }: TodoFormProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('medium')
  const [dueDate, setDueDate] = useState('')

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
      createdAt: new Date().toISOString(),
    })
    setText('')
    setDueDate('')
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-4 space-y-3">
      <p className="font-pixel text-[8px] text-[#5b8def] mb-1">{t('todo.addTitle')}</p>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t('todo.textPlaceholder')}
          className="input-base flex-1"
        />
        <button type="submit" className="btn-tactile px-4 bg-[#5b8def] text-white">
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
