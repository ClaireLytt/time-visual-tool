import { Router } from 'express'
import { assertHttpUrl, fetchOk } from '../http.js'

export const transcriptRouter = Router()

/** Proxy a transcript file (SRT / VTT / JSON) to bypass CORS. */
transcriptRouter.get('/transcript', async (req, res, next) => {
  try {
    const url = assertHttpUrl(req.query.url)
    const upstream = await fetchOk(url)
    const ct = upstream.headers.get('content-type') ?? 'text/plain'
    const body = await upstream.text()

    res.setHeader('content-type', ct)
    res.setHeader('cache-control', 'public, max-age=86400')
    res.send(body)
  } catch (e) {
    next(e)
  }
})
