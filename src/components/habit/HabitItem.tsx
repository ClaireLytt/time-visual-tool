import { memo } from 'react'
import { computeStreak } from '../../utils/streaks'
import { XIcon } from '../icons'
import ConfirmDialog from '../common/ConfirmDialog'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface HabitItemProps {
  habit: { id: string; name: string; icon: string; color: string }
  checked: boolean
  streakDates: string[]
  onToggle: () => void
  onDelete: (id: string) => void
}

const HabitItem = memo(function HabitItem({ habit, checked, streakDates, onToggle, onDelete }: HabitItemProps) {
  const { t } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const streak = computeStreak(streakDates)

  return (
    <div className="flex items-center gap-3 py-2">
      <button
        onClick={onToggle}
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
          checked
            ? 'shadow-sm scale-105'
            : 'bg-gray-100 dark:bg-gray-700/50 opacity-50'
        }`}
        style={checked ? { backgroundColor: habit.color + '20', boxShadow: `0 0 8px ${habit.color}30` } : undefined}
        aria-label={checked ? t('habit.uncheck') : t('habit.check')}
      >
        {checked ? habit.icon : <span className="text-gray-400 text-sm">○</span>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${checked ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
          {habit.name}
        </p>
        {streak > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {streak >= 3 ? '🔥 ' : ''}{t('habit.streak', { count: streak })}
          </p>
        )}
      </div>
      <button onClick={() => setConfirmDelete(true)} className="btn-icon text-gray-400 hover:text-red-500">
        <XIcon className="w-4 h-4" />
      </button>
      <ConfirmDialog
        open={confirmDelete}
        title={t('habit.deleteTitle')}
        message={t('habit.deleteMessage', { name: habit.name })}
        onConfirm={() => { onDelete(habit.id); setConfirmDelete(false) }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
})

export default HabitItem
