import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { writeFile, unlink, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Router } from 'express'
import { assertHttpUrl, fetchOk, HttpError } from '../http.js'
import type { Segment } from '../types.js'

export const transcribeRouter = Router()

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCRIPTS_DIR = join(__dirname, '..', '..', 'scripts')
const TEMP_DIR = join(__dirname, '..', '..', 'data', 'tmp')
const CACHE_DIR = join(__dirname, '..', '..', 'data', 'transcripts')

// In-memory cache: episodeId → { status, segments?, error? }
interface Job {
  status: 'queued' | 'transcribing' | 'done' | 'failed'
  segments?: Segment[]
  language?: string
  error?: string
}
const jobs = new Map<string, Job>()

/** Sanitize an id so it is safe for use in file paths and shell arguments */
function sanitizeId(raw: string): string {
  // Strip path separators and non-alphanumeric chars (keep - _ .)
  return raw.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 128)
}

function deriveId(audioUrl: string, episodeId?: string): string {
  if (episodeId) return sanitizeId(episodeId)
  return createHash('sha1').update(audioUrl).digest('hex').slice(0, 16)
}

/** Read cached transcript from disk if available */
async function readCache(id: string): Promise<{ language: string; segments: Segment[] } | null> {
  try {
    const { readFile } = await import('node:fs/promises')
    const data = await readFile(join(CACHE_DIR, `${id}.json`), 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

/** Write transcript result to disk cache */
async function writeCache(id: string, result: { language: string; segments: Segment[] }) {
  try {
    await mkdir(CACHE_DIR, { recursive: true })
    await writeFile(join(CACHE_DIR, `${id}.json`), JSON.stringify(result), 'utf-8')
  } catch (err) {
    console.error('cache write failed:', err)
  }
}

/** Test if a Python command has faster-whisper installed */
async function testPython(cmd: string): Promise<boolean> {
  try {
    return await new Promise<boolean>(resolve => {
      const p = spawn(cmd, ['-c', 'from faster_whisper import WhisperModel; print("ok")'], {
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      let out = ''
      p.stdout.on('data', (d: Buffer) => { out += d.toString() })
      p.on('error', () => resolve(false))
      p.on('close', code => resolve(code === 0 && out.includes('ok')))
    })
  } catch { return false }
}

/** Find a Python that has faster-whisper installed */
async function findPython(): Promise<string> {
  // 1. Env var override (most reliable)
  if (process.env.PYTHON_PATH) {
    if (await testPython(process.env.PYTHON_PATH)) {
      console.log(`Using PYTHON_PATH: ${process.env.PYTHON_PATH}`)
      return process.env.PYTHON_PATH
    }
    console.warn(`PYTHON_PATH=${process.env.PYTHON_PATH} does not have faster-whisper, trying others...`)
  }

  // 2. Common names on PATH
  for (const cmd of ['python3', 'python', 'py']) {
    if (await testPython(cmd)) {
      console.log(`Using Python: ${cmd}`)
      return cmd
    }
  }

  // 3. Common absolute paths (Windows conda/miniconda, system python)
  const homedir = process.env.USERPROFILE || process.env.HOME || ''
  const extraPaths = [
    // Miniconda / Anaconda default locations
    'D:\\development\\miniconda\\python.exe',
    join(homedir, 'miniconda3', 'python.exe'),
    join(homedir, 'anaconda3', 'python.exe'),
    join(homedir, 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'python.exe'),
    join(homedir, 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe'),
    // Unix
    '/usr/bin/python3',
    '/usr/local/bin/python3',
  ]
  for (const p of extraPaths) {
    if (await testPython(p)) {
      console.log(`Using Python: ${p}`)
      return p
    }
  }

  throw new Error(
    'No Python with faster-whisper found.\n' +
    'Fix: set PYTHON_PATH in server/.env to your Python executable, e.g.:\n' +
    'PYTHON_PATH=D:\\\\development\\\\miniconda\\\\python.exe'
  )
}

let pythonCmd: string | null = null

/**
 * Run the local faster-whisper transcription script.
 * Downloads audio to a temp file, invokes Python, parses JSON result.
 */
async function runTranscription(id: string, audioUrl: string) {
  const job = jobs.get(id)!
  job.status = 'transcribing'

  // Check disk cache first
  const cached = await readCache(id)
  if (cached) {
    job.status = 'done'
    job.segments = cached.segments
    job.language = cached.language
    return
  }

  let tempFile: string | null = null
  try {
    // Find Python once
    if (!pythonCmd) pythonCmd = await findPython()

    // Download audio to temp file
    await mkdir(TEMP_DIR, { recursive: true })
    const ext = audioUrl.match(/\.(mp3|m4a|wav|ogg|aac|opus)/i)?.[1] ?? 'mp3'
    tempFile = join(TEMP_DIR, `${id}.${ext}`)
    console.log(`Downloading audio for ${id}...`)
    const audioRes = await fetchOk(audioUrl, { timeoutMs: 180_000 }) // 3 min for large files
    const arrayBuf = await audioRes.arrayBuffer()
    await writeFile(tempFile, Buffer.from(arrayBuf))
    console.log(`Downloaded ${Math.round(arrayBuf.byteLength / 1024 / 1024)}MB → ${tempFile}`)

    // Determine model from env or default to 'base'
    const model = process.env.WHISPER_MODEL ?? 'base'
    const device = process.env.WHISPER_DEVICE ?? 'cpu'
    const language = process.env.WHISPER_LANGUAGE ?? ''

    // Spawn Python transcription script
    const scriptPath = join(SCRIPTS_DIR, 'transcribe.py')
    const args = [scriptPath, tempFile, '--model', model, '--device', device]
    if (language) args.push('--language', language)

    const gpuLimit = process.env.WHISPER_GPU_LIMIT ?? ''
    console.log(`Transcribing with ${pythonCmd} (model=${model}, device=${device}${gpuLimit ? `, gpu_limit=${gpuLimit}%` : ''})...`)
    const result = await new Promise<string>((resolve, reject) => {
      const env = { ...process.env, WHISPER_GPU_LIMIT: gpuLimit }
      const proc = spawn(pythonCmd!, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env,
      })
      let stdout = ''
      let stderr = ''
      proc.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
      proc.stderr.on('data', (d: Buffer) => {
        stderr += d.toString()
        // Stream progress to server console
        const lines = d.toString().split('\n').filter(Boolean)
        for (const line of lines) console.log(`  [whisper] ${line}`)
      })
      proc.on('error', err => reject(new Error(`Failed to start Python: ${err.message}`)))
      proc.on('close', code => {
        if (code === 0) resolve(stdout)
        else reject(new Error(stderr || `Python exited with code ${code}`))
      })
    })

    // Parse the JSON output
    const parsed = JSON.parse(result)
    if (!parsed.success) {
      job.status = 'failed'
      const detail = parsed.traceback
        ? `${parsed.error}\n\n${parsed.traceback}`
        : (parsed.error ?? 'Transcription failed')
      job.error = detail
      console.error(`[whisper] Transcription failed for ${id}:\n${detail}`)
      return
    }

    const segments: Segment[] = (parsed.segments ?? []).map((s: any) => ({
      start: s.start,
      end: s.end,
      text: (s.text ?? '').trim(),
    }))

    job.status = 'done'
    job.segments = segments
    job.language = parsed.language

    // Cache to disk
    await writeCache(id, { language: parsed.language, segments })
  } catch (err) {
    job.status = 'failed'
    job.error = (err as Error).message
  } finally {
    // Clean up temp file
    if (tempFile) {
      unlink(tempFile).catch(() => {})
    }
  }
}

/**
 * POST /api/transcribe
 * Body: { audioUrl, episodeId? }
 * Returns: { status, segments?, error? }
 *
 * Cached: if already transcribed, returns segments immediately.
 * Otherwise kicks off a local Whisper job and returns { status: 'queued' }.
 */
transcribeRouter.post('/transcribe', async (req, res, next) => {
  try {
    const { audioUrl, episodeId } = req.body ?? {}
    if (!audioUrl) throw new HttpError(400, 'audioUrl required')
    assertHttpUrl(audioUrl)

    const id = deriveId(audioUrl, episodeId)

    // Check in-memory cache
    const existing = jobs.get(id)
    if (existing) {
      res.json(existing)
      return
    }

    // Check disk cache
    const cached = await readCache(id)
    if (cached) {
      const job: Job = { status: 'done', segments: cached.segments, language: cached.language }
      jobs.set(id, job)
      res.json(job)
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
    const episodeId = req.query.episodeId ? String(req.query.episodeId) : ''
    const audioUrl = req.query.audioUrl ? String(req.query.audioUrl) : ''
    if (!episodeId && !audioUrl) throw new HttpError(400, 'episodeId or audioUrl required')
    const id = deriveId(audioUrl, episodeId || undefined)
    const job = jobs.get(id)
    if (!job) throw new HttpError(404, 'no transcription job for this episode')
    res.json(job)
  } catch (e) {
    next(e)
  }
})
