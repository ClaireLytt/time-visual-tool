/**
 * Translation API with automatic fallback:
 * 1. Backend proxy → Bing Translator (fast, no limit, works in China)
 * 2. Lingva Translate (open-source Google proxy, for GitHub Pages fallback)
 * 3. MyMemory (last resort, has daily limits)
 *
 * All results cached in localStorage by episode ID.
 */

const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api'

let backendAvailable = true // assume available until first failure

/** Fetch with hard timeout */
async function fetchTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  if (init.signal) init.signal.addEventListener('abort', () => ctrl.abort())
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

// ─── Strategy 1: Backend → Bing Translator (best for China) ───

async function translateViaBackend(text: string): Promise<string | null> {
  if (!backendAvailable) return null
  try {
    const res = await fetchTimeout(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }, 8000)
    if (!res.ok) {
      if (res.status === 404) backendAvailable = false
      return null
    }
    const data = await res.json()
    return data?.translation || null
  } catch {
    backendAvailable = false
    return null
  }
}

/** Batch translate via backend (one HTTP request for up to 50 texts) */
export async function batchTranslateViaBackend(texts: string[]): Promise<(string | null)[]> {
  if (!backendAvailable) return texts.map(() => null)
  try {
    const res = await fetchTimeout(`${API_BASE}/translate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts }),
    }, 30000) // longer timeout for batch
    if (!res.ok) {
      if (res.status === 404) backendAvailable = false
      return texts.map(() => null)
    }
    const data = await res.json()
    return (data?.translations ?? []) as (string | null)[]
  } catch {
    backendAvailable = false
    return texts.map(() => null)
  }
}

// ─── Strategy 2: Lingva (open-source Google Translate proxy) ───

const LINGVA_HOSTS = [
  'lingva.ml', 'translate.plausibility.cloud',
  'lingva.lunar.icu', 'translate.projectsegfau.lt',
]
let lingvaIdx = 0
let lingvaFailed = 0

async function translateViaLingva(text: string): Promise<string | null> {
  if (lingvaFailed >= LINGVA_HOSTS.length) return null
  for (let i = 0; i < LINGVA_HOSTS.length; i++) {
    const host = LINGVA_HOSTS[(lingvaIdx + i) % LINGVA_HOSTS.length]
    try {
      const res = await fetchTimeout(
        `https://${host}/api/v1/en/zh/${encodeURIComponent(text.slice(0, 1000))}`,
        {}, 5000
      )
      if (!res.ok) continue
      const data = await res.json()
      if (data?.translation) {
        lingvaIdx = (lingvaIdx + i) % LINGVA_HOSTS.length // stick to working host
        return data.translation
      }
    } catch { /* try next */ }
  }
  lingvaFailed = LINGVA_HOSTS.length
  return null
}

// ─── Strategy 3: MyMemory (last resort) ───

async function translateViaMyMemory(text: string): Promise<string | null> {
  try {
    const res = await fetchTimeout(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 490))}&langpair=en|zh`,
      {}, 5000
    )
    if (!res.ok) return null
    const data = await res.json()
    const t = data?.responseData?.translatedText
    if (!t || t.includes('MYMEMORY WARNING') || t.includes('QUERY LENGTH LIMIT')) return null
    if (t.toLowerCase() === text.toLowerCase()) return null
    return t
  } catch {
    return null
  }
}

// ─── Main translate function ───

export async function translateText(text: string): Promise<string | null> {
  return await translateViaBackend(text)
    ?? await translateViaLingva(text)
    ?? await translateViaMyMemory(text)
}

// ─── localStorage cache ───

const CACHE_PREFIX = 'podcast-trans-'

export function loadTranslationCache(episodeId: string): Map<string, string> {
  const map = new Map<string, string>()
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + episodeId)
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, string>
      for (const [k, v] of Object.entries(parsed)) map.set(k, v)
    }
  } catch { /* */ }
  return map
}

export function saveTranslationCache(episodeId: string, cache: Map<string, string>): void {
  try {
    const obj: Record<string, string> = {}
    for (const [k, v] of cache) obj[k] = v
    localStorage.setItem(CACHE_PREFIX + episodeId, JSON.stringify(obj))
  } catch { /* */ }
}
