import { Readable } from 'node:stream'
import { Router } from 'express'
import { assertHttpUrl, HttpError } from '../http.js'

export const audioRouter = Router()

const UA = 'TimeVisualPodcast/0.1 (+https://github.com/ClaireLytt/time-visual-tool)'

/**
 * Stream-proxy podcast audio to avoid CORS issues on the client.
 *
 * Key points:
 * - Do NOT set access-control-allow-origin here — the global cors() middleware
 *   already handles it.  Duplicate CORS headers cause browsers to reject the
 *   response entirely, which manifests as MEDIA_ELEMENT_ERROR code 4.
 * - Follow redirects manually (up to 5 hops) so we can handle CDN signed-URL
 *   redirect chains that Node's built-in fetch sometimes chokes on.
 * - Always set content-type so the browser knows how to decode the stream.
 */
audioRouter.get('/audio', async (req, res, next) => {
  try {
    const url = assertHttpUrl(req.query.url)

    const headers: Record<string, string> = { 'user-agent': UA }
    if (req.headers.range) headers.range = req.headers.range

    // Follow redirects manually to survive CDN chains
    let upstream: Response
    let target: string | URL = url
    for (let i = 0; i < 5; i++) {
      upstream = await fetch(target, { headers, redirect: 'manual' })
      if (upstream.status >= 300 && upstream.status < 400) {
        const loc = upstream.headers.get('location')
        if (!loc) break
        target = new URL(loc, String(target))
        // Consume the redirect body to avoid leaking
        await upstream.body?.cancel()
        continue
      }
      break
    }
    if (!upstream!.ok && upstream!.status !== 206) {
      throw new HttpError(502, `upstream ${upstream!.status}`)
    }

    res.status(upstream!.status)

    // Forward audio-relevant headers
    const ct = upstream!.headers.get('content-type')
    // Ensure we always send a valid audio content-type
    res.setHeader('content-type', ct && ct.startsWith('audio') ? ct : 'audio/mpeg')
    for (const h of ['content-length', 'content-range', 'accept-ranges']) {
      const v = upstream!.headers.get(h)
      if (v) res.setHeader(h, v)
    }
    if (!upstream!.headers.get('accept-ranges')) {
      res.setHeader('accept-ranges', 'bytes')
    }
    res.setHeader('cache-control', 'public, max-age=86400')

    // Pipe the body
    if (upstream!.body) {
      const nodeStream = Readable.fromWeb(upstream!.body as any)
      nodeStream.on('error', err => {
        if (!res.headersSent) next(err)
        else res.destroy(err)
      })
      nodeStream.pipe(res)
      req.on('close', () => nodeStream.destroy())
    } else {
      res.end()
    }
  } catch (e) {
    next(e)
  }
})
