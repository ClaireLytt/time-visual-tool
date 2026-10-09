import 'dotenv/config'
import express, { type ErrorRequestHandler } from 'express'
import cors from 'cors'
import { HttpError } from './http.js'
import { searchRouter } from './routes/search.js'
import { episodesRouter } from './routes/episodes.js'
import { audioRouter } from './routes/audio.js'
import { transcriptRouter } from './routes/transcript.js'
import { transcribeRouter } from './routes/transcribe.js'
import { chartsRouter } from './routes/charts.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', searchRouter)
app.use('/api', episodesRouter)
app.use('/api', audioRouter)
app.use('/api', transcriptRouter)
app.use('/api', transcribeRouter)
app.use('/api', chartsRouter)

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500
  if (status >= 500) console.error(err)
  if (!res.headersSent) res.status(status).json({ error: err.message ?? 'internal error' })
}
app.use(onError)

const port = Number(process.env.PORT ?? 8787)
app.listen(port, () => console.log(`podcast server on http://localhost:${port}`))
