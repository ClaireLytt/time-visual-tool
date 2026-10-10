import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generateGaps, collectAllWords } from '../../utils/gapFill'
import { lookupWord } from '../../api/dictionary'
import type { Segment } from '../../types/podcast'
import type { GapWord } from '../../utils/gapFill'

interface TypeFillGameProps {
  segments: Segment[]
  audioRef: React.RefObject<HTMLAudioElement | null>
  onExit: () => void
  onAddToVocab?: (word: string) => void
  difficulty?: 'easy' | 'medium' | 'hard'
}

type GamePhase = 'setup' | 'playing' | 'results'

interface AnswerRecord {
  gap: GapWord
  userAnswer: string
  correct: boolean
  definition: string
  attemptsUsed: number
}

const MAX_RETRIES = 2

export default function TypeFillGame({
  segments,
  audioRef,
  onExit,
  onAddToVocab,
  difficulty: initialDifficulty = 'medium',
}: TypeFillGameProps) {
  const { t } = useTranslation()

  // ─── Setup state ───
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialDifficulty)
  const [phase, setPhase] = useState<GamePhase>('setup')

  // ─── Game state ───
  const [gaps, setGaps] = useState<GapWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_RETRIES)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [feedback, setFeedback] = useState<{ correct: boolean; definition: string; correctWord?: string } | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const activeGapRef = useRef<HTMLSpanElement>(null)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _allWords = useMemo(() => collectAllWords(segments), [segments])

  // Preview gap count for setup screen
  const previewCount = useMemo(() => {
    const preview = generateGaps(segments, { difficulty })
    return preview.length
  }, [segments, difficulty])

  // ─── Start game ───
  const startGame = useCallback(() => {
    const generated = generateGaps(segments, { difficulty })
    if (generated.length === 0) return
    setGaps(generated)
    setCurrentIndex(0)
    setAnswers([])
    setFeedback(null)
    setInputValue('')
    setAttemptsLeft(MAX_RETRIES)
    setPhase('playing')

    // Seek audio to first gap
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, generated[0].startTime - 1)
      audio.play().catch(() => {})
    }
  }, [segments, difficulty, audioRef])

  // ─── Auto-focus input when playing ───
  useEffect(() => {
    if (phase === 'playing' && !feedback) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [phase, currentIndex, feedback])

  // ─── Scroll active gap into view ───
  useEffect(() => {
    if (phase === 'playing' && activeGapRef.current) {
      activeGapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentIndex, phase])

  // ─── Auto-pause audio at gap segment ───
  useEffect(() => {
    if (phase !== 'playing' || gaps.length === 0) return
    const audio = audioRef.current
    if (!audio) return

    const currentGap = gaps[currentIndex]
    if (!currentGap) return

    let rafId: number
    const check = () => {
      if (audio.currentTime >= currentGap.startTime + 0.5 && !audio.paused) {
        audio.pause()
        inputRef.current?.focus()
      }
      rafId = requestAnimationFrame(check)
    }
    rafId = requestAnimationFrame(check)
    return () => cancelAnimationFrame(rafId)
  }, [phase, gaps, currentIndex, audioRef])

  // ─── Move to next gap ───
  const moveToNext = useCallback(() => {
    setFeedback(null)
    setInputValue('')
    setAttemptsLeft(MAX_RETRIES)

    const nextIndex = currentIndex + 1
    if (nextIndex >= gaps.length) {
      setPhase('results')
      const audio = audioRef.current
      if (audio) audio.pause()
      return
    }

    setCurrentIndex(nextIndex)

    // Seek audio to next gap
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, gaps[nextIndex].startTime - 1)
      audio.play().catch(() => {})
    }
  }, [currentIndex, gaps, audioRef])

  // ─── Handle submit ───
  const handleSubmit = useCallback(async () => {
    if (feedback) return
    const currentGap = gaps[currentIndex]
    if (!currentGap) return

    const trimmed = inputValue.trim()
    if (!trimmed) return

    const isCorrect = trimmed.toLowerCase() === currentGap.word.toLowerCase()

    if (isCorrect) {
      setFeedback({ correct: true, definition: '' })
      setAnswers(prev => [...prev, {
        gap: currentGap,
        userAnswer: trimmed,
        correct: true,
        definition: '',
        attemptsUsed: MAX_RETRIES - attemptsLeft,
      }])

      feedbackTimer.current = setTimeout(moveToNext, 1000)
    } else {
      const newAttemptsLeft = attemptsLeft - 1

      if (newAttemptsLeft > 0) {
        // Still has retries
        setAttemptsLeft(newAttemptsLeft)
        setInputValue('')
        // Brief shake feedback
        setFeedback({ correct: false, definition: '', correctWord: undefined })
        feedbackTimer.current = setTimeout(() => {
          setFeedback(null)
          inputRef.current?.focus()
        }, 800)
      } else {
        // No retries left — set feedback immediately to block re-entry
        setFeedback({ correct: false, definition: '', correctWord: currentGap.word })
        setAnswers(prev => [...prev, {
          gap: currentGap,
          userAnswer: trimmed,
          correct: false,
          definition: '',
          attemptsUsed: MAX_RETRIES,
        }])

        // Fetch definition asynchronously, update in place
        lookupWord(currentGap.word).then(result => {
          const def = result?.definitions?.join('; ') ?? ''
          setFeedback(prev => prev ? { ...prev, definition: def } : prev)
          setAnswers(prev => {
            const copy = [...prev]
            const last = copy[copy.length - 1]
            if (last && last.gap.word === currentGap.word) copy[copy.length - 1] = { ...last, definition: def }
            return copy
          })
        })

        feedbackTimer.current = setTimeout(moveToNext, 2500)
      }
    }
  }, [feedback, gaps, currentIndex, inputValue, attemptsLeft, moveToNext])

  // Handle Enter key
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    }
  }, [])

  // ─── Results calculations ───
  const correctCount = answers.filter(a => a.correct).length
  const wrongAnswers = answers.filter(a => !a.correct)
  const scorePercent = gaps.length > 0 ? Math.round((correctCount / gaps.length) * 100) : 0

  // ─── Render: Setup screen ───
  if (phase === 'setup') {
    const difficulties: Array<{ key: 'easy' | 'medium' | 'hard'; label: string }> = [
      { key: 'easy', label: t('game.easy') },
      { key: 'medium', label: t('game.medium') },
      { key: 'hard', label: t('game.hard') },
    ]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('game.typeFill')}
          </h3>
          <button
            onClick={onExit}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {t('game.exit')}
          </button>
        </div>

        {/* Difficulty selector */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('game.difficulty')}</p>
          <div className="flex gap-2">
            {difficulties.map(d => (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                  difficulty === d.key
                    ? 'bg-mode-podcast text-white'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gap count preview */}
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-mode-podcast">{previewCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('game.progress')}
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={startGame}
          disabled={previewCount === 0}
          className="w-full py-3 rounded-xl bg-mode-podcast text-white font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {t('game.start')}
        </button>
      </div>
    )
  }

  // ─── Render: Results screen ───
  if (phase === 'results') {
    return (
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('game.result')}
        </h3>

        {/* Score */}
        <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <p className="text-4xl font-bold text-mode-podcast">{scorePercent}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t('game.score')}: {correctCount}/{gaps.length}
          </p>
        </div>

        {/* Wrong words list */}
        {wrongAnswers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('game.wrong')} ({wrongAnswers.length})
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {wrongAnswers.map((a, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                  <span className="text-red-500 line-through shrink-0">{a.userAnswer}</span>
                  <span className="text-gray-400 shrink-0">&rarr;</span>
                  <div className="min-w-0">
                    <span className="text-green-600 dark:text-green-400 font-medium">{a.gap.word}</span>
                    {a.definition && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{a.definition}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {wrongAnswers.length > 0 && onAddToVocab && (
            <button
              onClick={() => wrongAnswers.forEach(a => onAddToVocab(a.gap.word))}
              className="w-full py-3 rounded-xl bg-mode-podcast/10 text-mode-podcast font-medium text-sm hover:bg-mode-podcast/20 transition-colors"
            >
              {t('game.addWrongWords')}
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { setPhase('setup'); setCurrentIndex(0); setAnswers([]) }}
              className="flex-1 py-3 rounded-xl bg-mode-podcast text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {t('game.playAgain')}
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t('game.exit')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render: Playing screen ───
  const currentGap = gaps[currentIndex]

  // Build the set of gap segment indices and word indices
  const gapMap = new Map<number, Set<number>>()
  for (const g of gaps) {
    if (!gapMap.has(g.segmentIndex)) gapMap.set(g.segmentIndex, new Set())
    gapMap.get(g.segmentIndex)!.add(g.wordIndex)
  }

  // Which gaps have been answered already
  const answeredGapWords = new Set(answers.map(a => `${a.gap.segmentIndex}-${a.gap.wordIndex}`))

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {t('game.typeFill')}
        </h3>
        <button
          onClick={onExit}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {t('game.exit')}
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{t('game.progress')}</span>
          <span className="tabular-nums">{currentIndex + 1}/{gaps.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-mode-podcast rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / gaps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Transcript with blanks */}
      <div className="max-h-[18rem] overflow-y-auto space-y-1.5 rounded-xl">
        {segments.map((seg, si) => {
          const segGaps = gapMap.get(si)
          if (!segGaps) {
            return (
              <div
                key={si}
                className="px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
              >
                {seg.text}
              </div>
            )
          }

          const words = seg.text.split(/\s+/)
          const isCurrentSegment = currentGap?.segmentIndex === si

          return (
            <div
              key={si}
              className={`px-3 py-2 rounded-lg text-sm leading-relaxed transition-colors ${
                isCurrentSegment
                  ? 'bg-mode-podcast/10 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {words.map((word, wi) => {
                if (!segGaps.has(wi)) {
                  return <span key={wi}>{wi > 0 ? ' ' : ''}{word}</span>
                }

                const gapKey = `${si}-${wi}`
                const isCurrentGap = currentGap?.segmentIndex === si && currentGap?.wordIndex === wi
                const isAnswered = answeredGapWords.has(gapKey)
                const answerRecord = answers.find(
                  a => a.gap.segmentIndex === si && a.gap.wordIndex === wi
                )

                if (isAnswered && answerRecord) {
                  return (
                    <span key={wi}>
                      {wi > 0 ? ' ' : ''}
                      <span className={`inline-block px-1.5 py-0.5 rounded font-medium ${
                        answerRecord.correct
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        {answerRecord.gap.word}
                      </span>
                    </span>
                  )
                }

                // Current gap — show inline input
                if (isCurrentGap) {
                  const charWidth = Math.max(4, currentGap.word.length)
                  return (
                    <span key={wi}>
                      {wi > 0 ? ' ' : ''}
                      <span
                        ref={activeGapRef}
                        className="inline-block"
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          onKeyDown={onKeyDown}
                          className="border-b-2 border-mode-podcast bg-transparent outline-none font-mono text-sm text-center px-1 py-0.5"
                          style={{ width: `${charWidth + 1}ch` }}
                          autoComplete="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          disabled={!!feedback}
                        />
                      </span>
                    </span>
                  )
                }

                // Future gap — show blank
                return (
                  <span key={wi}>
                    {wi > 0 ? ' ' : ''}
                    <span className="inline-block px-2 py-0.5 rounded border-dashed border-2 border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-700/30 min-w-[3rem] text-center">
                      {'____'}
                    </span>
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Feedback + attempts */}
      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          feedback.correct
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : feedback.correctWord
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
        }`}>
          {feedback.correct ? (
            <p>{t('game.correct')}</p>
          ) : feedback.correctWord ? (
            <div>
              <p>{t('game.wrong')}</p>
              <p className="text-green-600 dark:text-green-400 mt-1">{feedback.correctWord}</p>
              {feedback.definition && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{feedback.definition}</p>
              )}
            </div>
          ) : (
            <p>{t('game.retry')} - {t('game.attemptsLeft')}: {attemptsLeft}</p>
          )}
        </div>
      )}

      {/* Submit button + attempts indicator */}
      {!feedback && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="flex-1 py-3 rounded-xl bg-mode-podcast text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {t('confirm.ok')}
          </button>
          <span className="text-xs text-gray-400 tabular-nums shrink-0">
            {t('game.attemptsLeft')}: {attemptsLeft}
          </span>
        </div>
      )}
    </div>
  )
}
