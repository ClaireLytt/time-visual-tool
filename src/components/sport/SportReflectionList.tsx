import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { SportReflection } from '../../types/sport'

interface SportReflectionListProps {
  reflections: SportReflection[]
  periodType: 'week' | 'month' | 'year'
  activePeriodKey: string
  onSelect: (reflection: SportReflection) => void
}

function SportReflectionList({ reflections, periodType, activePeriodKey, onSelect }: SportReflectionListProps) {
  const { t } = useTranslation()

  const sorted = useMemo(
    () => reflections
      .filter(r => r.periodType === periodType)
      .sort((a, b) => b.periodKey.localeCompare(a.periodKey))
      .slice(0, 20),
    [reflections, periodType]
  )

  if (sorted.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('sport.reflectionEmptyTitle')}</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('sport.reflectionEmptySubtitle')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-3 pt-2 pb-1">
        {t('sport.reflectionListTitle', { count: sorted.length })}
      </h3>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {sorted.map(reflection => {
          const isActive = reflection.periodKey === activePeriodKey
          return (
            <button
              key={reflection.id}
              onClick={() => onSelect(reflection)}
              aria-current={isActive ? 'true' : undefined}
              className={`w-full text-left px-3 py-3 transition-colors rounded-lg ${isActive ? 'bg-teal-50 dark:bg-teal-900/20 ring-1 ring-teal-300 dark:ring-teal-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700'}`}
            >
              <p className={`text-base sm:text-sm font-medium ${isActive ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-200'}`}>
                {reflection.periodKey}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {reflection.text.slice(0, 60)}{reflection.text.length > 60 ? '...' : ''}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SportReflectionList
