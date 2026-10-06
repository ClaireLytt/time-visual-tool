import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useTheme } from '../../hooks/useTheme'
import type { ViewMode, ExtendedViewMode } from '../../types'

const DEFAULT_MODES: readonly ViewMode[] = ['day', 'week', 'month']

interface ViewModeToggleProps<M extends ExtendedViewMode> {
  viewMode: M
  onViewModeChange: (mode: M) => void
  modes?: readonly M[]
}

/**
 * Tactile segmented control with sliding pill indicator.
 * Recessed track, raised active pill — feels like pushing a physical switch.
 */
function ViewModeToggle<M extends ExtendedViewMode>({ viewMode, onViewModeChange, modes }: ViewModeToggleProps<M>) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const modeList = (modes ?? DEFAULT_MODES) as readonly M[]

  return (
    <div
      className="relative flex rounded-xl p-1 w-fit"
      style={{
        background: isDark ? 'linear-gradient(to bottom, #1e1e22, #232328)' : 'linear-gradient(to bottom, #e8e7e3, #eeede9)',
        boxShadow: isDark
          ? 'inset 0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.04)'
          : 'inset 0 1px 2px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04)',
      }}
      role="group"
      aria-label={t('viewMode.label')}
    >
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
              className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg"
              layoutId="viewmode-pill"
              style={{
                zIndex: -1,
                boxShadow: '0 2px 0 rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

export default ViewModeToggle
