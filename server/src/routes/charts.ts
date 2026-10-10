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

/** Build chart URL with country and optional genre */
function buildChartUrl(feed: string, country: string, genreId?: string): string {
  const cc = country.toLowerCase()
  if (feed === 'popular') {
    const genrePart = genreId ? `/genre=${genreId}` : ''
    return `https://rss.marketingtools.apple.com/api/v2/${cc}/podcasts/top/30${genrePart}/podcasts.json`
  }
  // iTunes RSS format
  const genrePart = genreId ? `/genre=${genreId}` : ''
  return `https://itunes.apple.com/${cc}/rss/toppodcasts${genrePart}/limit=30/json`
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
 * GET /api/charts?feed=top|popular&country=us&genreId=1469
 * Returns: { results: ChartPodcast[] }
 * Cached for 30 minutes per feed+country+genre combination.
 */
chartsRouter.get('/charts', async (req, res, next) => {
  try {
    const feed = String(req.query.feed ?? 'top')
    if (feed !== 'top' && feed !== 'popular') throw new HttpError(400, `unknown feed type: ${feed}`)
    const country = String(req.query.country ?? (feed === 'popular' ? 'gb' : 'us'))
    const genreId = req.query.genreId ? String(req.query.genreId) : undefined
    const url = buildChartUrl(feed, country, genreId)

    // Check cache (keyed by feed+country+genre)
    const cacheKey = `${feed}:${country}:${genreId ?? ''}`
    const cached = cache.get(cacheKey)
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

    cache.set(cacheKey, { data: results, ts: Date.now() })

    res.setHeader('x-cache', 'miss')
    res.setHeader('cache-control', 'public, max-age=1800')
    res.json({ results })
  } catch (e) {
    next(e)
  }
})
