import type { AppMode } from '../types'

/** Canonical color for each module — single source of truth */
export const MODE_ACCENT: Record<AppMode, string> = {
  overview: '#f4b41a',
  time: '#0099db',
  finance: '#3e8948',
  eating: '#f77622',
  diary: '#8b5cf6',
  sport: '#2ce8f5',
  habit: '#e8a838',
  todo: '#5b8def',
  study: '#4a90d9',
  work: '#e67e22',
  podcast: '#c2417a',
}

/** All valid mode strings — used by validateMode and anywhere a mode list is needed */
export const ALL_MODES: AppMode[] = Object.keys(MODE_ACCENT) as AppMode[]

/** Scene labels for each module (pixel font decorative) */
export const MODE_SCENE: Record<AppMode, { emoji: string; label: string }> = {
  overview: { emoji: '📍', label: 'HUB WORLD' },
  time: { emoji: '⚔️', label: 'DUNGEON' },
  finance: { emoji: '💰', label: 'TREASURE' },
  eating: { emoji: '🍺', label: 'TAVERN' },
  diary: { emoji: '📜', label: 'LIBRARY' },
  sport: { emoji: '⚔️', label: 'ARENA' },
  habit: { emoji: '🏰', label: 'CASTLE' },
  todo: { emoji: '📋', label: 'QUEST LOG' },
  study: { emoji: '🎓', label: 'ACADEMY' },
  work: { emoji: '🏢', label: 'GUILD HALL' },
  podcast: { emoji: '🎧', label: 'BARD HALL' },
}
