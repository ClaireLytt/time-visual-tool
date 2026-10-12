import { Router } from 'express'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchOk, HttpError } from '../http.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_DIR = join(__dirname, '..', '..', 'data', 'youtube-transcripts')

export const youtubeRouter = Router()

/* ── helpers ─────────────────────────────────────────── */

const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'])

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (!YT_HOSTS.has(u.hostname)) return null
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null
    if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

/* ── GET /youtube/info ───────────────────────────────── */

youtubeRouter.get('/youtube/info', async (req, res, next) => {
  try {
    const raw = String(req.query.url ?? '').trim()
    if (!raw) throw new HttpError(400, 'missing url param')

    const videoId = extractVideoId(raw)
    if (!videoId) throw new HttpError(400, 'invalid YouTube URL')

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
    const data = (await (await fetchOk(oembedUrl)).json()) as Record<string, unknown>

    res.json({
      videoId,
      title: data.title ?? '',
      channelName: data.author_name ?? '',
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    })
  } catch (e) {
    next(e)
  }
})

/* ── GET /youtube/transcript ─────────────────────────── */

youtubeRouter.get('/youtube/transcript', async (req, res, next) => {
  try {
    const videoId = String(req.query.videoId ?? '').trim()
    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      throw new HttpError(400, 'invalid or missing videoId')
    }
    const lang = String(req.query.lang ?? 'en').trim()

    // Check disk cache first
    await mkdir(CACHE_DIR, { recursive: true })
    const cachePath = join(CACHE_DIR, `${videoId}_${lang}.json`)
    try {
      const cached = JSON.parse(await readFile(cachePath, 'utf-8'))
      res.json(cached)
      return
    } catch { /* cache miss, continue */ }

    // Fetch via youtubei.js
    const { Innertube } = await import('youtubei.js')
    const yt = await Innertube.create({ generate_session_locally: true })
    const info = await yt.getInfo(videoId)

    const transcriptInfo = await info.getTranscript()
    const body = transcriptInfo?.transcript?.content?.body
    if (!body || !('initial_segments' in body)) {
      throw new HttpError(404, 'no transcript available for this video')
    }

    const segments = (body.initial_segments ?? [])
      .filter((seg: any) => seg.type === 'TranscriptSegment')
      .map((seg: any) => {
        const startMs = Number(seg.start_ms ?? 0)
        const endMs = Number(seg.end_ms ?? startMs)
        const text = (seg.snippet?.text ?? '').trim()
        return {
          start: startMs / 1000,
          end: endMs / 1000,
          text,
        }
      })
      .filter((s: any) => s.text.length > 0)

    if (segments.length === 0) {
      throw new HttpError(404, 'transcript is empty')
    }

    const result = { videoId, language: lang, segments }

    // Cache to disk
    writeFile(cachePath, JSON.stringify(result, null, 2)).catch(() => {})

    res.json(result)
  } catch (e) {
    next(e)
  }
})
