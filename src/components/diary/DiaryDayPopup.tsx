import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import type { DiaryEntry } from '../../types/diary'

interface DiaryDayPopupProps {
  /** yyyy-MM-dd, null = closed */
  date: string | null
  entry: DiaryEntry | undefined
  onEdit: (date: string) => void
  onClose: () => void
}

/** Slide-over panel showing one day's diary, opened from the calendar */
function DiaryDayPopup({ date, entry, onEdit, onClose }: DiaryDayPopupProps) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {date && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          {/* panel: bottom sheet on mobile, side panel on desktop */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={date}
            className="fixed z-50 bg-white dark:bg-gray-800 shadow-xl
              inset-x-0 bottom-0 rounded-t-2xl max-h-[70dvh]
              sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-0 sm:w-[380px] sm:rounded-none sm:max-h-none
              flex flex-col"
            initial={{ y: '100%', x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{date}</span>
                {entry?.mood && <span className="text-lg" aria-hidden="true">{entry.mood}</span>}
              </div>
              <button
                onClick={onClose}
                className="p-2 -m-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors no-press"
                aria-label={t('diary.close')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {entry ? (
                <>
                  {entry.gratitude && (
                    <section>
                      <h4 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">{t('diary.gratitudeLabel')}</h4>
                      <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{entry.gratitude}</p>
                    </section>
                  )}
                  {entry.feelings && (
                    <section>
                      <h4 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">{t('diary.feelingsLabel')}</h4>
                      <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{entry.feelings}</p>
                    </section>
                  )}
                  {entry.motivation && (
                    <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{entry.motivation}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">{t('diary.noEntryForDay')}</p>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <button
                onClick={() => onEdit(date)}
                className="w-full py-2.5 rounded-xl bg-mode-diary text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {entry ? t('diary.editThisDay') : t('diary.writeThisDay')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default DiaryDayPopup
