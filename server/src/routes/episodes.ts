import { Router } from 'express'
import { assertHttpUrl, fetchOk, HttpError } from '../http.js'
import { parseFeed } from '../rss.js'

export const episodesRouter = Router()

async function lookupFeedUrl(collectionId: string): Promise<string> {
  const res = await fetchOk(`https://itunes.apple.com/lookup?id=${encodeURIComponent(collectionId)}`)
  const data = (await res.json()) as { results: { feedUrl?: string }[] }
  const feedUrl = data.results[0]?.feedUrl
  if (!feedUrl) throw new HttpError(404, 'no feedUrl for this podcast')
  return feedUrl
}

episodesRouter.get('/episodes', async (req, res, next) => {
  try {
    const { feedUrl: rawFeed, collectionId } = req.query
    let feedUrl: string
    if (rawFeed) feedUrl = assertHttpUrl(rawFeed).toString()
    else if (collectionId) feedUrl = await lookupFeedUrl(String(collectionId))
    else throw new HttpError(400, 'feedUrl or collectionId required')

    const xml = await (await fetchOk(feedUrl)).text()
    let feed
    try {
      feed = parseFeed(xml)
    } catch (e) {
      throw new HttpError(422, (e as Error).message)
    }
    res.json({ feedUrl, ...feed })
  } catch (e) {
    next(e)
  }
})
