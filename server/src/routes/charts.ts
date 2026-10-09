import { Router } from 'express'
import { HttpError } from '../http.js'

export const chartsRouter = Router()

interface ChartPodcast {
  collectionId: number
  collectionName: string
  artistName: string
  artworkUrl600: string
  summary: string
}

interface CacheEntry {
  data: ChartPodcast[]
  ts: number
}

const CACHE_TTL = 30 * 60_000 // 30 minutes
const cache = new Map<string, CacheEntry>()

const UA = 'TimeVisualPodcast/0.1 (+https://github.com/ClaireLytt/time-visual-tool)'

/*
 * Two different chart sources — both English, different rankings:
 *
 *   "top"     → iTunes RSS Feed (US) — subscription/editorial ranking
 *   "popular" → Apple Marketing Tools API (US) — play-based ranking
 *
 * They return different JSON formats, so we normalize both.
 */

const FEED_URLS: Record<string, string> = {
  // 流行榜 — US top chart (subscription/editorial ranking)
  top: 'https://itunes.apple.com/us/rss/toppodcasts/limit=30/json',
  // 大家在听 — UK top chart (different ranking, also English-language)
  popular: 'https://rss.marketingtools.apple.com/api/v2/gb/podcasts/top/30/podcasts.json',
}

/** Parse the old iTunes RSS JSON format */
function parseItunesRss(data: any): ChartPodcast[] {
  const entries = data?.feed?.entry
  if (!Array.isArray(entries)) return []

  return entries.map((e: any) => {
    const images = e['im:image']
    const artwork = Array.isArray(images) ? images[images.length - 1]?.label ?? '' : ''
    return {
      collectionId: Number(e.id?.attributes?.['im:id'] ?? 0),
      collectionName: e['im:name']?.label ?? '',
      artistName: e['im:artist']?.label ?? '',
      artworkUrl600: artwork.replace(/\/\d+x\d+/, '/600x600'),
      summary: e.summary?.label ?? '',
    }
  }).filter((p: ChartPodcast) => p.collectionId > 0)
}

/** Parse the Apple Marketing Tools API format */
function parseMarketingTools(data: any): ChartPodcast[] {
  const results = data?.feed?.results
  if (!Array.isArray(results)) return []

  return results.map((e: any) => ({
    collectionId: Number(e.id ?? 0),
    collectionName: e.name ?? '',
    artistName: e.artistName ?? '',
    artworkUrl600: (e.artworkUrl100 ?? '').replace(/\/\d+x\d+/, '/600x600'),
    summary: '',
  })).filter((p: ChartPodcast) => p.collectionId > 0)
}

/**
 * GET /api/charts?feed=top|popular
 * Returns: { results: ChartPodcast[] }
 * Cached for 30 minutes per feed type.
 */
chartsRouter.get('/charts', async (req, res, next) => {
  try {
    const feed = String(req.query.feed ?? 'top')
    const url = FEED_URLS[feed]
    if (!url) throw new HttpError(400, `unknown feed type: ${feed} (use "top" or "popular")`)

    // Check cache
    const cached = cache.get(feed)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      res.setHeader('x-cache', 'hit')
      res.json({ results: cached.data })
      return
    }

    const response = await fetch(url, {
      headers: { 'user-agent': UA },
      redirect: 'follow',
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) {
      throw new HttpError(502, `Apple API returned ${response.status}`)
    }
    const data = await response.json().catch(() => null)
    if (!data) throw new HttpError(502, 'Apple API returned invalid response')

    // Pick parser based on which API format we got
    const results = feed === 'popular'
      ? parseMarketingTools(data)
      : parseItunesRss(data)

    cache.set(feed, { data: results, ts: Date.now() })

    res.setHeader('x-cache', 'miss')
    res.setHeader('cache-control', 'public, max-age=1800')
    res.json({ results })
  } catch (e) {
    next(e)
  }
})
