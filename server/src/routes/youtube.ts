import { Router } from 'express'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fetchOk, HttpError } from '../http.js'

const execFileAsync = promisify(execFile)
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

/** Parse YouTube's json3 caption format into Segment[] */
function parseJson3Captions(json: any): { start: number; end: number; text: string }[] {
  const events = json?.events ?? []
  const segments: { start: number; end: number; text: string }[] = []

  for (const ev of events) {
    if (!ev.segs) continue
    const text = ev.segs.map((s: any) => s.utf8 ?? '').join('').trim()
    if (!text || text === '\n') continue
    const start = (ev.tStartMs ?? 0) / 1000
    const duration = (ev.dDurationMs ?? 0) / 1000
    segments.push({ start, end: start + duration, text })
  }
  return segments
}

/** Parse SRT subtitle format into Segment[] */
function parseSrt(text: string): { start: number; end: number; text: string }[] {
  const segments: { start: number; end: number; text: string }[] = []
  const blocks = text.trim().split(/\n\s*\n/)
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 2) continue
    const timeMatch = lines.find(l => l.includes('-->'))
    if (!timeMatch) continue
    const [startStr, endStr] = timeMatch.split('-->')
    const parseTime = (s: string) => {
      const parts = s.trim().replace(',', '.').split(':')
      if (parts.length === 3) return +parts[0] * 3600 + +parts[1] * 60 + +parts[2]
      if (parts.length === 2) return +parts[0] * 60 + +parts[1]
      return +parts[0]
    }
    const textIdx = lines.indexOf(timeMatch)
    const content = lines.slice(textIdx + 1).join(' ').replace(/<[^>]*>/g, '').trim()
    if (content) segments.push({ start: parseTime(startStr), end: parseTime(endStr), text: content })
  }
  return segments
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

    // Use yt-dlp to download subtitles (handles YouTube auth/bot detection)
    const tmpDir = join(CACHE_DIR, `tmp_${videoId}_${Date.now()}`)
    await mkdir(tmpDir, { recursive: true })

    const ytdlpPath = process.env.YTDLP_PATH || 'yt-dlp'
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || ''

    // Try multiple language variants: en, en-US, en-GB, en-orig
    const langVariants = lang === 'en' ? 'en,en-US,en-GB,en-orig' : lang

    const args = [
      '--js-runtimes', 'node',
      '--skip-download',
      '--write-auto-sub',
      '--write-sub',
      '--sub-lang', langVariants,
      '--sub-format', 'json3/srt/vtt/best',
      '-o', join(tmpDir, '%(id)s'),
      `https://www.youtube.com/watch?v=${videoId}`,
    ]

    if (proxy) args.unshift('--proxy', proxy)

    // Add cookies from browser if YTDLP_COOKIES_BROWSER is set (e.g. "chrome", "edge")
    const cookiesBrowser = process.env.YTDLP_COOKIES_BROWSER
    if (cookiesBrowser) {
      args.unshift('--cookies-from-browser', cookiesBrowser)
    }
    // Or use a cookies file if YTDLP_COOKIES_FILE is set
    const cookiesFile = process.env.YTDLP_COOKIES_FILE
    if (cookiesFile && !cookiesBrowser) {
      args.unshift('--cookies', cookiesFile)
    }

    try {
      await execFileAsync(ytdlpPath, args, { timeout: 30_000 })
    } catch (e: any) {
      const msg = e.stderr || e.message || ''
      if (msg.includes('Sign in to confirm')) {
        throw new HttpError(403, 'YouTube requires authentication. Set YTDLP_COOKIES_BROWSER or YTDLP_COOKIES_FILE in server/.env')
      }
      throw new HttpError(502, `yt-dlp error: ${msg.substring(0, 200)}`)
    }

    // Find the downloaded subtitle file
    const { readdir } = await import('node:fs/promises')
    const files = await readdir(tmpDir)
    const subFile = files.find(f => f.includes(videoId) && /\.(json3|srt|vtt)$/i.test(f))

    if (!subFile) {
      await rm(tmpDir, { recursive: true, force: true })
      throw new HttpError(404, 'no subtitles available for this video')
    }

    const subContent = await readFile(join(tmpDir, subFile), 'utf-8')
    let segments: { start: number; end: number; text: string }[]

    if (subFile.endsWith('.json3')) {
      segments = parseJson3Captions(JSON.parse(subContent))
    } else {
      segments = parseSrt(subContent)
    }

    // Cleanup temp dir
    await rm(tmpDir, { recursive: true, force: true })

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
