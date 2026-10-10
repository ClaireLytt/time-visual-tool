import { Router } from 'express'
import { HttpError } from '../http.js'

export const translateRouter = Router()

/**
 * POST /api/translate
 * Body: { text: string, from?: string, to?: string }
 * Returns: { translation: string }
 *
 * Uses Google Translate unofficial API (no key, no limit).
 * Server-side proxy bypasses CORS restrictions.
 */
translateRouter.post('/translate', async (req, res, next) => {
  try {
    const { text, from = 'en', to = 'zh-CN' } = req.body ?? {}
    if (!text || typeof text !== 'string') throw new HttpError(400, 'text required')
    if (text.length > 2000) throw new HttpError(400, 'text too long (max 2000 chars)')

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`

    const ctrl = AbortSignal.timeout(8000)
    const resp = await fetch(url, { signal: ctrl })
    if (!resp.ok) throw new HttpError(502, `Google Translate returned ${resp.status}`)

    const data = await resp.json()
    // Response format: [[["translated","original",...],...],...]
    // Extract all translated segments and join
    let translation = ''
    if (Array.isArray(data) && Array.isArray(data[0])) {
      for (const seg of data[0]) {
        if (Array.isArray(seg) && typeof seg[0] === 'string') {
          translation += seg[0]
        }
      }
    }

    if (!translation) throw new HttpError(502, 'No translation returned')

    res.json({ translation })
  } catch (e) {
    next(e)
  }
})
