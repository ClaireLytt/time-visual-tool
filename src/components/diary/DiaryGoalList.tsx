import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DiaryGoal } from '../../types/diary'

interface DiaryGoalListProps {
  goals: DiaryGoal[]
  onChange: (goals: DiaryGoal[]) => void
  inputLabel: string
}

function DiaryGoalList({ goals, onChange, inputLabel }: DiaryGoalListProps) {
  const { t } = useTranslation()
  const [newGoalText, setNewGoalText] = useState('')

  const addGoal = () => {
    const text = newGoalText.trim()
    if (!text) return
    onChange([...goals, { id: crypto.randomUUID(), text, done: false }])
    setNewGoalText('')
  }

  return (
    <div>
      {goals.length > 0 && (
        <ul className="space-y-1 mb-2">
          {goals.map(goal => (
            <li key={goal.id} className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id={`diary-goal-${goal.id}`}
                checked={goal.done}
                onChange={() => onChange(goals.map(g => g.id === goal.id ? { ...g, done: !g.done } : g))}
                className="w-5 h-5 accent-purple-500 shrink-0"
              />
              <label
                htmlFor={`diary-goal-${goal.id}`}
                className={`flex-1 text-base sm:text-sm ${goal.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}
              >
                {goal.text}
              </label>
              <button
                onClick={() => onChange(goals.filter(g => g.id !== goal.id))}
                aria-label={t('diary.goalRemove')}
                className="shrink-0 p-2 -m-1 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={newGoalText}
          onChange={e => setNewGoalText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addGoal() }}
          enterKeyHint="done"
          aria-label={inputLabel}
          className="flex-1 min-w-0 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-base sm:text-sm bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-700 transition-colors"
        />
        <button
          onClick={addGoal}
          disabled={newGoalText.trim() === ''}
          className="shrink-0 px-4 py-2 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-base sm:text-sm font-medium rounded-xl transition-colors"
        >
          {t('diary.goalAdd')}
        </button>
      </div>
    </div>
  )
}

export default DiaryGoalList
