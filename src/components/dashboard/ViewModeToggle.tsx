import { useTranslation } from 'react-i18next'
import type { ViewMode } from '../../types'

const MODE_KEYS: ViewMode[] = ['day', 'week', 'month']

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  const { t } = useTranslation()

  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-fit" role="group" aria-label={t('viewMode.label')}>
      {MODE_KEYS.map(mode => (
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
