/**
 * Translation API with automatic fallback:
 * 1. Local backend proxy → Google Translate (fast, no limit, no CORS)
 * 2. Lingva Translate (open-source Google Translate proxy, CORS-friendly)
 * 3. MyMemory (free but has daily limits)
 *
 * All results are cached in localStorage by episode ID.
 */

const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api'

// Track which sources are down so we skip them quickly
let backendDown = false
let lingvaDown = false

// Lingva public instances (fallback chain)
const LINGVA_HOSTS = [
  'lingva.ml',
  'lingva.thedaviddelta.com',
  'lingva.lunar.icu',
]
let lingvaHostIdx = 0

/** Fetch with a hard timeout */
async function fetchTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  if (init.signal) {
    init.signal.addEventListener('abort', () => ctrl.abort())
  }
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Strategy 1: Own backend proxy → Google Translate (no CORS, no limit) */
async function translateViaBackend(text: string): Promise<string | null> {
  if (backendDown) return null
  try {
    const res = await fetchTimeout(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }, 5000)
    if (!res.ok) {
      if (res.status === 404) backendDown = true // no backend
      return null
    }
    const data = await res.json()
    return data?.translation || null
  } catch {
    backendDown = true // backend unreachable (GitHub Pages)
    return null
  }
}

/** Strategy 2: Lingva Translate (open-source, CORS-friendly) */
async function translateViaLingva(text: string): Promise<string | null> {
  if (lingvaDown) return null
  // Try current host, rotate on failure
  for (let attempt = 0; attempt < LINGVA_HOSTS.length; attempt++) {
    const host = LINGVA_HOSTS[lingvaHostIdx]
    try {
      const res = await fetchTimeout(
        `https://${host}/api/v1/en/zh/${encodeURIComponent(text)}`,
        {}, 5000
      )
      if (!res.ok) {
        lingvaHostIdx = (lingvaHostIdx + 1) % LINGVA_HOSTS.length
        continue
      }
      const data = await res.json()
      return data?.translation || null
    } catch {
      lingvaHostIdx = (lingvaHostIdx + 1) % LINGVA_HOSTS.length
    }
  }
  lingvaDown = true
  return null
}

/** Strategy 3: MyMemory (free, has daily limits) */
async function translateViaMyMemory(text: string): Promise<string | null> {
  try {
    const res = await fetchTimeout(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 490))}&langpair=en|zh`,
      {}, 5000
    )
    if (!res.ok) return null
    const data = await res.json()
    const translated = data?.responseData?.translatedText
    if (!translated) return null
    // Check for rate limit or error messages
    if (translated.includes('MYMEMORY WARNING') || translated.includes('QUERY LENGTH LIMIT')) return null
    if (translated.toLowerCase() === text.toLowerCase()) return null
    return translated
  } catch {
    return null
  }
}

/**
 * Translate a single sentence from English to Chinese.
 * Tries backend → Lingva → MyMemory in order. Returns null if all fail.
 */
export async function translateText(text: string): Promise<string | null> {
  // Try strategies in order, return first success
  const result = await translateViaBackend(text)
  if (result) return result

  const result2 = await translateViaLingva(text)
  if (result2) return result2

  return translateViaMyMemory(text)
}

// ─── localStorage cache for episode translations ───

const CACHE_PREFIX = 'podcast-trans-'

export function loadTranslationCache(episodeId: string): Map<string, string> {
  const map = new Map<string, string>()
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + episodeId)
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, string>
      for (const [k, v] of Object.entries(parsed)) map.set(k, v)
    }
  } catch { /* localStorage unavailable */ }
  return map
}

export function saveTranslationCache(episodeId: string, cache: Map<string, string>): void {
  try {
    const obj: Record<string, string> = {}
    for (const [k, v] of cache) obj[k] = v
    localStorage.setItem(CACHE_PREFIX + episodeId, JSON.stringify(obj))
  } catch { /* quota exceeded */ }
}
