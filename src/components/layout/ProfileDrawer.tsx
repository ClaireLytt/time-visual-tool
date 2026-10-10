import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../contexts/AuthContext'

interface ProfileDrawerProps {
  open: boolean
  onClose: () => void
}

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { t, i18n } = useTranslation()
  const { theme, cycleTheme } = useTheme()
  const { user, logout, switchAccount } = useAuth()

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')
  const initial = user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-72 z-50 bg-[#f4f1ea] dark:bg-[#262b44] shadow-2xl flex flex-col pt-[env(safe-area-inset-top)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {/* Close button */}
            <div className="flex justify-end px-4 pt-4">
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            {/* User info */}
            <div className="px-5 pb-5 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {user?.email ?? t('profile.guest')}
                </p>
                <p className="text-xs text-gray-400">{t('profile.account')}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="flex-1 overflow-y-auto py-3">
              {/* Appearance section */}
              <p className="px-5 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('profile.appearance')}</p>

              <button onClick={cycleTheme} className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                ) : theme === 'light' ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path strokeLinecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><path strokeLinecap="round" d="M8 21h8m-4-4v4" /></svg>
                )}
                <span>{t(`theme.${theme}`)}</span>
              </button>

              <button onClick={toggleLang} className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-18c2.485 0 4.5 4.03 4.5 9s-2.015 9-4.5 9-4.5-4.03-4.5-9 2.015-9 4.5-9ZM3.5 9h17M3.5 15h17" /></svg>
                <span>{t('lang.toggle')}</span>
              </button>

              {/* Account section */}
              {user && (
                <>
                  <p className="px-5 py-2 mt-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('profile.account')}</p>

                  <button onClick={() => { switchAccount(); onClose() }} className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-4 7a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" /></svg>
                    <span>{t('auth.switchAccount')}</span>
                  </button>

                  <button onClick={() => { logout(); onClose() }} className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-3h-9m9 0-3-3m3 3-3 3" /></svg>
                    <span>{t('auth.logout')}</span>
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-[10px] text-gray-400 text-center">TimeVisual v1.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
