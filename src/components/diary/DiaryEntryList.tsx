import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { DiaryEntry, DiaryPeriodType } from '../../types/diary'

interface DiaryEntryListProps {
  entries: DiaryEntry[]
  periodType: DiaryPeriodType
  activePeriodKey: string
  onSelect: (entry: DiaryEntry) => void
}

function DiaryEntryList({ entries, periodType, activePeriodKey, onSelect }: DiaryEntryListProps) {
  const { t } = useTranslation()

  const sorted = useMemo(
    () => entries
      .filter(e => e.periodType === periodType)
      .sort((a, b) => b.periodKey.localeCompare(a.periodKey))
      .slice(0, 20),
    [entries, periodType]
  )

  if (sorted.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('diary.emptyTitle')}</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('diary.emptySubtitle')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-3 pt-2 pb-1">
        {t('diary.listTitle', { count: sorted.length })}
      </h3>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {sorted.map(entry => {
          const isActive = entry.periodKey === activePeriodKey
          return (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              aria-current={isActive ? 'true' : undefined}
              className={`w-full text-left px-3 py-3 transition-colors rounded-lg ${isActive ? 'bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-300 dark:ring-purple-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700'}`}
            >
              <p className={`text-base sm:text-sm font-medium ${isActive ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200'}`}>
                {entry.periodKey}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DiaryEntryList
