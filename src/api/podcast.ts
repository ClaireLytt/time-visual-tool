import type { Feed, PodcastSummary } from '../types/podcast'

const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api'

/** Fetch JSON with automatic retry on transient network errors */
async function getJson<T>(path: string, signal?: AbortSignal, retries = 2): Promise<T> {
  const url = `${API_BASE}${path}`
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { signal })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        // Pass through the server's clear error message directly
        const msg = body.error ?? `HTTP ${res.status}`
        if (attempt < retries && res.status >= 500) {
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)))
          continue
        }
        throw new Error(msg)
      }
      return body as T
    } catch (err) {
      if (signal?.aborted) throw err
      if (attempt < retries && err instanceof TypeError) {
        await new Promise(r => setTimeout(r, 800 * (attempt + 1)))
        continue
      }
      // Clear message for browser-level network errors
      if (err instanceof TypeError) {
        // @ts-expect-error ES2022 Error.cause not in ES2020 target
        throw new Error('Cannot connect to server — make sure the podcast server is running (npm run server)', { cause: err })
      }
      throw err
    }
  }
}

export async function searchPodcasts(q: string, signal?: AbortSignal): Promise<PodcastSummary[]> {
  const { results } = await getJson<{ results: PodcastSummary[] }>(`/search?q=${encodeURIComponent(q)}`, signal)
  return results
}

export type FeedSource = { feedUrl: string } | { collectionId: number }

export function fetchEpisodes(source: FeedSource, signal?: AbortSignal): Promise<Feed> {
  const qs = 'feedUrl' in source
    ? `feedUrl=${encodeURIComponent(source.feedUrl)}`
    : `collectionId=${source.collectionId}`
  return getJson<Feed>(`/episodes?${qs}`, signal)
}

export function audioProxyUrl(audioUrl: string): string {
  return `${API_BASE}/audio?url=${encodeURIComponent(audioUrl)}`
}

export async function fetchTranscriptText(transcriptUrl: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(`${API_BASE}/transcript?url=${encodeURIComponent(transcriptUrl)}`, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// ─── Charts ───

export type ChartFeed = 'top' | 'popular'

export interface ChartPodcast {
  collectionId: number
  collectionName: string
  artistName: string
  artworkUrl600: string
  summary: string
  feedUrl?: string
}

export async function fetchCharts(
  feed: ChartFeed,
  signal?: AbortSignal,
  country?: string,
  genreId?: string,
): Promise<ChartPodcast[]> {
  let url = `/charts?feed=${feed}`
  if (country) url += `&country=${encodeURIComponent(country)}`
  if (genreId) url += `&genreId=${encodeURIComponent(genreId)}`
  const { results } = await getJson<{ results: ChartPodcast[] }>(url, signal)
  return results
}

// ─── Whisper ASR transcription ───

interface TranscriptionResult {
  status: 'queued' | 'transcribing' | 'done' | 'failed'
  segments?: import('../types/podcast').Segment[]
  error?: string
}

/** Request a Whisper transcription (returns cached result if already done) */
export async function requestTranscription(audioUrl: string, episodeId: string, signal?: AbortSignal): Promise<TranscriptionResult> {
  const res = await fetch(`${API_BASE}/transcribe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ audioUrl, episodeId }),
    signal,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`)
  return body as TranscriptionResult
}

/** Poll the status of a Whisper transcription job */
export async function pollTranscription(episodeId: string, signal?: AbortSignal): Promise<TranscriptionResult> {
  return getJson<TranscriptionResult>(`/transcribe?episodeId=${encodeURIComponent(episodeId)}`, signal)
}
