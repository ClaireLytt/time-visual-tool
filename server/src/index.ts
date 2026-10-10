import 'dotenv/config'
import { readdir, unlink } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import express, { type ErrorRequestHandler } from 'express'
import cors from 'cors'
import { HttpError } from './http.js'
import { searchRouter } from './routes/search.js'
import { episodesRouter } from './routes/episodes.js'
import { audioRouter } from './routes/audio.js'
import { transcriptRouter } from './routes/transcript.js'
import { transcribeRouter } from './routes/transcribe.js'
import { chartsRouter } from './routes/charts.js'
import { dictionaryRouter } from './routes/dictionary.js'
import { translateRouter } from './routes/translate.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', searchRouter)
app.use('/api', episodesRouter)
app.use('/api', audioRouter)
app.use('/api', transcriptRouter)
app.use('/api', transcribeRouter)
app.use('/api', chartsRouter)
app.use('/api', dictionaryRouter)
app.use('/api', translateRouter)

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500
  if (status >= 500) console.error(err)
  if (!res.headersSent) res.status(status).json({ error: err.message ?? 'internal error' })
}
app.use(onError)

// Clean up leftover temp audio files from previous runs
const __dirname = dirname(fileURLToPath(import.meta.url))
const tmpDir = join(__dirname, '..', 'data', 'tmp')
readdir(tmpDir).then(files => {
  let cleaned = 0
  for (const f of files) {
    if (/\.(mp3|m4a|wav|ogg|aac|opus)$/i.test(f)) {
      unlink(join(tmpDir, f)).catch(() => {})
      cleaned++
    }
  }
  if (cleaned) console.log(`Cleaned ${cleaned} leftover temp file(s)`)
}).catch(() => {})

const port = Number(process.env.PORT ?? 8787)
app.listen(port, () => console.log(`podcast server on http://localhost:${port}`))
