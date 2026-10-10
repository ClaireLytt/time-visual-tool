/**
 * Client-side dictionary lookup — calls public APIs directly, no backend needed.
 * Works on GitHub Pages and any static hosting.
 *
 * Sources:
 *  - Free Dictionary API (dictionaryapi.dev) — phonetics + English definitions
 *  - MyMemory Translation API — English → Chinese translation as definitions
 *  - Youdao dictvoice — pronunciation audio (direct URL, no API call)
 */

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

// ─── In-memory client cache with TTL + LRU eviction ───

interface CacheEntry { data: DictResult; ts: number }
const clientCache = new Map<string, CacheEntry>()
const CLIENT_CACHE_MAX = 300
const CLIENT_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

// ─── External API types ───

type FreeDictEntry = {
  phonetics?: Array<{ text?: string; audio?: string }>
  meanings?: Array<{
    partOfSpeech?: string
    definitions?: Array<{ definition?: string }>
  }>
}

type MyMemoryResponse = {
  responseStatus?: number
  responseData?: { translatedText?: string }
}

// ─── Youdao dictvoice URLs (no API key needed, direct audio) ───

function youdaoAudio(word: string, type: 1 | 2): string {
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`
}

// ─── Public API lookup ───

async function fetchFreeDictionary(word: string, signal?: AbortSignal): Promise<FreeDictEntry | null> {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { signal }
    )
    if (!res.ok) return null
    const data = (await res.json()) as FreeDictEntry[]
    return Array.isArray(data) ? data[0] ?? null : null
  } catch {
    return null
  }
}

async function fetchTranslation(word: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh`,
      { signal }
    )
    if (!res.ok) return null
    const data = (await res.json()) as MyMemoryResponse
    const text = data?.responseData?.translatedText
    // MyMemory sometimes returns the input unchanged — skip those
    if (text && text.toLowerCase() !== word.toLowerCase()) return text
    return null
  } catch {
    return null
  }
}

// ─── Main lookup function ───

/**
 * Look up a word's phonetics and definitions.
 * Calls Free Dictionary API + MyMemory Translation directly from the client.
 * No backend server required.
 */
export async function lookupWord(word: string, signal?: AbortSignal): Promise<DictResult | null> {
  const key = word.toLowerCase().trim()
  if (!key || !/^[a-z'-]+$/.test(key)) return null

  // LRU cache check
  const cached = clientCache.get(key)
  if (cached) {
    if (Date.now() - cached.ts < CLIENT_CACHE_TTL) {
      clientCache.delete(key)
      clientCache.set(key, cached)
      return cached.data
    }
    clientCache.delete(key)
  }

  // Fetch both APIs in parallel — both are free and CORS-friendly
  const [freeDictResult, translationResult] = await Promise.allSettled([
    fetchFreeDictionary(key, signal),
    fetchTranslation(key, signal),
  ])

  // ── Extract phonetics + English definitions from Free Dictionary API ──
  const freeDict = freeDictResult.status === 'fulfilled' ? freeDictResult.value : null
  const phonetics = freeDict?.phonetics ?? []
  const ukPhon = phonetics.find(p => p.audio?.includes('-uk'))
  const usPhon = phonetics.find(p => p.audio?.includes('-us'))
  const anyPhon = phonetics.find(p => p.text)

  const enDefinitions: string[] = []
  if (freeDict?.meanings) {
    for (const m of freeDict.meanings) {
      const pos = m.partOfSpeech ?? ''
      const defs = (m.definitions ?? []).slice(0, 2).map(d => d.definition).filter(Boolean)
      if (defs.length > 0) {
        enDefinitions.push(`${pos}. ${defs.join('; ')}`)
      }
    }
  }

  // ── Chinese definitions from MyMemory ──
  let definitions: string[] = []
  const translation = translationResult.status === 'fulfilled' ? translationResult.value : null
  if (translation) {
    definitions = [translation]
  }

  // Fallback: use English definitions if no Chinese
  if (definitions.length === 0 && enDefinitions.length > 0) {
    definitions = enDefinitions
  }

  // If both APIs returned nothing, return null
  if (definitions.length === 0 && enDefinitions.length === 0) return null

  const result: DictResult = {
    word: key,
    phonetics: {
      uk: {
        text: ukPhon?.text ?? anyPhon?.text ?? '',
        audio: ukPhon?.audio ?? youdaoAudio(key, 1),
      },
      us: {
        text: usPhon?.text ?? anyPhon?.text ?? '',
        audio: usPhon?.audio ?? youdaoAudio(key, 2),
      },
    },
    definitions,
    enDefinitions,
  }

  // LRU eviction + cache
  if (clientCache.size >= CLIENT_CACHE_MAX) {
    const firstKey = clientCache.keys().next().value
    if (firstKey !== undefined) clientCache.delete(firstKey)
  }
  clientCache.set(key, { data: result, ts: Date.now() })

  return result
}

/**
 * Play a pronunciation audio URL.
 * If the URL is empty, falls back to Youdao dictvoice.
 */
export function playPronunciation(audioUrl: string, word?: string): void {
  const url = audioUrl || (word ? youdaoAudio(word, 2) : '')
  if (!url) return
  try {
    const audio = new Audio(url)
    audio.volume = 0.8
    audio.play().catch(() => {})
  } catch {
    // Audio playback is best-effort
  }
}
