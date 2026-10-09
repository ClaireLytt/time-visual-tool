import { Router } from 'express'
import { fetchOk, HttpError } from '../http.js'
import type { PodcastSummary } from '../types.js'

export const searchRouter = Router()

searchRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim()
    if (!q) throw new HttpError(400, 'missing q')
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=podcast&limit=20`
    const data = (await (await fetchOk(url)).json()) as { results: Record<string, any>[] }
    const results: PodcastSummary[] = data.results.map(r => ({
      collectionId: r.collectionId,
      collectionName: r.collectionName,
      artistName: r.artistName,
      artworkUrl600: r.artworkUrl600 ?? r.artworkUrl100,
      feedUrl: r.feedUrl,
    }))
    res.json({ results })
  } catch (e) {
    next(e)
  }
})
