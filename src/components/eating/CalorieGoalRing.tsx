import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { formatCalories } from '../../utils/calories'
import { DEFAULT_DAILY_CALORIE_GOAL } from '../../constants/eating'

interface CalorieGoalRingProps {
  currentCalories: number
  goal: number | undefined
  onGoalChange: (goal: number | undefined) => void
}

const RING_SIZE = 140
const STROKE_WIDTH = 10
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getRingColor(ratio: number): string {
  if (ratio > 1) return '#c47070'
  if (ratio > 0.8) return '#c4a36b'
  return '#7aab8e'
}

function CalorieGoalRing({ currentCalories, goal, onGoalChange }: CalorieGoalRingProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const effectiveGoal = goal ?? DEFAULT_DAILY_CALORIE_GOAL
  const ratio = effectiveGoal > 0 ? currentCalories / effectiveGoal : 0
  const clampedRatio = Math.min(ratio, 1)
  const ringColor = getRingColor(ratio)
  const hasGoal = goal != null

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleGoalEdit = () => {
    setInputValue(String(effectiveGoal))
    setIsEditing(true)
  }

  const handleGoalSubmit = () => {
    const parsed = parseInt(inputValue, 10)
    if (!isNaN(parsed) && parsed >= 100 && parsed <= 10000) {
      onGoalChange(parsed)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGoalSubmit()
    if (e.key === 'Escape') setIsEditing(false)
  }

  return (
    <div className="panel p-4 mb-4 flex flex-col items-center">
      <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
        {/* Background track */}
        <svg width={RING_SIZE} height={RING_SIZE} className="absolute inset-0">
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            className="text-gray-100 dark:text-gray-700/50"
            strokeDasharray={hasGoal ? 'none' : '6 4'}
          />
        </svg>

        {/* Progress ring */}
        <svg width={RING_SIZE} height={RING_SIZE} className="absolute inset-0 -rotate-90">
          <motion.circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - clampedRatio) }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ filter: `drop-shadow(0 0 4px ${ringColor}40)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hasGoal || currentCalories > 0 ? (
            <>
              <span className="text-2xl font-bold tracking-display tabular-nums text-gray-800 dark:text-gray-100">
                {currentCalories.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                / {effectiveGoal.toLocaleString()}
              </span>
            </>
          ) : (
            /* No goal set, no calories — show invite */
            <button
              onClick={handleGoalEdit}
              className="btn-icon text-gray-300 dark:text-gray-600 hover:text-mode-eating dark:hover:text-mode-eating"
              aria-label={t('eating.goalSetAriaLabel')}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8m-4-4h8" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Goal setter row */}
      <div className="mt-2 flex items-center gap-1.5">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onBlur={handleGoalSubmit}
              onKeyDown={handleKeyDown}
              className="input-base w-20 text-center text-sm py-1"
              aria-label={t('eating.goalInputAriaLabel')}
              min={100}
              max={10000}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">{t('eating.calorieUnit')}</span>
          </div>
        ) : (
          <button
            onClick={handleGoalEdit}
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-mode-eating dark:hover:text-mode-eating transition-colors"
            aria-label={t('eating.goalSetAriaLabel')}
          >
            {/* Target icon */}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span className="tabular-nums">{formatCalories(effectiveGoal)}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default CalorieGoalRing
