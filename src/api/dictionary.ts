const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api'

// ─── Types ───

export interface DictPhonetics {
  uk: { text: string; audio: string }
  us: { text: string; audio: string }
}

export interface DictResult {
  word: string
  phonetics: DictPhonetics
  /** Chinese definitions, e.g. ["n. 时代；次数", "v. 计时"] */
  definitions: string[]
  /** English definitions, e.g. ["verb. to come into conflict"] */
  enDefinitions?: string[]
}

// ─── In-memory client cache (capped at 500 entries) ───

const clientCache = new Map<string, DictResult>()
const CLIENT_CACHE_MAX = 500

// ─── API ───

/**
 * Look up a word's phonetics and Chinese definitions.
 * Uses the server proxy which aggregates Youdao + free dictionary API data.
 * Returns null on any failure (not an app error).
 */
export async function lookupWord(word: string, signal?: AbortSignal): Promise<DictResult | null> {
  const key = word.toLowerCase().trim()
  if (!key) return null

  const cached = clientCache.get(key)
  if (cached) return cached

  try {
    const res = await fetch(`${API_BASE}/dictionary/${encodeURIComponent(key)}`, { signal })
    if (!res.ok) return null
    const data = (await res.json()) as DictResult
    if (clientCache.size >= CLIENT_CACHE_MAX) {
      // Delete oldest entry (first inserted)
      const firstKey = clientCache.keys().next().value
      if (firstKey !== undefined) clientCache.delete(firstKey)
    }
    clientCache.set(key, data)
    return data
  } catch {
    return null
  }
}

/**
 * Play a pronunciation audio URL.
 * Swallows errors silently — audio is a nice-to-have.
 */
export function playPronunciation(audioUrl: string): void {
  if (!audioUrl) return
  try {
    const audio = new Audio(audioUrl)
    audio.volume = 0.8
    audio.play().catch(() => {})
  } catch {
    // Audio playback is best-effort
  }
}
