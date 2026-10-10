import { Router } from 'express'
import { HttpError } from '../http.js'

export const translateRouter = Router()

/**
 * POST /api/translate
 * Body: { text: string, from?: string, to?: string }
 * Returns: { translation: string }
 *
 * Uses Bing Translator (free, no API key, works in China, no daily limit).
 */
translateRouter.post('/translate', async (req, res, next) => {
  try {
    const { text, from, to = 'zh-Hans' } = req.body ?? {}
    if (!text || typeof text !== 'string') throw new HttpError(400, 'text required')
    if (text.length > 3000) throw new HttpError(400, 'text too long (max 3000 chars)')

    // Dynamic import for ESM compatibility
    const { translate } = await import('bing-translate-api')

    const result = await translate(text, from ?? null, to, false)
    if (!result?.translation) throw new HttpError(502, 'No translation returned')

    res.json({ translation: result.translation })
  } catch (e) {
    if (e instanceof HttpError) return next(e)
    next(new HttpError(502, `Translation failed: ${(e as Error).message}`))
  }
})

/**
 * POST /api/translate/batch
 * Body: { texts: string[], from?: string, to?: string }
 * Returns: { translations: string[] }
 *
 * Batch translate multiple texts in one request (sequential to avoid rate limits).
 */
translateRouter.post('/translate/batch', async (req, res, next) => {
  try {
    const { texts, from, to = 'zh-Hans' } = req.body ?? {}
    if (!Array.isArray(texts) || texts.length === 0) throw new HttpError(400, 'texts array required')
    if (texts.length > 50) throw new HttpError(400, 'max 50 texts per batch')

    const { translate } = await import('bing-translate-api')

    const translations: string[] = []
    for (const text of texts) {
      if (typeof text !== 'string' || !text.trim()) {
        translations.push('')
        continue
      }
      try {
        const result = await translate(text.slice(0, 3000), from ?? null, to, false)
        translations.push(result?.translation ?? '')
      } catch {
        translations.push('') // skip failed segments
      }
    }

    res.json({ translations })
  } catch (e) {
    if (e instanceof HttpError) return next(e)
    next(new HttpError(502, `Batch translation failed: ${(e as Error).message}`))
  }
})
