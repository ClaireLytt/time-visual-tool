import type { AppMode } from '../types'

/** Canonical color for each module — single source of truth */
export const MODE_ACCENT: Record<AppMode, string> = {
  overview: '#c9ab72',
  time: '#7fa3bb',
  finance: '#86a98d',
  eating: '#cb9c77',
  diary: '#b09cc4',
  sport: '#8fc0c6',
  habit: '#c9ab77',
  todo: '#90a6c9',
  study: '#8aa7c4',
  work: '#c79a74',
  podcast: '#b4879d',
  youtube: '#b28787',
  ielts: '#c28a80',
  gallery: '#a39080',
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
  youtube: { emoji: '📺', label: 'THEATER' },
  ielts: { emoji: '📝', label: 'EXAM HALL' },
  gallery: { emoji: '🖼️', label: 'GALLERY' },
}
