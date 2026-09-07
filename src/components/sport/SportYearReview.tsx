import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { parseISO, startOfYear, format } from 'date-fns'
import type { SportEntry } from '../../types/sport'
import { useCategories } from '../../contexts/CategoryContext'

interface SportYearReviewProps {
  allEntries: SportEntry[]
  selectedDate: string
}

function SportYearReview({ allEntries, selectedDate }: SportYearReviewProps) {
  const { t } = useTranslation()
  const { getColor } = useCategories()

  const { thisYearTypes, newTypes } = useMemo(() => {
    const anchor = parseISO(selectedDate)
    const yearStart = format(startOfYear(anchor), 'yyyy-MM-dd')
    const year = format(anchor, 'yyyy')
    const yearEnd = `${year}-12-31`

    const thisYearEntries = allEntries.filter(e => e.date >= yearStart && e.date <= yearEnd)
    const thisYearSet = new Set(thisYearEntries.map(e => e.sportType))

    const previousEntries = allEntries.filter(e => e.date < yearStart)
    const previousSet = new Set(previousEntries.map(e => e.sportType))

    const newSet = new Set<string>()
    for (const sport of thisYearSet) {
      if (!previousSet.has(sport)) newSet.add(sport)
    }

    return {
      thisYearTypes: Array.from(thisYearSet),
      newTypes: Array.from(newSet),
    }
  }, [allEntries, selectedDate])

  if (thisYearTypes.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        {t('sport.yearReviewTitle')}
      </h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {t('sport.yearAllSports', { count: thisYearTypes.length })}
          </p>
          <div className="flex flex-wrap gap-2">
            {thisYearTypes.map(sport => (
              <span
                key={sport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getColor(sport) }}
                  aria-hidden="true"
                />
                {t('category.names.' + sport, sport)}
              </span>
            ))}
          </div>
        </div>

        {newTypes.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t('sport.yearNewSports', { count: newTypes.length })}
            </p>
            <div className="flex flex-wrap gap-2">
              {newTypes.map(sport => (
                <span
                  key={sport}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 ring-1 ring-teal-200 dark:ring-teal-700"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getColor(sport) }}
                    aria-hidden="true"
                  />
                  {t('category.names.' + sport, sport)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SportYearReview
