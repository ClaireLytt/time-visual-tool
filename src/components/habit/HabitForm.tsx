import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Habit } from '../../types/habit'

const EMOJI_OPTIONS = ['🌅', '💧', '📖', '🏃', '🧘', '💪', '🎯', '✍️', '🛌', '🍎', '🚫', '🎵']
const COLOR_OPTIONS = ['#e43b44', '#f4b41a', '#3e8948', '#0099db', '#8b5cf6', '#f77622', '#2ce8f5', '#be4a7f']

interface HabitFormProps {
  onAdd: (habit: Habit) => void
}

export default function HabitForm({ onAdd }: HabitFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('#f4b41a')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      icon,
      color,
      createdAt: new Date().toISOString(),
    })
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-4 space-y-3">
      <p className="font-pixel text-[8px] text-[#e8a838] mb-1">{t('habit.addTitle')}</p>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('habit.namePlaceholder')}
          className="input-base flex-1"
        />
        <button type="submit" className="btn-tactile px-4 bg-[#e8a838] text-white">
          {t('habit.addButton')}
        </button>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {EMOJI_OPTIONS.map(e => (
          <button
            key={e}
            type="button"
            onClick={() => setIcon(e)}
            className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${icon === e ? 'ring-2 ring-[#e8a838] bg-[#e8a838]/10 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        {COLOR_OPTIONS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </form>
  )
}
