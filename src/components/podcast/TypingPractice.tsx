import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Segment } from '../../types/podcast'

export interface TypingPracticeProps {
  segments: Segment[]
  audioRef: React.RefObject<HTMLAudioElement | null>
  onExit: () => void
  onAddToVocab?: (word: string) => void
}

interface SegmentResult {
  wpm: number
  accuracy: number
  errors: string[]
}

function normalizeWord(w: string): string {
  return w.replace(/[^a-zA-Z']/g, '').toLowerCase()
}

export default function TypingPractice({ segments, audioRef, onExit, onAddToVocab }: TypingPracticeProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState<SegmentResult[]>([])
  const [greenFlash, setGreenFlash] = useState(false)
  const startTimeRef = useRef(0)

  const seg = segments[currentIndex]
  const refWords = seg?.text.split(/\s+/).filter(Boolean) ?? []
  const inputWords = userInput.trimEnd().split(/\s+/).filter(Boolean)

  // Play the current segment audio
  const playSegment = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !seg) return
    audio.currentTime = seg.start
    audio.play().catch(() => {})
  }, [audioRef, seg])

  // Auto-pause audio at segment end
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !seg) return
    let id: number
    const tick = () => {
      if (audio.currentTime >= seg.end) audio.pause()
      else id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [audioRef, seg])

  // When segment changes, play audio and reset input
  useEffect(() => {
    if (completed) return
    playSegment()
    /* eslint-disable react-hooks/set-state-in-effect -- intentional state resets when segment changes */
    setUserInput('')
    setShowErrors(false)
    /* eslint-enable react-hooks/set-state-in-effect */
    startTimeRef.current = 0
    setTimeout(() => inputRef.current?.focus(), 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!startTimeRef.current) startTimeRef.current = Date.now()
    setUserInput(e.target.value)
    setShowErrors(false)
  }

  const advance = useCallback(() => {
    if (currentIndex + 1 >= segments.length) {
      setCompleted(true)
      audioRef.current?.pause()
    } else {
      setCurrentIndex(i => i + 1)
    }
  }, [currentIndex, segments.length, audioRef])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    // If errors are showing, second Enter advances to next segment
    if (showErrors) { advance(); return }

    // Calculate result for this segment
    /* eslint-disable react-hooks/purity -- event handler, not render */
    const elapsed = startTimeRef.current
      ? (Date.now() - startTimeRef.current) / 60000
      : 1
    /* eslint-enable react-hooks/purity */
    const errors: string[] = []
    let correct = 0
    for (let i = 0; i < refWords.length; i++) {
      if (i < inputWords.length && normalizeWord(inputWords[i]) === normalizeWord(refWords[i])) {
        correct++
      } else {
        errors.push(refWords[i].replace(/[^a-zA-Z']/g, '').toLowerCase())
      }
    }
    const wpm = Math.round(refWords.length / Math.max(elapsed, 0.01))
    const accuracy = refWords.length > 0 ? Math.round((correct / refWords.length) * 100) : 100
    const result: SegmentResult = { wpm, accuracy, errors }
    setResults(prev => [...prev, result])

    if (errors.length === 0 && inputWords.length >= refWords.length) {
      // All correct — green flash then advance
      setGreenFlash(true)
      setTimeout(() => { setGreenFlash(false); advance() }, 500)
    } else {
      setShowErrors(true)
    }
  }

  // ─── Results screen ───
  if (completed) {
    const totalLines = results.length
    const avgWpm = totalLines > 0 ? Math.round(results.reduce((s, r) => s + r.wpm, 0) / totalLines) : 0
    const avgAccuracy = totalLines > 0 ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / totalLines) : 0
    const allErrors = [...new Set(results.flatMap(r => r.errors))]

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {t('typing.complete')}
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-mode-podcast">{totalLines}</p>
            <p className="text-xs text-gray-500">{t('typing.linesCompleted')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-mode-podcast">{avgWpm}</p>
            <p className="text-xs text-gray-500">{t('typing.wpm')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-mode-podcast">{avgAccuracy}%</p>
            <p className="text-xs text-gray-500">{t('typing.accuracy')}</p>
          </div>
        </div>

        {allErrors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('typing.errorWords')}
            </p>
            <div className="flex flex-wrap gap-2">
              {allErrors.map(w => (
                <button
                  key={w}
                  onClick={() => onAddToVocab?.(w)}
                  className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  {w}{' '}
                  <span className="text-xs opacity-60">+ {t('podcast.addToVocab')}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setCurrentIndex(0)
              setCompleted(false)
              setResults([])
              setUserInput('')
              setShowErrors(false)
            }}
            className="flex-1 py-3 rounded-xl bg-mode-podcast text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            {t('typing.practiceAgain')}
          </button>
          <button
            onClick={onExit}
            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t('typing.exit')}
          </button>
        </div>
      </div>
    )
  }

  // ─── Active practice ───
  return (
    <div className={`space-y-4 transition-colors duration-300 ${greenFlash ? 'ring-2 ring-green-400 rounded-xl bg-green-50 dark:bg-green-900/20 p-2' : ''}`}>
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">
          {t('typing.title')} ({currentIndex + 1}/{segments.length})
        </h2>
        <button
          onClick={onExit}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {t('typing.exit')}
        </button>
      </div>

      {/* Reference sentence */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
        <p className="text-lg leading-relaxed text-gray-900 dark:text-gray-100 select-none">
          {seg?.text}
        </p>
      </div>

      {/* Replay button */}
      <button
        onClick={playSegment}
        className="text-xs px-3 py-1.5 rounded-lg bg-mode-podcast/10 text-mode-podcast hover:bg-mode-podcast/20 transition-colors"
      >
        🔊 Replay
      </button>

      {/* Word-by-word comparison display */}
      {inputWords.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-1 text-base leading-relaxed px-1">
          {refWords.map((ref, i) => {
            const typed = inputWords[i]
            if (!typed) {
              return (
                <span key={i} className="text-gray-300 dark:text-gray-600">
                  {ref}
                </span>
              )
            }
            if (normalizeWord(typed) === normalizeWord(ref)) {
              return (
                <span key={i} className="text-green-600 dark:text-green-400">
                  {ref}
                </span>
              )
            }
            return (
              <span key={i} className="inline-flex flex-col items-center leading-tight">
                <span className="text-[10px] text-green-600 dark:text-green-400">{ref}</span>
                <span className="text-red-500 dark:text-red-400 line-through">{typed}</span>
              </span>
            )
          })}
        </div>
      )}

      {/* Typing input */}
      <textarea
        ref={inputRef}
        value={userInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={3}
        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base resize-none focus:outline-none focus:ring-2 focus:ring-mode-podcast/30 focus:border-mode-podcast"
        placeholder={t('typing.pressEnter')}
        autoFocus
      />

      <p className="text-xs text-gray-400 text-center">{t('typing.pressEnter')}</p>
    </div>
  )
}
