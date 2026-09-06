import type { ViewMode } from '../../types'

const MODES: { value: ViewMode; label: string }[] = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
]

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-fit" role="group" aria-label="视图模式">
      {MODES.map(mode => (
        <button
          key={mode.value}
          onClick={() => onViewModeChange(mode.value)}
          aria-pressed={viewMode === mode.value}
          className={`px-3 sm:px-4 py-1.5 text-sm font-medium transition-colors ${
            viewMode === mode.value
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}

export default ViewModeToggle
