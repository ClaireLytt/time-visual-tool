import { motion, AnimatePresence } from 'motion/react'
import type { ReactNode } from 'react'

interface AnimatedCollapseProps {
  open: boolean
  children: ReactNode
}

/**
 * Animated collapse/expand wrapper.
 *
 * Gate: Occasional frequency (settings panels). Purpose: state indication.
 * Tool: motion — needs height:"auto" animation which CSS can't do.
 * Budget: 200ms ease-out. Reduced-motion: opacity only, no height animation.
 */
function AnimatedCollapse({ open, children }: AnimatedCollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
          animate={{ height: 'auto', opacity: 1, overflow: 'hidden' }}
          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedCollapse
