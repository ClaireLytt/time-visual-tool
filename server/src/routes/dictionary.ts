import { Router } from 'express'
import { fetchOk, HttpError } from '../http.js'

export const dictionaryRouter = Router()

const cache = new Map<string, { data: unknown; ts: number; size: number }>()
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000
const CACHE_MAX = 2000
const CACHE_MAX_BYTES = 10 * 1024 * 1024 // 10 MB total size budget
let cacheBytes = 0

function cacheSet(key: string, data: unknown) {
  const json = JSON.stringify(data)
  const entrySize = json.length * 2 // rough UTF-16 byte estimate

  // Skip caching oversized single entries (> 256 KB)
  if (entrySize > 256 * 1024) return

  // Evict expired entries first
  if (cache.size >= CACHE_MAX || cacheBytes + entrySize > CACHE_MAX_BYTES) {
    const now = Date.now()
    for (const [k, v] of cache) {
      if (now - v.ts > CACHE_TTL) { cacheBytes -= v.size; cache.delete(k) }
    }
  }
  // Evict oldest entries if still over limits
  if (cache.size >= CACHE_MAX || cacheBytes + entrySize > CACHE_MAX_BYTES) {
    for (const [k, v] of cache) {
      cacheBytes -= v.size
      cache.delete(k)
      if (cache.size < CACHE_MAX * 0.8 && cacheBytes + entrySize <= CACHE_MAX_BYTES) break
    }
  }

  // Remove old entry's size if replacing
  const old = cache.get(key)
  if (old) cacheBytes -= old.size

  cache.set(key, { data, ts: Date.now(), size: entrySize })
  cacheBytes += entrySize
}

// ─── Types ───

interface DictResponse {
  word: string
  phonetics: {
    uk: { text: string; audio: string }
    us: { text: string; audio: string }
  }
  /** Chinese definitions (from Youdao or translation fallback) */
  definitions: string[]
  /** English definitions (from free dictionary API) */
  enDefinitions: string[]
}

type YoudaoRaw = {
  data?: { entries?: Array<{ explain: string; entry: string }> }
}

type FreeDictEntry = {
  phonetics?: Array<{ text?: string; audio?: string }>
  meanings?: Array<{
    partOfSpeech?: string
    definitions?: Array<{ definition?: string }>
  }>
}

type TranslationRaw = {
  responseStatus?: number
  responseData?: { translatedText?: string }
}

// ─── Route ───

dictionaryRouter.get('/dictionary/:word', async (req, res, next) => {
  try {
    const word = req.params.word?.trim().toLowerCase()
    if (!word || word.length > 100) throw new HttpError(400, 'invalid word')
    if (!/^[a-z'-]+$/.test(word)) throw new HttpError(400, 'only English words are supported')

    // Cache hit
    const cached = cache.get(word)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      res.set('cache-control', 'private, max-age=604800')
      res.json(cached.data)
      return
    }

    // Fetch all three APIs in parallel — all degrade gracefully
    const [youdaoResult, freeDictResult, translateResult] = await Promise.allSettled([
      fetchOk(`https://dict.youdao.com/suggest?num=8&ver=3.0&doctype=json&cache=false&le=en&q=${encodeURIComponent(word)}`, { timeoutMs: 5000 })
        .then(r => r.json() as Promise<YoudaoRaw>),
      fetchOk(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { timeoutMs: 8000 })
        .then(r => r.json() as Promise<FreeDictEntry[]>),
      // MyMemory free translation API as last-resort fallback for Chinese meaning
      fetchOk(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh`, { timeoutMs: 5000 })
        .then(r => r.json() as Promise<TranslationRaw>),
    ])

    // ── Chinese definitions from Youdao ──
    let definitions: string[] = []
    if (youdaoResult.status === 'fulfilled') {
      const entries = youdaoResult.value?.data?.entries ?? []
      const match = entries.find(e => e.entry?.toLowerCase() === word) ?? entries[0]
      if (match?.explain) {
        definitions = match.explain.split(/;\s*(?=[a-z]+\.)/).filter(Boolean)
        if (definitions.length === 0) definitions = [match.explain]
      }
    }

    // ── Phonetics + English definitions from free dictionary API ──
    let phonetics: Array<{ text?: string; audio?: string }> = []
    let enDefinitions: string[] = []
    if (freeDictResult.status === 'fulfilled' && Array.isArray(freeDictResult.value)) {
      const first = freeDictResult.value[0]
      if (first?.phonetics) phonetics = first.phonetics
      if (first?.meanings) {
        for (const m of first.meanings) {
          const pos = m.partOfSpeech ?? ''
          const defs = (m.definitions ?? []).slice(0, 2).map(d => d.definition).filter(Boolean)
          if (defs.length > 0) {
            enDefinitions.push(`${pos}. ${defs.join('; ')}`)
          }
        }
      }
    }

    // ── Translation fallback: if Youdao returned nothing, use MyMemory ──
    if (definitions.length === 0 && translateResult.status === 'fulfilled') {
      const translated = translateResult.value?.responseData?.translatedText
      if (translated && translated.toLowerCase() !== word) {
        definitions = [translated]
      }
    }

    // ── Final fallback: use English definitions as Chinese definitions ──
    if (definitions.length === 0 && enDefinitions.length > 0) {
      definitions = enDefinitions
    }

    // ── Extract UK / US phonetics ──
    const ukPhon = phonetics.find(p => p.audio?.includes('-uk'))
    const usPhon = phonetics.find(p => p.audio?.includes('-us'))
    const anyPhon = phonetics.find(p => p.text)

    const result: DictResponse = {
      word,
      phonetics: {
        uk: { text: ukPhon?.text ?? anyPhon?.text ?? '', audio: ukPhon?.audio ?? '' },
        us: { text: usPhon?.text ?? anyPhon?.text ?? '', audio: usPhon?.audio ?? '' },
      },
      definitions,
      enDefinitions,
    }

    cacheSet(word, result)
    res.set('cache-control', 'private, max-age=604800')
    res.json(result)
  } catch (e) {
    next(e)
  }
})
