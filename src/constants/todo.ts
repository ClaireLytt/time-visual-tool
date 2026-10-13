/** Single source of truth for the todo module's accent color */
export const TODO_ACCENT = '#90a6c9'

export const PRIORITY_COLORS = {
  high: '#c18383',
  medium: '#c9ab77',
  low: '#93ab93',
} as const

export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const

/** Built-in categories — always present, names resolved via i18n (todo.category.*) */
export const DEFAULT_CATEGORIES = [
  { id: 'life', color: '#86a98d' },
  { id: 'work', color: '#c79a74' },
  { id: 'study', color: '#8aa7c4' },
] as const

/** Palette cycled through for user-created categories */
export const CATEGORY_COLORS = ['#b4879d', '#8fc0c6', '#c9ab77', '#b09cc4', '#c18383', '#8B9DAB']
