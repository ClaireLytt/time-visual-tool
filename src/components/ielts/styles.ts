/* ─── IELTS Module — Design System Tokens ───
 *
 * Color scale:
 *   primary  → #c0392b (500), hover #a02d20 (600), active #7d2118 (700), disabled #f0b8b0 (200)
 *   surfaces → page #fdf2f5, card #f5f2e9, hover #f5ede0, modal #ffffff
 *   text     → primary #1f2937, secondary #6b7280, tertiary #9ca3af
 *
 * Size scale (touch-friendly):
 *   sm   → h-9  (36px)  — secondary actions, chips
 *   md   → h-10 (40px)  — default controls, inputs
 *   lg   → h-11 (44px)  — primary actions
 *
 * Radius: buttons/chips 999px (capsule), input 12px, card 16px
 * Transition: 150ms hover, 200ms expand, var(--ease-standard)
 */

/** Primary accent */
export const ACCENT = '#c0392b'
export const ACCENT_HOVER = '#a02d20'
export const ACCENT_LIGHT = 'rgba(192, 57, 43, 0.08)'
export const ACCENT_LIGHT_DARK = 'rgba(192, 57, 43, 0.18)'

/* ── Button builders ── */

/** Primary (solid capsule) — main CTA */
export const btnPrimary = (disabled?: boolean) =>
  `inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-white
   transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c0392b]/30 focus-visible:ring-offset-2
   active:scale-[0.98] select-none no-press
   ${disabled ? 'opacity-35 pointer-events-none' : 'hover:brightness-[0.92]'}`

/** Secondary (white capsule with border) */
export const btnSecondary =
  `inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium
   bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
   text-gray-700 dark:text-gray-300
   hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300
   transition-all duration-150 active:scale-[0.98] select-none no-press`

/** Ghost — minimal, for toolbars */
export const btnGhost =
  `inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-medium
   text-gray-500 hover:bg-[#f5ede0] dark:hover:bg-gray-700/40 hover:text-gray-700 dark:hover:text-gray-300
   transition-all duration-150 active:scale-[0.98] select-none no-press`

/** Toggle (segmented control / filter chips) */
export function btnToggle(active: boolean) {
  return `inline-flex items-center justify-center rounded-full text-sm font-medium
    transition-all duration-150 select-none no-press active:scale-[0.97]
    ${active
      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-[#f5ede0] dark:hover:bg-gray-700/30'
    }`
}

/* ── Reactive dark mode ── */

import { useSyncExternalStore } from 'react'

export function useIsDark() {
  return useSyncExternalStore(
    cb => {
      const obs = new MutationObserver(cb)
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
      return () => obs.disconnect()
    },
    () => document.documentElement.classList.contains('dark'),
  )
}

/* ── Input base ── */

export const inputClass =
  'input-base w-full rounded-xl text-sm h-11'

export const textareaClass =
  'input-base w-full rounded-xl text-sm resize-none'
