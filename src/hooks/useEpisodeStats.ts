import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

/** Per-episode learning metadata persisted in localStorage */
export interface EpisodeMeta {
  /** Episode RSS id */
  id: string
  /** Favorited (⭐) */
  starred: boolean
  /** Marked as "to learn" (📖) */
  toLearn: boolean
  /** Number of transcript segments the user has interacted with (seek clicks) */
  segmentsListened: number
  /** Cumulative listen time in seconds (approximated from segment seeks) */
  listenTime: number
  /** Number of words looked up from this episode */
  wordCount: number
  /** Last interaction timestamp (ISO) */
  lastPlayed: string
}

type SortMode = 'default' | 'difficulty' | 'recent' | 'words'

const STORAGE_KEY = 'podcast-episode-stats'
const MAX_ENTRIES = 500

export function useEpisodeStats() {
  const [stats, setStats] = useLocalStorage<Record<string, EpisodeMeta>>(STORAGE_KEY, {})

  const getMeta = useCallback((id: string): EpisodeMeta | undefined => stats[id], [stats])

  /** Update meta using a function that reads from prev state (no stale closures) */
  const updateMeta = useCallback((id: string, patchFn: (cur: EpisodeMeta) => Partial<EpisodeMeta>) => {
    setStats(prev => {
      const existing = prev[id] ?? {
        id, starred: false, toLearn: false,
        segmentsListened: 0, listenTime: 0, wordCount: 0,
        lastPlayed: new Date().toISOString(),
      }
      const patch = patchFn(existing)
      const next = { ...prev, [id]: { ...existing, ...patch, id } }
      const keys = Object.keys(next)
      if (keys.length > MAX_ENTRIES) {
        const sorted = keys
          .filter(k => !next[k].starred && !next[k].toLearn)
          .sort((a, b) => (next[a].lastPlayed ?? '').localeCompare(next[b].lastPlayed ?? ''))
        for (const k of sorted.slice(0, keys.length - MAX_ENTRIES)) delete next[k]
      }
      return next
    })
  }, [setStats])

  const toggleStar = useCallback((id: string) => {
    updateMeta(id, cur => ({ starred: !cur.starred, lastPlayed: new Date().toISOString() }))
  }, [updateMeta])

  const toggleToLearn = useCallback((id: string) => {
    updateMeta(id, cur => ({ toLearn: !cur.toLearn, lastPlayed: new Date().toISOString() }))
  }, [updateMeta])

  const recordPlay = useCallback((id: string, durationSec = 0) => {
    updateMeta(id, cur => ({
      segmentsListened: cur.segmentsListened + 1,
      listenTime: cur.listenTime + durationSec,
      lastPlayed: new Date().toISOString(),
    }))
  }, [updateMeta])

  const recordWord = useCallback((id: string) => {
    updateMeta(id, cur => ({
      wordCount: cur.wordCount + 1,
      lastPlayed: new Date().toISOString(),
    }))
  }, [updateMeta])

  return { stats, getMeta, toggleStar, toggleToLearn, recordPlay, recordWord }
}

export type { SortMode }
