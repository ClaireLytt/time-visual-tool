import { createHash } from 'node:crypto'
import { Router } from 'express'
import OpenAI, { toFile } from 'openai'
import { assertHttpUrl, fetchOk, HttpError } from '../http.js'
import type { Segment } from '../types.js'

export const transcribeRouter = Router()

// In-memory cache: episodeId → { status, segments?, error? }
interface Job {
  status: 'queued' | 'transcribing' | 'done' | 'failed'
  segments?: Segment[]
  error?: string
}
const jobs = new Map<string, Job>()

const MAX_AUDIO_BYTES = 25 * 1024 * 1024 // Whisper API limit

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new HttpError(503, 'OPENAI_API_KEY not configured — add it to server/.env')
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  })
}

function deriveId(audioUrl: string, episodeId?: string): string {
  return episodeId || createHash('sha1').update(audioUrl).digest('hex').slice(0, 16)
}

async function runTranscription(id: string, audioUrl: string) {
  const job = jobs.get(id)!
  job.status = 'transcribing'
  try {
    const openai = getOpenAI()

    // Download audio
    const audioRes = await fetchOk(audioUrl)
    const arrayBuf = await audioRes.arrayBuffer()

    if (arrayBuf.byteLength > MAX_AUDIO_BYTES) {
      job.status = 'failed'
      job.error = `Audio file too large (${Math.round(arrayBuf.byteLength / 1024 / 1024)}MB) — Whisper limit is 25MB`
      return
    }

    // Use SDK's toFile() for Node 18 compatibility (no global File needed)
    const file = await toFile(Buffer.from(arrayBuf), 'episode.mp3', { type: 'audio/mpeg' })

    const result = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    })

    const segments: Segment[] = ((result as any).segments ?? []).map((s: any) => ({
      start: s.start,
      end: s.end,
      text: (s.text ?? '').trim(),
    }))

    job.status = 'done'
    job.segments = segments
  } catch (err) {
    job.status = 'failed'
    job.error = (err as Error).message
  }
}

/**
 * POST /api/transcribe
 * Body: { audioUrl, episodeId? }
 * Returns: { status, segments?, error? }
 *
 * Cached: if already transcribed, returns segments immediately.
 * Otherwise kicks off a Whisper job and returns { status: 'queued' }.
 */
transcribeRouter.post('/transcribe', (req, res, next) => {
  try {
    // Validate API key early so the client gets a clear error
    getOpenAI()

    const { audioUrl, episodeId } = req.body ?? {}
    if (!audioUrl) throw new HttpError(400, 'audioUrl required')
    assertHttpUrl(audioUrl)

    const id = deriveId(audioUrl, episodeId)
    const existing = jobs.get(id)
    if (existing) {
      res.json(existing)
      return
    }

    const job: Job = { status: 'queued' }
    jobs.set(id, job)
    runTranscription(id, audioUrl).catch(() => {})
    res.json(job)
  } catch (e) {
    next(e)
  }
})

/**
 * GET /api/transcribe?episodeId=...
 * Poll the status of a transcription job.
 */
transcribeRouter.get('/transcribe', (req, res, next) => {
  try {
    const episodeId = String(req.query.episodeId ?? '')
    if (!episodeId) throw new HttpError(400, 'episodeId required')
    const job = jobs.get(episodeId)
    if (!job) throw new HttpError(404, 'no transcription job for this episode')
    res.json(job)
  } catch (e) {
    next(e)
  }
})
