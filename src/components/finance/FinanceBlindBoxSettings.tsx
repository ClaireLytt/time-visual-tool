import { useTranslation } from 'react-i18next'
import type { FinanceCategory } from '../../types/finance'

interface FinanceBlindBoxSettingsProps {
  categories: FinanceCategory[]
  nonEssentialCategories: string[]
  onToggle: (name: string) => void
}

/** Picks which expense categories count as non-essential (blind-box eligible). */
function FinanceBlindBoxSettings({ categories, nonEssentialCategories, onToggle }: FinanceBlindBoxSettingsProps) {
  const { t } = useTranslation()
  const expenseCategories = categories.filter(c => c.kind === 'expense')

  return (
    <div className="panel p-4">
      <h3 className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400 mb-1">
        {t('finance.blindBoxSettings')}
      </h3>
      <p className="text-xs text-calm-muted dark:text-gray-400 mb-3">{t('finance.blindBoxSettingsHint')}</p>
      <div className="flex flex-wrap gap-2">
        {expenseCategories.map(cat => {
          const active = nonEssentialCategories.includes(cat.name)
          const displayName = t('category.names.' + cat.name, cat.name)
          return (
            <button
              key={cat.name}
              onClick={() => onToggle(cat.name)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'border-calm-accent bg-calm-accent/10 text-gray-800 dark:text-gray-100'
                  : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} aria-hidden="true" />
              {displayName}
              {active && <span aria-hidden="true">📦</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FinanceBlindBoxSettings
