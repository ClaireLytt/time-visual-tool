/* ─── IELTS Module — Shared Design Tokens ───
 *
 * Inspired by shadcn/ui button variants + Radix segmented control.
 * Adapted for a warm, restrained learning-tool aesthetic.
 *
 * Size scale (touch-friendly):
 *   xs   → h-7  (28px)  — chips, badges
 *   sm   → h-9  (36px)  — secondary actions, presets
 *   md   → h-10 (40px)  — default controls, inputs
 *   lg   → h-11 (44px)  — primary actions, subject toggle
 *
 * Radius: rounded-lg (8px) throughout
 * Font:   text-sm (14px) default, text-xs (12px) secondary
 * Gap:    gap-2 (8px) between siblings, space-y-3 (12px) between sections
 */

/** Primary accent (coral, muted) */
export const ACCENT = '#c0392b'
export const ACCENT_LIGHT = 'rgba(192, 57, 43, 0.08)'
export const ACCENT_LIGHT_DARK = 'rgba(192, 57, 43, 0.18)'

/* ── Button class builders ── */

/** Primary (solid) — main actions: submit, confirm */
export const btnPrimary = (disabled?: boolean) =>
  `inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white
   transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   active:scale-[0.97] select-none no-press
   ${disabled ? 'opacity-35 pointer-events-none' : 'hover:brightness-110'}`

/** Secondary (muted bg) — less prominent actions */
export const btnSecondary =
  `inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium
   bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300
   hover:bg-gray-200 dark:hover:bg-gray-600
   transition-colors active:scale-[0.97] select-none no-press`

/** Ghost — minimal, for toolbars and inline actions */
export const btnGhost =
  `inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium
   text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/40 hover:text-gray-700 dark:hover:text-gray-300
   transition-colors active:scale-[0.97] select-none no-press`

/** Toggle item (for segmented controls / chip selectors) */
export function btnToggle(active: boolean) {
  return `inline-flex items-center justify-center rounded-lg text-sm font-medium
    transition-all select-none no-press active:scale-[0.97]
    ${active
      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
    }`
}

/* ── Reactive dark mode ── */

import { useSyncExternalStore } from 'react'

/** Reactive dark-mode detection — re-renders when theme toggles */
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
  'input-base w-full rounded-lg text-sm h-10'

export const textareaClass =
  'input-base w-full rounded-lg text-sm resize-none'
