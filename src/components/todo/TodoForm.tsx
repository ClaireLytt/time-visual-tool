import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PRIORITY_COLORS } from '../../constants/todo'
import type { TodoItem, TodoPriority, TodoRepeatType } from '../../types/todo'

interface TodoFormProps {
  selectedDate: string
  onAdd: (item: TodoItem) => void
}

const PRIORITIES: TodoPriority[] = ['high', 'medium', 'low']
const REPEAT_TYPES: TodoRepeatType[] = ['none', 'daily', 'weekly', 'monthly', 'custom']
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]

export default function TodoForm({ selectedDate, onAdd }: TodoFormProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [repeatType, setRepeatType] = useState<TodoRepeatType>('none')
  const [repeatWeekdays, setRepeatWeekdays] = useState<number[]>([])
  const [repeatInterval, setRepeatInterval] = useState('2')

  const toggleWeekday = (d: number) => {
    setRepeatWeekdays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const interval = Math.max(1, Math.floor(Number(repeatInterval) || 1))
    onAdd({
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
      priority,
      date: selectedDate,
      ...(dueDate ? { dueDate } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(repeatType !== 'none' ? {
        repeat: {
          type: repeatType,
          ...(repeatType === 'weekly' && repeatWeekdays.length > 0 ? { weekdays: repeatWeekdays } : {}),
          ...(repeatType === 'custom' ? { interval } : {}),
        },
        completedDates: [],
      } : {}),
      createdAt: new Date().toISOString(),
    })
    setText('')
    setDueDate('')
    setNotes('')
    setShowNotes(false)
    setRepeatType('none')
    setRepeatWeekdays([])
    setRepeatInterval('2')
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
      {/* Repeat */}
      <div className="space-y-2">
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">🔁 {t('todo.repeat.label')}</span>
          {REPEAT_TYPES.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRepeatType(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                repeatType === r
                  ? 'bg-[#5b8def] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {t(`todo.repeat.${r}`)}
            </button>
          ))}
        </div>
        {repeatType === 'weekly' && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-xs text-gray-400 dark:text-gray-500">{t('todo.repeat.weekdaysLabel')}</span>
            {WEEKDAYS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => toggleWeekday(d)}
                className={`w-7 h-7 text-xs font-medium rounded-full transition-all ${
                  repeatWeekdays.includes(d)
                    ? 'bg-[#5b8def] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {t(`todo.weekday.${d}`)}
              </button>
            ))}
          </div>
        )}
        {repeatType === 'custom' && (
          <div className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400">
            <span>{t('todo.repeat.every')}</span>
            <input
              type="number"
              min="1"
              value={repeatInterval}
              onChange={e => setRepeatInterval(e.target.value)}
              className="input-base w-16 text-xs py-1"
            />
            <span>{t('todo.repeat.days')}</span>
          </div>
        )}
      </div>

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
            className="mt-1 w-full text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#5b8def]/50"
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
