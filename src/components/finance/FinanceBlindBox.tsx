import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { drawLuck } from '../../utils/financeLuck'
import type { FinanceLuck } from '../../types/finance'

interface FinanceBlindBoxProps {
  open: boolean
  /** Category + description of the expense that triggered the draw */
  label: string
  onReveal: (luck: FinanceLuck) => void
  onClose: () => void
}

const LUCK_META: Record<FinanceLuck, { emoji: string; color: string }> = {
  good: { emoji: '🎁', color: '#86a98d' },
  normal: { emoji: '⚖️', color: '#9AABB5' },
  bad: { emoji: '💸', color: '#c18383' },
}

/**
 * Blind-box modal shown after recording a non-essential expense.
 * Tap the box to draw; the result is reported via onReveal.
 */
function FinanceBlindBox({ open, label, onReveal, onClose }: FinanceBlindBoxProps) {
  const { t } = useTranslation()
  const [result, setResult] = useState<FinanceLuck | null>(null)

  // Reset for a fresh draw each time the dialog opens (adjust-state-during-render pattern)
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setResult(null)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleOpenBox = useCallback(() => {
    if (result != null) return
    const luck = drawLuck()
    setResult(luck)
    onReveal(luck)
  }, [result, onReveal])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={result != null ? onClose : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-dialog p-6 max-w-xs w-full mx-4 text-center"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="blind-box-title"
            initial={{ opacity: 0, transform: 'scale(0.96)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            exit={{ opacity: 0, transform: 'scale(0.96)' }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            <h3 id="blind-box-title" className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">
              {result == null ? t('finance.blindBoxTitle') : t(`finance.blindBoxResult.${result}`)}
            </h3>
            <p className="text-xs text-calm-muted dark:text-gray-400 mb-4 truncate">{label}</p>

            {result == null ? (
              <>
                <motion.button
                  onClick={handleOpenBox}
                  className="text-6xl mx-auto block p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-calm-accent"
                  aria-label={t('finance.blindBoxOpen')}
                  animate={{ rotate: [0, -6, 6, -4, 4, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.6 }}
                >
                  <span aria-hidden="true">📦</span>
                </motion.button>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{t('finance.blindBoxTap')}</p>
              </>
            ) : (
              <>
                <motion.div
                  className="text-6xl"
                  initial={{ transform: 'scale(0.3)', opacity: 0 }}
                  animate={{ transform: 'scale(1)', opacity: 1 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  aria-hidden="true"
                >
                  {LUCK_META[result].emoji}
                </motion.div>
                <p className="text-sm font-medium mt-3" style={{ color: LUCK_META[result].color }}>
                  {t(`finance.blindBoxDesc.${result}`)}
                </p>
                <button onClick={onClose} className="btn-secondary mt-4 w-full">
                  {t('confirm.ok')}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FinanceBlindBox
