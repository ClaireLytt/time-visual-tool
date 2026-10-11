import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { XIcon } from '../icons'

interface NeonHoopsOverlayProps {
  open: boolean
  onClose: () => void
}

export default function NeonHoopsOverlay({ open, onClose }: NeonHoopsOverlayProps) {
  const { t } = useTranslation()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Lock body scroll while overlay is open; focus iframe so keyboard goes to game
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => iframeRef.current?.focus(), 100)
    return () => { document.body.style.overflow = prev; clearTimeout(timer) }
  }, [open])

  // Push browser history so that back button closes the game instead of leaving the page
  useEffect(() => {
    if (!open) return
    window.history.pushState({ neonHoops: true }, '', '#game')

    const onPopState = () => onClose()
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [open, onClose])

  // Close via history.back() so popstate fires and history stays clean
  const handleClose = useCallback(() => {
    window.history.back()
  }, [])

  const gameSrc = `${import.meta.env.BASE_URL}games/neon-hoops.html`

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label={t('game.neonHoops')}
        >
          {/* Close button — floats above the game */}
          <button
            onClick={handleClose}
            className="fixed top-4 right-4 z-[60] bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full p-2 transition-colors"
            aria-label={t('game.closeGame')}
          >
            <XIcon className="w-5 h-5" />
          </button>

          {/* Game iframe — full viewport */}
          <motion.div
            className="w-full h-full"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            <iframe
              ref={iframeRef}
              src={gameSrc}
              className="w-full h-full border-none"
              title={t('game.neonHoops')}
              allow="autoplay"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
