import { useTranslation } from 'react-i18next'
import type { ViewMode, ExtendedViewMode } from '../../types'

const DEFAULT_MODES: readonly ViewMode[] = ['day', 'week', 'month']

interface ViewModeToggleProps<M extends ExtendedViewMode> {
  viewMode: M
  onViewModeChange: (mode: M) => void
  modes?: readonly M[]
}

function ViewModeToggle<M extends ExtendedViewMode>({ viewMode, onViewModeChange, modes }: ViewModeToggleProps<M>) {
  const { t } = useTranslation()
  const modeList = (modes ?? DEFAULT_MODES) as readonly M[]

  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-fit" role="group" aria-label={t('viewMode.label')}>
      {modeList.map(mode => (
        <button
          key={mode}
          onClick={() => onViewModeChange(mode)}
          aria-pressed={viewMode === mode}
          className={`px-3 sm:px-4 py-1.5 text-sm font-medium transition-colors ${
            viewMode === mode
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {t(`viewMode.${mode}`)}
        </button>
      ))}
    </div>
  )
}

export default ViewModeToggle
