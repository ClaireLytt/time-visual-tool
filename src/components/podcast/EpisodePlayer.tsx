import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { audioProxyUrl, fetchTranscriptText, requestTranscription, pollTranscription } from '../../api/podcast'
import { translateText, batchTranslateViaBackend, loadTranslationCache, saveTranslationCache } from '../../api/translate'
import { findActiveIndex, formatClock, parseSrt, parseVtt, parseJsonTranscript } from '../../utils/transcript'
import WordPopover from './WordPopover'
import GapFillGame from './GapFillGame'
import TypeFillGame from './TypeFillGame'
import TypingPractice from './TypingPractice'
import EpisodeWordList from './EpisodeWordList'
import type { Episode } from '../../types/podcast'
import type { Segment, JobStatus } from '../../types/podcast'

interface EpisodePlayerProps {
  episode: Episode
  onBack: () => void
  onWordLookup?: (word: string) => void
  onSaveSentence?: (text: string, episodeTitle: string, timestamp: number) => void
  onRemoveSentence?: (text: string, episodeTitle: string) => void
  savedSentences?: Set<string>
  /** Batch-add words from transcript */
  onExtractWords?: (words: string[]) => void
  /** Remove a word from history */
  onRemoveWord?: (word: string) => void
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

export default function EpisodePlayer({ episode, onBack, onWordLookup, onSaveSentence, onRemoveSentence, savedSentences, onExtractWords, onRemoveWord }: EpisodePlayerProps) {
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
  // Word-tap dictionary popup
  const [selectedWord, setSelectedWord] = useState<{ word: string; rect: DOMRect; sentence: string; segStart: number } | null>(null)
  const closePopover = useCallback(() => setSelectedWord(null), [])
  const isPopoverOpen = selectedWord !== null

  // Subtitle display mode
  const [subtitleMode, setSubtitleMode] = useState<'en' | 'bilingual'>('en')

  // Bilingual translation — user-triggered, with progress bar
  const translationCache = useRef<Map<string, string>>(new Map())
  const [translationVersion, setTranslationVersion] = useState(0)
  const [translationLoading, setTranslationLoading] = useState(false)
  const [translationProgress, setTranslationProgress] = useState({ done: 0, total: 0 })
  const [translationStarted, setTranslationStarted] = useState(false)

  // Game mode
  const [gameMode, setGameMode] = useState<'none' | 'gapfill' | 'typefill' | 'typing'>('none')

  // Episode word list overlay
  const [showEpisodeWords, setShowEpisodeWords] = useState(false)

  // Dictation clip mode: select a segment range and loop-play it
  const [clipMode, setClipMode] = useState(false)
  const [clipStart, setClipStart] = useState<number | null>(null)
  const [clipEnd, setClipEnd] = useState<number | null>(null)

  // Loop playback within clip range using a tight rAF loop for smooth looping
  useEffect(() => {
    if (!clipMode || clipStart == null || clipEnd == null) return
    const audio = audioRef.current
    if (!audio) return
    let rafId: number
    const check = () => {
      if (audio.currentTime >= clipEnd) {
        audio.currentTime = clipStart
      }
      rafId = requestAnimationFrame(check)
    }
    rafId = requestAnimationFrame(check)
    return () => cancelAnimationFrame(rafId)
  }, [clipMode, clipStart, clipEnd])

  /** Extract unique words from all transcript segments */
  const extractAllWords = useCallback(() => {
    if (segments.length === 0) return
    const wordSet = new Set<string>()
    for (const seg of segments) {
      for (const token of seg.text.split(/\s+/)) {
        const clean = token.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '').toLowerCase()
        if (clean && clean.length > 1 && /[a-zA-Z]/.test(clean)) wordSet.add(clean)
      }
    }
    // Filter out very common words (top 50 English)
    const stopWords = new Set(['the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your'])
    const words = [...wordSet].filter(w => !stopWords.has(w))
    onExtractWords?.(words)
  }, [segments, onExtractWords])

  // Dismiss popover — only on Escape key or explicit close button (in WordPopover).
  // Double-clicking another word naturally replaces selectedWord (no dismiss needed).
  // This avoids all mousedown/click race conditions with double-click.
  useEffect(() => {
    if (!isPopoverOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedWord(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isPopoverOpen])

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
    /* eslint-disable react-hooks/set-state-in-effect -- intentional state resets before async transcript load */
    setTranscriptLoading(true)
    setTranscriptError(null)
    setAsrStatus(null)
    setAsrElapsed(0)
    /* eslint-enable react-hooks/set-state-in-effect */
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

  // Load cached translations from localStorage on mount (instant, no network)
  useEffect(() => {
    if (segments.length === 0) return
    const cached = loadTranslationCache(episode.id)
    if (cached.size > 0) {
      for (const [k, v] of cached) translationCache.current.set(k, v)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTranslationVersion(v => v + 1)
      // If all segments are already cached, mark as started (show translations)
      const allCached = segments.every(s => cached.has(s.text))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (allCached) setTranslationStarted(true)
    }
  }, [segments, episode.id])

  // Translate segments when user clicks "Start Translation" button
  useEffect(() => {
    if (!translationStarted || segments.length === 0) return
    const uncached = segments.filter(s => !translationCache.current.has(s.text))
    if (uncached.length === 0) return // fully cached, nothing to do
    let cancelled = false

    setTranslationLoading(true)
    setTranslationProgress({ done: 0, total: uncached.length })

    // Try batch via backend first (Bing, one request per 30 segments)
    // Falls back to one-by-one (Lingva/MyMemory) if backend is down
    ;(async () => {
      const texts = uncached.map(s => s.text)
      let done = 0
      let backendWorked = true

      for (let i = 0; i < texts.length; i += 30) {
        if (cancelled) break
        const chunk = texts.slice(i, i + 30)

        if (backendWorked) {
          const results = await batchTranslateViaBackend(chunk)
          const anySuccess = results.some(r => !!r)
          if (anySuccess) {
            for (let j = 0; j < chunk.length; j++) {
              if (results[j]) translationCache.current.set(chunk[j], results[j]!)
              done++
            }
            if (!cancelled) {
              setTranslationProgress({ done, total: texts.length })
              setTranslationVersion(v => v + 1)
            }
          } else {
            backendWorked = false // don't increment done, fall through
          }
        }

        if (!backendWorked) {
          for (let j = i; j < Math.min(i + 30, texts.length); j++) {
            if (cancelled) break
            if (!translationCache.current.has(texts[j])) {
              const result = await translateText(texts[j])
              if (result && !cancelled) translationCache.current.set(texts[j], result)
            }
            done++
            if (!cancelled) setTranslationProgress({ done, total: texts.length })
          }
          if (!cancelled) setTranslationVersion(v => v + 1)
        }
      }

      if (!cancelled) {
        setTranslationLoading(false)
        setTranslationVersion(v => v + 1)
        saveTranslationCache(episode.id, translationCache.current)
      }
    })()

    return () => { cancelled = true }
  }, [translationStarted, segments, episode.id])

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


  return (
    <div className="space-y-4">
      <button
        onClick={(e) => { e.stopPropagation(); onBack() }}
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

      {/* View episode words button */}
      <button
        onClick={() => setShowEpisodeWords(true)}
        className="text-xs text-mode-podcast hover:text-mode-podcast/80 transition-colors"
      >
        📚 {t('episodeWords.viewAll')}
      </button>

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

          {/* Speed dropdown */}
          <select
            value={playbackRate}
            onChange={e => setPlaybackRate(Number(e.target.value))}
            className="shrink-0 px-2 py-1 rounded-lg text-xs font-bold tabular-nums bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-w-[3.5rem] text-center border-none focus:outline-none focus:ring-2 focus:ring-mode-podcast/30"
          >
            {SPEED_OPTIONS.map(s => (
              <option key={s} value={s}>{s}x</option>
            ))}
          </select>
        </div>

        {audioError && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            ⚠ {audioError}
          </div>
        )}
      </div>

      {/* Transcript */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              {t('podcast.transcript')}
            </p>
            {/* Bilingual toggle */}
            {segments.length > 0 && !translationStarted && (
              <button
                onClick={() => { setTranslationStarted(true); setSubtitleMode('bilingual') }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-mode-podcast/10 text-mode-podcast hover:bg-mode-podcast/20 transition-colors"
              >
                🌐 {t('podcast.startTranslation')}
              </button>
            )}
            {segments.length > 0 && translationStarted && (
              <button
                onClick={() => setSubtitleMode(prev => prev === 'bilingual' ? 'en' : 'bilingual')}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                  subtitleMode === 'bilingual'
                    ? 'bg-mode-podcast text-white'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                }`}
              >
                🌐 {subtitleMode === 'bilingual' ? t('podcast.subtitleEn') : t('podcast.subtitleBilingual')}
              </button>
            )}
          </div>
          {/* Toolbar buttons */}
          {segments.length > 0 && (
            <div className="flex items-center gap-1.5">
              {/* Extract all words */}
              <button
                onClick={extractAllWords}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-mode-podcast/10 text-mode-podcast hover:bg-mode-podcast/20 transition-colors"
                title={t('podcast.extractWords')}
              >
                📝 {t('podcast.extractWords')}
              </button>
              {/* Dictation clip toggle */}
              <button
                onClick={() => {
                  if (clipMode) {
                    setClipMode(false)
                    setClipStart(null)
                    setClipEnd(null)
                  } else {
                    setClipMode(true)
                  }
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                  clipMode
                    ? 'bg-mode-podcast text-white'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={t('podcast.dictationClip')}
              >
                🎧 {t('podcast.dictationClip')}
              </button>
              {/* Gap fill game */}
              <button
                onClick={() => setGameMode('gapfill')}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                  gameMode === 'gapfill'
                    ? 'bg-mode-podcast text-white'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🎮 {t('game.gapFill')}
              </button>
              {/* Type fill game */}
              <button
                onClick={() => setGameMode('typefill')}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                  gameMode === 'typefill'
                    ? 'bg-mode-podcast text-white'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ⌨️ {t('game.typeFill')}
              </button>
              {/* Typing practice */}
              <button
                onClick={() => setGameMode('typing')}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                  gameMode === 'typing'
                    ? 'bg-mode-podcast text-white'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ✍️ {t('typing.title')}
              </button>
            </div>
          )}
        </div>

        {/* Clip mode instructions */}
        {clipMode && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-mode-podcast/10 text-sm text-mode-podcast">
            {clipStart == null
              ? t('podcast.clipSelectStart')
              : clipEnd == null
                ? t('podcast.clipSelectEnd')
                : `${t('podcast.clipActive')} ${formatClock(clipStart)} → ${formatClock(clipEnd)}`
            }
            {clipStart != null && clipEnd != null && (
              <button
                onClick={() => { setClipStart(null); setClipEnd(null) }}
                className="ml-2 underline text-xs"
              >
                {t('podcast.clipReset')}
              </button>
            )}
          </div>
        )}

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

        {/* Translation progress bar */}
        {translationLoading && translationProgress.total > 0 && (
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>🌐 {t('podcast.translating')}</span>
              <span className="tabular-nums">{translationProgress.done}/{translationProgress.total}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-mode-podcast rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.round((translationProgress.done / translationProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Game mode — render game component instead of transcript */}
        {gameMode === 'gapfill' && segments.length > 0 && (
          <GapFillGame
            segments={segments}
            audioRef={audioRef}
            onExit={() => setGameMode('none')}
            onAddToVocab={onWordLookup}
          />
        )}
        {gameMode === 'typefill' && segments.length > 0 && (
          <TypeFillGame
            segments={segments}
            audioRef={audioRef}
            onExit={() => setGameMode('none')}
            onAddToVocab={onWordLookup}
          />
        )}
        {gameMode === 'typing' && segments.length > 0 && (
          <TypingPractice
            segments={segments}
            audioRef={audioRef}
            onExit={() => setGameMode('none')}
            onAddToVocab={onWordLookup}
          />
        )}

        {/* Transcript lines — clickable words + sentence bookmark */}
        {gameMode === 'none' && segments.length > 0 && (
          <div className="max-h-[28rem] overflow-y-auto space-y-1.5">
            {segments.map((seg, i) => {
              const inClip = clipMode && clipStart != null && clipEnd != null &&
                seg.start >= clipStart && seg.end <= clipEnd
              return (
              <div
                key={i}
                ref={i === activeIndex ? activeRef : undefined}
                className={`group flex flex-wrap items-start gap-1 px-3 py-2 rounded-lg transition-colors ${
                  inClip
                    ? 'bg-mode-podcast/20 ring-1 ring-mode-podcast/30 text-gray-900 dark:text-gray-100'
                    : i === activeIndex
                      ? 'bg-mode-podcast/15 text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {/* Timestamp — click seeks audio, or selects clip boundary */}
                <button
                  onClick={() => {
                    if (clipMode) {
                      if (clipStart == null) { setClipStart(seg.start); seekTo(seg.start) }
                      else if (clipEnd == null) { setClipEnd(seg.end); seekTo(clipStart) }
                      else {
                        // Both set — reset and start new selection from this segment
                        setClipStart(seg.start); setClipEnd(null); seekTo(seg.start)
                      }
                    } else {
                      closePopover(); seekTo(seg.start)
                    }
                  }}
                  className={`text-xs tabular-nums mr-1.5 mt-1 shrink-0 transition-colors ${
                    clipMode ? 'text-mode-podcast hover:text-mode-podcast font-medium' : 'text-gray-400 dark:text-gray-500 hover:text-mode-podcast'
                  }`}
                >
                  {formatClock(seg.start)}
                </button>

                {/* Words — each word is tappable for dictionary lookup */}
                <span className="text-base leading-relaxed flex-1">
                  {seg.text.split(/(\s+)/).map((token, j) => {
                    if (/^\s+$/.test(token)) return token
                    if (!token) return null
                    // Check if this token contains any letters
                    const hasLetters = /[a-zA-Z]/.test(token)
                    if (!hasLetters) return <span key={j}>{token}</span>
                    const openWord = (el: HTMLElement) => {
                      const clean = token.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '')
                      if (!clean) return
                      setSelectedWord({ word: clean, rect: el.getBoundingClientRect(), sentence: seg.text, segStart: seg.start })
                    }
                    return (
                      <span
                        key={j}
                        onClick={(e) => {
                          e.stopPropagation()
                          openWord(e.currentTarget)
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          openWord(e.currentTarget)
                        }}
                        className="hover:bg-mode-podcast/20 active:bg-mode-podcast/30 rounded px-0.5 cursor-pointer transition-colors"
                        style={{ touchAction: 'manipulation' }}
                      >
                        {token}
                      </span>
                    )
                  })}
                </span>

                {/* Bookmark sentence button -- toggle save/remove */}
                {(() => {
                  const isSaved = savedSentences?.has(seg.text) ?? false
                  return (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isSaved) {
                          onRemoveSentence?.(seg.text, episode.title)
                        } else {
                          onSaveSentence?.(seg.text, episode.title, seg.start)
                        }
                      }}
                      className={`mt-1 shrink-0 transition-all ${
                        isSaved
                          ? 'text-yellow-500 dark:text-yellow-400 opacity-100'
                          : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-yellow-500 dark:hover:text-yellow-400'
                      }`}
                      title={isSaved ? t('podcast.unsaveSentence') : t('podcast.saveSentence')}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                        fill={isSaved ? 'currentColor' : 'none'}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                      </svg>
                    </button>
                  )
                })()}

                {/* Bilingual translation */}
                {subtitleMode === 'bilingual' && translationVersion >= 0 && (() => {
                  const cached = translationCache.current.get(seg.text)
                  if (cached) {
                    return (
                      <p className="w-full text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed pl-12">
                        {cached}
                      </p>
                    )
                  }
                  if (translationLoading) {
                    return (
                      <p className="w-full text-[10px] text-gray-300 dark:text-gray-600 mt-0.5 pl-12">
                        ...
                      </p>
                    )
                  }
                  return null
                })()}
              </div>
              )
            })}
          </div>
        )}

        {/* Dictionary popover — rendered via portal to body so it is NOT
            clipped by the transcript's overflow-y-auto container. */}
        {selectedWord && createPortal(
          <WordPopover
            word={selectedWord.word}
            anchorRect={selectedWord.rect}
            onClose={closePopover}
            onLookup={onWordLookup}
            onAddToVocab={onWordLookup}
            onRemoveFromVocab={onRemoveWord}
            onSaveSentence={() => onSaveSentence?.(selectedWord.sentence, episode.title, selectedWord.segStart)}
            isSentenceSaved={savedSentences?.has(selectedWord.sentence) ?? false}
            sentenceContext={selectedWord.sentence}
          />,
          document.body,
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

      {/* Episode word list overlay */}
      {showEpisodeWords && (
        <div className="panel p-4">
          <EpisodeWordList
            episodeId={episode.id}
            episodeTitle={episode.title}
            onClose={() => setShowEpisodeWords(false)}
            onRemoveWord={onRemoveWord}
          />
        </div>
      )}
    </div>
  )
}
