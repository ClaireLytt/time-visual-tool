import { useState, useEffect } from 'react'
import { useCategories } from '../../contexts/CategoryContext'
import { parseDurationInput } from '../../utils/time'

interface EntryFormProps {
  selectedDate: string
  onAdd: (entry: { date: string; activity: string; duration: number; weight: number; category: string }) => void
}

function EntryForm({ selectedDate, onAdd }: EntryFormProps) {
  const { categories } = useCategories()
  const [activity, setActivity] = useState('')
  const [durationInput, setDurationInput] = useState('')
  const [weight, setWeight] = useState('1')
  const [category, setCategory] = useState<string>(categories[0]?.name ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (categories.length > 0 && !categories.some(c => c.name === category)) {
      setCategory(categories[0].name)
    }
  }, [categories, category])

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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">添加时间记录</h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <input
            type="text"
            value={activity}
            onChange={e => setActivity(e.target.value)}
            placeholder="活动名称"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
        </div>

        <div>
          <input
            type="text"
            value={durationInput}
            onChange={e => setDurationInput(e.target.value)}
            placeholder="时长（如 90、1:30、1.5h）"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="权重"
            step="0.1"
            min="0.1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="col-span-2">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      <button
        type="submit"
        className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
      >
        添加记录
      </button>
    </form>
  )
}

export default EntryForm
