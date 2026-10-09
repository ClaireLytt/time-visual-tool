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
  // Track which src is loaded so we can retry with the direct URL
  const [audioSrc, setAudioSrc] = useState(() => audioProxyUrl(episode.audioUrl))
  const triedDirectRef = useRef(false)

  const [segments, setSegments] = useState<Segment[]>([])
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [transcriptError, setTranscriptError] = useState<string | null>(null)
  const [asrStatus, setAsrStatus] = useState<JobStatus | null>(null)

  // ─── Load transcript: RSS-embedded first, then fall back to Whisper ASR ───
  useEffect(() => {
    const ctrl = new AbortController()
    setTranscriptLoading(true)
    setTranscriptError(null)
    setAsrStatus(null)

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
          // Already cached on server
          setSegments(job.segments)
          setTranscriptLoading(false)
          return
        }
        // Poll until done
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
            // ASR task failed (file too large, API error, etc.)
            // Show the reason if available, otherwise generic message
            setTranscriptError(status.error ?? t('podcast.asrFailed'))
            setTranscriptLoading(false)
            return
          }
        }
      } catch (err) {
        if (ctrl.signal.aborted) return
        const msg = (err as Error).message ?? ''
        // 404 = server not restarted; 503 = API key missing
        // These are infrastructure issues → show "no transcript" (gray, not red)
        if (msg.includes('404') || msg.includes('503')) {
          setTranscriptLoading(false)
          return
        }
        // Other errors (network down, unexpected) → show as warning
        setTranscriptError(msg)
        setTranscriptLoading(false)
      }
    }

    load()
    return () => ctrl.abort()
  }, [episode.transcript, episode.audioUrl, episode.id])

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
      // Auto-retry: if proxy failed, try the direct podcast URL
      if (!triedDirectRef.current) {
        triedDirectRef.current = true
        setAudioSrc(episode.audioUrl)
        return
      }
      // Both proxy and direct failed — show friendly message
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

  // Auto-scroll active subtitle into view
  const activeIndex = findActiveIndex(segments, currentTime)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (audio.paused) {
        await audio.play()
      } else {
        audio.pause()
      }
    } catch (err) {
      setAudioError(t('podcast.audioPlayFailed'))
    }
  }, [t])

  const seekTo = useCallback(async (time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    try {
      if (audio.paused) await audio.play()
    } catch {
      // Seek succeeded; play blocked by browser — not critical
    }
  }, [])

  const onSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Number(e.target.value)
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
        {/*
          No crossOrigin — the src is same-origin via the /api proxy.
          crossOrigin="anonymous" would make the browser add Origin headers
          and reject if duplicate CORS headers appear.
        */}
        <audio ref={audioRef} src={audioSrc} preload="auto" />

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-mode-podcast text-white flex items-center justify-center shrink-0 hover:opacity-90"
            aria-label={playing ? t('podcast.pause') : t('podcast.play')}
          >
            {playing ? '⏸' : '▶'}
          </button>

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
        </div>

        {audioError && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            ⚠ {audioError}
          </div>
        )}
      </div>

      {/* Transcript */}
      <div className="panel p-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('podcast.transcript')}
        </p>

        {transcriptLoading && (
          <p className="text-sm text-gray-400">
            {asrStatus === 'queued' && t('podcast.asrQueued')}
            {asrStatus === 'transcribing' && t('podcast.asrTranscribing')}
            {!asrStatus && t('podcast.transcriptLoading')}
          </p>
        )}

        {segments.length > 0 && (
          <div className="max-h-80 overflow-y-auto space-y-1 text-sm">
            {segments.map((seg, i) => (
              <div
                key={i}
                ref={i === activeIndex ? activeRef : undefined}
                onClick={() => seekTo(seg.start)}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  i === activeIndex
                    ? 'bg-mode-podcast/20 text-gray-900 dark:text-gray-100 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-xs text-gray-400 tabular-nums mr-2">{formatClock(seg.start)}</span>
                {seg.text}
              </div>
            ))}
          </div>
        )}

        {/* ASR failed with a specific reason (e.g. file too large) — amber warning */}
        {!transcriptLoading && transcriptError && segments.length === 0 && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            ⚠ {transcriptError}
          </div>
        )}

        {/* No transcript and no error — quiet gray message */}
        {!transcriptLoading && !transcriptError && segments.length === 0 && (
          <p className="text-sm text-gray-400">{t('podcast.noTranscript')}</p>
        )}
      </div>
    </div>
  )
}
