import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

interface GoalRingProps {
  current: number
  goal: number | undefined
  defaultGoal: number
  onGoalChange: (goal: number | undefined) => void
  formatValue: (value: number) => string
  color: string
  unit: string
  goalLabel: string
  size?: number
  strokeWidth?: number
  min?: number
  max?: number
}

function getRingColor(ratio: number, baseColor: string): string {
  if (ratio > 1) return '#c47070'
  if (ratio > 0.8) return baseColor
  return '#7aab8e'
}

function GoalRing({
  current, goal, defaultGoal, onGoalChange, formatValue,
  color, unit, goalLabel, size = 140, strokeWidth = 10, min = 1, max = 100000,
}: GoalRingProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const effectiveGoal = goal ?? defaultGoal
  const ratio = effectiveGoal > 0 ? current / effectiveGoal : 0
  const clampedRatio = Math.min(ratio, 1)
  const ringColor = getRingColor(ratio, color)
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

  const handleGoalSave = () => {
    const parsed = parseFloat(inputValue)
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onGoalChange(parsed)
    }
  }

  const handleBlur = () => {
    handleGoalSave()
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    }
    if (e.key === 'Escape') {
      setInputValue(String(effectiveGoal))
      setIsEditing(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="currentColor" strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-gray-700/50"
            strokeDasharray={hasGoal ? 'none' : '6 4'}
          />
        </svg>
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={ringColor} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - clampedRatio) }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ filter: `drop-shadow(0 0 4px ${ringColor}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hasGoal || current > 0 ? (
            <>
              <span className="text-2xl font-bold tracking-display tabular-nums text-gray-800 dark:text-gray-100">
                {formatValue(current)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                / {formatValue(effectiveGoal)}
              </span>
            </>
          ) : (
            <button
              onClick={handleGoalEdit}
              className="btn-icon text-gray-300 dark:text-gray-600 hover:text-current"
              style={{ color: undefined }}
              aria-label={goalLabel}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8m-4-4h8" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="input-base w-20 text-center text-sm py-1"
              aria-label={goalLabel}
              min={min} max={max}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">{unit}</span>
          </div>
        ) : (
          <button
            onClick={handleGoalEdit}
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:opacity-80 transition-colors"
            style={{ ['--hover-color' as string]: color }}
            aria-label={goalLabel}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span className="tabular-nums">{formatValue(effectiveGoal)} {unit}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default GoalRing
