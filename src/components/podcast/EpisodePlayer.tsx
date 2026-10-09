import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { audioProxyUrl, fetchTranscriptText, requestTranscription, pollTranscription } from '../../api/podcast'
import { findActiveIndex, formatClock, parseSrt, parseVtt, parseJsonTranscript } from '../../utils/transcript'
import type { Episode } from '../../types/podcast'
import type { Segment, JobStatus } from '../../types/podcast'

interface EpisodePlayerProps {
  episode: Episode
  onBack: () => void
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2]

/** Map MediaError.code to a human-readable description */
function describeMediaError(code: number): string {
  switch (code) {
    case 1: return 'MEDIA_ERR_ABORTED'
    case 2: return 'MEDIA_ERR_NETWORK'
    case 3: return 'MEDIA_ERR_DECODE'
    case 4: return 'MEDIA_ERR_SRC_NOT_SUPPORTED'
    default: return `MEDIA_ERR_${code}`
  }
}

export default function EpisodePlayer({ episode, onBack }: EpisodePlayerProps) {
  const { t } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(episode.duration ?? 0)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [audioSrc, setAudioSrc] = useState(() => audioProxyUrl(episode.audioUrl))
  const triedDirectRef = useRef(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  const [segments, setSegments] = useState<Segment[]>([])
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [transcriptError, setTranscriptError] = useState<string | null>(null)
  const [asrStatus, setAsrStatus] = useState<JobStatus | null>(null)
  // User must click "Load transcript" to start — not auto-loaded
  const [transcriptRequested, setTranscriptRequested] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  // Elapsed time tracking for transcript generation
  const [asrElapsed, setAsrElapsed] = useState(0)
  const asrTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── Load transcript on demand ───
  useEffect(() => {
    if (!transcriptRequested) return

    abortRef.current?.abort()
    if (asrTimerRef.current) clearInterval(asrTimerRef.current)
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setTranscriptLoading(true)
    setTranscriptError(null)
    setAsrStatus(null)
    setAsrElapsed(0)
    // Start elapsed timer
    const t0 = Date.now()
    asrTimerRef.current = setInterval(() => setAsrElapsed(Math.floor((Date.now() - t0) / 1000)), 1000)

    const load = async () => {
      // 1. Try RSS-embedded transcript
      if (episode.transcript) {
        try {
          const raw = await fetchTranscriptText(episode.transcript.url, ctrl.signal)
          let parsed: Segment[]
          switch (episode.transcript.type) {
            case 'srt': parsed = parseSrt(raw); break
            case 'vtt': parsed = parseVtt(raw); break
            case 'json': parsed = parseJsonTranscript(raw); break
            default: parsed = []
          }
          if (parsed.length > 0) {
            setSegments(parsed)
            setTranscriptLoading(false)
            return
          }
        } catch {
          // RSS transcript failed — fall through to ASR
        }
      }

      // 2. Fall back to Whisper ASR
      try {
        const job = await requestTranscription(episode.audioUrl, episode.id, ctrl.signal)
        if (job.segments && job.segments.length > 0) {
          setSegments(job.segments)
          setTranscriptLoading(false)
          return
        }
        setAsrStatus(job.status)
        for (;;) {
          if (ctrl.signal.aborted) return
          await new Promise(r => setTimeout(r, 3000))
          if (ctrl.signal.aborted) return
          const status = await pollTranscription(episode.id, ctrl.signal)
          setAsrStatus(status.status)
          if (status.status === 'done' && status.segments) {
            setSegments(status.segments)
            setTranscriptLoading(false)
            return
          }
          if (status.status === 'failed') {
            setTranscriptError(status.error ?? t('podcast.asrFailed'))
            setTranscriptLoading(false)
            return
          }
        }
      } catch (err) {
        if (ctrl.signal.aborted) return
        const msg = (err as Error).message ?? ''
        if (msg.includes('404') || msg.includes('503')) {
          setTranscriptLoading(false)
          return
        }
        setTranscriptError(msg)
        setTranscriptLoading(false)
      }
    }

    load().finally(() => {
      if (asrTimerRef.current) { clearInterval(asrTimerRef.current); asrTimerRef.current = null }
    })
    return () => {
      ctrl.abort()
      if (asrTimerRef.current) { clearInterval(asrTimerRef.current); asrTimerRef.current = null }
    }
  }, [transcriptRequested, episode.transcript, episode.audioUrl, episode.id, t])

  // ─── Audio event listeners ───
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => setCurrentTime(audio.currentTime)
    const onDur = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration)
    }
    const onPlay = () => { setPlaying(true); setAudioError(null) }
    const onPause = () => setPlaying(false)
    const onError = () => {
      const code = audio.error?.code ?? 0
      if (!triedDirectRef.current) {
        triedDirectRef.current = true
        setAudioSrc(episode.audioUrl)
        return
      }
      setAudioError(t('podcast.audioFormatError', {
        detail: describeMediaError(code),
      }))
      setPlaying(false)
    }
    const onCanPlay = () => setAudioError(null)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('durationchange', onDur)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    audio.addEventListener('canplay', onCanPlay)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('durationchange', onDur)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('canplay', onCanPlay)
    }
  }, [t, episode.audioUrl])

  // Sync playback rate to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  // Auto-scroll active subtitle into view
  const activeIndex = findActiveIndex(segments, currentTime)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (audio.paused) await audio.play()
      else audio.pause()
    } catch {
      setAudioError(t('podcast.audioPlayFailed'))
    }
  }, [t])

  const seekTo = useCallback(async (time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    try {
      if (audio.paused) await audio.play()
    } catch { /* seek ok, play blocked — not critical */ }
  }, [])

  const skip = useCallback((delta: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + delta, duration))
  }, [duration])

  const onSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (audio) audio.currentTime = Number(e.target.value)
  }, [])

  const cycleSpeed = useCallback(() => {
    setPlaybackRate(prev => {
      const idx = SPEED_OPTIONS.indexOf(prev)
      return SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]
    })
  }, [])

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        ‹ {t('podcast.back')}
      </button>

      {/* Episode info */}
      <div className="panel p-4">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{episode.title}</p>
        {episode.pubDate && (
          <p className="text-xs text-gray-400 mt-1">{new Date(episode.pubDate).toLocaleDateString()}</p>
        )}
      </div>

      {/* Audio player */}
      <div className="panel p-4 space-y-3">
        <audio ref={audioRef} src={audioSrc} preload="auto" />

        <div className="flex items-center gap-3">
          {/* Skip back */}
          <button
            onClick={() => skip(-15)}
            className="w-8 h-8 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center shrink-0 text-xs font-bold"
            aria-label="-15s"
          >
            -15
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-mode-podcast text-white flex items-center justify-center shrink-0 hover:opacity-90"
            aria-label={playing ? t('podcast.pause') : t('podcast.play')}
          >
            {playing ? '⏸' : '▶'}
          </button>

          {/* Skip forward */}
          <button
            onClick={() => skip(15)}
            className="w-8 h-8 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center shrink-0 text-xs font-bold"
            aria-label="+15s"
          >
            +15
          </button>

          {/* Progress bar */}
          <div className="flex-1 min-w-0">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={1}
              value={currentTime}
              onChange={onSeek}
              className="w-full accent-mode-podcast"
            />
            <div className="flex justify-between text-xs text-gray-400 tabular-nums mt-0.5">
              <span>{formatClock(currentTime)}</span>
              <span>{formatClock(duration)}</span>
            </div>
          </div>

          {/* Speed button */}
          <button
            onClick={cycleSpeed}
            className="shrink-0 px-2 py-1 rounded-lg text-xs font-bold tabular-nums bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-w-[3rem] text-center"
            aria-label={`Speed ${playbackRate}x`}
          >
            {playbackRate}x
          </button>
        </div>

        {audioError && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            ⚠ {audioError}
          </div>
        )}
      </div>

      {/* Transcript */}
      <div className="panel p-4">
        <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('podcast.transcript')}
        </p>

        {/* Not requested yet — show load button with duration warning */}
        {!transcriptRequested && segments.length === 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setTranscriptRequested(true)}
              className="w-full py-3 rounded-xl bg-mode-podcast/10 text-mode-podcast font-medium text-sm hover:bg-mode-podcast/20 transition-colors"
            >
              📝 {t('podcast.loadTranscript')}
            </button>
            {(episode.duration ?? 0) > 600 && (
              <p className="text-xs text-gray-400 text-center">
                {t('podcast.longEpisodeHint', { mins: Math.round((episode.duration ?? 0) / 60) })}
              </p>
            )}
          </div>
        )}

        {/* Loading with real elapsed time */}
        {transcriptLoading && (() => {
          const elapsedMin = Math.floor(asrElapsed / 60)
          const elapsedSec = asrElapsed % 60
          const elapsedStr = elapsedMin > 0
            ? `${elapsedMin}:${String(elapsedSec).padStart(2, '0')}`
            : `${elapsedSec}s`
          // Rough estimate: ~1min per 5min of audio on CPU base model
          const audioDur = episode.duration ?? 0
          const estimateSec = Math.max(30, Math.round(audioDur / 5))
          const pct = asrStatus === 'transcribing'
            ? Math.min(95, Math.round((asrElapsed / estimateSec) * 100))
            : asrStatus === 'queued' ? 10 : 5
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-mode-podcast border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {asrStatus === 'queued' && t('podcast.asrQueued')}
                    {asrStatus === 'transcribing' && t('podcast.asrTranscribing')}
                    {!asrStatus && t('podcast.transcriptLoading')}
                  </p>
                </div>
                <span className="text-xs text-gray-400 tabular-nums">{elapsedStr}</span>
              </div>
              {/* Real progress bar */}
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-mode-podcast rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {asrStatus === 'transcribing' && audioDur > 300 && (
                <p className="text-xs text-gray-400">
                  {t('podcast.asrEstimate', { mins: Math.ceil(estimateSec / 60) })}
                </p>
              )}
            </div>
          )
        })()}

        {/* Transcript lines — larger text */}
        {segments.length > 0 && (
          <div className="max-h-[28rem] overflow-y-auto space-y-1.5">
            {segments.map((seg, i) => (
              <div
                key={i}
                ref={i === activeIndex ? activeRef : undefined}
                onClick={() => seekTo(seg.start)}
                className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  i === activeIndex
                    ? 'bg-mode-podcast/15 text-gray-900 dark:text-gray-100 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums mr-2.5">
                  {formatClock(seg.start)}
                </span>
                <span className="text-base leading-relaxed">{seg.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* ASR failed */}
        {!transcriptLoading && transcriptError && segments.length === 0 && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 space-y-2">
            <p>⚠ {transcriptError}</p>
            <button
              onClick={() => { setTranscriptRequested(false); setTranscriptError(null) }}
              className="text-xs text-mode-podcast hover:underline"
            >
              {t('podcast.retry')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
