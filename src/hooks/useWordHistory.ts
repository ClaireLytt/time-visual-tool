import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

/** A single word lookup record */
export interface WordRecord {
  word: string
  /** ISO timestamp of first lookup */
  firstSeen: string
  /** ISO timestamp of last lookup */
  lastSeen: string
  /** Number of times looked up */
  count: number
  /** Whether the user bookmarked this word */
  bookmarked: boolean
  /** Episode where this word was first encountered */
  episodeId?: string
  /** Title of the episode where this word was first encountered */
  episodeTitle?: string
}

/** Bookmarked sentence from a transcript */
export interface SavedSentence {
  text: string
  episodeTitle: string
  timestamp: number // seconds into the episode
  savedAt: string   // ISO timestamp
}

const WORDS_KEY = 'podcast-word-history'
const SENTENCES_KEY = 'podcast-saved-sentences'
const MAX_WORDS = 3000
const MAX_SENTENCES = 500

export function useWordHistory() {
  const [words, setWords] = useLocalStorage<WordRecord[]>(WORDS_KEY, [])
  const [sentences, setSentences] = useLocalStorage<SavedSentence[]>(SENTENCES_KEY, [])

  /** Record a word lookup. Increments count if already seen. */
  const recordLookup = useCallback((word: string, episodeId?: string, episodeTitle?: string) => {
    const key = word.toLowerCase().trim()
    if (!key) return
    setWords(prev => {
      const idx = prev.findIndex(w => w.word === key)
      const now = new Date().toISOString()
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], lastSeen: now, count: updated[idx].count + 1 }
        return updated
      }
      const next = [...prev, { word: key, firstSeen: now, lastSeen: now, count: 1, bookmarked: false, episodeId, episodeTitle }]
      // Evict least-recently-seen non-bookmarked entries if over limit
      if (next.length > MAX_WORDS) {
        const excess = next.length - MAX_WORDS
        // Sort candidates by lastSeen ascending (oldest first)
        const candidates = next
          .map((w, i) => ({ i, w }))
          .filter(c => !c.w.bookmarked)
          .sort((a, b) => a.w.lastSeen.localeCompare(b.w.lastSeen))
        const toRemove = new Set(candidates.slice(0, excess).map(c => c.i))
        return next.filter((_, i) => !toRemove.has(i))
      }
      return next
    })
  }, [setWords])

  /** Toggle bookmark on a word */
  const toggleBookmark = useCallback((word: string) => {
    const key = word.toLowerCase().trim()
    setWords(prev => prev.map(w =>
      w.word === key ? { ...w, bookmarked: !w.bookmarked } : w
    ))
  }, [setWords])

  /** Remove a word from history */
  const removeWord = useCallback((word: string) => {
    const key = word.toLowerCase().trim()
    setWords(prev => prev.filter(w => w.word !== key))
  }, [setWords])

  /** Save a sentence */
  const saveSentence = useCallback((text: string, episodeTitle: string, timestamp: number) => {
    setSentences(prev => {
      if (prev.some(s => s.text === text && s.episodeTitle === episodeTitle)) return prev
      const next = [...prev, { text, episodeTitle, timestamp, savedAt: new Date().toISOString() }]
      return next.length > MAX_SENTENCES ? next.slice(-MAX_SENTENCES) : next
    })
  }, [setSentences])

  /** Get lookup records filtered by date range */
  const getRecordsInRange = useCallback((startDate: Date, endDate: Date): WordRecord[] => {
    return words.filter(w => {
      const d = new Date(w.lastSeen)
      return d >= startDate && d <= endDate
    })
  }, [words])

  /** Get daily lookup counts for a date range (aggregated by day) */
  const getDailyCounts = useCallback((startDate: Date, endDate: Date): Map<string, number> => {
    const counts = new Map<string, number>()
    for (const w of words) {
      const d = new Date(w.lastSeen)
      if (d >= startDate && d <= endDate) {
        const dayKey = d.toISOString().slice(0, 10)
        counts.set(dayKey, (counts.get(dayKey) ?? 0) + 1)
      }
    }
    return counts
  }, [words])

  /** Get all words associated with a specific episode */
  const getWordsByEpisode = useCallback((episodeId: string): WordRecord[] => {
    return words.filter(w => w.episodeId === episodeId)
  }, [words])

  /** Get a list of episodes with word counts, sorted by most recent */
  const getEpisodeGroups = useCallback((): Array<{ episodeId: string; episodeTitle: string; count: number }> => {
    const groups = new Map<string, { episodeTitle: string; count: number; lastSeen: string }>()
    for (const w of words) {
      if (!w.episodeId) continue
      const existing = groups.get(w.episodeId)
      if (existing) {
        existing.count++
        if (w.lastSeen > existing.lastSeen) existing.lastSeen = w.lastSeen
      } else {
        groups.set(w.episodeId, {
          episodeTitle: w.episodeTitle ?? w.episodeId,
          count: 1,
          lastSeen: w.lastSeen,
        })
      }
    }
    return [...groups.entries()]
      .sort((a, b) => b[1].lastSeen.localeCompare(a[1].lastSeen))
      .map(([episodeId, { episodeTitle, count }]) => ({ episodeId, episodeTitle, count }))
  }, [words])

  return {
    words,
    sentences,
    recordLookup,
    toggleBookmark,
    removeWord,
    saveSentence,
    getRecordsInRange,
    getDailyCounts,
    getWordsByEpisode,
    getEpisodeGroups,
  }
}
