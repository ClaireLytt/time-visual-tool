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

  const updateMeta = useCallback((id: string, patch: Partial<EpisodeMeta>) => {
    setStats(prev => {
      const existing = prev[id] ?? {
        id, starred: false, toLearn: false,
        segmentsListened: 0, listenTime: 0, wordCount: 0,
        lastPlayed: new Date().toISOString(),
      }
      const next = { ...prev, [id]: { ...existing, ...patch, id } }
      // Evict oldest non-starred entries if over limit
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
    const cur = stats[id]
    updateMeta(id, { starred: !(cur?.starred ?? false), lastPlayed: new Date().toISOString() })
  }, [stats, updateMeta])

  const toggleToLearn = useCallback((id: string) => {
    const cur = stats[id]
    updateMeta(id, { toLearn: !(cur?.toLearn ?? false), lastPlayed: new Date().toISOString() })
  }, [stats, updateMeta])

  /** Record that the user played/interacted with an episode */
  const recordPlay = useCallback((id: string) => {
    const cur = stats[id]
    updateMeta(id, {
      segmentsListened: (cur?.segmentsListened ?? 0) + 1,
      lastPlayed: new Date().toISOString(),
    })
  }, [stats, updateMeta])

  /** Increment word count for an episode */
  const recordWord = useCallback((id: string) => {
    const cur = stats[id]
    updateMeta(id, {
      wordCount: (cur?.wordCount ?? 0) + 1,
      lastPlayed: new Date().toISOString(),
    })
  }, [stats, updateMeta])

  return { stats, getMeta, toggleStar, toggleToLearn, recordPlay, recordWord }
}

export type { SortMode }
