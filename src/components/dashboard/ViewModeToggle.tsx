import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import type { ViewMode, ExtendedViewMode } from '../../types'

const DEFAULT_MODES: readonly ViewMode[] = ['day', 'week', 'month']

interface ViewModeToggleProps<M extends ExtendedViewMode> {
  viewMode: M
  onViewModeChange: (mode: M) => void
  modes?: readonly M[]
}

/**
 * Apple-style segmented control with sliding pill indicator.
 * The pill uses layout animation (spring, critically damped) for fluid movement.
 */
function ViewModeToggle<M extends ExtendedViewMode>({ viewMode, onViewModeChange, modes }: ViewModeToggleProps<M>) {
  const { t } = useTranslation()
  const modeList = (modes ?? DEFAULT_MODES) as readonly M[]

  return (
    <div className="relative flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit" role="group" aria-label={t('viewMode.label')}>
      {modeList.map(mode => (
        <button
          key={mode}
          onClick={() => onViewModeChange(mode)}
          aria-pressed={viewMode === mode}
          className="no-press relative z-10 px-3 sm:px-4 py-1.5 text-sm transition-colors"
        >
          <span className={viewMode === mode ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-500 dark:text-gray-400'}>
            {t(`viewMode.${mode}`)}
          </span>
          {viewMode === mode && (
            <motion.div
              className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-soft"
              layoutId="viewmode-pill"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

export default ViewModeToggle
