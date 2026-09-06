import { useState, useEffect } from 'react'
import { useCategories } from '../../contexts/CategoryContext'
import { parseDurationInput } from '../../utils/time'
import type { TimeEntry } from '../../types'

interface EntryFormProps {
  selectedDate: string
  onAdd: (entry: { date: string; activity: string; duration: number; weight: number; category: string }) => void
  editingEntry?: TimeEntry | null
  onUpdate?: (id: string, updates: Partial<TimeEntry>) => void
  onCancelEdit?: () => void
}

function EntryForm({ selectedDate, onAdd, editingEntry, onUpdate, onCancelEdit }: EntryFormProps) {
  const { categories } = useCategories()
  const [activity, setActivity] = useState('')
  const [durationInput, setDurationInput] = useState('')
  const [weight, setWeight] = useState('1')
  const [category, setCategory] = useState<string>(categories[0]?.name ?? '')
  const [error, setError] = useState('')

  const isEditing = !!editingEntry

  useEffect(() => {
    if (categories.length > 0 && !categories.some(c => c.name === category)) {
      setCategory(categories[0].name)
    }
  }, [categories, category])

  useEffect(() => {
    if (editingEntry) {
      setActivity(editingEntry.activity)
      setDurationInput(String(editingEntry.duration))
      setWeight(String(editingEntry.weight))
      setCategory(editingEntry.category)
      setError('')
    } else {
      setActivity('')
      setDurationInput('')
      setWeight('1')
      setCategory(categories[0]?.name ?? '')
      setError('')
    }
  }, [editingEntry])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!activity.trim()) {
      setError('请输入活动名称')
      return
    }

    const duration = parseDurationInput(durationInput)
    if (duration === null || duration <= 0) {
      setError('请输入有效时长（如 90、1:30、1.5h）')
      return
    }

    const w = parseFloat(weight)
    if (isNaN(w) || w < 0.1 || w > 10) {
      setError('权重需在 0.1 - 10 之间')
      return
    }

    if (isEditing && onUpdate) {
      onUpdate(editingEntry.id, {
        activity: activity.trim(),
        duration,
        weight: w,
        category,
      })
      onCancelEdit?.()
    } else {
      onAdd({
        date: selectedDate,
        activity: activity.trim(),
        duration,
        weight: w,
        category,
      })
      setActivity('')
      setDurationInput('')
      setWeight('1')
      setError('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        {isEditing ? '编辑时间记录' : '添加时间记录'}
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <input
            type="text"
            value={activity}
            onChange={e => setActivity(e.target.value)}
            placeholder="活动名称"
            aria-label="活动名称"
            aria-invalid={error === '请输入活动名称' || undefined}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            maxLength={100}
          />
        </div>

        <div>
          <input
            type="text"
            value={durationInput}
            onChange={e => setDurationInput(e.target.value)}
            placeholder="时长（如 90、1:30、1.5h）"
            aria-label="时长"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>

        <div>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="权重"
            aria-label="权重"
            step="0.1"
            min="0.1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="分类"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-xs mb-2" role="alert">{error}</p>}

      <div className={isEditing ? 'flex gap-2' : ''}>
        <button
          type="submit"
          className={`${isEditing ? 'flex-1' : 'w-full'} py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors`}
        >
          {isEditing ? '保存修改' : '添加记录'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
        )}
      </div>
    </form>
  )
}

export default EntryForm
