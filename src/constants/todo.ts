/** Single source of truth for the todo module's accent color */
export const TODO_ACCENT = '#5b8def'

export const PRIORITY_COLORS = {
  high: '#e43b44',
  medium: '#f4b41a',
  low: '#3e8948',
} as const

export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const

/** Built-in categories — always present, names resolved via i18n (todo.category.*) */
export const DEFAULT_CATEGORIES = [
  { id: 'life', color: '#3e8948' },
  { id: 'work', color: '#e67e22' },
  { id: 'study', color: '#4a90d9' },
] as const

/** Palette cycled through for user-created categories */
export const CATEGORY_COLORS = ['#c2417a', '#2ce8f5', '#e8a838', '#a855f7', '#e43b44', '#8B9DAB']
