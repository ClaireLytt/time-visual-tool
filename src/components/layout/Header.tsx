import { useTranslation } from 'react-i18next'
import { useTheme } from '../../hooks/useTheme'
import { ClockIcon } from '../icons'

function Header() {
  const { t, i18n } = useTranslation()
  const { theme, cycleTheme } = useTheme()

  const themeLabel = t(`theme.${theme}`)

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
        <ClockIcon className="w-8 h-8 text-blue-500" />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('app.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('app.subtitle')}</p>
        </div>
        <button
          onClick={toggleLang}
          className="px-2 py-1 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('lang.label')}
        >
          {t('lang.toggle')}
        </button>
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('theme.toggle', { mode: themeLabel })}
          title={themeLabel}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : theme === 'light' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <path strokeLinecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path strokeLinecap="round" d="M8 21h8m-4-4v4" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}

export default Header
