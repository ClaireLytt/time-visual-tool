/**
 * Client-side dictionary lookup — uses OFFLINE bundled ECDICT data.
 * 26 JSON shard files (a.json ~ z.json) in /dict/, loaded on demand.
 * No backend server or external API needed. Instant lookups.
 *
 * Data source: ECDICT (https://github.com/skywind3000/ECDICT, MIT license)
 * Each shard: { w: { word: [DisplayWord, phonetic, translation], ... }, l: { inflected: lemma, ... } }
 */

// ─── Types ───

export interface DictPhonetics {
  uk: { text: string; audio: string }
  us: { text: string; audio: string }
}

export interface DictResult {
  word: string
  phonetics: DictPhonetics
  /** Chinese definitions */
  definitions: string[]
  /** English definitions (not available in offline dict, always empty) */
  enDefinitions?: string[]
}

// ─── Shard loader (lazy, cached) ───

interface ShardData {
  w: Record<string, [string, string, string]>  // word -> [display, phonetic, translation]
  l: Record<string, string>                     // inflected -> lemma
}

const shards: Record<string, Promise<ShardData>> = {}
const BASE = import.meta.env.BASE_URL ?? '/'

function loadShard(letter: string): Promise<ShardData> {
  if (!shards[letter]) {
    shards[letter] = fetch(`${BASE}dict/${letter}.json`)
      .then(r => r.json() as Promise<ShardData>)
      .catch(() => ({ w: {}, l: {} }))
  }
  return shards[letter]
}

// ─── Suffix candidate generation (lemmatization) ───
// Ported from lyric_agent's dictionary._candidates logic

function suffixCandidates(w: string): string[] {
  const out: string[] = []
  const rules: [string, string][] = [
    ['ies', 'y'], ['es', ''], ['s', ''],
    ['ing', ''], ['ing', 'e'],
    ['ed', ''], ['ed', 'e'],
  ]
  for (const [suf, rep] of rules) {
    if (w.endsWith(suf) && w.length - suf.length >= 2) {
      out.push(w.slice(0, w.length - suf.length) + rep)
    }
  }
  return out
}

// ─── Youdao dictvoice URLs (pronunciation, no API key needed) ───

function youdaoAudio(word: string, type: 1 | 2): string {
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`
}

// ─── In-memory result cache ───

const resultCache = new Map<string, DictResult | null>()

// ─── Main lookup ───

/**
 * Look up a word using the bundled offline ECDICT dictionary.
 * Instant — no network latency. Supports lemmatization (running→run, cities→city).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function lookupWord(word: string, _signal?: AbortSignal): Promise<DictResult | null> {
  const w = word.toLowerCase().replace(/^['-]+|['-]+$/g, '')
  if (!w || !/^[a-z][a-z'-]*$/.test(w)) return null

  // Result cache hit
  if (resultCache.has(w)) return resultCache.get(w) ?? null

  // Build candidate list: original, lemma, suffix variants
  const candidates = [w]
  const sh = await loadShard(w[0])
  if (sh.l[w]) candidates.push(sh.l[w])
  candidates.push(...suffixCandidates(w))

  const seen = new Set<string>()
  for (const c of candidates) {
    if (!c || seen.has(c)) continue
    seen.add(c)
    const hit = (await loadShard(c[0])).w[c]
    if (hit) {
      const [display, phonetic, translation] = hit
      const result: DictResult = {
        word: display,
        phonetics: {
          uk: { text: phonetic ? `/${phonetic}/` : '', audio: youdaoAudio(display, 1) },
          us: { text: phonetic ? `/${phonetic}/` : '', audio: youdaoAudio(display, 2) },
        },
        definitions: translation ? translation.split(/\\n|\n/).filter(Boolean) : [],
        enDefinitions: [],
      }
      resultCache.set(w, result)
      return result
    }
  }

  resultCache.set(w, null)
  return null
}

/**
 * Play pronunciation audio.
 * Uses Youdao dictvoice URL — always works, no API key needed.
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
